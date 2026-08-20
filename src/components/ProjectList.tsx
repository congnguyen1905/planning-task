"use client";

import { useState, useEffect, ReactElement } from "react";
import type { Project } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { DEFAULT_PROJECT } from "@/lib/serverStore";
import { Button } from "./Button";

interface ProjectListProps {
  projects: Project[];
  selectedProjectId: string | null; // null = All Projects
  onSelectProject: (id: string | null) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal?: (project: Project) => void;
  onDeleteProject?: (id: string) => void;
  todosCountByProject: Record<string, number>;
  totalTodosCount: number;
}

export function ProjectList({
  projects,
  selectedProjectId,
  onSelectProject,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteProject,
  todosCountByProject,
  totalTodosCount,
}: ProjectListProps): ReactElement {
  const { t } = useLanguage();

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    project: Project;
  } | null>(null);

  // Close context menu on outside click or scroll
  useEffect(() => {
    const handleClose = () => setContextMenu(null);
    window.addEventListener("click", handleClose);
    window.addEventListener("scroll", handleClose, true);
    return () => {
      window.removeEventListener("click", handleClose);
      window.removeEventListener("scroll", handleClose, true);
    };
  }, []);

  const handleContextMenu = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      project,
    });
  };

  return (
    <div className="rounded-sm border border-[var(--hairline)] p-3 space-y-3 relative">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--amber)]">
          {t("projects_title")}
        </h3>
        <Button
          variant="soft"
          color="primary"
          size="sm"
          onClick={onOpenCreateModal}
        >
          {t("new_project_btn")}
        </Button>
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
              onContextMenu={(e) => handleContextMenu(e, project)}
              className={`group flex items-center justify-between px-2.5 py-1.5 rounded text-sm transition-colors select-none ${
                isSelected
                  ? "bg-[var(--amber)]/15 font-medium text-[var(--ink)] border-l-2"
                  : "text-[var(--ink-muted)] hover:bg-[var(--hairline)]/20"
              }`}
              style={{
                borderLeftColor: isSelected ? project.color || "var(--amber)" : undefined,
              }}
              title="Ấn chuột phải để sửa/xóa dự án"
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
                    className="opacity-0 group-hover:opacity-100 text-[var(--ink-faint)] hover:text-red-400 transition-opacity p-0.5 text-xs cursor-pointer"
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

      {/* Floating Right-Click Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: "fixed",
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          className="z-50 min-w-[170px] rounded-lg border border-[var(--hairline)] bg-[var(--surface)] p-1.5 shadow-2xl text-xs font-sans space-y-1 animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-1 font-mono text-[10px] text-[var(--ink-faint)] uppercase border-b border-[var(--hairline)] truncate max-w-[200px]">
            {contextMenu.project.name}
          </div>

          <button
            type="button"
            onClick={() => {
              const proj = contextMenu.project;
              setContextMenu(null);
              onOpenEditModal?.(proj);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[var(--amber)]/15 hover:text-[var(--amber)] text-[var(--ink)] text-left font-medium transition-colors cursor-pointer"
          >
            <span>✏️</span> Chỉnh sửa dự án
          </button>

          {contextMenu.project.id !== DEFAULT_PROJECT.id && onDeleteProject && (
            <button
              type="button"
              onClick={() => {
                const proj = contextMenu.project;
                setContextMenu(null);
                if (confirm(`${t("delete_project")} "${proj.name}"?`)) {
                  onDeleteProject(proj.id);
                }
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-red-500/15 text-red-500 text-left font-medium transition-colors cursor-pointer"
            >
              <span>🗑️</span> Xóa dự án
            </button>
          )}
        </div>
      )}
    </div>
  );
}
