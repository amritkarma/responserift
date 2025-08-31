import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import categoriesData from '../../data/categories.json'

type Category = {
  id: number
  name: string
  description: string
}

const categories: Category[] = [...categoriesData]

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

export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }))
}

function validateCategoryPayload(body: unknown): string[] {
  const errors: string[] = []
  if (typeof body !== 'object' || body === null) {
    errors.push('Invalid body format')
    return errors
  }
  const b = body as Partial<Category>
  if (!b.name || typeof b.name !== 'string') {
    errors.push('Missing or invalid "name"')
  }
  if (!b.description || typeof b.description !== 'string') {
    errors.push('Missing or invalid "description"')
  }
  return errors
}

// GET /api/categories?limit=...&offset=...&q=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = Number(searchParams.get('limit') || 100)
  const offset = Number(searchParams.get('offset') || 0)
  const q = searchParams.get('q')?.toLowerCase()

  let filtered = categories
  if (q) {
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    )
  }

  const paginated = filtered.slice(offset, offset + limit)

  return prettyJSON({ total: filtered.length, limit, offset, results: paginated })
}

// POST /api/categories
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const errors = validateCategoryPayload(body)
    if (errors.length) return prettyJSON({ errors }, 400)

    const b = body as Partial<Category>
    const newCategory: Category = {
      id: categories.length ? Math.max(...categories.map(c => c.id)) + 1 : 1,
      name: b.name!,
      description: b.description!,
    }
    categories.push(newCategory)
    return prettyJSON(newCategory, 201)
  } catch {
    return prettyJSON({ error: 'Invalid request body' }, 400)
  }
}
