"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import type { Todo } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { Checkbox } from "./Checkbox";
import {
  enumerateDateRange,
  formatDateKey,
  formatDateLabel,
  getTaskStatus,
  addDaysToDateKey,
  type TaskStatus,
} from "@/lib/date";

type Row = {
  key: string;
  parentId?: string;
  projectId?: string;
  label: string;
  isSub: boolean;
  startDate: string;
  endDate: string;
  done: boolean;
  todo: Todo;
};

type DragState = {
  rowKey: string;
  isSub: boolean;
  parentId?: string;
  label: string;
  dragType: "resize-start" | "resize-end" | "move";
  initialDay: string;
  initialStart: string;
  initialEnd: string;
  currentStart: string;
  currentEnd: string;
};

const STATUS_STYLE: Record<TaskStatus, { bg: string; dim: string }> = {
  not_started: { bg: "var(--status-not-started)", dim: "var(--status-not-started-dim)" },
  in_progress: { bg: "var(--status-in-progress)", dim: "var(--status-in-progress-dim)" },
  overdue: { bg: "var(--status-overdue)", dim: "var(--status-overdue-dim)" },
  done: { bg: "var(--status-done)", dim: "var(--status-done-dim)" },
};

function formatDayHeader(dateKey: string): { weekday: string; day: string } {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return {
    weekday: date.toLocaleDateString("vi-VN", { weekday: "short" }).replace("Th ", "T"),
    day: String(d).padStart(2, "0"),
  };
}

function getDaysDiff(startKey: string, endKey: string): number {
  const [y1, m1, d1] = startKey.split("-").map(Number);
  const [y2, m2, d2] = endKey.split("-").map(Number);
  const date1 = Date.UTC(y1, m1 - 1, d1);
  const date2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((date2 - date1) / (86400 * 1000));
}

