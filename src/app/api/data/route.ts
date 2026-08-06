import { NextResponse } from "next/server";
import { getTodos } from "@/lib/store";

export async function GET() {
  const todos = await getTodos();
  todos.sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json({ todos });
}
