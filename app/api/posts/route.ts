import { NextResponse } from 'next/server' 
import type { NextRequest } from 'next/server'
import postsData from '../../data/posts.json'
import usersData from '../../data/users.json'

const posts = [...postsData]

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function withCORS(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

// Helper: create a pretty JSON NextResponse with CORS
function prettyJSON(data: unknown, status = 200) {
  const jsonString = JSON.stringify(data, null, 2)
  const res = new NextResponse(jsonString, {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
  return withCORS(res)
}

// Handle OPTIONS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 })
  return withCORS(response)
}

// GET handler
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const userId = searchParams.get('userId')
  const tag = searchParams.get('tag')
  const category = searchParams.get('category')
  const limit = Number(searchParams.get('limit') || 100)
  const offset = Number(searchParams.get('offset') || 0)

  let filtered = posts

  if (userId) {
    filtered = filtered.filter(p => String(p.userId) === userId)
  }

  if (tag) {
    filtered = filtered.filter(p => p.tags?.includes(tag))
  }

  if (category) {
    filtered = filtered.filter(p => p.category?.toLowerCase() === category.toLowerCase())
  }

  const paginated = filtered.slice(offset, offset + limit)

  return prettyJSON({
    total: filtered.length,
    limit,
    offset,
    results: paginated,
  })
}

// POST handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const requiredFields = ['userId', 'title', 'body']

    for (const field of requiredFields) {
      if (!body[field]) {
        return prettyJSON({ error: `Missing field: ${field}` }, 400)
      }
    }

    if (!usersData.find(user => user.id === Number(body.userId))) {
      return prettyJSON({ error: 'Invalid userId' }, 400)
    }

    const newPost = {
      id: posts.length ? Math.max(...posts.map(p => p.id)) + 1 : 1,
      userId: body.userId,
      title: body.title,
      slug: generateSlug(body.title),
      body: body.body,
      tags: Array.isArray(body.tags) ? body.tags : [],
      category: body.category || 'General',
      createdAt: new Date().toISOString(),
    }

    posts.push(newPost)

    return prettyJSON(newPost, 201)
  } catch {
    return prettyJSON({ error: 'Invalid request body' }, 400)
  }
}
