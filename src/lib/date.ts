export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeDateInput(value: string | null | undefined): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return formatDateKey(new Date());
}

export function addDaysToDateKey(value: string, delta: number): string {
  const [year, month, day] = value.split("-").map(Number);
  const next = new Date(year, month - 1, day);
  next.setDate(next.getDate() + delta);
  return formatDateKey(next);
}

export function formatDateLabel(value: string, language: "vi" | "en" = "vi") {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (language === "vi") {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function rangesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  return startA <= endB && endA >= startB;
}

/** Danh sách các ngày (dạng "YYYY-MM-DD") từ start đến end, bao gồm cả 2 đầu. */
export function enumerateDateRange(start: string, end: string): string[] {
  if (!start || !end || end < start) return [];
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  const cursor = new Date(sy, sm - 1, sd);
  const last = new Date(ey, em - 1, ed);
  const days: string[] = [];
  while (cursor <= last) {
    days.push(formatDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export type TaskStatus = "not_started" | "in_progress" | "overdue" | "done";

/**
 * Trạng thái công việc dựa trên ngày hôm nay so với khoảng [startDate, endDate]:
 * - done: đã hoàn thành (bất kể ngày)
 * - not_started: hôm nay còn trước startDate (xanh lá)
 * - in_progress: hôm nay nằm trong khoảng, chưa xong (xanh dương)
 * - overdue: hôm nay đã qua endDate mà vẫn chưa xong (đỏ)
 */
export function getTaskStatus(
  startDate: string,
  endDate: string,
  done: boolean,
  today: string = formatDateKey(new Date())
): TaskStatus {
  if (done) return "done";
  if (today < startDate) return "not_started";
  if (today > endDate) return "overdue";
  return "in_progress";
}

/** So khớp một khoảng lọc [filterStart, filterEnd] với khoảng công việc [taskStart, taskEnd]. */
export function isWithinFilterRange(
  taskStart: string,
  taskEnd: string,
  filterStart: string,
  filterEnd: string
): boolean {
  return rangesOverlap(taskStart, taskEnd, filterStart, filterEnd);
}

export function reconcileDateRange(
  startDate: string,
  endDate: string,
  changedField: "start" | "end"
): { startDate: string; endDate: string } {
  if (endDate < startDate) {
    return changedField === "start"
      ? { startDate, endDate: startDate }   // sửa start làm end < start → end = start
      : { startDate: endDate, endDate };    // sửa end làm end < start → start = end
  }
  return { startDate, endDate };
}