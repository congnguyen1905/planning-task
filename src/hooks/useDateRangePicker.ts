"use client";

import { useState, useCallback } from "react";
import { reconcileDateRange } from "@/lib/date";

export function useDateRangePicker(initialStart: string, initialEnd: string) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);

  const error = startDate > endDate;

  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);

  const onChangeStartDate = useCallback(
    (newStart: string) => {
      const next = reconcileDateRange(newStart, endDate, "start");
      setStartDate(next.startDate);
      setEndDate(next.endDate);
    },
    [endDate]
  );

  const onChangeEndDate = useCallback(
    (newEnd: string) => {
      const next = reconcileDateRange(startDate, newEnd, "end");
      setStartDate(next.startDate);
      setEndDate(next.endDate);
    },
    [startDate]
  );

  const setRange = useCallback((start: string, end: string) => {
    if (end < start) {
      setStartDate(end);
      setEndDate(start);
    } else {
      setStartDate(start);
      setEndDate(end);
    }
  }, []);

  const onReset = useCallback(() => {
    setStartDate(initialStart);
    setEndDate(initialEnd);
  }, [initialStart, initialEnd]);

  return {
    startDate,
    endDate,
    open,
    error,
    onOpen,
    onClose,
    onChangeStartDate,
    onChangeEndDate,
    setRange,
    onReset,
    setStartDate,
    setEndDate,
  };
}
