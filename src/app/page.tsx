"use client";

import { useState, useMemo } from "react";
import { useTodos } from "@/lib/useTodos";
import { useProjects } from "@/lib/useProjects";
import { AddTodoForm } from "@/components/AddTodoForm";
import { TodoRow } from "@/components/TodoRow";
import { CalendarView } from "@/components/CalendarView";
import { ProjectList } from "@/components/ProjectList";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { AssignProjectModal } from "@/components/AssignProjectModal";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Todo } from "@/lib/types";
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
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assigningTodo, setAssigningTodo] = useState<Todo | null>(null);

  const { projects, addProject, deleteProject } = useProjects();

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

  const todosCountByProject = useMemo(() => {
    const counts: Record<string, number> = {};
    todos.forEach((t) => {
      const pid = t.projectId || "unassigned";
      counts[pid] = (counts[pid] || 0) + 1;
    });
    return counts;
  }, [todos]);

  const projectsMap = useMemo(() => {
    const map: Record<string, { name: string; color?: string }> = {};
    projects.forEach((p) => {
      map[p.id] = { name: p.name, color: p.color };
    });
    return map;
  }, [projects]);

  const visibleTodos = todos.filter((todo) => {
    // Project filter
    if (selectedProjectId === "unassigned") {
      if (todo.projectId) return false;
    } else if (selectedProjectId !== null) {
      if (todo.projectId !== selectedProjectId) return false;
    }

    // Date range filter
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

  const selectedProjectObj = projects.find((p) => p.id === selectedProjectId);

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <LanguageSwitcher />

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={async (name, description, color) => {
          const updated = await addProject(name, description, color);
          if (updated && updated.length > 0) {
            setSelectedProjectId(updated[updated.length - 1].id);
          }
        }}
      />

      <AssignProjectModal
        isOpen={assigningTodo !== null}
        onClose={() => setAssigningTodo(null)}
        todo={assigningTodo}
        projects={projects}
        onSaveProject={async (todoId, projectId) => {
          await updateTodo(todoId, { projectId });
        }}
      />

      <div className="w-full px-4 py-10 sm:px-8 lg:py-14 xl:px-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr] lg:items-start">
          {/* LEFT — sidebar: header + bộ lọc dự án + bộ lọc ngày + toggle view + form thêm việc */}
          <aside className="space-y-6 lg:sticky lg:top-10">
            <header>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--amber)] mb-2">
                {formatDateLabel(rangeStart, language)} — {formatDateLabel(rangeEnd, language)}
              </p>
              <h1 className="font-display italic text-4xl text-[var(--ink)]">
                {t("app_title")}
              </h1>
              {selectedProjectObj ? (
                <p className="mt-1 font-mono text-xs text-[var(--amber)] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: selectedProjectObj.color || "#f59e0b" }} />
                  {selectedProjectObj.name}
                </p>
              ) : selectedProjectId === "unassigned" ? (
                <p className="mt-1 font-mono text-xs text-amber-500 flex items-center gap-1.5 italic">
                  <span className="h-2 w-2 rounded-full border border-dashed border-amber-500" />
                  {t("unassigned_project")}
                </p>
              ) : null}
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

            {/* PROJECTS SECTION */}
            <ProjectList
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
              onOpenCreateModal={() => setIsModalOpen(true)}
              onDeleteProject={async (id) => {
                await deleteProject(id);
                if (selectedProjectId === id) {
                  setSelectedProjectId(null);
                }
              }}
              todosCountByProject={todosCountByProject}
              totalTodosCount={todos.length}
            />

            {/* DATE RANGE SECTION */}
            <div className="rounded-sm border border-[var(--hairline)] p-3 space-y-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => shiftRange(-1)}
                  className="flex-1 rounded-sm border border-[var(--hairline)] px-2 py-1 text-sm text-[var(--ink-muted)] hover:border-[var(--amber)] transition-colors"
                >
                  {t("previous_day")}
                </button>
                <button
                  type="button"
                  onClick={() => shiftRange(1)}
                  className="flex-1 rounded-sm border border-[var(--hairline)] px-2 py-1 text-sm text-[var(--ink-muted)] hover:border-[var(--amber)] transition-colors"
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
                  className="flex-1 rounded-sm border border-[var(--hairline)] px-2 py-1 text-xs text-[var(--ink-muted)] hover:border-[var(--amber)] transition-colors"
                >
                  {t("this_week")}
                </button>
                <button
                  type="button"
                  onClick={selectThisMonth}
                  className="flex-1 rounded-sm border border-[var(--hairline)] px-2 py-1 text-xs text-[var(--ink-muted)] hover:border-[var(--amber)] transition-colors"
                >
                  {t("this_month")}
                </button>
              </div>
            </div>

            {/* VIEW SWITCHER */}
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

            {/* ADD TODO FORM */}
            <AddTodoForm
              onAdd={addTodo}
              defaultStartDate={todayKey}
              defaultEndDate={todayKey}
              projects={projects}
              selectedProjectId={selectedProjectId === "unassigned" ? null : selectedProjectId}
            />
          </aside>

          {/* RIGHT — danh sách / lịch tiến độ */}
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
                projectsMap={projectsMap}
                onUpdateTodo={(id, startDate, endDate) => updateTodo(id, { startDate, endDate })}
                onUpdateSubTodo={(parentId, subId, startDate, endDate) =>
                  updateSubTodo(parentId, subId, { startDate, endDate })
                }
                onSelectTodo={(todo) => setAssigningTodo(todo)}
                onToggleTodo={(id, done) => updateTodo(id, { done })}
                onToggleSubTodo={(parentId, subId, done) => updateSubTodo(parentId, subId, { done })}
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
                        projectName={selectedProjectId === null && todo.projectId ? projectsMap[todo.projectId]?.name : undefined}
                        projectColor={selectedProjectId === null && todo.projectId ? projectsMap[todo.projectId]?.color : undefined}
                        onToggle={(v) => updateTodo(todo.id, { done: v })}
                        onChangeDateRange={(startDate, endDate) => updateTodo(todo.id, { startDate, endDate })}
                        onDelete={() => deleteTodo(todo.id)}
                        onAddSub={(text, startDate, endDate) => addSubTodo(todo.id, text, startDate, endDate)}
                        onToggleSub={(subId, v) =>
                          updateSubTodo(todo.id, subId, { done: v })
                        }
                        onDeleteSub={(subId) => deleteSubTodo(todo.id, subId)}
                        onChangeSubDateRange={(subId, startDate, endDate) => updateSubTodo(todo.id, subId, { startDate, endDate })}
                        onAssignProject={(todoToAssign) => setAssigningTodo(todoToAssign)}
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
                        projectName={selectedProjectId === null && todo.projectId ? projectsMap[todo.projectId]?.name : undefined}
                        projectColor={selectedProjectId === null && todo.projectId ? projectsMap[todo.projectId]?.color : undefined}
                        onToggle={(v) => updateTodo(todo.id, { done: v })}
                        onChangeDateRange={(startDate, endDate) => updateTodo(todo.id, { startDate, endDate })}
                        onDelete={() => deleteTodo(todo.id)}
                        onAddSub={(text, startDate, endDate) => addSubTodo(todo.id, text, startDate, endDate)}
                        onToggleSub={(subId, v) =>
                          updateSubTodo(todo.id, subId, { done: v })
                        }
                        onDeleteSub={(subId) => deleteSubTodo(todo.id, subId)}
                        onChangeSubDateRange={(subId, startDate, endDate) => updateSubTodo(todo.id, subId, { startDate, endDate })}
                        onAssignProject={(todoToAssign) => setAssigningTodo(todoToAssign)}
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
