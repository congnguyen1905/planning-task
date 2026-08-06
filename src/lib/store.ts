import { redis } from "./redis";
import type { Todo } from "./types";

const KEY = "daily-todos:list";

export async function getTodos(): Promise<Todo[]> {
  const data = await redis.get<Todo[]>(KEY);
  return data ?? [];
}

export async function saveTodos(todos: Todo[]): Promise<void> {
  await redis.set(KEY, todos);
}
