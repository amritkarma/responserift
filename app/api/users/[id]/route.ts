import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import usersData from '../../../data/users.json'

type User = {
  id: number
  name: string
  username: string
  email: string
  avatar: string
  phone: string
  website: string
  address: {
    street: string
    city: string
    zipcode: string
  }
}

const users: User[] = [...usersData] // in-memory clone

// 🔁 Reusable CORS wrapper
function withCORS(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

// Helper: pretty JSON response with CORS
function prettyJSON(data: unknown, status = 200) {
  const jsonString = JSON.stringify(data, null, 2) // 2-space indent
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

// GET /api/users/:id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = Number(id)
  const user = users.find(u => u.id === userId)

  if (!user) {
    return prettyJSON({ error: 'User not found' }, 404)
  }

  return prettyJSON(user)
}

// PUT /api/users/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = Number(id)
  const index = users.findIndex(u => u.id === userId)

  if (index === -1) {
    return prettyJSON({ error: 'User not found' }, 404)
  }

  try {
    const body = await req.json()
    const updatedUser = { ...users[index], ...body, id: userId }
    users[index] = updatedUser
    return prettyJSON(updatedUser)
  } catch {
    return prettyJSON({ error: 'Invalid request body' }, 400)
  }
}

// DELETE /api/users/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = Number(id)
  const index = users.findIndex(u => u.id === userId)

  if (index === -1) {
    return prettyJSON({ error: 'User not found' }, 404)
  }

  const [deleted] = users.splice(index, 1)
  return prettyJSON({ message: 'User deleted', user: deleted })
}
