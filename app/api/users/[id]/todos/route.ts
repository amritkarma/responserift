import { NextRequest, NextResponse } from "next/server";
import todosData from "@/app/data/todos.json";
import usersData from "@/app/data/users.json";

type Todo = {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
};

// In-memory copy for mutations
const todos: Todo[] = [...todosData];

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
  const completed = searchParams.get("completed");
  const q = searchParams.get("q");

  let filteredTodos = todos.filter(todo => todo.userId === userId);

  // Filter by completion status
  if (completed !== null) {
    const isCompleted = completed === "true";
    filteredTodos = filteredTodos.filter(todo => todo.completed === isCompleted);
  }

  // Search by title
  if (q) {
    filteredTodos = filteredTodos.filter(todo =>
      todo.title.toLowerCase().includes(q.toLowerCase())
    );
  }

  // Apply pagination
  const total = filteredTodos.length;
  const results = filteredTodos.slice(offset, offset + limit);

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
    if (!body.title) {
      return prettyJSON({
        errors: ["title is required"]
      }, 400);
    }

    // Create new todo
    const newTodo = {
      id: Math.max(...todos.map(t => t.id)) + 1,
      userId: userId, // Set from URL parameter
      title: body.title,
      completed: body.completed || false
    };

    todos.push(newTodo);

    return prettyJSON(newTodo, 201);
  } catch {
    return prettyJSON({
      errors: ["Invalid JSON payload"]
    }, 400);
  }
}

export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 200 }));
}

