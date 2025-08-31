import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import productsData from '../../data/products.json'

type Product = {
  id: number
  title: string
  description: string
  price: number
  image: string
  category: string
  stock: number
}

const products: Product[] = [...productsData] // in-memory clone

// 🔁 Reusable CORS function
function withCORS(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

// Helper: pretty JSON response with CORS
function prettyJSON(data: unknown, status = 200) {
  const jsonString = JSON.stringify(data, null, 2) // 2 spaces indent for pretty
  const res = new NextResponse(jsonString, {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
  return withCORS(res)
}

// 🔁 OPTIONS handler for preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 })
  return withCORS(response)
}

// Helper: validate product payload on create/update
function validateProductPayload(body: unknown): string[] {
  const errors: string[] = []

  if (typeof body !== 'object' || body === null) {
    errors.push('Invalid body format')
    return errors
  }

  const b = body as Partial<Product>

  if (!b.title || typeof b.title !== 'string') errors.push('Invalid or missing "title"')
  if (!b.description || typeof b.description !== 'string') errors.push('Invalid or missing "description"')
  if (typeof b.price !== 'number' || b.price < 0) errors.push('Invalid or missing "price"')
  if (!b.category || typeof b.category !== 'string') errors.push('Invalid or missing "category"')
  if (!b.image || typeof b.image !== 'string') errors.push('Invalid or missing "image"')
  if (typeof b.stock !== 'number' || b.stock < 0) errors.push('Invalid or missing "stock"')

  return errors
}

// GET /api/products?category=...&limit=...&offset=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')?.toLowerCase()
  const limit = Number(searchParams.get('limit') || 100)
  const offset = Number(searchParams.get('offset') || 0)

  let filtered = products

  if (category) {
    filtered = filtered.filter(p => p.category.toLowerCase() === category)
  }

  const paginated = filtered.slice(offset, offset + limit)

  return prettyJSON({
    total: filtered.length,
    limit,
    offset,
    results: paginated
  })
}

// POST /api/products
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const errors = validateProductPayload(body)

    if (errors.length > 0) {
      return prettyJSON({ errors }, 400)
    }

    const b = body as Partial<Product>

    const newProduct: Product = {
      id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
      title: b.title!,
      description: b.description!,
      price: b.price!,
      category: b.category!,
      image: b.image!,
      stock: b.stock!,
    }

    products.push(newProduct)

    return prettyJSON(newProduct, 201)
  } catch {
    return prettyJSON({ error: 'Invalid request body' }, 400)
  }
}
