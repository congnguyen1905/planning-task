"use client";

import { useEffect, useState } from "react";
import { formatDateKey } from "@/lib/date";
import { useLanguage } from "@/contexts/LanguageContext";

export function AddTodoForm({
  onAdd,
  defaultDate = formatDateKey(new Date()),
}: {
  onAdd: (text: string, date: string) => void;
  defaultDate?: string;
}) {
  const { t } = useLanguage();
  const [text, setText] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDate(defaultDate);
  }, [defaultDate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value || busy) return;
    setBusy(true);
    setText("");
    try {
      await onAdd(value, date);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <span className="font-mono text-[var(--ink-faint)] text-sm">＋</span>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("add_task_placeholder")}
        className="flex-1 bg-transparent border-b border-[var(--hairline)] py-2 text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--amber)] transition-colors"
      />
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-[var(--ink-faint)]">
          <span className="font-mono text-[11px] uppercase tracking-wider">{t("due_date")}</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-sm border border-[var(--hairline)] bg-transparent px-2 py-1 text-sm text-[var(--ink)]"
          />
        </label>
        <button
          type="submit"
          disabled={!text.trim() || busy}
          className="font-mono text-xs uppercase tracking-wider px-3 py-1.5 rounded-sm border border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--amber)] hover:text-[var(--amber)] disabled:opacity-30 disabled:hover:border-[var(--hairline)] disabled:hover:text-[var(--ink-muted)] transition-colors"
        >
          {t("add_button")}
        </button>
      </div>
    </form>
  );
}
