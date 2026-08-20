import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getTodos, saveTodos } from "@/lib/store";
import { reconcileDateRange, syncParentWithSubtodos } from "@/lib/date";
import type { SubTodo, Todo } from "@/lib/types";

function getUserFromReq(req: NextRequest): string | null {
  const headerUsername = req.headers.get("x-user-username");
  if (headerUsername && headerUsername.trim()) {
    return headerUsername.trim();
  }
  const queryUsername = req.nextUrl.searchParams.get("username");
  if (queryUsername && queryUsername.trim()) {
    return queryUsername.trim();
  }
  return null;
}

function filterTodosForUser(todos: Todo[], username: string | null): Todo[] {
  return todos.filter((todo) => {
    if (!todo.username) return true;
    if (!username) return true;
    return todo.username.toLowerCase() === username.toLowerCase();
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const username = getUserFromReq(req);
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

  if (username) {
    todo.username = username;
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

  syncParentWithSubtodos(todo);

  await saveTodos(todos);

  const filtered = filterTodosForUser(todos, username);
  filtered.sort((a, b) => b.createdAt - a.createdAt);

  return NextResponse.json({ todos: filtered }, { status: 201 });
}