export function CalendarView({
  todos,
  rangeStart,
  rangeEnd,
  projectsMap,
  onUpdateTodo,
  onUpdateSubTodo,
  onSelectTodo,
  onToggleTodo,
  onToggleSubTodo,
}: {
  todos: Todo[];
  rangeStart: string;
  rangeEnd: string;
  projectsMap?: Record<string, { name: string; color?: string }>;
  onUpdateTodo?: (id: string, startDate: string, endDate: string) => void;
  onUpdateSubTodo?: (parentId: string, subId: string, startDate: string, endDate: string) => void;
  onSelectTodo?: (todo: Todo) => void;
  onToggleTodo?: (id: string, done: boolean) => void;
  onToggleSubTodo?: (parentId: string, subId: string, done: boolean) => void;
}) {
  const { t, language } = useLanguage();
  const today = formatDateKey(new Date());
  const days = useMemo(() => enumerateDateRange(rangeStart, rangeEnd), [rangeStart, rangeEnd]);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      // 1. Sort by Project Name (unassigned projects placed at the end)
      const projA = a.projectId ? projectsMap?.[a.projectId]?.name || a.projectId : "\uFFFF";
      const projB = b.projectId ? projectsMap?.[b.projectId]?.name || b.projectId : "\uFFFF";
      const projCompare = projA.localeCompare(projB, language === "vi" ? "vi" : "en");
      if (projCompare !== 0) return projCompare;

      // 2. Sort by Start Date ascending ("YYYY-MM-DD")
      if (a.startDate !== b.startDate) {
        return a.startDate.localeCompare(b.startDate);
      }

      // 3. Sort by End Date ascending
      if (a.endDate !== b.endDate) {
        return a.endDate.localeCompare(b.endDate);
      }

      // 4. Stable fallback by creation time / ID
      return (a.createdAt || 0) - (b.createdAt || 0) || a.id.localeCompare(b.id);
    });
  }, [todos, projectsMap, language]);

  const rows: Row[] = useMemo(() => {
    const result: Row[] = [];
    for (const todo of sortedTodos) {
      result.push({
        key: todo.id,
        projectId: todo.projectId,
        label: todo.text,
        isSub: false,
        startDate: todo.startDate,
        endDate: todo.endDate,
        done: todo.done,
        todo,
      });

      const sortedSubtodos = [...todo.subtodos].sort((sa, sb) => {
        if (sa.startDate !== sb.startDate) {
          return sa.startDate.localeCompare(sb.startDate);
        }
        return (sa.createdAt || 0) - (sb.createdAt || 0) || sa.id.localeCompare(sb.id);
      });

      for (const sub of sortedSubtodos) {
        result.push({
          key: sub.id,
          parentId: todo.id,
          projectId: todo.projectId,
          label: sub.text,
          isSub: true,
          startDate: sub.startDate,
          endDate: sub.endDate,
          done: sub.done,
          todo,
        });
      }
    }
    return result;
  }, [sortedTodos]);

  useEffect(() => {
    if (!dragState) return;

    function handlePointerMove(e: PointerEvent) {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const cell = target?.closest("[data-day]");
      const hoveredDay = cell?.getAttribute("data-day");

      if (!hoveredDay) return;

      setDragState((prev) => {
        if (!prev) return null;
        const { dragType, initialStart, initialEnd, initialDay } = prev;

        let newStart = prev.currentStart;
        let newEnd = prev.currentEnd;

        if (dragType === "resize-start") {
          if (hoveredDay > initialEnd) {
            newStart = initialEnd;
            newEnd = initialEnd;
          } else {
            newStart = hoveredDay;
            newEnd = initialEnd;
          }
        } else if (dragType === "resize-end") {
          if (hoveredDay < initialStart) {
            newStart = initialStart;
            newEnd = initialStart;
          } else {
            newStart = initialStart;
            newEnd = hoveredDay;
          }
        } else if (dragType === "move") {
          const delta = getDaysDiff(initialDay, hoveredDay);
          newStart = addDaysToDateKey(initialStart, delta);
          newEnd = addDaysToDateKey(initialEnd, delta);
        }

        if (newStart === prev.currentStart && newEnd === prev.currentEnd) {
          return prev;
        }

        return { ...prev, currentStart: newStart, currentEnd: newEnd };
      });
    }

    function handlePointerUp() {
      setDragState((prev) => {
        if (prev) {
          const { rowKey, isSub, parentId, currentStart, currentEnd, initialStart, initialEnd } = prev;
          if (currentStart !== initialStart || currentEnd !== initialEnd) {
            if (isSub && parentId) {
              onUpdateSubTodo?.(parentId, rowKey, currentStart, currentEnd);
            } else {
              onUpdateTodo?.(rowKey, currentStart, currentEnd);
            }
          }
        }
        return null;
      });
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragState, onUpdateTodo, onUpdateSubTodo]);

  const handleStartDrag = useCallback(
    (
      e: React.PointerEvent,
      row: Row,
      dragType: "resize-start" | "resize-end" | "move",
      currentDay: string
    ) => {
      e.preventDefault();
      e.stopPropagation();

      setDragState({
        rowKey: row.key,
        isSub: row.isSub,
        parentId: row.parentId,
        label: row.label,
        dragType,
        initialDay: currentDay,
        initialStart: row.startDate,
        initialEnd: row.endDate,
        currentStart: row.startDate,
        currentEnd: row.endDate,
      });
    },
    []
  );

  if (days.length === 0) {
    return (
      <p className="text-[var(--ink-faint)] text-sm italic">{t("no_tasks_in_range")}</p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-[var(--ink-faint)]">
        <div className="flex items-center gap-4">
          <LegendDot color="var(--status-not-started)" label={t("status_not_started")} />
          <LegendDot color="var(--status-in-progress)" label={t("status_in_progress")} />
          <LegendDot color="var(--status-overdue)" label={t("status_overdue")} />
          <LegendDot color="var(--status-done)" label={t("status_done")} />
        </div>
        <span className="hidden sm:inline-block italic text-[var(--ink-muted)]">
          {t("drag_hint")}
        </span>
      </div>

      <div className="overflow-x-auto rounded-sm border border-[var(--hairline)]">
        <table className="border-collapse w-full text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-[var(--surface)] border-b border-r border-[var(--hairline)] px-3 py-2 text-left font-mono text-[var(--ink-muted)] min-w-[180px]">
                {t("view_list")}
              </th>
              {days.map((day) => {
                const { weekday, day: dayNum } = formatDayHeader(day);
                const isToday = day === today;
                return (
                  <th
                    key={day}
                    data-day={day}
                    className={`border-b border-l border-[var(--hairline)] px-1.5 py-2 text-center font-mono font-normal min-w-[34px] ${
                      isToday
                        ? "bg-[var(--amber)] text-[#1c1b19]"
                        : "bg-[var(--surface)] text-[var(--ink-faint)]"
                    }`}
                    title={isToday ? t("today_column") : day}
                  >
                    <div className="leading-tight">{weekday}</div>
                    <div className="leading-tight tabular-nums">{dayNum}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isRowDragging = dragState?.rowKey === row.key;
              const effectiveStart = isRowDragging ? dragState.currentStart : row.startDate;
              const effectiveEnd = isRowDragging ? dragState.currentEnd : row.endDate;

              const status = getTaskStatus(effectiveStart, effectiveEnd, row.done, today);
              const style = STATUS_STYLE[status];

              return (
                <tr key={row.key} className="group">
                  <td
                    className={`sticky left-0 z-10 bg-[var(--bg)] group-hover:bg-[var(--surface)] border-r border-b border-[var(--hairline)] px-3 py-1.5 whitespace-nowrap ${
                      row.isSub ? "pl-7 text-[var(--ink-muted)]" : "text-[var(--ink)] font-medium"
                    } ${row.done ? "line-through opacity-60" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2 max-w-[220px]">
                      <div
                        className={`flex items-center gap-1.5 truncate ${
                          !row.isSub && onSelectTodo ? "cursor-pointer hover:text-[var(--amber)]" : ""
                        }`}
                        onClick={() => {
                          if (!row.isSub && onSelectTodo) {
                            onSelectTodo(row.todo);
                          }
                        }}
                      >
                        <Checkbox
                          size="sm"
                          checked={row.done}
                          onChange={(v: boolean) => {
                            if (row.isSub && row.parentId) {
                              onToggleSubTodo?.(row.parentId, row.key, v);
                            } else {
                              onToggleTodo?.(row.key, v);
                            }
                          }}
                        />

                        {row.projectId && projectsMap?.[row.projectId] ? (
                          <span
                            className="h-2 w-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: projectsMap[row.projectId].color || "#f59e0b" }}
                            title={projectsMap[row.projectId].name}
                          />
                        ) : !row.isSub ? (
                          <span
                            className="h-2 w-2 rounded-full border border-dashed border-amber-500/80 flex-shrink-0"
                            title="Chưa gán dự án"
                          />
                        ) : null}
                        <span className="truncate">{row.label}</span>
                      </div>

                      {!row.projectId && !row.isSub && onSelectTodo && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTodo(row.todo);
                          }}
                          className="text-[10px] font-mono text-[var(--amber)] border border-[var(--amber)]/40 hover:bg-[var(--amber)] hover:text-[#1c1b19] rounded px-1.5 py-0.5 transition-colors flex-shrink-0"
                          title={t("assign_project")}
                        >
                          + Dự án
                        </button>
                      )}
                    </div>
                  </td>
                  {days.map((day) => {
                    const inRange = day >= effectiveStart && day <= effectiveEnd;
                    const isStartCell = day === effectiveStart;
                    const isEndCell = day === effectiveEnd;

                    const isParentWithSubtasks = !row.isSub && row.todo.subtodos.length > 0;

                    return (
                      <td
                        key={day}
                        data-day={day}
                        className="border-l border-b border-[var(--hairline)] p-0 relative"
                      >
                        {inRange ? (
                          isParentWithSubtasks ? (
                            /* Parent Todo with Subtasks: 1 thin summary line to distinguish parent planning */
                            <div
                              className="h-6 w-full flex items-center relative select-none"
                              title={`${row.label} (${formatDateLabel(effectiveStart, language)} — ${formatDateLabel(effectiveEnd, language)}) - Kế hoạch tổng quan theo Subtask`}
                              onClick={(e) => {
                                if (!row.projectId && onSelectTodo) {
                                  e.stopPropagation();
                                  onSelectTodo(row.todo);
                                }
                              }}
                            >
                              <div
                                className={`h-2 w-full relative transition-all ${
                                  isStartCell ? "rounded-l-full" : ""
                                } ${isEndCell ? "rounded-r-full" : ""}`}
                                style={{ backgroundColor: style.bg }}
                              >
                                {isStartCell && (
                                  <div
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3.5 rounded-sm"
                                    style={{ backgroundColor: style.bg }}
                                    title="Start"
                                  />
                                )}
                                {isEndCell && (
                                  <div
                                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-3.5 rounded-sm"
                                    style={{ backgroundColor: style.bg }}
                                    title="End"
                                  />
                                )}
                              </div>
                            </div>
                          ) : (
                            /* Normal Task or Subtask Bar */
                            <div
                              className={`h-6 w-full relative group/bar select-none cursor-grab active:cursor-grabbing hover:opacity-90 transition-shadow ${
                                isStartCell ? "rounded-l-sm" : ""
                              } ${isEndCell ? "rounded-r-sm" : ""} ${
                                isRowDragging ? "ring-2 ring-[var(--amber)] shadow-lg z-20 opacity-90" : ""
                              }`}
                              style={{ backgroundColor: style.bg }}
                              title={`${row.label} (${formatDateLabel(effectiveStart, language)} — ${formatDateLabel(effectiveEnd, language)})`}
                              onClick={(e) => {
                                if (!row.projectId && !row.isSub && onSelectTodo) {
                                  e.stopPropagation();
                                  onSelectTodo(row.todo);
                                }
                              }}
                              onPointerDown={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.dataset.handle) return;
                                handleStartDrag(e, row, "move", day);
                              }}
                            >
                              {/* Left Resize Handle */}
                              {isStartCell && (
                                <div
                                  data-handle="left"
                                  onPointerDown={(e) => handleStartDrag(e, row, "resize-start", day)}
                                  className="absolute left-0 top-0 bottom-0 w-3 z-30 cursor-ew-resize flex items-center justify-center hover:bg-black/30 rounded-l-sm transition-colors group/handle-left"
                                  title={language === "vi" ? "Kéo cạnh trái để chỉnh ngày bắt đầu" : "Drag left edge to change start date"}
                                >
                                  <div className="w-1 h-3.5 bg-white/80 rounded-full shadow-sm group-hover/handle-left:bg-white group-hover/handle-left:scale-110 transition-all" />
                                </div>
                              )}

                              {/* Right Resize Handle */}
                              {isEndCell && (
                                <div
                                  data-handle="right"
                                  onPointerDown={(e) => handleStartDrag(e, row, "resize-end", day)}
                                  className="absolute right-0 top-0 bottom-0 w-3 z-30 cursor-ew-resize flex items-center justify-center hover:bg-black/30 rounded-r-sm transition-colors group/handle-right"
                                  title={language === "vi" ? "Kéo cạnh phải để chỉnh ngày kết thúc" : "Drag right edge to change end date"}
                                >
                                  <div className="w-1 h-3.5 bg-white/80 rounded-full shadow-sm group-hover/handle-right:bg-white group-hover/handle-right:scale-110 transition-all" />
                                </div>
                              )}
                            </div>
                          )
                        ) : (
                          <div className="h-6 w-full" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dragging Active Toast */}
      {dragState && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-md bg-[var(--surface)] border border-[var(--amber)] px-4 py-2.5 shadow-2xl text-xs font-mono backdrop-blur-sm">
          <div className="h-2.5 w-2.5 rounded-full bg-[var(--amber)] animate-pulse" />
          <div>
            <span className="font-semibold text-[var(--ink)]">{dragState.label}</span>
            <span className="text-[var(--ink-faint)] ml-2">
              {formatDateLabel(dragState.currentStart, language)} — {formatDateLabel(dragState.currentEnd, language)}
            </span>
            <span className="text-[var(--amber)] font-bold ml-2">
              ({getDaysDiff(dragState.currentStart, dragState.currentEnd) + 1} {language === "vi" ? "ngày" : "days"})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2.5 w-2.5 rounded-sm"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

