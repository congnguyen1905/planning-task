"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "vi" | "en";

interface Translations {
  [key: string]: {
    vi: string;
    en: string;
  };
}

const translations: Translations = {
  // Page titles and headers
  "app_title": {
    vi: "Việc hôm nay",
    en: "Today's Tasks",
  },
  "today_label": {
    vi: "Hôm nay",
    en: "Today",
  },
  "no_tasks": {
    vi: "chưa có việc nào",
    en: "no tasks yet",
  },
  "tasks_completed": {
    vi: "việc xong",
    en: "tasks completed",
  },
  "loading": {
    vi: "đang tải…",
    en: "loading…",
  },
  "empty_state": {
    vi: "Trống trơn. Thêm việc đầu tiên ở trên.",
    en: "Empty. Add your first task above.",
  },
  "completed_section": {
    vi: "đã xong",
    en: "completed",
  },
  "auto_sync": {
    vi: "tự động đồng bộ mỗi 10 giây · mở ở máy khác cũng thấy ngay",
    en: "auto-sync every 10 seconds · open on another device to see updates",
  },
  "start_date": {
    vi: "Từ",
    en: "From",
  },
  "end_date": {
    vi: "Đến",
    en: "To",
  },
  "filter_date": {
    vi: "Lọc theo khoảng ngày",
    en: "Filter by date range",
  },
  "previous_day": {
    vi: "Ngày trước",
    en: "Previous day",
  },
  "next_day": {
    vi: "Ngày sau",
    en: "Next day",
  },
  "view_list": {
    vi: "Danh sách",
    en: "List",
  },
  "view_calendar": {
    vi: "Lịch tiến độ",
    en: "Calendar",
  },
  "range_from": {
    vi: "Từ ngày",
    en: "From",
  },
  "range_to": {
    vi: "Đến ngày",
    en: "To",
  },
  "this_week": {
    vi: "Tuần này",
    en: "This week",
  },
  "this_month": {
    vi: "Tháng này",
    en: "This month",
  },
  "no_tasks_in_range": {
    vi: "Không có việc nào trong khoảng ngày này.",
    en: "No tasks in this date range.",
  },
  "status_not_started": {
    vi: "Chưa thực hiện",
    en: "Not started",
  },
  "status_in_progress": {
    vi: "Đang xử lý",
    en: "In progress",
  },
  "status_overdue": {
    vi: "Quá hạn",
    en: "Overdue",
  },
  "status_done": {
    vi: "Đã xong",
    en: "Done",
  },
  "today_column": {
    vi: "Hôm nay",
    en: "Today",
  },
  // AddTodoForm
  "add_task_placeholder": {
    vi: "Thêm việc cần làm hôm nay…",
    en: "Add a task for today…",
  },
  "add_button": {
    vi: "Thêm",
    en: "Add",
  },
  "use_data_api": {
    vi: "Dùng API lấy data",
    en: "Use GET data API",
  },
  // TodoRow
  "toggle_subtasks": {
    vi: "Ẩn/hiện việc con",
    en: "Toggle subtasks",
  },
  "delete_task": {
    vi: "Xóa việc",
    en: "Delete task",
  },
  "add_subtask_placeholder": {
    vi: "thêm việc con…",
    en: "add subtask…",
  },
  // SubTodoRow
  "delete_subtask": {
    vi: "Xóa việc con",
    en: "Delete subtask",
  },
  // Language switcher
  "language_switch": {
    vi: "Chuyển ngôn ngữ",
    en: "Switch language",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("vi");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language;
    if (saved && (saved === "vi" || saved === "en")) {
      setLanguageState(saved);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Missing translation key: ${key}`);
      return key;
    }
    return translations[key][language];
  };

  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
