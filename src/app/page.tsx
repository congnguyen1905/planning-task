"use client";

import { useState } from "react";
import { useTodos } from "@/lib/useTodos";
import { AddTodoForm } from "@/components/AddTodoForm";
import { TodoRow } from "@/components/TodoRow";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { addDaysToDateKey, formatDateKey, formatDateLabel } from "@/lib/date";

export default function Home() {
  const { language, t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const {
    todos,
    lastSync,
    hasHydrated,
    addTodo,
    updateTodo,
    deleteTodo,
    addSubTodo,
    updateSubTodo,
    deleteSubTodo,
  } = useTodos();

  const visibleTodos = todos.filter((todo) => {
    const parentMatches = todo.date === selectedDate;
    const subtaskMatches = todo.subtodos.some((sub) => sub.date === selectedDate);
    return parentMatches || subtaskMatches;
  });
  const active = visibleTodos.filter((t) => !t.done);
  const done = visibleTodos.filter((t) => t.done);
  const totalDone = visibleTodos.reduce((acc, t) => acc + (t.done ? 1 : 0), 0);

  return (
    <main className="flex-1 bg-[var(--bg)]">
      <LanguageSwitcher />
      <div className="max-w-xl mx-auto px-6 py-14 sm:py-20">
        <header className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--amber)] mb-2">
            {formatDateLabel(selectedDate, language)}
          </p>
          <h1 className="font-display italic text-4xl text-[var(--ink)]">
            {t("app_title")}
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-faint)] font-mono">
            {visibleTodos.length === 0
              ? t("no_tasks")
              : `${totalDone}/${visibleTodos.length} ${t("tasks_completed")}${
                  lastSync ? ` · ${language === "vi" ? "đồng bộ lúc" : "synced at"} ${lastSync.toLocaleTimeString(language === "vi" ? "vi-VN" : "en-US")}` : ""
                }`}
          </p>
        </header>

        <div className="mb-6 flex items-center justify-between rounded-sm border border-[var(--hairline)] px-3 py-2">
          <button
            type="button"
            onClick={() => setSelectedDate((current) => addDaysToDateKey(current, -1))}
            className="rounded-sm border border-[var(--hairline)] px-2 py-1 text-sm text-[var(--ink-muted)]"
          >
            {t("previous_day")}
          </button>
          <label className="flex items-center gap-2 text-sm text-[var(--ink-faint)]">
            <span className="font-mono text-[11px] uppercase tracking-wider">{t("filter_date")}</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-sm border border-[var(--hairline)] bg-transparent px-2 py-1 text-sm text-[var(--ink)]"
            />
          </label>
          <button
            type="button"
            onClick={() => setSelectedDate((current) => addDaysToDateKey(current, 1))}
            className="rounded-sm border border-[var(--hairline)] px-2 py-1 text-sm text-[var(--ink-muted)]"
          >
            {t("next_day")}
          </button>
        </div>

        <div className="mb-8">
          <AddTodoForm onAdd={addTodo} defaultDate={selectedDate} />
        </div>

        {!hasHydrated && visibleTodos.length === 0 ? null : visibleTodos.length === 0 ? (
          <p className="text-[var(--ink-faint)] text-sm italic">
            {t("empty_state")}
          </p>
        ) : (
          <div className="space-y-8">
            {active.length > 0 && (
              <section>
                {active.map((todo) => (
                  <TodoRow
                    key={todo.id}
                    todo={todo}
                    selectedDate={selectedDate}
                    onToggle={(v) => updateTodo(todo.id, { done: v })}
                    onChangeDate={(date) => updateTodo(todo.id, { date })}
                    onDelete={() => deleteTodo(todo.id)}
                    onAddSub={(text, date) => addSubTodo(todo.id, text, date)}
                    onToggleSub={(subId, v) =>
                      updateSubTodo(todo.id, subId, { done: v })
                    }
                    onDeleteSub={(subId) => deleteSubTodo(todo.id, subId)}
                    onChangeSubDate={(subId, date) => updateSubTodo(todo.id, subId, { date })}
                  />
                ))}
              </section>
            )}

            {done.length > 0 && (
              <section>
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--ink-faint)] mb-1">
                  {t("completed_section")}
                </p>
                {done.map((todo) => (
                  <TodoRow
                    key={todo.id}
                    todo={todo}
                    selectedDate={selectedDate}
                    onToggle={(v) => updateTodo(todo.id, { done: v })}
                    onChangeDate={(date) => updateTodo(todo.id, { date })}
                    onDelete={() => deleteTodo(todo.id)}
                    onAddSub={(text, date) => addSubTodo(todo.id, text, date)}
                    onToggleSub={(subId, v) =>
                      updateSubTodo(todo.id, subId, { done: v })
                    }
                    onDeleteSub={(subId) => deleteSubTodo(todo.id, subId)}
                    onChangeSubDate={(subId, date) => updateSubTodo(todo.id, subId, { date })}
                  />
                ))}
              </section>
            )}
          </div>
        )}

        <footer className="mt-16 text-center">
          <p className="font-mono text-[11px] text-[var(--ink-faint)]">
            {t("auto_sync")}
          </p>
        </footer>
      </div>
    </main>
  );
}
