"use client";

import { useState, useEffect, ReactElement } from "react";
import type { Todo, Project } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface AssignProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo | null;
  projects: Project[];
  onSaveProject: (todoId: string, projectId: string) => Promise<void>;
}

export function AssignProjectModal({
  isOpen,
  onClose,
  todo,
  projects,
  onSaveProject,
}: AssignProjectModalProps): ReactElement | null {
  const { t } = useLanguage();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (todo) {
      setSelectedProjectId(todo.projectId || projects[0]?.id || "");
    }
  }, [todo, projects]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !todo) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProjectId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSaveProject(todo!.id, selectedProjectId);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Dialog box */}
      <div className="relative z-10 w-full max-w-md rounded-lg border border-[var(--hairline)] bg-[var(--bg)] p-6 shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-3 mb-4">
          <h2 className="font-display text-xl font-bold text-[var(--ink)]">
            {t("assign_project")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors p-1 rounded"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <span className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-faint)] mb-1">
              Công việc
            </span>
            <p className="text-sm font-medium text-[var(--ink)] bg-[var(--surface)] p-2.5 rounded border border-[var(--hairline)]">
              {todo.text}
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-faint)] mb-1">
              {t("select_project")} <span className="text-[var(--amber)]">*</span>
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full rounded border border-[var(--hairline)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--amber)]"
            >
              <option value="" disabled className="bg-[var(--bg)] text-[var(--ink-faint)]">
                -- {t("select_project")} --
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-[var(--bg)] text-[var(--ink)]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--hairline)]">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-[var(--hairline)] px-4 py-2 text-sm text-[var(--ink-muted)] hover:bg-[var(--hairline)]/20 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedProjectId}
              className="rounded bg-[var(--amber)] px-4 py-2 text-sm font-semibold text-[#1c1b19] disabled:opacity-50 transition-opacity hover:opacity-90"
            >
              {isSubmitting ? t("loading") : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
