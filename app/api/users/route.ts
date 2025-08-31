import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import usersData from '../../data/users.json'

const users = [...usersData] // in-memory copy for mutation

// 🔁 Reusable CORS function
function withCORS(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

// Helper: pretty JSON response with CORS
function prettyJSON(data: unknown, status = 200) {
  const jsonString = JSON.stringify(data, null, 2) // 2 spaces for pretty printing
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

// GET /api/users?limit=...&offset=...&q=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = Number(searchParams.get('limit') || 100)
  const offset = Number(searchParams.get('offset') || 0)
  const q = searchParams.get('q')?.toLowerCase()

  let filtered = users
  if (q) {
    filtered = filtered.filter(u =>
      String(u.id).includes(q) ||
      String(u.username ?? '').toLowerCase().includes(q) ||
      String(u.name ?? '').toLowerCase().includes(q) ||
      String(u.email ?? '').toLowerCase().includes(q)
    )
  }

  const paginated = filtered.slice(offset, offset + limit)
  return prettyJSON({ total: filtered.length, limit, offset, results: paginated })
}

// POST /api/users
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Basic validation
    if (!body.name || !body.email || !body.username) {
      return prettyJSON({ error: 'Missing required fields' }, 400)
    }

    const newUser = {
      id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
      ...body,
    }

    users.push(newUser)

    return prettyJSON(newUser, 201)
  } catch (error) {
    console.error('POST /api/users error:', error)
    return prettyJSON({ error: 'Invalid request' }, 400)
  }
}
