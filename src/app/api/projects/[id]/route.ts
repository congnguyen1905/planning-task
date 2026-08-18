import { NextRequest, NextResponse } from "next/server";
import { getProjects, saveProjects, getTodos, saveTodos } from "@/lib/store";
import { DEFAULT_PROJECT } from "@/lib/serverStore";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  return NextResponse.json({ projects });
}
