"use client";

import { useTodos } from "@/lib/useTodos";
import { AddTodoForm } from "@/components/AddTodoForm";
import { TodoRow } from "@/components/TodoRow";

function todayLabel() {
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const now = new Date();
  const day = days[now.getDay()];
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${day}, ${dd}/${mm}/${now.getFullYear()}`;
}

export default function Home() {
  const {
    todos,
    isLoading,
    lastSync,
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
      <div className="max-w-xl mx-auto px-6 py-14 sm:py-20">
        <header className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--amber)] mb-2">
            {todayLabel()}
          </p>
          <h1 className="font-display italic text-4xl text-[var(--ink)]">
            Việc hôm nay
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-faint)] font-mono">
            {todos.length === 0
              ? "chưa có việc nào"
              : `${totalDone}/${todos.length} việc xong${
                  lastSync ? ` · đồng bộ lúc ${lastSync.toLocaleTimeString("vi-VN")}` : ""
                }`}
          </p>
        </header>

        <div className="mb-8">
          <AddTodoForm onAdd={addTodo} />
        </div>

        {isLoading && todos.length === 0 ? (
          <p className="text-[var(--ink-faint)] text-sm font-mono">đang tải…</p>
        ) : todos.length === 0 ? (
          <p className="text-[var(--ink-faint)] text-sm italic">
            Trống trơn. Thêm việc đầu tiên ở trên.
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
                  đã xong
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
            tự động đồng bộ mỗi 3 giây · mở ở máy khác cũng thấy ngay
          </p>
        </footer>
      </div>
    </main>
  );
}
