import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import commentsData from '../../../../data/comments.json'
import postsData from '../../../../data/posts.json'

type Comment = {
  id: number
  postId: number
  userId: number
  body: string
  createdAt: string
}

const comments: Comment[] = [...commentsData] // in-memory clone
const posts = [...postsData] // in-memory clone

// 🔁 CORS utility
function withCORS(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

// Helper for pretty JSON response with CORS
function prettyJSON(data: unknown, status = 200) {
  const jsonString = JSON.stringify(data, null, 2)
  const res = new NextResponse(jsonString, {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
  return withCORS(res)
}

// 🔁 OPTIONS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 })
  return withCORS(response)
}

// GET /api/posts/:id/comments
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const postId = Number(id)
  
  // Check if post exists
  const post = posts.find(p => p.id === postId)
  if (!post) {
    return prettyJSON({ error: 'Post not found' }, 404)
  }

  const postComments = comments.filter(c => c.postId === postId)
  return prettyJSON(postComments)
}

// POST /api/posts/:id/comments
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const postId = Number(id)
  
  // Check if post exists
  const post = posts.find(p => p.id === postId)
  if (!post) {
    return prettyJSON({ error: 'Post not found' }, 404)
  }

  try {
    const body = await req.json()
    
    if (typeof body !== 'object' || body === null) {
      return prettyJSON({ error: 'Invalid body format' }, 400)
    }

    const { userId, body: commentBody } = body as { userId?: number; body?: string }
    
    if (!userId || typeof userId !== 'number') {
      return prettyJSON({ error: 'userId is required' }, 400)
    }
    
    if (!commentBody || typeof commentBody !== 'string') {
      return prettyJSON({ error: 'Comment body is required' }, 400)
    }

    const newComment: Comment = {
      id: Math.max(...comments.map(c => c.id), 0) + 1,
      postId,
      userId,
      body: commentBody,
      createdAt: new Date().toISOString()
    }

    comments.push(newComment)
    return prettyJSON(newComment, 201)
  } catch {
    return prettyJSON({ error: 'Invalid request body' }, 400)
  }
}
