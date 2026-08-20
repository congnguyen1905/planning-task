"use client";

import { useState, useEffect, useCallback } from "react";
import type { Project } from "./types";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem("current_user");
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.username) {
        return { "x-user-username": user.username };
      }
    }
  } catch {}
  return {};
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const loadProjects = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/projects", {
        headers: getAuthHeaders(),
      });
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
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
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

  async function updateProject(id: string, patch: { name?: string; description?: string; color?: string }) {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        throw new Error("Failed to update project");
      }
      const json = await res.json();
      setProjects((json?.projects as Project[]) ?? []);
      return json?.projects as Project[];
    } catch (e) {
      console.error("Failed to update project:", e);
      setError(e);
      throw e;
    }
  }

  async function deleteProject(id: string) {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
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
    updateProject,
    deleteProject,
    reloadProjects: loadProjects,
  };
}
