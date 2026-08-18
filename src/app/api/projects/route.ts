import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getProjects, saveProjects } from "@/lib/store";
import type { Project } from "@/lib/types";

export async function GET() {
  const projects = await getProjects();
  projects.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
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
    description: description || undefined,
    color: color || "#f59e0b",
    createdAt: Date.now(),
  };

  projects.push(newProject);
  await saveProjects(projects);

  return NextResponse.json({ projects }, { status: 201 });
}
