import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import reviewsData from '../../../data/reviews.json'

type Review = {
  id: number
  productId: number
  userId: number
  rating: number
  comment: string
  createdAt: string
}

const reviews: Review[] = [...reviewsData]

// ✅ Reusable CORS handler
function withCORS(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

// ✅ Pretty JSON response wrapper
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
  return withCORS(new NextResponse(null, { status: 204 }))
}

// GET /api/reviews/:id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const reviewId = Number(id)
  const review = reviews.find(r => r.id === reviewId)

  if (!review) {
    return prettyJSON({ error: 'Review not found' }, 404)
  }

  return prettyJSON(review)
}

// PUT /api/reviews/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const reviewId = Number(id)
  const index = reviews.findIndex(r => r.id === reviewId)

  if (index === -1) {
    return prettyJSON({ error: 'Review not found' }, 404)
  }

  try {
    const body = await req.json()
    const updatedReview = {
      ...reviews[index],
      ...body,
      id: reviewId,
    }

    reviews[index] = updatedReview
    return prettyJSON(updatedReview)
  } catch {
    return prettyJSON({ error: 'Invalid request body' }, 400)
  }
}

// DELETE /api/reviews/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const reviewId = Number(id)
  const index = reviews.findIndex(r => r.id === reviewId)

  if (index === -1) {
    return prettyJSON({ error: 'Review not found' }, 404)
  }

  const [deleted] = reviews.splice(index, 1)
  return prettyJSON({
    message: 'Review deleted',
    review: deleted,
  })
}
