import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getProjects, saveProjects } from "@/lib/store";
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

export async function GET(req: NextRequest) {
  const username = getUserFromReq(req);
  const projects = await getProjects();
  const filtered = filterProjectsForUser(projects, username);
  filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return NextResponse.json({ projects: filtered });
}

export async function POST(req: NextRequest) {
  const username = getUserFromReq(req);
  const body = await req.json();
  const name = (body?.name ?? "").trim();
  const description = (body?.description ?? "").trim();
  const color = (body?.color ?? "#f59e0b").trim();

  if (!name) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

  const projects = await getProjects();

  const newProject: Project = {
    id: randomUUID(),
    name,
    username: username || undefined,
    description: description || undefined,
    color: color || "#f59e0b",
    createdAt: Date.now(),
  };

  projects.push(newProject);
  await saveProjects(projects);

  const filtered = filterProjectsForUser(projects, username);
  filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return NextResponse.json({ projects: filtered }, { status: 201 });
}
