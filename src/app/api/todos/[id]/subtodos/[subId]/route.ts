import { NextRequest, NextResponse } from "next/server";
import { getTodos, saveTodos } from "@/lib/store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; subId: string }> }
) {
  const { id, subId } = await params;
  const body = await req.json();

  const todos = await getTodos();
  const todo = todos.find((t) => t.id === id);
  const sub = todo?.subtodos.find((s) => s.id === subId);

  if (!todo || !sub) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (typeof body.text === "string" && body.text.trim()) {
    sub.text = body.text.trim();
  }
  if (typeof body.done === "boolean") {
    sub.done = body.done;
    // If every subtask is done, mark the parent done too.
    // If any subtask becomes undone, the parent can't stay done.
    if (!body.done) {
      todo.done = false;
    } else if (todo.subtodos.every((s) => s.done)) {
      todo.done = true;
    }
  }

  await saveTodos(todos);
  return NextResponse.json({ todos });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; subId: string }> }
) {
  const { id, subId } = await params;
  const todos = await getTodos();
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  todo.subtodos = todo.subtodos.filter((s) => s.id !== subId);

  await saveTodos(todos);
  return NextResponse.json({ todos });
}
