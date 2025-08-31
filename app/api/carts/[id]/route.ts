import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import cartsData from '../../../data/carts.json'

type CartProduct = {
  productId: number
  quantity: number
}

type Cart = {
  id: number
  userId: number
  products: CartProduct[]
}

const carts: Cart[] = [...cartsData]

// 🔁 CORS helper
function withCORS(response: Response | NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  return response
}

// ✅ Pretty JSON with CORS
function prettyJSON(data: unknown, status = 200) {
  const jsonString = JSON.stringify(data, null, 2)
  const res = new NextResponse(jsonString, {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
  return withCORS(res)
}

// 🧩 OPTIONS / Preflight
export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }))
}

// 🧪 Validation
function validateCartPayload(body: unknown): string[] {
  const errors: string[] = []

  if (typeof body !== 'object' || body === null) {
    errors.push('Invalid body format')
    return errors
  }

  const b = body as Partial<Cart>

  if (b.userId !== undefined && typeof b.userId !== 'number') {
    errors.push('Invalid "userId"')
  }

  if (b.products !== undefined) {
    if (!Array.isArray(b.products)) {
      errors.push('"products" must be an array')
    } else {
      for (const product of b.products) {
        if (
          typeof product.productId !== 'number' ||
          typeof product.quantity !== 'number' ||
          product.quantity < 1
        ) {
          errors.push('Each product must have valid "productId" and positive "quantity"')
          break
        }
      }
    }
  }

  return errors
}

// GET /api/carts/:id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cartId = Number(id)
  const cart = carts.find(c => c.id === cartId)

  if (!cart) {
    return prettyJSON({ error: 'Cart not found' }, 404)
  }

  return prettyJSON(cart)
}

// PUT /api/carts/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cartId = Number(id)
  const index = carts.findIndex(c => c.id === cartId)

  if (index === -1) {
    return prettyJSON({ error: 'Cart not found' }, 404)
  }

  try {
    const body = await req.json()
    const errors = validateCartPayload(body)
    if (errors.length) {
      return prettyJSON({ errors }, 400)
    }

    const updatedCart = {
      ...carts[index],
      ...body,
      id: cartId,
    }

    carts[index] = updatedCart
    return prettyJSON(updatedCart)
  } catch {
    return prettyJSON({ error: 'Invalid request body' }, 400)
  }
}

// DELETE /api/carts/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cartId = Number(id)
  const index = carts.findIndex(c => c.id === cartId)

  if (index === -1) {
    return prettyJSON({ error: 'Cart not found' }, 404)
  }

  const [deleted] = carts.splice(index, 1)
  return prettyJSON({ message: 'Cart deleted', cart: deleted })
}
