import { NextRequest, NextResponse } from "next/server";
import { getTodos, saveTodos } from "@/lib/store";
import { reconcileDateRange } from "@/lib/date";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const todos = await getTodos();
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  if (typeof body.text === "string" && body.text.trim()) {
    todo.text = body.text.trim();
  }

  const startChanged = typeof body.startDate === "string" && body.startDate.trim().length > 0;
  const endChanged = typeof body.endDate === "string" && body.endDate.trim().length > 0;
  if (startChanged || endChanged) {
    const nextStart = startChanged ? body.startDate.trim() : todo.startDate;
    const nextEnd = endChanged ? body.endDate.trim() : todo.endDate;
    // If both changed at once, treat endDate as the field that "wins" the conflict.
    const changedField = endChanged ? "end" : "start";
    const reconciled = reconcileDateRange(nextStart, nextEnd, changedField);
    todo.startDate = reconciled.startDate;
    todo.endDate = reconciled.endDate;
  }

  if (typeof body.done === "boolean") {
    todo.done = body.done;
    // Toggling the parent done state cascades to its subtodos.
    todo.subtodos = todo.subtodos.map((s) => ({ ...s, done: body.done }));
  }

  await saveTodos(todos);
  return NextResponse.json({ todos });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const todos = await getTodos();
  const next = todos.filter((t) => t.id !== id);

  if (next.length === todos.length) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  await saveTodos(next);
  return NextResponse.json({ todos: next });
}
