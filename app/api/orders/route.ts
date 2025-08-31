import { NextRequest, NextResponse } from 'next/server'
import ordersData from '../../data/orders.json'
import usersData from '../../data/users.json'
import cartsData from '../../data/carts.json'

type Order = {
  id: number
  userId: number
  cartId: number
  totalPrice: number
  status: string
  createdAt: string
}

const orders: Order[] = ordersData.map(o => ({
  ...o,
  status: o.status || 'Processing'
}))

// CORS helper
function withCORS(response: Response | NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  return response
}

// Pretty JSON helper with CORS
function prettyJSON(data: unknown, status = 200) {
  const jsonString = JSON.stringify(data, null, 2)
  const res = new NextResponse(jsonString, {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
  return withCORS(res)
}

// OPTIONS handler
export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }))
}

// Payload validation
function validateOrderPayload(body: unknown): string[] {
  const errors: string[] = []

  if (typeof body !== 'object' || body === null) {
    errors.push('Invalid body format')
    return errors
  }

  const b = body as Partial<Order>

  if (typeof b.userId !== 'number') errors.push('Invalid or missing userId')
  if (typeof b.cartId !== 'number') errors.push('Invalid or missing cartId')
  if (typeof b.totalPrice !== 'number' || b.totalPrice < 0) errors.push('Invalid or missing totalPrice')
  if (b.status && typeof b.status !== 'string') errors.push('Invalid status format')

  // Validate that userId exists
  if (typeof b.userId === 'number' && !usersData.find(user => user.id === b.userId)) {
    errors.push('Invalid userId: user does not exist')
  }

  // Validate that cartId exists
  if (typeof b.cartId === 'number' && !cartsData.find(cart => cart.id === b.cartId)) {
    errors.push('Invalid cartId: cart does not exist')
  }

  return errors
}

// GET /api/orders
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const status = searchParams.get('status')
  const limit = Number(searchParams.get('limit') || 100)
  const offset = Number(searchParams.get('offset') || 0)

  let filtered = orders

  if (userId) filtered = filtered.filter(o => String(o.userId) === userId)
  if (status) filtered = filtered.filter(o => o.status === status)

  const paginated = filtered.slice(offset, offset + limit)

  return prettyJSON({
    total: filtered.length,
    limit,
    offset,
    results: paginated
  })
}

// POST /api/orders
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const errors = validateOrderPayload(body)

    if (errors.length > 0) {
      return prettyJSON({ errors }, 400)
    }

    const b = body as Partial<Order>

    const newOrder: Order = {
      id: orders.length ? Math.max(...orders.map(o => o.id)) + 1 : 1,
      userId: b.userId!,
      cartId: b.cartId!,
      totalPrice: b.totalPrice!,
      status: b.status || 'Processing',
      createdAt: new Date().toISOString()
    }

    orders.push(newOrder)

    return prettyJSON(newOrder, 201)
  } catch {
    return prettyJSON({ error: 'Invalid request body' }, 400)
  }
}
