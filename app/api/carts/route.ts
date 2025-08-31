import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import cartsData from '../../data/carts.json'
import usersData from '../../data/users.json'
import productsData from '../../data/products.json'

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

// 🔁 CORS utility
function withCORS(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

// ✅ Pretty JSON response with CORS
function prettyJSON(data: unknown, status = 200) {
  const jsonString = JSON.stringify(data, null, 2)
  const res = new NextResponse(jsonString, {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
  return withCORS(res)
}

// 🔁 Preflight handler
export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }))
}

// ✅ Payload validation
function validateCartPayload(body: unknown): string[] {
  const errors: string[] = []

  if (typeof body !== 'object' || body === null) {
    errors.push('Invalid body format')
    return errors
  }

  const b = body as Partial<Cart>

  if (typeof b.userId !== 'number') {
    errors.push('Missing or invalid "userId"')
  }

  if (!Array.isArray(b.products) || b.products.length === 0) {
    errors.push('Missing or invalid "products" array')
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

  return errors
}

// GET /api/carts?userId=...&limit=...&offset=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const limit = Number(searchParams.get('limit') || 100)
  const offset = Number(searchParams.get('offset') || 0)

  let filtered = carts
  if (userId) {
    filtered = filtered.filter(c => String(c.userId) === userId)
  }

  const paginated = filtered.slice(offset, offset + limit)

  return prettyJSON({
    total: filtered.length,
    limit,
    offset,
    results: paginated,
  })
}

// POST /api/carts
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const errors = validateCartPayload(body)

    if (errors.length) {
      return prettyJSON({ errors }, 400)
    }

    const b = body as Partial<Cart>

    // Validate that userId exists
    if (!usersData.find(user => user.id === b.userId)) {
      return prettyJSON({ error: 'Invalid userId: user does not exist' }, 400)
    }

    // Validate that all productIds exist
    for (const product of b.products!) {
      if (!productsData.find(p => p.id === product.productId)) {
        return prettyJSON({ error: `Invalid productId: product ${product.productId} does not exist` }, 400)
      }
    }

    const newCart: Cart = {
      id: carts.length ? Math.max(...carts.map(c => c.id)) + 1 : 1,
      userId: b.userId!,
      products: b.products!,
    }

    carts.push(newCart)

    return prettyJSON(newCart, 201)
  } catch {
    return prettyJSON({ error: 'Invalid request body' }, 400)
  }
}
