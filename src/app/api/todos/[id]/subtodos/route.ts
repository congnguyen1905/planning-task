import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getTodos, saveTodos } from "@/lib/store";
import { reconcileDateRange } from "@/lib/date";
import type { SubTodo } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const text = (body?.text ?? "").trim();
  const startDate = (body?.startDate ?? "").trim();
  const endDate = (body?.endDate ?? "").trim();

  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const todos = await getTodos();
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  const resolvedStart = startDate || todo.startDate;
  const resolvedEnd = endDate || todo.endDate;
  const { startDate: safeStart, endDate: safeEnd } = reconcileDateRange(
    resolvedStart,
    resolvedEnd,
    "start"
  );

  const newSub: SubTodo = {
    id: randomUUID(),
    text,
    done: false,
    createdAt: Date.now(),
    startDate: safeStart,
    endDate: safeEnd,
  };
  todo.subtodos.push(newSub);
  // Adding a new (undone) subtask reopens the parent if it was done.
  if (todo.done) todo.done = false;

  await saveTodos(todos);
  return NextResponse.json({ todos }, { status: 201 });
}
