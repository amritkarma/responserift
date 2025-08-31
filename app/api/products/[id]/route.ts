import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import productsData from '../../../data/products.json'

type Product = {
  id: number
  title: string
  description: string
  price: number
  image: string
  category: string
  stock: number
}

const products: Product[] = [...productsData]

// 🔁 CORS utility
function withCORS(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

// Helper: pretty JSON response with CORS
function prettyJSON(data: unknown, status = 200) {
  const jsonString = JSON.stringify(data, null, 2) // 2 spaces indentation for pretty output
  const res = new NextResponse(jsonString, {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
  return withCORS(res)
}

// 🔁 OPTIONS preflight handler
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 })
  return withCORS(response)
}

// GET /api/products/:id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const productId = Number(id)
  const product = products.find(p => p.id === productId)

  if (!product) {
    return prettyJSON({ error: 'Product not found' }, 404)
  }

  return prettyJSON(product)
}

// PUT /api/products/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const productId = Number(id)
  const index = products.findIndex(p => p.id === productId)

  if (index === -1) {
    return prettyJSON({ error: 'Product not found' }, 404)
  }

  try {
    const body = await req.json()
    const updatedProduct = { ...products[index], ...body, id: productId }
    products[index] = updatedProduct
    return prettyJSON(updatedProduct)
  } catch {
    return prettyJSON({ error: 'Invalid request body' }, 400)
  }
}

// DELETE /api/products/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const productId = Number(id)
  const index = products.findIndex(p => p.id === productId)

  if (index === -1) {
    return prettyJSON({ error: 'Product not found' }, 404)
  }

  const [deleted] = products.splice(index, 1)
  return prettyJSON({ message: 'Product deleted', product: deleted })
}
