import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getTodos, saveTodos } from "@/lib/store";
import { reconcileDateRange } from "@/lib/date";
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
    // If todo has no username assigned (legacy data), visible to everyone!
    if (!todo.username) return true;
    // Otherwise, visible only if username matches
    if (!username) return true;
    return todo.username.toLowerCase() === username.toLowerCase();
  });
}

export async function GET(req: NextRequest) {
  const username = getUserFromReq(req);
  const allTodos = await getTodos();
  const filtered = filterTodosForUser(allTodos, username);
  filtered.sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json({ todos: filtered });
}

export async function POST(req: NextRequest) {
  const username = getUserFromReq(req);
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

  const allTodos = await getTodos();
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
    username: username || undefined,
    text,
    done: false,
    createdAt: Date.now(),
    startDate: safeStart,
    endDate: safeEnd,
    subtodos: [],
  };

  allTodos.push(newTodo);
  await saveTodos(allTodos);

  const filtered = filterTodosForUser(allTodos, username);
  filtered.sort((a, b) => b.createdAt - a.createdAt);

  return NextResponse.json({ todos: filtered }, { status: 201 });
}
