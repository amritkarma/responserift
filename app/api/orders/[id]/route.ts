import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import ordersData from '../../../data/orders.json'

type Order = {
  id: number
  userId: number
  cartId: number
  totalPrice: number
  status: string
  createdAt: string
}

const orders: Order[] = [...ordersData] // in-memory clone

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

// OPTIONS handler for preflight requests
export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }))
}

// GET /api/orders/:id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const orderId = Number(id)
  const order = orders.find(o => o.id === orderId)

  if (!order) {
    return prettyJSON({ error: 'Order not found' }, 404)
  }

  return prettyJSON(order)
}

// PUT /api/orders/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const orderId = Number(id)
  const index = orders.findIndex(o => o.id === orderId)

  if (index === -1) {
    return prettyJSON({ error: 'Order not found' }, 404)
  }

  try {
    const body = await req.json()
    const updatedOrder = { ...orders[index], ...body, id: orderId }
    orders[index] = updatedOrder
    return prettyJSON(updatedOrder)
  } catch {
    return prettyJSON({ error: 'Invalid request body' }, 400)
  }
}

// DELETE /api/orders/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const orderId = Number(id)
  const index = orders.findIndex(o => o.id === orderId)

  if (index === -1) {
    return prettyJSON({ error: 'Order not found' }, 404)
  }

  const [deleted] = orders.splice(index, 1)
  return prettyJSON({ message: 'Order deleted', order: deleted })
}
