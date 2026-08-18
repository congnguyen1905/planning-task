"use client";

import { useEffect, useState } from "react";
import { formatDateKey, reconcileDateRange } from "@/lib/date";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Project } from "@/lib/types";

export function AddTodoForm({
  onAdd,
  defaultStartDate = formatDateKey(new Date()),
  defaultEndDate = formatDateKey(new Date()),
  projects = [],
  selectedProjectId = null,
}: {
  onAdd: (text: string, startDate: string, endDate: string, projectId?: string) => void;
  defaultStartDate?: string;
  defaultEndDate?: string;
  projects?: Project[];
  selectedProjectId?: string | null;
}) {
  const { t } = useLanguage();
  const [text, setText] = useState("");
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [targetProjectId, setTargetProjectId] = useState<string>(
    selectedProjectId || projects[0]?.id || ""
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
  }, [defaultStartDate, defaultEndDate]);

  useEffect(() => {
    if (selectedProjectId) {
      setTargetProjectId(selectedProjectId);
    } else if (projects.length > 0 && !targetProjectId) {
      setTargetProjectId(projects[0].id);
    }
  }, [selectedProjectId, projects, targetProjectId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value || !targetProjectId || busy) return;
    setBusy(true);
    setText("");
    try {
      await onAdd(value, startDate, endDate, targetProjectId);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-sm border border-[var(--hairline)] p-3 space-y-3">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[var(--ink-faint)] text-sm">＋</span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("add_task_placeholder")}
          className="flex-1 bg-transparent border-b border-[var(--hairline)] py-2 text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--amber)] transition-colors text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center justify-between gap-2 text-sm text-[var(--ink-faint)]">
          <span className="font-mono text-[11px] uppercase tracking-wider">
            {t("select_project")} <span className="text-[var(--amber)]">*</span>
          </span>
          <select
            value={targetProjectId}
            required
            onChange={(e) => setTargetProjectId(e.target.value)}
            className={`rounded-sm border px-2 py-1 text-sm bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:border-[var(--amber)] ${
              !targetProjectId ? "border-amber-500/50" : "border-[var(--hairline)]"
            }`}
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
        </label>

        <label className="flex items-center justify-between gap-2 text-sm text-[var(--ink-faint)]">
          <span className="font-mono text-[11px] uppercase tracking-wider">{t("start_date")}</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              const next = reconcileDateRange(e.target.value, endDate, "start");
              setStartDate(next.startDate);
              setEndDate(next.endDate);
            }}
            className="rounded-sm border border-[var(--hairline)] bg-transparent px-2 py-1 text-sm text-[var(--ink)]"
          />
        </label>
        <label className="flex items-center justify-between gap-2 text-sm text-[var(--ink-faint)]">
          <span className="font-mono text-[11px] uppercase tracking-wider">{t("end_date")}</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              const next = reconcileDateRange(startDate, e.target.value, "end");
              setStartDate(next.startDate);
              setEndDate(next.endDate);
            }}
            className="rounded-sm border border-[var(--hairline)] bg-transparent px-2 py-1 text-sm text-[var(--ink)]"
          />
        </label>
        <button
          type="submit"
          disabled={!text.trim() || !targetProjectId || busy}
          className="w-full font-mono text-xs uppercase tracking-wider px-3 py-1.5 rounded-sm border border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--amber)] hover:text-[var(--amber)] disabled:opacity-30 disabled:hover:border-[var(--hairline)] disabled:hover:text-[var(--ink-muted)] transition-colors"
        >
          {t("add_button")}
        </button>
      </div>
    </form>
  );
}

