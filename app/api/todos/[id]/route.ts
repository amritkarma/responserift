import { NextRequest, NextResponse } from "next/server";
import todosData from "@/app/data/todos.json";

type Todo = {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
};

// In-memory copy for mutations
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
  // If you want pretty output in dev, swap to manual JSON.stringify with indentation.
  return withCORS(NextResponse.json(data, { status }));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const todoId = Number(id);
  const todo = todos.find(t => t.id === todoId);

  if (!todo) {
    return prettyJSON({ error: "Todo not found" }, 404);
  }

  return prettyJSON(todo);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const todoId = Number(id);
    const body = await request.json();

    const todoIndex = todos.findIndex(t => t.id === todoId);

    if (todoIndex === -1) {
      return prettyJSON({ error: "Todo not found" }, 404);
    }

    // Validate required fields
    if (!body.userId || !body.title) {
      return prettyJSON({ errors: ["userId and title are required"] }, 400);
    }

    // Update todo (keep id stable)
    const updatedTodo: Todo = {
      ...todos[todoIndex],
      ...body,
      id: todoId,
    };

    todos[todoIndex] = updatedTodo;

    return prettyJSON(updatedTodo);
  } catch {
    return prettyJSON({ errors: ["Invalid JSON payload"] }, 400);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const todoId = Number(id);
  const todoIndex = todos.findIndex(t => t.id === todoId);

  if (todoIndex === -1) {
    return prettyJSON({ error: "Todo not found" }, 404);
  }

  const deletedTodo = todos[todoIndex];
  todos.splice(todoIndex, 1);

  return prettyJSON(deletedTodo);
}

export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 200 }));
}
