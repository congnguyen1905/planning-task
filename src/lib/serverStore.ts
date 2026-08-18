import type { Todo, Project } from "./types";

const REDIS_KEY = "daily-todos:list";
const REDIS_PROJECTS_KEY = "daily-todos:projects";
const DEFAULT_DATA_FILE = process.env.VERCEL ? "/tmp/todos-data.json" : "data.json";
const DEFAULT_PROJECTS_FILE = process.env.VERCEL ? "/tmp/projects.json" : "projects.json";

export const DEFAULT_PROJECT: Project = {
  id: "default",
  name: "Dự án mặc định",
  description: "Dự án chung cho tất cả các công việc",
  color: "#f59e0b",
  createdAt: 0,
};

async function getDataFilePath(defaultFile = DEFAULT_DATA_FILE): Promise<string | null> {
  const explicitPath = defaultFile === DEFAULT_DATA_FILE ? process.env.TODOS_DATA_FILE : process.env.PROJECTS_DATA_FILE;
  if (explicitPath) {
    return explicitPath;
  }

  if (typeof process === "undefined" || typeof process.cwd !== "function") {
    return null;
  }

  if (process.env.VERCEL || process.env.NEXT_RUNTIME) {
    return defaultFile;
  }

  const pathModule = await import("node:path");
  return pathModule.join(process.cwd(), defaultFile);
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

async function readProjectsFromFile(filePath: string): Promise<Project[] | null> {
  try {
    const fs = await import("node:fs/promises");
    const raw = await fs.readFile(filePath, "utf8");
    if (!raw.trim()) {
      return null;
    }

    const parsed = JSON.parse(raw) as Project[];
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return null;
    }

    console.error("Error reading projects from file:", error);
    return null;
  }
}

async function writeToFile<T>(filePath: string, data: T): Promise<void> {
  try {
    const fs = await import("node:fs/promises");
    const pathModule = await import("node:path");
    await fs.mkdir(pathModule.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing data to file:", error);
  }
}

export async function getTodosFromServerStore(): Promise<Todo[]> {
  const filePath = await getDataFilePath(DEFAULT_DATA_FILE);
  if (!filePath) {
    return [];
  }

  const todos = await readTodosFromFile(filePath);
  return todos ?? [];
}

export async function saveTodosToServerStore(todos: Todo[]): Promise<void> {
  const filePath = await getDataFilePath(DEFAULT_DATA_FILE);
  if (!filePath) {
    return;
  }

  await writeToFile(filePath, todos);
}

export async function getProjectsFromServerStore(): Promise<Project[]> {
  const filePath = await getDataFilePath(DEFAULT_PROJECTS_FILE);
  if (!filePath) {
    return [DEFAULT_PROJECT];
  }

  const projects = await readProjectsFromFile(filePath);
  if (!projects || projects.length === 0) {
    await saveProjectsToServerStore([DEFAULT_PROJECT]);
    return [DEFAULT_PROJECT];
  }

  if (!projects.some((p) => p.id === DEFAULT_PROJECT.id)) {
    projects.unshift(DEFAULT_PROJECT);
  }

  return projects;
}

export async function saveProjectsToServerStore(projects: Project[]): Promise<void> {
  const filePath = await getDataFilePath(DEFAULT_PROJECTS_FILE);
  if (!filePath) {
    return;
  }

  await writeToFile(filePath, projects);
}

export function getRedisKey(): string {
  return REDIS_KEY;
}

export function getRedisProjectsKey(): string {
  return REDIS_PROJECTS_KEY;
}

