"use client";

import { useMemo } from "react";
import type { Todo } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { enumerateDateRange, formatDateKey, getTaskStatus, type TaskStatus } from "@/lib/date";

type Row = {
  key: string;
  label: string;
  isSub: boolean;
  startDate: string;
  endDate: string;
  done: boolean;
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

export function CalendarView({
  todos,
  rangeStart,
  rangeEnd,
}: {
  todos: Todo[];
  rangeStart: string;
  rangeEnd: string;
}) {
  const { t } = useLanguage();
  const today = formatDateKey(new Date());
  const days = useMemo(() => enumerateDateRange(rangeStart, rangeEnd), [rangeStart, rangeEnd]);

  const rows: Row[] = useMemo(() => {
    const result: Row[] = [];
    for (const todo of todos) {
      result.push({
        key: todo.id,
        label: todo.text,
        isSub: false,
        startDate: todo.startDate,
        endDate: todo.endDate,
        done: todo.done,
      });
      for (const sub of todo.subtodos) {
        result.push({
          key: sub.id,
          label: sub.text,
          isSub: true,
          startDate: sub.startDate,
          endDate: sub.endDate,
          done: sub.done,
        });
      }
    }
    return result;
  }, [todos]);

  if (days.length === 0) {
    return (
      <p className="text-[var(--ink-faint)] text-sm italic">{t("no_tasks_in_range")}</p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-[var(--ink-faint)]">
        <LegendDot color="var(--status-not-started)" label={t("status_not_started")} />
        <LegendDot color="var(--status-in-progress)" label={t("status_in_progress")} />
        <LegendDot color="var(--status-overdue)" label={t("status_overdue")} />
        <LegendDot color="var(--status-done)" label={t("status_done")} />
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
              const status = getTaskStatus(row.startDate, row.endDate, row.done, today);
              const style = STATUS_STYLE[status];
              return (
                <tr key={row.key} className="group">
                  <td
                    className={`sticky left-0 z-10 bg-[var(--bg)] group-hover:bg-[var(--surface)] border-r border-b border-[var(--hairline)] px-3 py-1.5 whitespace-nowrap ${
                      row.isSub ? "pl-7 text-[var(--ink-muted)]" : "text-[var(--ink)] font-medium"
                    } ${row.done ? "line-through opacity-60" : ""}`}
                  >
                    {row.label}
                  </td>
                  {days.map((day) => {
                    const inRange = day >= row.startDate && day <= row.endDate;
                    return (
                      <td
                        key={day}
                        className="border-l border-b border-[var(--hairline)] p-0"
                      >
                        {inRange ? (
                          <div
                            className="h-6 w-full"
                            style={{ backgroundColor: style.bg }}
                            title={`${row.label} — ${t(`status_${status}`)}`}
                          />
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
