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
import { CustomDateRangePicker } from "@/components/CustomDateRangePicker";
import { DatePicker } from "@/components/DatePicker";
import { Button } from "@/components/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useThemeContext } from "@/contexts/ThemeContext";
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
  const { settings } = useThemeContext();
  const isClassic = settings.style === "classic";

  const todayKey = formatDateKey(new Date());
  const [rangeStart, setRangeStart] = useState(formatDateKey(startOfWeek(new Date())));
  const [rangeEnd, setRangeEnd] = useState(addDaysToDateKey(formatDateKey(startOfWeek(new Date())), 6));
  const [view, setView] = useState<"list" | "calendar">("calendar");
  const [useDataApi, setUseDataApi] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
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

  const headerComponent = (
    <header className={isClassic ? "mb-6 pb-6 border-b border-[var(--hairline)] flex flex-wrap items-start justify-between gap-6" : ""}>
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--amber)] mb-2">
          {formatDateLabel(rangeStart, language)} — {formatDateLabel(rangeEnd, language)}
        </p>
        <h1 className="font-display italic text-4xl text-[var(--ink)]">
          {t("app_title")}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-sm text-[var(--ink-faint)]">
          <span>
            {visibleTodos.length === 0
              ? t("no_tasks")
              : `${totalDone}/${visibleTodos.length} ${t("tasks_completed")}${
                  lastSync ? ` · ${language === "vi" ? "đồng bộ lúc" : "synced at"} ${lastSync.toLocaleTimeString(language === "vi" ? "vi-VN" : "en-US")}` : ""
                }`}
          </span>
          {selectedProjectObj ? (
            <span className="font-mono text-xs text-[var(--amber)] flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: selectedProjectObj.color || "#f59e0b" }} />
              {selectedProjectObj.name}
            </span>
          ) : selectedProjectId === "unassigned" ? (
            <span className="font-mono text-xs text-amber-500 flex items-center gap-1.5 italic">
              <span className="h-2 w-2 rounded-full border border-dashed border-amber-500" />
              {t("unassigned_project")}
            </span>
          ) : null}
        </div>
        <label className="mt-3 inline-flex items-center gap-2 text-sm text-[var(--ink-faint)]">
          <input
            type="checkbox"
            checked={useDataApi}
            onChange={(e) => setUseDataApi(e.target.checked)}
            className="h-4 w-4 rounded border border-[var(--hairline)] bg-[var(--bg)] accent-[var(--amber)] cursor-pointer"
          />
          <span>{t("use_data_api")}</span>
        </label>
      </div>

      {isClassic && (
        <div className="flex flex-wrap items-center justify-between gap-6 w-full lg:w-auto lg:self-center">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--ink-faint)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--status-not-started)]" />
              {t("status_not_started")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--status-in-progress)]" />
              {t("status_in_progress")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--status-overdue)]" />
              {t("status_overdue")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--status-done)]" />
              {t("status_done")}
            </span>
          </div>
          <p className="text-xs italic text-[var(--ink-faint)] font-mono max-w-xs text-right hidden sm:block">
            {t("drag_hint")}
          </p>
        </div>
      )}
    </header>
  );

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

      <div className={`w-full px-4 sm:px-8 xl:px-12 ${isClassic ? "py-6 lg:py-8" : "py-10 lg:py-14"}`}>
        {isClassic && headerComponent}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr] lg:items-start">
          {/* LEFT — sidebar: header + bộ lọc dự án + bộ lọc ngày + toggle view + form thêm việc */}
          <aside className="space-y-6 lg:sticky lg:top-6">
            {!isClassic && headerComponent}

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
            <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  📅 {language === "vi" ? "Khoảng thời gian" : "Date Filter"}
                </span>
                <Button
                  variant="soft"
                  color="primary"
                  size="sm"
                  onClick={() => setIsDatePickerOpen(true)}
                >
                  {language === "vi" ? "Chọn Nhanh" : "Quick Pick"}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outlined"
                  color="inherit"
                  size="sm"
                  fullWidth
                  onClick={() => shiftRange(-1)}
                >
                  {t("previous_day")}
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="sm"
                  fullWidth
                  onClick={() => shiftRange(1)}
                >
                  {t("next_day")}
                </Button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">{t("range_from")}</span>
                <DatePicker
                  value={rangeStart}
                  onChange={(val) => setRange(val, rangeEnd)}
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">{t("range_to")}</span>
                <DatePicker
                  value={rangeEnd}
                  onChange={(val) => setRange(rangeStart, val)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="soft"
                  color="inherit"
                  size="sm"
                  fullWidth
                  onClick={selectThisWeek}
                >
                  {t("this_week")}
                </Button>
                <Button
                  variant="soft"
                  color="inherit"
                  size="sm"
                  fullWidth
                  onClick={selectThisMonth}
                >
                  {t("this_month")}
                </Button>
              </div>
            </div>

            <CustomDateRangePicker
              open={isDatePickerOpen}
              startDate={rangeStart}
              endDate={rangeEnd}
              title={language === "vi" ? "Chọn khoảng thời gian Lịch" : "Select Date Range Filter"}
              onClose={() => setIsDatePickerOpen(false)}
              onApply={(start, end) => setRange(start, end)}
            />

            {/* VIEW SWITCHER */}
            <div className="inline-flex w-full rounded-xl border border-[var(--hairline)] bg-[var(--surface-raised)]/60 p-1 gap-1">
              <Button
                fullWidth
                size="sm"
                variant={view === "list" ? "contained" : "text"}
                color={view === "list" ? "primary" : "inherit"}
                onClick={() => setView("list")}
              >
                {t("view_list")}
              </Button>
              <Button
                fullWidth
                size="sm"
                variant={view === "calendar" ? "contained" : "text"}
                color={view === "calendar" ? "primary" : "inherit"}
                onClick={() => setView("calendar")}
              >
                {t("view_calendar")}
              </Button>
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
