"use client";

import { useTodos } from "@/lib/useTodos";
import { AddTodoForm } from "@/components/AddTodoForm";
import { TodoRow } from "@/components/TodoRow";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

function todayLabel(language: "vi" | "en") {
  const viDays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const enDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const now = new Date();
  const days = language === "vi" ? viDays : enDays;
  const day = days[now.getDay()];
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${day}, ${dd}/${mm}/${now.getFullYear()}`;
}

export default function Home() {
  const { language, t } = useLanguage();
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
  } = useTodos();

  const active = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);
  const totalDone = todos.reduce(
    (acc, t) => acc + (t.done ? 1 : 0),
    0
  );

  return (
    <main className="flex-1 bg-[var(--bg)]">
      <LanguageSwitcher />
      <div className="max-w-xl mx-auto px-6 py-14 sm:py-20">
        <header className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--amber)] mb-2">
            {todayLabel(language)}
          </p>
          <h1 className="font-display italic text-4xl text-[var(--ink)]">
            {t("app_title")}
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-faint)] font-mono">
            {todos.length === 0
              ? t("no_tasks")
              : `${totalDone}/${todos.length} ${t("tasks_completed")}${
                  lastSync ? ` · ${language === "vi" ? "đồng bộ lúc" : "synced at"} ${lastSync.toLocaleTimeString(language === "vi" ? "vi-VN" : "en-US")}` : ""
                }`}
          </p>
        </header>

        <div className="mb-8">
          <AddTodoForm onAdd={addTodo} />
        </div>

        {!hasHydrated && todos.length === 0 ? null : todos.length === 0 ? (
          <p className="text-[var(--ink-faint)] text-sm italic">
            {t("empty_state")}
          </p>
        ) : (
          <div className="space-y-8">
            {active.length > 0 && (
              <section>
                {active.map((todo) => (
                  <TodoRow
                    key={todo.id}
                    todo={todo}
                    onToggle={(v) => updateTodo(todo.id, { done: v })}
                    onDelete={() => deleteTodo(todo.id)}
                    onAddSub={(text) => addSubTodo(todo.id, text)}
                    onToggleSub={(subId, v) =>
                      updateSubTodo(todo.id, subId, { done: v })
                    }
                    onDeleteSub={(subId) => deleteSubTodo(todo.id, subId)}
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
                    onToggle={(v) => updateTodo(todo.id, { done: v })}
                    onDelete={() => deleteTodo(todo.id)}
                    onAddSub={(text) => addSubTodo(todo.id, text)}
                    onToggleSub={(subId, v) =>
                      updateSubTodo(todo.id, subId, { done: v })
                    }
                    onDeleteSub={(subId) => deleteSubTodo(todo.id, subId)}
                  />
                ))}
              </section>
            )}
          </div>
        )}

        <footer className="mt-16 text-center">
          <p className="font-mono text-[11px] text-[var(--ink-faint)]">
            {t("auto_sync")}
          </p>
        </footer>
      </div>
    </main>
  );
}
