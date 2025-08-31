import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import postsData from '../../../data/posts.json'

type Post = {
  id: number
  title: string
  body: string
  userId: number
}

const posts: Post[] = [...postsData]

// 🔁 Reusable function to add CORS headers
function withCORS(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

// Helper to return pretty JSON with CORS
function prettyJSON(data: unknown, status = 200) {
  const jsonString = JSON.stringify(data, null, 2)
  const res = new NextResponse(jsonString, {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
  return withCORS(res)
}

// 🔁 OPTIONS handler for preflight requests
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 })
  return withCORS(response)
}

// GET /api/posts/:id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const postId = Number(id)
  const post = posts.find(p => p.id === postId)

  if (!post) {
    return prettyJSON({ error: 'Post not found' }, 404)
  }

  return prettyJSON(post)
}

// PUT /api/posts/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const postId = Number(id)
  const index = posts.findIndex(p => p.id === postId)

  if (index === -1) {
    return prettyJSON({ error: 'Post not found' }, 404)
  }

  try {
    const body = await req.json()
    const updatedPost = { ...posts[index], ...body, id: postId }
    posts[index] = updatedPost
    return prettyJSON(updatedPost)
  } catch {
    return prettyJSON({ error: 'Invalid request body' }, 400)
  }
}

// DELETE /api/posts/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const postId = Number(id)
  const index = posts.findIndex(p => p.id === postId)

  if (index === -1) {
    return prettyJSON({ error: 'Post not found' }, 404)
  }

  const [deleted] = posts.splice(index, 1)
  return prettyJSON({ message: 'Post deleted', post: deleted })
}
