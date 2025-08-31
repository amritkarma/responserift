import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import tagsData from '../../data/tags.json'

type Tag = {
  id: number
  name: string
}

const tags: Tag[] = [...tagsData]

// ✅ CORS utility
function withCORS(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

// ✅ Pretty JSON wrapper
function prettyJSON(data: unknown, status = 200) {
  const json = JSON.stringify(data, null, 2)
  const response = new NextResponse(json, {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
  return withCORS(response)
}

// ✅ Payload validation
function validateTagPayload(body: unknown): string[] {
  const errors: string[] = []

  if (typeof body !== 'object' || body === null) {
    errors.push('Invalid body format')
    return errors
  }

  const b = body as Partial<Tag>
  if (!b.name || typeof b.name !== 'string') {
    errors.push('Missing or invalid "name"')
  }

  return errors
}

// 🔁 OPTIONS preflight
export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }))
}

// GET /api/tags?limit=...&offset=...&q=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = Number(searchParams.get('limit') || 100)
  const offset = Number(searchParams.get('offset') || 0)
  const q = searchParams.get('q')?.toLowerCase()

  let filtered = tags
  if (q) {
    filtered = filtered.filter(tag => tag.name.toLowerCase().includes(q))
  }

  const paginated = filtered.slice(offset, offset + limit)

  return prettyJSON({
    total: filtered.length,
    limit,
    offset,
    results: paginated,
  })
}

// POST /api/tags
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const errors = validateTagPayload(body)

    if (errors.length) {
      return prettyJSON({ errors }, 400)
    }

    const b = body as Partial<Tag>
    const newTag: Tag = {
      id: tags.length ? Math.max(...tags.map(t => t.id)) + 1 : 1,
      name: b.name!,
    }

    tags.push(newTag)
    return prettyJSON(newTag, 201)
  } catch {
    return prettyJSON({ error: 'Invalid request body' }, 400)
  }
}
