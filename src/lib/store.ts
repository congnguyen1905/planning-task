import { getRedis, isRedisConfigured } from "./redis";
import type { Todo } from "./types";

const REDIS_KEY = "daily-todos:list";

/**
 * Get todos from Redis when configured; otherwise from the server-side JSON file.
 */
export async function getTodos(): Promise<Todo[]> {
  if (isRedisConfigured()) {
    const redis = getRedis();
    if (redis) {
      const data = await redis.get<Todo[]>(REDIS_KEY);
      return data ?? [];
    }
  }

  if (typeof window === "undefined") {
    const { getTodosFromServerStore } = await import("./serverStore");
    return getTodosFromServerStore();
  }

  return [];
}

/**
 * Save todos to Redis when configured; otherwise to the server-side JSON file.
 */
export async function saveTodos(todos: Todo[]): Promise<void> {
  if (isRedisConfigured()) {
    const redis = getRedis();
    if (redis) {
      await redis.set(REDIS_KEY, todos);
      return;
    }
  }

  if (typeof window === "undefined") {
    const { saveTodosToServerStore } = await import("./serverStore");
    await saveTodosToServerStore(todos);
  }
}
