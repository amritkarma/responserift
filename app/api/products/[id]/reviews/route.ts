import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import reviewsData from '../../../../data/reviews.json'

type Review = {
  id: number
  productId: number
  userId: number
  rating: number
  comment: string
  createdAt: string
}

const reviews: Review[] = [...reviewsData]

// Reusable CORS function
function withCORS(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

// Pretty JSON response helper
function prettyJSON(data: unknown, status = 200) {
  const jsonString = JSON.stringify(data, null, 2)
  const res = new NextResponse(jsonString, {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
  return withCORS(res)
}

// OPTIONS preflight
export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }))
}

// Validate review payload for POST
function validateReviewPayload(body: unknown): string[] {
  const errors: string[] = []
  if (typeof body !== 'object' || body === null) {
    errors.push('Invalid body format')
    return errors
  }
  const b = body as Partial<Review>
  if (typeof b.userId !== 'number') errors.push('Missing or invalid userId')
  if (typeof b.rating !== 'number' || b.rating < 1 || b.rating > 5)
    errors.push('Rating must be between 1 and 5')
  if (!b.comment || typeof b.comment !== 'string') errors.push('Missing or invalid comment')
  return errors
}

// GET /api/products/:id/reviews
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const productId = Number(id)

  const productReviews = reviews.filter(r => r.productId === productId)

  return prettyJSON({
    total: productReviews.length,
    results: productReviews,
  })
}

// POST /api/products/:id/reviews
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const productId = Number(id)

  try {
    const body = await req.json()
    const errors = validateReviewPayload(body)

    if (errors.length) {
      return prettyJSON({ errors }, 400)
    }

    const b = body as Partial<Review>

    const newReview: Review = {
      id: reviews.length ? Math.max(...reviews.map(r => r.id)) + 1 : 1,
      productId,
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
