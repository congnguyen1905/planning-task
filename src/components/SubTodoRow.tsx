"use client";

import type { SubTodo } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

export function SubTodoRow({
  sub,
  onToggle,
  onDelete,
  onChangeDate,
}: {
  sub: SubTodo;
  onToggle: (done: boolean) => void;
  onDelete: () => void;
  onChangeDate: (date: string) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="group flex items-center gap-2.5 py-1.5 pl-8">
      <input
        type="checkbox"
        className="check-box sub"
        checked={sub.done}
        onChange={(e) => onToggle(e.target.checked)}
      />
      <span
        className={`flex-1 text-sm transition-colors ${
          sub.done
            ? "text-[var(--ink-faint)] line-through"
            : "text-[var(--ink-muted)]"
        }`}
      >
        {sub.text}
      </span>
      <input
        type="date"
        value={sub.date}
        onChange={(e) => onChangeDate(e.target.value)}
        className="rounded-sm border border-[var(--hairline)] bg-transparent px-2 py-1 text-[11px] text-[var(--ink-muted)]"
      />
      <button
        onClick={onDelete}
        aria-label={t("delete_subtask")}
        className="opacity-0 group-hover:opacity-100 text-[var(--ink-faint)] hover:text-[var(--danger)] text-xs font-mono transition-opacity px-1"
      >
        ✕
      </button>
    </div>
  );
}
