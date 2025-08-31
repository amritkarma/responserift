import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import categoriesData from '../../../data/categories.json'

type Category = {
  id: number
  name: string
  description: string
}

const categories: Category[] = [...categoriesData] // in-memory clone

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
  if (b.name !== undefined && typeof b.name !== 'string') {
    errors.push('Invalid name')
  }
  if (b.description !== undefined && typeof b.description !== 'string') {
    errors.push('Invalid description')
  }
  return errors
}

// GET /api/categories/:id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const categoryId = Number(id)
  const category = categories.find(c => c.id === categoryId)

  if (!category) {
    return prettyJSON({ error: 'Category not found' }, 404)
  }

  return prettyJSON(category)
}

// PUT /api/categories/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const categoryId = Number(id)
  const index = categories.findIndex(c => c.id === categoryId)

  if (index === -1) {
    return prettyJSON({ error: 'Category not found' }, 404)
  }

  try {
    const body = await req.json()
    const errors = validateCategoryPayload(body)
    if (errors.length) {
      return prettyJSON({ errors }, 400)
    }

    const updatedCategory = { ...categories[index], ...body, id: categoryId }
    categories[index] = updatedCategory
    return prettyJSON(updatedCategory)
  } catch {
    return prettyJSON({ error: 'Invalid request body' }, 400)
  }
}

// DELETE /api/categories/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const categoryId = Number(id)
  const index = categories.findIndex(c => c.id === categoryId)

  if (index === -1) {
    return prettyJSON({ error: 'Category not found' }, 404)
  }

  const [deleted] = categories.splice(index, 1)
  return prettyJSON({ message: 'Category deleted', category: deleted })
}
