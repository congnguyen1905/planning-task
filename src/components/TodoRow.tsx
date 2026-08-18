"use client";

import { useEffect, useState } from "react";
import type { Todo } from "@/lib/types";
import { SubTodoRow } from "./SubTodoRow";
import { useLanguage } from "@/contexts/LanguageContext";
import { isWithinFilterRange, reconcileDateRange } from "@/lib/date";

export function TodoRow({
  todo,
  rangeStart,
  rangeEnd,
  projectName,
  projectColor,
  onToggle,
  onChangeDateRange,
  onDelete,
  onAddSub,
  onToggleSub,
  onDeleteSub,
  onChangeSubDateRange,
  onAssignProject,
}: {
  todo: Todo;
  rangeStart: string;
  rangeEnd: string;
  projectName?: string;
  projectColor?: string;
  onToggle: (done: boolean) => void;
  onChangeDateRange: (startDate: string, endDate: string) => void;
  onDelete: () => void;
  onAddSub: (text: string, startDate: string, endDate: string) => void;
  onToggleSub: (subId: string, done: boolean) => void;
  onDeleteSub: (subId: string) => void;
  onChangeSubDateRange: (subId: string, startDate: string, endDate: string) => void;
  onAssignProject?: (todo: Todo) => void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(true);
  const [subText, setSubText] = useState("");
  const [subStartDate, setSubStartDate] = useState(todo.startDate);
  const [subEndDate, setSubEndDate] = useState(todo.endDate);

  useEffect(() => {
    setSubStartDate(todo.startDate);
    setSubEndDate(todo.endDate);
  }, [todo.startDate, todo.endDate]);

  const visibleSubtasks = todo.subtodos.filter((sub) =>
    isWithinFilterRange(sub.startDate, sub.endDate, rangeStart, rangeEnd)
  );
  const total = visibleSubtasks.length;
  const doneCount = visibleSubtasks.filter((s) => s.done).length;

  function submitSub(e: React.FormEvent) {
    e.preventDefault();
    const value = subText.trim();
    if (!value) return;
    onAddSub(value, subStartDate, subEndDate);
    setSubText("");
  }

  return (
    <div className="border-b border-[var(--hairline)] last:border-b-0">
      <div className="group flex items-center gap-3 py-3">
        <input
          type="checkbox"
          className="check-box"
          checked={todo.done}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {projectName ? (
            <span
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-mono border flex-shrink-0"
              style={{
                borderColor: `${projectColor || "#f59e0b"}40`,
                backgroundColor: `${projectColor || "#f59e0b"}15`,
                color: projectColor || "#f59e0b",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: projectColor || "#f59e0b" }} />
              {projectName}
            </span>
          ) : !todo.projectId && onAssignProject ? (
            <button
              type="button"
              onClick={() => onAssignProject(todo)}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-mono border border-[var(--amber)]/50 text-[var(--amber)] hover:bg-[var(--amber)] hover:text-[#1c1b19] transition-colors flex-shrink-0"
              title={t("assign_project")}
            >
              + Dự án
            </button>
          ) : null}
          <span
            className={`truncate text-[15px] transition-colors ${
              todo.done
                ? "text-[var(--ink-faint)] line-through"
                : "text-[var(--ink)]"
            }`}
          >
            {todo.text}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <input
            type="date"
            value={todo.startDate}
            onChange={(e) => {
              const next = reconcileDateRange(e.target.value, todo.endDate, "start");
              onChangeDateRange(next.startDate, next.endDate);
            }}
            className="rounded-sm border border-[var(--hairline)] bg-transparent px-2 py-1 text-[11px] text-[var(--ink-muted)]"
          />
          <span className="text-[10px] text-[var(--ink-faint)]">→</span>
          <input
            type="date"
            value={todo.endDate}
            onChange={(e) => {
              const next = reconcileDateRange(todo.startDate, e.target.value, "end");
              onChangeDateRange(next.startDate, next.endDate);
            }}
            className="rounded-sm border border-[var(--hairline)] bg-transparent px-2 py-1 text-[11px] text-[var(--ink-muted)]"
          />
        </div>

        {total > 0 && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="font-mono text-xs text-[var(--ink-faint)] hover:text-[var(--amber)] transition-colors tabular-nums"
            aria-label={t("toggle_subtasks")}
          >
            {doneCount}/{total} {open ? "▾" : "▸"}
          </button>
        )}

        <button
          onClick={onDelete}
          aria-label={t("delete_task")}
          className="opacity-0 group-hover:opacity-100 text-[var(--ink-faint)] hover:text-[var(--danger)] text-xs font-mono transition-opacity px-1"
        >
          ✕
        </button>
      </div>

      {open && (
        <div className="pb-2">
          {visibleSubtasks.map((sub) => (
            <SubTodoRow
              key={sub.id}
              sub={sub}
              onToggle={(done) => onToggleSub(sub.id, done)}
              onDelete={() => onDeleteSub(sub.id)}
              onChangeDateRange={(startDate, endDate) => onChangeSubDateRange(sub.id, startDate, endDate)}
            />
          ))}

          <form onSubmit={submitSub} className="flex items-center gap-2.5 pl-8 pt-1">
            <span className="text-[var(--ink-faint)] text-sm font-mono">↳</span>
            <input
              value={subText}
              onChange={(e) => setSubText(e.target.value)}
              placeholder={t("add_subtask_placeholder")}
              className="flex-1 bg-transparent text-sm py-1 text-[var(--ink-muted)] placeholder:text-[var(--ink-faint)] focus:outline-none border-b border-transparent focus:border-[var(--hairline)] transition-colors"
            />
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={subStartDate}
                onChange={(e) => {
                  const next = reconcileDateRange(e.target.value, subEndDate, "start");
                  setSubStartDate(next.startDate);
                  setSubEndDate(next.endDate);
                }}
                className="rounded-sm border border-[var(--hairline)] bg-transparent px-2 py-1 text-[11px] text-[var(--ink-muted)]"
              />
              <span className="text-[10px] text-[var(--ink-faint)]">→</span>
              <input
                type="date"
                value={subEndDate}
                onChange={(e) => {
                  const next = reconcileDateRange(subStartDate, e.target.value, "end");
                  setSubStartDate(next.startDate);
                  setSubEndDate(next.endDate);
                }}
                className="rounded-sm border border-[var(--hairline)] bg-transparent px-2 py-1 text-[11px] text-[var(--ink-muted)]"
              />
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
