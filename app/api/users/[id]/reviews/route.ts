import { NextRequest, NextResponse } from "next/server";
import reviewsData from "@/app/data/reviews.json";
import usersData from "@/app/data/users.json";
import productsData from "@/app/data/products.json";

type Review = {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
};

// In-memory copy for mutations
const reviews: Review[] = [...reviewsData];

// Helper function to add CORS headers
function withCORS(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// Helper function to format JSON response
function prettyJSON<T>(data: T, status = 200) {
  return withCORS(NextResponse.json(data, { status }));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = parseInt(id);
  
  // Check if user exists
  if (!usersData.find(user => user.id === userId)) {
    return prettyJSON({
      error: "User not found"
    }, 404);
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = parseInt(searchParams.get("offset") || "0");
  const productId = searchParams.get("productId");

  let filteredReviews = reviews.filter(review => review.userId === userId);

  // Filter by product
  if (productId) {
    filteredReviews = filteredReviews.filter(review => 
      review.productId === parseInt(productId)
    );
  }

  // Apply pagination
  const total = filteredReviews.length;
  const results = filteredReviews.slice(offset, offset + limit);

  return prettyJSON({
    total,
    limit,
    offset,
    results
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    
    // Check if user exists
    if (!usersData.find(user => user.id === userId)) {
      return prettyJSON({
        error: "User not found"
      }, 404);
    }

    const body = await request.json();
    
    // Validate required fields (userId is set from URL)
    if (!body.productId || !body.rating || !body.comment) {
      return prettyJSON({
        errors: ["productId, rating, and comment are required"]
      }, 400);
    }

    // Validate rating range
    if (typeof body.rating !== "number" || body.rating < 1 || body.rating > 5) {
      return prettyJSON({
        errors: ["rating must be a number between 1 and 5"]
      }, 400);
    }

    // Validate that product exists
    if (!productsData.find(product => product.id === body.productId)) {
      return prettyJSON({
        errors: ["Invalid productId: product does not exist"]
      }, 400);
    }

    // Create new review
    const newReview = {
      id: Math.max(...reviews.map(r => r.id)) + 1,
      productId: body.productId,
      userId: userId, // Set from URL parameter
      rating: body.rating,
      comment: body.comment,
      createdAt: new Date().toISOString()
    };

    reviews.push(newReview);

    return prettyJSON(newReview, 201);
  } catch {
    return prettyJSON({
      errors: ["Invalid JSON payload"]
    }, 400);
  }
}

export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 200 }));
}

