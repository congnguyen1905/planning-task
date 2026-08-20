import { NextRequest, NextResponse } from "next/server";
import { getTodos, saveTodos } from "@/lib/store";
import { reconcileDateRange, syncParentWithSubtodos } from "@/lib/date";
import type { Todo } from "@/lib/types";

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const username = getUserFromReq(req);
  const body = await req.json();

  const todos = await getTodos();
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  // Claim ownership if user is logged in
  if (username) {
    todo.username = username;
  }

  if (typeof body.text === "string" && body.text.trim()) {
    todo.text = body.text.trim();
  }

  if (typeof body.projectId === "string") {
    todo.projectId = body.projectId.trim() || undefined;
  }

  const startChanged = typeof body.startDate === "string" && body.startDate.trim().length > 0;
  const endChanged = typeof body.endDate === "string" && body.endDate.trim().length > 0;
  if ((startChanged || endChanged) && (!todo.subtodos || todo.subtodos.length === 0)) {
    const nextStart = startChanged ? body.startDate.trim() : todo.startDate;
    const nextEnd = endChanged ? body.endDate.trim() : todo.endDate;
    const changedField = endChanged ? "end" : "start";
    const reconciled = reconcileDateRange(nextStart, nextEnd, changedField);
    todo.startDate = reconciled.startDate;
    todo.endDate = reconciled.endDate;
  }

  if (typeof body.done === "boolean") {
    todo.done = body.done;
    if (todo.subtodos && todo.subtodos.length > 0) {
      todo.subtodos = todo.subtodos.map((s) => ({ ...s, done: body.done }));
    }
  }

  syncParentWithSubtodos(todo);
  await saveTodos(todos);

  const filtered = filterTodosForUser(todos, username);
  filtered.sort((a, b) => b.createdAt - a.createdAt);

  return NextResponse.json({ todos: filtered });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const username = getUserFromReq(req);
  const todos = await getTodos();
  const next = todos.filter((t) => t.id !== id);

  if (next.length === todos.length) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  await saveTodos(next);

  const filtered = filterTodosForUser(next, username);
  filtered.sort((a, b) => b.createdAt - a.createdAt);

  return NextResponse.json({ todos: filtered });
}
