import { NextRequest, NextResponse } from "next/server";
import todosData from "@/app/data/todos.json";
import usersData from "@/app/data/users.json";

type Todo = {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
};

// In-memory copy for mutations (binding never reassigned)
const todos: Todo[] = [...(todosData as Todo[])];

// Helper function to add CORS headers
function withCORS(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// Helper function to format JSON response
function prettyJSON<T>(data: T, status = 200) {
  // For dev-only pretty printing, replace with manual JSON.stringify as needed.
  return withCORS(NextResponse.json(data, { status }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const completed = searchParams.get("completed");
  const limit = Number(searchParams.get("limit") ?? "10");
  const offset = Number(searchParams.get("offset") ?? "0");
  const q = searchParams.get("q");

  let filteredTodos = [...todos];

  // Filter by userId
  if (userId) {
    const uid = Number(userId);
    filteredTodos = filteredTodos.filter(todo => todo.userId === uid);
  }

  // Filter by completion status
  if (completed !== null) {
    const isCompleted = completed === "true";
    filteredTodos = filteredTodos.filter(todo => todo.completed === isCompleted);
  }

  // Search by title
  if (q) {
    const qLower = q.toLowerCase();
    filteredTodos = filteredTodos.filter(todo =>
      todo.title.toLowerCase().includes(qLower)
    );
  }

  // Apply pagination
  const total = filteredTodos.length;
  const results = filteredTodos.slice(offset, offset + limit);

  return prettyJSON({ total, limit, offset, results });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body?.userId || !body?.title) {
      return prettyJSON({ errors: ["userId and title are required"] }, 400);
    }

    // Validate userId exists
    if (typeof body.userId !== "number" || body.userId < 1) {
      return prettyJSON({ errors: ["userId must be a positive number"] }, 400);
    }

    // Validate that userId exists in users data
    if (!usersData.find(user => user.id === body.userId)) {
      return prettyJSON({ errors: ["Invalid userId: user does not exist"] }, 400);
    }

    // Robust id generation (handles empty array)
    const nextId = todos.length === 0 ? 1 : Math.max(...todos.map(t => t.id)) + 1;

    // Create new todo
    const newTodo: Todo = {
      id: nextId,
      userId: body.userId,
      title: body.title,
      completed: Boolean(body.completed) || false,
    };

    todos.push(newTodo);

    return prettyJSON(newTodo, 201);
  } catch {
    return prettyJSON({ errors: ["Invalid JSON payload"] }, 400);
  }
}

export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 200 }));
}
