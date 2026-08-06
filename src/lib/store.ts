import { getRedis, isRedisConfigured } from "./redis";
import type { Todo } from "./types";

const REDIS_KEY = "daily-todos:list";
const LOCAL_STORAGE_KEY = "daily-todos:list";

/**
 * Get todos - from Redis if configured, otherwise from a server file or localStorage.
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

  // Fallback to localStorage when Redis is not configured and we are in the browser.
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as Todo[];
      }
    } catch (e) {
      console.error("Error reading from localStorage:", e);
    }
  }

  return [];
}

/**
 * Save todos - to Redis if configured, otherwise to a server file or localStorage.
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
    return;
  }

  // Fallback to localStorage when Redis is not configured and we are in the browser.
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  }
}

/**
 * Sync localStorage data to Redis (call this when Redis becomes available)
 * Returns true if sync was performed, false otherwise
 */
export async function syncLocalStorageToRedis(): Promise<boolean> {
  if (!isRedisConfigured()) {
    return false;
  }
  
  const redis = getRedis();
  if (!redis) {
    return false;
  }
  
  if (typeof window === "undefined") {
    return false;
  }
  
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const localTodos = JSON.parse(stored) as Todo[];
      
      // Get existing Redis data
      const redisTodos = await redis.get<Todo[]>(REDIS_KEY);
      
      // Merge: prefer newer items based on createdAt timestamp
      const mergedMap = new Map<string, Todo>();
      
      // Add all Redis todos first
      if (redisTodos) {
        redisTodos.forEach(todo => mergedMap.set(todo.id, todo));
      }
      
      // Add/overwrite with localStorage todos
      localTodos.forEach(todo => mergedMap.set(todo.id, todo));
      
      // Sort by createdAt descending (newest first) and save to Redis
      const mergedTodos = Array.from(mergedMap.values()).sort((a, b) => b.createdAt - a.createdAt);
      await redis.set(REDIS_KEY, mergedTodos);
      
      // Clear localStorage after successful sync
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
      return true;
    }
  } catch (e) {
    console.error("Error syncing localStorage to Redis:", e);
    return false;
  }
  
  return false;
}

/**
 * Check if there is data in localStorage that needs to be synced
 */
export function hasLocalData(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored !== null && stored.length > 0;
  } catch {
    return false;
  }
}
