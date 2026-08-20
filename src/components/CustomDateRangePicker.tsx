"use client";

import React, { useState, useMemo } from "react";
import { formatDateKey, addDaysToDateKey } from "@/lib/date";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "./Button";

interface CustomDateRangePickerProps {
  open: boolean;
  startDate: string;
  endDate: string;
  variant?: "calendar" | "input";
  title?: string;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

// Mini Interactive Calendar Component matching vite-js DateCalendar
function MiniDateCalendar({
  label,
  selectedKey,
  onSelectDate,
}: {
  label: string;
  selectedKey: string;
  onSelectDate: (key: string) => void;
}) {
  const initialDate = useMemo(() => parseDateKey(selectedKey), [selectedKey]);
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());

  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayOfWeek = useMemo(() => {
    const day = new Date(currentYear, currentMonth, 1).getDay();
    return day === 0 ? 6 : day - 1; // Mon = 0
  }, [currentYear, currentMonth]);

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-[var(--hairline)] bg-[var(--surface-raised)]/40 p-4 w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-sans text-xs font-bold uppercase tracking-wider text-[var(--amber)]">
          {label}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="rounded p-1 text-xs text-[var(--ink-muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
          >
            ‹
          </button>
          <span className="font-sans text-xs font-semibold text-[var(--ink)]">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="rounded p-1 text-xs text-[var(--ink-muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-sans text-[11px] text-[var(--ink-faint)] font-medium mb-1">
        {weekDays.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-7 w-7" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const key = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = key === selectedKey;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(key)}
              className={`h-7 w-7 rounded-full text-xs font-medium transition-all flex items-center justify-center ${
                isSelected
                  ? "bg-[var(--amber)] text-[#FFFFFF] shadow-sm font-bold scale-105"
                  : "text-[var(--ink)] hover:bg-[var(--surface)] hover:text-[var(--amber)]"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CustomDateRangePicker({
  open,
  startDate: initialStartDate,
  endDate: initialEndDate,
  variant = "calendar",
  title = "Select date range",
  onClose,
  onApply,
}: CustomDateRangePickerProps) {
  const { t, language } = useLanguage();
  const [tempStart, setTempStart] = useState(initialStartDate);
  const [tempEnd, setTempEnd] = useState(initialEndDate);

  if (!open) return null;

  const isError = tempEnd < tempStart;

  const selectToday = () => {
    const today = formatDateKey(new Date());
    setTempStart(today);
    setTempEnd(today);
  };

  const selectThisWeek = () => {
    const start = formatDateKey(startOfWeek(new Date()));
    const end = addDaysToDateKey(start, 6);
    setTempStart(start);
    setTempEnd(end);
  };

  const selectNext7Days = () => {
    const start = formatDateKey(new Date());
    const end = addDaysToDateKey(start, 6);
    setTempStart(start);
    setTempEnd(end);
  };

  const selectThisMonth = () => {
    const now = new Date();
    const first = formatDateKey(new Date(now.getFullYear(), now.getMonth(), 1));
    const last = formatDateKey(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    setTempStart(first);
    setTempEnd(last);
  };

  const handleApply = () => {
    if (isError) return;
    onApply(tempStart, tempEnd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-3">
          <h3 className="font-sans text-lg font-bold text-[var(--ink)]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-[var(--ink-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--ink)] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Quick Range Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="soft"
            color="inherit"
            size="sm"
            onClick={selectToday}
          >
            {language === "vi" ? "Hôm nay" : "Today"}
          </Button>
          <Button
            variant="soft"
            color="inherit"
            size="sm"
            onClick={selectThisWeek}
          >
            {t("this_week")}
          </Button>
          <Button
            variant="soft"
            color="inherit"
            size="sm"
            onClick={selectNext7Days}
          >
            {language === "vi" ? "7 ngày tới" : "Next 7 Days"}
          </Button>
          <Button
            variant="soft"
            color="inherit"
            size="sm"
            onClick={selectThisMonth}
          >
            {t("this_month")}
          </Button>
        </div>

        {/* Dual Calendar Views (Matching vite-js DateCalendar) */}
        {variant === "calendar" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MiniDateCalendar
              label={language === "vi" ? "Ngày bắt đầu" : "Start date"}
              selectedKey={tempStart}
              onSelectDate={setTempStart}
            />
            <MiniDateCalendar
              label={language === "vi" ? "Ngày kết thúc" : "End date"}
              selectedKey={tempEnd}
              onSelectDate={setTempEnd}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--ink-faint)]">
                {t("start_date")}
              </label>
              <input
                type="date"
                value={tempStart}
                onChange={(e) => setTempStart(e.target.value)}
                className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--amber)]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--ink-faint)]">
                {t("end_date")}
              </label>
              <input
                type="date"
                value={tempEnd}
                onChange={(e) => setTempEnd(e.target.value)}
                className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--amber)]"
              />
            </div>
          </div>
        )}

        {isError && (
          <p className="text-xs text-[var(--danger)] font-medium">
            End date must be later than start date
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--hairline)]">
          <Button
            variant="outlined"
            color="inherit"
            size="sm"
            onClick={onClose}
          >
            {language === "vi" ? "Hủy" : "Cancel"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="sm"
            disabled={isError}
            onClick={handleApply}
          >
            {language === "vi" ? "Áp dụng" : "Apply"}
          </Button>
        </div>
      </div>
    </div>
  );
}
