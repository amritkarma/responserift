import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import tagsData from '../../../data/tags.json'

type Tag = {
  id: number
  name: string
}

const tags: Tag[] = [...tagsData] // in-memory clone

// ✅ CORS utility
function withCORS(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

// ✅ Pretty JSON formatter
function prettyJSON(data: unknown, status = 200) {
  const json = JSON.stringify(data, null, 2)
  const response = new NextResponse(json, {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
  return withCORS(response)
}

// 🔁 OPTIONS handler for preflight
export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }))
}

// GET /api/tags/:id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tagId = Number(id)
  const tag = tags.find(t => t.id === tagId)

  if (!tag) {
    return prettyJSON({ error: 'Tag not found' }, 404)
  }

  return prettyJSON(tag)
}

// PUT /api/tags/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tagId = Number(id)
  const index = tags.findIndex(t => t.id === tagId)

  if (index === -1) {
    return prettyJSON({ error: 'Tag not found' }, 404)
  }

  try {
    const body = await req.json()

    if (typeof body !== 'object' || body === null) {
      return prettyJSON({ error: 'Invalid body format' }, 400)
    }

    const { name } = body as { name?: unknown }

    if (name !== undefined && typeof name !== 'string') {
      return prettyJSON({ error: 'Invalid "name" format' }, 400)
    }

    const updatedTag = { ...tags[index], ...body, id: tagId }
    tags[index] = updatedTag

    return prettyJSON(updatedTag)
  } catch {
    return prettyJSON({ error: 'Invalid request body' }, 400)
  }
}

// DELETE /api/tags/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tagId = Number(id)
  const index = tags.findIndex(t => t.id === tagId)

  if (index === -1) {
    return prettyJSON({ error: 'Tag not found' }, 404)
  }

  const [deleted] = tags.splice(index, 1)
  return prettyJSON({ message: 'Tag deleted', tag: deleted })
}
