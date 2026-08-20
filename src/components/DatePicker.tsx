"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { formatDateLabel } from "@/lib/date";
import { useLanguage } from "@/contexts/LanguageContext";

interface DatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

function parseDateKey(key: string): Date {
  if (!key) return new Date();
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function DatePicker({
  value,
  onChange,
  label,
  disabled = false,
  className = "",
}: DatePickerProps) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialDate = useMemo(() => parseDateKey(value), [value]);
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    const date = parseDateKey(value);
    setCurrentYear(date.getFullYear());
    setCurrentMonth(date.getMonth());
  }, [value]);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayOfWeek = useMemo(() => {
    const day = new Date(currentYear, currentMonth, 1).getDay();
    return day === 0 ? 6 : day - 1; // Mon = 0
  }, [currentYear, currentMonth]);

  const monthNames = [
    "Thg 1", "Thg 2", "Thg 3", "Thg 4", "Thg 5", "Thg 6",
    "Thg 7", "Thg 8", "Thg 9", "Thg 10", "Thg 11", "Thg 12"
  ];
  const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

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

  const formattedDisplay = useMemo(() => {
    if (!value) return "Chọn ngày";
    const [y, m, d] = value.split("-");
    return `${d}/${m}/${y}`;
  }, [value]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {label && (
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-faint)] mb-1">
          {label}
        </label>
      )}

      {/* Input button matching vite-js DatePicker TextField */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`flex items-center justify-between gap-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-raised)]/60 px-3 py-1.5 text-xs font-semibold text-[var(--ink)] hover:border-[var(--amber)] focus:outline-none transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } ${open ? "border-[var(--amber)] ring-1 ring-[var(--amber)]" : ""}`}
      >
        <span>{formattedDisplay}</span>
        {/* vite-js Calendar Icon */}
        <svg
          className="h-4 w-4 text-[var(--amber)] shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {/* Popover Calendar Picker */}
      {open && (
        <div className="absolute left-0 z-50 mt-1.5 w-64 rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-3 shadow-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="rounded p-1 text-xs text-[var(--ink-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--ink)]"
            >
              ‹
            </button>
            <span className="font-sans text-xs font-bold text-[var(--ink)]">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="rounded p-1 text-xs text-[var(--ink-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--ink)]"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-sans text-[10px] text-[var(--ink-faint)] font-bold mb-1">
            {weekDays.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-6 w-6" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const key = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = key === value;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  className={`h-6 w-6 rounded-full text-xs font-medium transition-all flex items-center justify-center ${
                    isSelected
                      ? "bg-[var(--amber)] text-[#FFFFFF] font-bold shadow-xs scale-105"
                      : "text-[var(--ink)] hover:bg-[var(--surface-raised)] hover:text-[var(--amber)]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
