"use client";

import { useState, useEffect, useCallback } from "react";
import type { Project } from "./types";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const loadProjects = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/projects");
      if (!res.ok) return;
      const json = await res.json();
      setProjects((json?.projects as Project[]) ?? []);
    } catch (e) {
      console.error("Failed to load projects:", e);
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  async function addProject(name: string, description?: string, color?: string) {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, color }),
      });
      if (!res.ok) {
        throw new Error("Failed to create project");
      }
      const json = await res.json();
      setProjects((json?.projects as Project[]) ?? []);
      return json?.projects as Project[];
    } catch (e) {
      console.error("Failed to add project:", e);
      setError(e);
      throw e;
    }
  }

  async function deleteProject(id: string) {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete project");
      }
      const json = await res.json();
      setProjects((json?.projects as Project[]) ?? []);
    } catch (e) {
      console.error("Failed to delete project:", e);
      setError(e);
      throw e;
    }
  }

  return {
    projects,
    isLoading,
    error,
    addProject,
    deleteProject,
    reloadProjects: loadProjects,
  };
}
