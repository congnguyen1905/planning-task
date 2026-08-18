import { getRedis, isRedisConfigured } from "./redis";
import type { Todo, Project } from "./types";

const REDIS_KEY = "daily-todos:list";
const REDIS_PROJECTS_KEY = "daily-todos:projects";

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

/**
 * Get projects from Redis when configured; otherwise from the server-side JSON file.
 */
export async function getProjects(): Promise<Project[]> {
  if (isRedisConfigured()) {
    const redis = getRedis();
    if (redis) {
      const data = await redis.get<Project[]>(REDIS_PROJECTS_KEY);
      if (data && data.length > 0) return data;
    }
  }

  if (typeof window === "undefined") {
    const { getProjectsFromServerStore } = await import("./serverStore");
    return getProjectsFromServerStore();
  }

  return [];
}

/**
 * Save projects to Redis when configured; otherwise to the server-side JSON file.
 */
export async function saveProjects(projects: Project[]): Promise<void> {
  if (isRedisConfigured()) {
    const redis = getRedis();
    if (redis) {
      await redis.set(REDIS_PROJECTS_KEY, projects);
      return;
    }
  }

  if (typeof window === "undefined") {
    const { saveProjectsToServerStore } = await import("./serverStore");
    await saveProjectsToServerStore(projects);
  }
}

