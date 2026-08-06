import type { Todo } from "./types";

const REDIS_KEY = "daily-todos:list";
const DEFAULT_DATA_FILE = process.env.VERCEL ? "/tmp/todos-data.json" : "data.json";

async function getDataFilePath(): Promise<string | null> {
  const explicitPath = process.env.TODOS_DATA_FILE;
  if (explicitPath) {
    return explicitPath;
  }

  if (typeof process === "undefined" || typeof process.cwd !== "function") {
    return null;
  }

  if (process.env.VERCEL || process.env.NEXT_RUNTIME) {
    return DEFAULT_DATA_FILE;
  }

  const pathModule = await import("node:path");
  return pathModule.join(process.cwd(), DEFAULT_DATA_FILE);
}

async function readTodosFromFile(filePath: string): Promise<Todo[] | null> {
  try {
    const fs = await import("node:fs/promises");
    const raw = await fs.readFile(filePath, "utf8");
    if (!raw.trim()) {
      return [];
    }

    const parsed = JSON.parse(raw) as Todo[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return null;
    }

    console.error("Error reading todos from file:", error);
    return null;
  }
}

async function writeTodosToFile(filePath: string, todos: Todo[]): Promise<void> {
  try {
    const fs = await import("node:fs/promises");
    const pathModule = await import("node:path");
    await fs.mkdir(pathModule.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(todos, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing todos to file:", error);
  }
}

export async function getTodosFromServerStore(): Promise<Todo[]> {
  const filePath = await getDataFilePath();
  if (!filePath) {
    return [];
  }

  const todos = await readTodosFromFile(filePath);
  return todos ?? [];
}

export async function saveTodosToServerStore(todos: Todo[]): Promise<void> {
  const filePath = await getDataFilePath();
  if (!filePath) {
    return;
  }

  await writeTodosToFile(filePath, todos);
}

export function getRedisKey(): string {
  return REDIS_KEY;
}
