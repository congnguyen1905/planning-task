"use client";

import { useState } from "react";
import { useTodos } from "@/lib/useTodos";
import { AddTodoForm } from "@/components/AddTodoForm";
import { TodoRow } from "@/components/TodoRow";
import { CalendarView } from "@/components/CalendarView";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  addDaysToDateKey,
  formatDateKey,
  formatDateLabel,
  isWithinFilterRange,
} from "@/lib/date";

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // tuần bắt đầu từ thứ 2
  d.setDate(d.getDate() + diff);
  return d;
}

export default function Home() {
  const { language, t } = useLanguage();
  const todayKey = formatDateKey(new Date());
  const [rangeStart, setRangeStart] = useState(formatDateKey(startOfWeek(new Date())));
  const [rangeEnd, setRangeEnd] = useState(addDaysToDateKey(formatDateKey(startOfWeek(new Date())), 6));
  const [view, setView] = useState<"list" | "calendar">("calendar");
  const [useDataApi, setUseDataApi] = useState(false);
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
  } = useTodos(useDataApi);

  const visibleTodos = todos.filter((todo) => {
    const parentMatches = isWithinFilterRange(todo.startDate, todo.endDate, rangeStart, rangeEnd);
    const subtaskMatches = todo.subtodos.some((sub) =>
      isWithinFilterRange(sub.startDate, sub.endDate, rangeStart, rangeEnd)
    );
    return parentMatches || subtaskMatches;
  });
  const active = visibleTodos.filter((t) => !t.done);
  const done = visibleTodos.filter((t) => t.done);
  const totalDone = visibleTodos.reduce((acc, t) => acc + (t.done ? 1 : 0), 0);

  function setRange(start: string, end: string) {
    if (end < start) {
      setRangeStart(end);
      setRangeEnd(start);
    } else {
      setRangeStart(start);
      setRangeEnd(end);
    }
  }

  function shiftRange(days: number) {
    setRangeStart((s) => addDaysToDateKey(s, days));
    setRangeEnd((e) => addDaysToDateKey(e, days));
  }

  function selectThisWeek() {
    const start = formatDateKey(startOfWeek(new Date()));
    setRange(start, addDaysToDateKey(start, 6));
  }

  function selectThisMonth() {
    const now = new Date();
    const first = formatDateKey(new Date(now.getFullYear(), now.getMonth(), 1));
    const last = formatDateKey(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    setRange(first, last);
  }

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <LanguageSwitcher />
      <div className="w-full px-4 py-10 sm:px-8 lg:py-14 xl:px-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr] lg:items-start">
          {/* LEFT — mục 1: header + bộ lọc + toggle view + form thêm việc */}
          <aside className="space-y-6 lg:sticky lg:top-10">
            <header>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--amber)] mb-2">
                {formatDateLabel(rangeStart, language)} — {formatDateLabel(rangeEnd, language)}
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
              <label className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--ink-faint)]">
                <input
                  type="checkbox"
                  checked={useDataApi}
                  onChange={(e) => setUseDataApi(e.target.checked)}
                  className="h-4 w-4 rounded border border-[var(--hairline)] bg-[var(--bg)] accent-[var(--amber)]"
                />
                <span>{t("use_data_api")}</span>
              </label>
            </header>

            <div className="rounded-sm border border-[var(--hairline)] p-3 space-y-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => shiftRange(-1)}
                  className="flex-1 rounded-sm border border-[var(--hairline)] px-2 py-1 text-sm text-[var(--ink-muted)]"
                >
                  {t("previous_day")}
                </button>
                <button
                  type="button"
                  onClick={() => shiftRange(1)}
                  className="flex-1 rounded-sm border border-[var(--hairline)] px-2 py-1 text-sm text-[var(--ink-muted)]"
                >
                  {t("next_day")}
                </button>
              </div>

              <label className="flex items-center justify-between gap-2 text-sm text-[var(--ink-faint)]">
                <span className="font-mono text-[11px] uppercase tracking-wider">{t("range_from")}</span>
                <input
                  type="date"
                  value={rangeStart}
                  onChange={(e) => setRange(e.target.value, rangeEnd)}
                  className="rounded-sm border border-[var(--hairline)] bg-transparent px-2 py-1 text-sm text-[var(--ink)]"
                />
              </label>
              <label className="flex items-center justify-between gap-2 text-sm text-[var(--ink-faint)]">
                <span className="font-mono text-[11px] uppercase tracking-wider">{t("range_to")}</span>
                <input
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => setRange(rangeStart, e.target.value)}
                  className="rounded-sm border border-[var(--hairline)] bg-transparent px-2 py-1 text-sm text-[var(--ink)]"
                />
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectThisWeek}
                  className="flex-1 rounded-sm border border-[var(--hairline)] px-2 py-1 text-xs text-[var(--ink-muted)]"
                >
                  {t("this_week")}
                </button>
                <button
                  type="button"
                  onClick={selectThisMonth}
                  className="flex-1 rounded-sm border border-[var(--hairline)] px-2 py-1 text-xs text-[var(--ink-muted)]"
                >
                  {t("this_month")}
                </button>
              </div>
            </div>

            <div className="inline-flex w-full rounded-sm border border-[var(--hairline)] p-0.5">
              <button
                type="button"
                onClick={() => setView("list")}
                className={`flex-1 rounded-sm px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                  view === "list" ? "bg-[var(--amber)] text-[#1c1b19]" : "text-[var(--ink-faint)]"
                }`}
              >
                {t("view_list")}
              </button>
              <button
                type="button"
                onClick={() => setView("calendar")}
                className={`flex-1 rounded-sm px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                  view === "calendar" ? "bg-[var(--amber)] text-[#1c1b19]" : "text-[var(--ink-faint)]"
                }`}
              >
                {t("view_calendar")}
              </button>
            </div>

            <AddTodoForm onAdd={addTodo} defaultStartDate={todayKey} defaultEndDate={todayKey} />
          </aside>

          {/* RIGHT — mục 2: danh sách / lịch tiến độ */}
          <section className="min-w-0">
            {!hasHydrated && visibleTodos.length === 0 ? null : visibleTodos.length === 0 ? (
              <p className="text-[var(--ink-faint)] text-sm italic">
                {t("empty_state")}
              </p>
            ) : view === "calendar" ? (
              <CalendarView
                todos={visibleTodos}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                onUpdateTodo={(id, startDate, endDate) => updateTodo(id, { startDate, endDate })}
                onUpdateSubTodo={(parentId, subId, startDate, endDate) =>
                  updateSubTodo(parentId, subId, { startDate, endDate })
                }
              />
            ) : (
              <div className="space-y-8">
                {active.length > 0 && (
                  <section>
                    {active.map((todo) => (
                      <TodoRow
                        key={todo.id}
                        todo={todo}
                        rangeStart={rangeStart}
                        rangeEnd={rangeEnd}
                        onToggle={(v) => updateTodo(todo.id, { done: v })}
                        onChangeDateRange={(startDate, endDate) => updateTodo(todo.id, { startDate, endDate })}
                        onDelete={() => deleteTodo(todo.id)}
                        onAddSub={(text, startDate, endDate) => addSubTodo(todo.id, text, startDate, endDate)}
                        onToggleSub={(subId, v) =>
                          updateSubTodo(todo.id, subId, { done: v })
                        }
                        onDeleteSub={(subId) => deleteSubTodo(todo.id, subId)}
                        onChangeSubDateRange={(subId, startDate, endDate) => updateSubTodo(todo.id, subId, { startDate, endDate })}
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
                        rangeStart={rangeStart}
                        rangeEnd={rangeEnd}
                        onToggle={(v) => updateTodo(todo.id, { done: v })}
                        onChangeDateRange={(startDate, endDate) => updateTodo(todo.id, { startDate, endDate })}
                        onDelete={() => deleteTodo(todo.id)}
                        onAddSub={(text, startDate, endDate) => addSubTodo(todo.id, text, startDate, endDate)}
                        onToggleSub={(subId, v) =>
                          updateSubTodo(todo.id, subId, { done: v })
                        }
                        onDeleteSub={(subId) => deleteSubTodo(todo.id, subId)}
                        onChangeSubDateRange={(subId, startDate, endDate) => updateSubTodo(todo.id, subId, { startDate, endDate })}
                      />
                    ))}
                  </section>
                )}
              </div>
            )}
          </section>
        </div>

        <footer className="mt-16 text-center">
          <p className="font-mono text-[11px] text-[var(--ink-faint)]">
            {t("auto_sync")}
          </p>
        </footer>
      </div>
    </main>
  );
}
