import { NextRequest, NextResponse } from "next/server";
import { getTodos, saveTodos } from "@/lib/store";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = typeof body?.id === "string" ? body.id.trim() : "";

  if (!id) {
    return NextResponse.json({ error: "Todo id is required" }, { status: 400 });
  }

  const todos = await getTodos();
  const todo = todos.find((item) => item.id === id);

  if (!todo) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  if (typeof body.done === "boolean") {
    todo.done = body.done;
    todo.subtodos = todo.subtodos.map((sub) => ({ ...sub, done: body.done }));
  }

  if (typeof body.text === "string" && body.text.trim()) {
    todo.text = body.text.trim();
  }

  if (typeof body.startDate === "string" && body.startDate.trim()) {
    todo.startDate = body.startDate.trim();
  }

  if (typeof body.endDate === "string" && body.endDate.trim()) {
    todo.endDate = body.endDate.trim();
  }

  await saveTodos(todos);
  return NextResponse.json({ todos });
}
