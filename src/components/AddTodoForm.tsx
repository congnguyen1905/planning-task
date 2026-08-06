"use client";

import { useState } from "react";

export function AddTodoForm({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value || busy) return;
    setBusy(true);
    setText("");
    try {
      await onAdd(value);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-3">
      <span className="font-mono text-[var(--ink-faint)] text-sm">＋</span>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Thêm việc cần làm hôm nay…"
        className="flex-1 bg-transparent border-b border-[var(--hairline)] py-2 text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--amber)] transition-colors"
      />
      <button
        type="submit"
        disabled={!text.trim() || busy}
        className="font-mono text-xs uppercase tracking-wider px-3 py-1.5 rounded-sm border border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--amber)] hover:text-[var(--amber)] disabled:opacity-30 disabled:hover:border-[var(--hairline)] disabled:hover:text-[var(--ink-muted)] transition-colors"
      >
        Thêm
      </button>
    </form>
  );
}
