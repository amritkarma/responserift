import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import reviewsData from '../../data/reviews.json'
import usersData from '../../data/users.json'
import productsData from '../../data/products.json'

type Review = {
  id: number
  productId: number
  userId: number
  rating: number   // 1–5 stars
  comment: string
  createdAt: string
}

const reviews: Review[] = [...reviewsData]

// 🔁 Reusable CORS function
function withCORS(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

// Helper: pretty JSON response with CORS
function prettyJSON(data: unknown, status = 200) {
  const jsonString = JSON.stringify(data, null, 2) // 2 spaces indentation
  const res = new NextResponse(jsonString, {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
  return withCORS(res)
}

// 🔁 Preflight handler
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 })
  return withCORS(response)
}

// ✅ Payload validation
function validateReviewPayload(body: unknown): string[] {
  const errors: string[] = []

  if (typeof body !== 'object' || body === null) {
    errors.push('Invalid body format')
    return errors
  }

  const b = body as Partial<Review>

  if (typeof b.productId !== 'number') errors.push('Missing or invalid productId')
  if (typeof b.userId !== 'number') errors.push('Missing or invalid userId')
  if (typeof b.rating !== 'number' || b.rating < 1 || b.rating > 5) errors.push('Rating must be 1 to 5')
  if (!b.comment || typeof b.comment !== 'string') errors.push('Missing or invalid comment')

  // Validate that userId exists
  if (typeof b.userId === 'number' && !usersData.find(user => user.id === b.userId)) {
    errors.push('Invalid userId: user does not exist')
  }

  // Validate that productId exists
  if (typeof b.productId === 'number' && !productsData.find(product => product.id === b.productId)) {
    errors.push('Invalid productId: product does not exist')
  }

  return errors
}

// GET /api/reviews?productId=...&userId=...&limit=...&offset=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  const userId = searchParams.get('userId')
  const limit = Number(searchParams.get('limit') || 100)
  const offset = Number(searchParams.get('offset') || 0)

  let filtered = reviews
  if (productId) filtered = filtered.filter(r => String(r.productId) === productId)
  if (userId) filtered = filtered.filter(r => String(r.userId) === userId)

  const paginated = filtered.slice(offset, offset + limit)

  return prettyJSON({
    total: filtered.length,
    limit,
    offset,
    results: paginated,
  })
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const errors = validateReviewPayload(body)

    if (errors.length) {
      return prettyJSON({ errors }, 400)
    }

    const b = body as Partial<Review>

    const newReview: Review = {
      id: reviews.length ? Math.max(...reviews.map(r => r.id)) + 1 : 1,
      productId: b.productId!,
      userId: b.userId!,
      rating: b.rating!,
      comment: b.comment!,
      createdAt: new Date().toISOString(),
    }

    reviews.push(newReview)

    return prettyJSON(newReview, 201)
  } catch {
    return prettyJSON({ error: 'Invalid request body' }, 400)
  }
}
