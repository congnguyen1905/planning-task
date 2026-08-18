"use client";

import { ReactElement } from "react";
import type { Project } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { DEFAULT_PROJECT } from "@/lib/serverStore";

interface ProjectListProps {
  projects: Project[];
  selectedProjectId: string | null; // null = All Projects
  onSelectProject: (id: string | null) => void;
  onOpenCreateModal: () => void;
  onDeleteProject?: (id: string) => void;
  todosCountByProject: Record<string, number>;
  totalTodosCount: number;
}

export function ProjectList({
  projects,
  selectedProjectId,
  onSelectProject,
  onOpenCreateModal,
  onDeleteProject,
  todosCountByProject,
  totalTodosCount,
}: ProjectListProps): ReactElement {
  const { t } = useLanguage();

  return (
    <div className="rounded-sm border border-[var(--hairline)] p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--amber)]">
          {t("projects_title")}
        </h3>
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="rounded border border-[var(--amber)] px-2 py-0.5 text-xs font-mono text-[var(--amber)] hover:bg-[var(--amber)] hover:text-[#1c1b19] transition-colors"
        >
          {t("new_project_btn")}
        </button>
      </div>

      <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
        {/* All Projects Option */}
        <button
          type="button"
          onClick={() => onSelectProject(null)}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-sm transition-colors ${
            selectedProjectId === null
              ? "bg-[var(--amber)]/15 font-medium text-[var(--ink)] border-l-2 border-[var(--amber)]"
              : "text-[var(--ink-muted)] hover:bg-[var(--hairline)]/20"
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <span className="h-2 w-2 rounded-full bg-[var(--ink-faint)]" />
            <span className="truncate">{t("all_projects")}</span>
          </div>
          <span className="font-mono text-xs rounded bg-[var(--hairline)]/30 px-1.5 py-0.5 text-[var(--ink-faint)]">
            {totalTodosCount}
          </span>
        </button>

        {/* Unassigned Projects Option if any exist */}
        {(todosCountByProject["unassigned"] ?? 0) > 0 && (
          <button
            type="button"
            onClick={() => onSelectProject("unassigned")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-sm transition-colors ${
              selectedProjectId === "unassigned"
                ? "bg-[var(--amber)]/15 font-medium text-[var(--ink)] border-l-2 border-amber-500/80"
                : "text-[var(--ink-muted)] hover:bg-[var(--hairline)]/20"
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="h-2 w-2 rounded-full border border-dashed border-amber-500/80" />
              <span className="truncate italic">{t("unassigned_project")}</span>
            </div>
            <span className="font-mono text-xs rounded bg-amber-500/20 px-1.5 py-0.5 text-amber-500 font-semibold">
              {todosCountByProject["unassigned"]}
            </span>
          </button>
        )}

        {/* Individual Projects */}
        {projects.map((project) => {
          const isSelected = selectedProjectId === project.id;
          const count = todosCountByProject[project.id] ?? 0;
          const isDefault = project.id === DEFAULT_PROJECT.id;

          return (
            <div
              key={project.id}
              className={`group flex items-center justify-between px-2.5 py-1.5 rounded text-sm transition-colors ${
                isSelected
                  ? "bg-[var(--amber)]/15 font-medium text-[var(--ink)] border-l-2"
                  : "text-[var(--ink-muted)] hover:bg-[var(--hairline)]/20"
              }`}
              style={{
                borderLeftColor: isSelected ? project.color || "var(--amber)" : undefined,
              }}
            >
              <button
                type="button"
                onClick={() => onSelectProject(project.id)}
                className="flex-1 flex items-center gap-2 truncate text-left"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color || "#f59e0b" }}
                />
                <span className="truncate">{project.name}</span>
              </button>

              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs rounded bg-[var(--hairline)]/30 px-1.5 py-0.5 text-[var(--ink-faint)]">
                  {count}
                </span>

                {!isDefault && onDeleteProject && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`${t("delete_project")} "${project.name}"?`)) {
                        onDeleteProject(project.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 text-[var(--ink-faint)] hover:text-red-400 transition-opacity p-0.5 text-xs"
                    title={t("delete_project")}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
