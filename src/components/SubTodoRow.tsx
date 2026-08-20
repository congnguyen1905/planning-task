"use client";

import type { SubTodo } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { reconcileDateRange } from "@/lib/date";

import { Checkbox } from "./Checkbox";
import { DatePicker } from "./DatePicker";

export function SubTodoRow({
  sub,
  onToggle,
  onDelete,
  onChangeDateRange,
}: {
  sub: SubTodo;
  onToggle: (done: boolean) => void;
  onDelete: () => void;
  onChangeDateRange: (startDate: string, endDate: string) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="group flex items-center gap-2.5 py-1.5 pl-8">
      <Checkbox
        size="sm"
        checked={sub.done}
        onChange={(v) => onToggle(v)}
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
      <div className="flex items-center gap-1.5">
        <DatePicker
          value={sub.startDate}
          onChange={(val) => {
            const next = reconcileDateRange(val, sub.endDate, "start");
            onChangeDateRange(next.startDate, next.endDate);
          }}
        />
        <span className="text-[10px] text-[var(--ink-faint)]">→</span>
        <DatePicker
          value={sub.endDate}
          onChange={(val) => {
            const next = reconcileDateRange(sub.startDate, val, "end");
            onChangeDateRange(next.startDate, next.endDate);
          }}
        />
      </div>
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
