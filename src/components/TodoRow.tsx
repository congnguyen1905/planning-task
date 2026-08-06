"use client";

import { useState } from "react";
import type { Todo } from "@/lib/types";
import { SubTodoRow } from "./SubTodoRow";
import { useLanguage } from "@/contexts/LanguageContext";

export function TodoRow({
  todo,
  onToggle,
  onDelete,
  onAddSub,
  onToggleSub,
  onDeleteSub,
}: {
  todo: Todo;
  onToggle: (done: boolean) => void;
  onDelete: () => void;
  onAddSub: (text: string) => void;
  onToggleSub: (subId: string, done: boolean) => void;
  onDeleteSub: (subId: string) => void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(true);
  const [subText, setSubText] = useState("");

  const total = todo.subtodos.length;
  const doneCount = todo.subtodos.filter((s) => s.done).length;

  function submitSub(e: React.FormEvent) {
    e.preventDefault();
    const value = subText.trim();
    if (!value) return;
    onAddSub(value);
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
        <span
          className={`flex-1 text-[15px] transition-colors ${
            todo.done
              ? "text-[var(--ink-faint)] line-through"
              : "text-[var(--ink)]"
          }`}
        >
          {todo.text}
        </span>

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
          {todo.subtodos.map((sub) => (
            <SubTodoRow
              key={sub.id}
              sub={sub}
              onToggle={(done) => onToggleSub(sub.id, done)}
              onDelete={() => onDeleteSub(sub.id)}
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
          </form>
        </div>
      )}
    </div>
  );
}
