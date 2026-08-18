import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getTodos, saveTodos } from "@/lib/store";
import { reconcileDateRange } from "@/lib/date";
import type { Todo } from "@/lib/types";

export async function GET() {
  const todos = await getTodos();
  // Newest first
  todos.sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json({ todos });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const text = (body?.text ?? "").trim();
  const startDate = (body?.startDate ?? "").trim();
  const endDate = (body?.endDate ?? "").trim();
  const projectId = (body?.projectId ?? "").trim();

  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  if (!projectId) {
    return NextResponse.json({ error: "Project is required" }, { status: 400 });
  }

  const todos = await getTodos();
  const resolvedStart = startDate || new Date().toISOString().slice(0, 10);
  const resolvedEnd = endDate || startDate || new Date().toISOString().slice(0, 10);
  const { startDate: safeStart, endDate: safeEnd } = reconcileDateRange(
    resolvedStart,
    resolvedEnd,
    "start"
  );

  const newTodo: Todo = {
    id: randomUUID(),
    projectId,
    text,
    done: false,
    createdAt: Date.now(),
    startDate: safeStart,
    endDate: safeEnd,
    subtodos: [],
  };
  todos.push(newTodo);
  await saveTodos(todos);

  return NextResponse.json({ todos }, { status: 201 });
}
