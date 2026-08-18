"use client";

import { useState, useEffect, ReactElement } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string, color?: string) => Promise<void>;
}

const PRESET_COLORS = [
  "#f59e0b", // Amber / Amber gold
  "#3b82f6", // Blue
  "#10b981", // Emerald green
  "#ec4899", // Pink
  "#8b5cf6", // Violet / Purple
  "#ef4444", // Red
  "#06b6d4", // Cyan
  "#f97316", // Orange
];

export function CreateProjectModal({
  isOpen,
  onClose,
  onCreate,
}: CreateProjectModalProps): ReactElement | null {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setColor(PRESET_COLORS[0]);
      setErrorMsg("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg(t("project_name_placeholder"));
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await onCreate(name.trim(), description.trim(), color);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      {/* Modal backdrop click */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-md rounded-lg border border-[var(--hairline)] bg-[var(--bg)] p-6 shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-3 mb-4">
          <h2 className="font-display text-xl font-bold text-[var(--ink)]">
            {t("create_project")}
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
          {errorMsg && (
            <div className="rounded bg-red-500/10 p-2 text-xs text-red-500 border border-red-500/20">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-faint)] mb-1">
              {t("project_name")} <span className="text-[var(--amber)]">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("project_name_placeholder")}
              className="w-full rounded border border-[var(--hairline)] bg-transparent px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--amber)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-faint)] mb-1">
              {t("project_description")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("project_description_placeholder")}
              rows={2}
              className="w-full rounded border border-[var(--hairline)] bg-transparent px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--amber)] transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-faint)] mb-2">
              {t("project_color")}
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    color === c ? "scale-110 border-[var(--ink)]" : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
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
              disabled={isSubmitting || !name.trim()}
              className="rounded bg-[var(--amber)] px-4 py-2 text-sm font-semibold text-[#1c1b19] disabled:opacity-50 transition-opacity hover:opacity-90"
            >
              {isSubmitting ? t("loading") : t("create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
