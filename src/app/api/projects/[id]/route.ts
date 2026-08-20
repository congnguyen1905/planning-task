import { NextRequest, NextResponse } from "next/server";
import { getProjects, saveProjects, getTodos, saveTodos } from "@/lib/store";
import { DEFAULT_PROJECT } from "@/lib/serverStore";
import type { Project } from "@/lib/types";

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

function filterProjectsForUser(projects: Project[], username: string | null): Project[] {
  return projects.filter((p) => {
    if (p.id === "default") return true;
    if (!p.username) return true;
    if (!username) return true;
    return p.username.toLowerCase() === username.toLowerCase();
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const username = getUserFromReq(req);
  const body = await req.json();

  let projects = await getProjects();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (typeof body.name === "string" && body.name.trim()) {
    project.name = body.name.trim();
  }

  if (typeof body.description === "string") {
    project.description = body.description.trim() || undefined;
  }

  if (typeof body.color === "string" && body.color.trim()) {
    project.color = body.color.trim();
  }

  if (username && !project.username) {
    project.username = username;
  }

  await saveProjects(projects);

  const filtered = filterProjectsForUser(projects, username);
  filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return NextResponse.json({ projects: filtered });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const username = getUserFromReq(req);

  if (id === DEFAULT_PROJECT.id) {
    return NextResponse.json({ error: "Cannot delete default project" }, { status: 400 });
  }

  let projects = await getProjects();
  const exists = projects.some((p) => p.id === id);

  if (!exists) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  projects = projects.filter((p) => p.id !== id);
  await saveProjects(projects);

  // Re-assign todos from deleted project to default project
  const todos = await getTodos();
  let updated = false;
  const updatedTodos = todos.map((t) => {
    if (t.projectId === id) {
      updated = true;
      return { ...t, projectId: DEFAULT_PROJECT.id };
    }
    return t;
  });

  if (updated) {
    await saveTodos(updatedTodos);
  }

  const filtered = filterProjectsForUser(projects, username);
  filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return NextResponse.json({ projects: filtered });
}
