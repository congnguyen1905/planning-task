"use client";

import { useState } from "react";
import useSWR from "swr";
import type { Todo } from "./types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useTodos() {
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const { data, error, isLoading, mutate } = useSWR<{ todos: Todo[] }>(
    "/api/todos",
    fetcher,
    {
      refreshInterval: 3000, // poll every 3s so other devices see updates
      revalidateOnFocus: true,
      dedupingInterval: 500,
      // Fires whenever a fetch (polled or manual) resolves — this is the
      // "external system" updating us, so setState here is fine.
      onSuccess: () => setLastSync(new Date()),
    }
  );

  const todos = data?.todos ?? [];

  async function addTodo(text: string) {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const json = await res.json();
    mutate(json, { revalidate: false });
  }

  async function updateTodo(id: string, patch: { text?: string; done?: boolean }) {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const json = await res.json();
    mutate(json, { revalidate: false });
  }

  async function deleteTodo(id: string) {
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    const json = await res.json();
    mutate(json, { revalidate: false });
  }

  async function addSubTodo(todoId: string, text: string) {
    const res = await fetch(`/api/todos/${todoId}/subtodos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const json = await res.json();
    mutate(json, { revalidate: false });
  }

  async function updateSubTodo(
    todoId: string,
    subId: string,
    patch: { text?: string; done?: boolean }
  ) {
    const res = await fetch(`/api/todos/${todoId}/subtodos/${subId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const json = await res.json();
    mutate(json, { revalidate: false });
  }

  async function deleteSubTodo(todoId: string, subId: string) {
    const res = await fetch(`/api/todos/${todoId}/subtodos/${subId}`, {
      method: "DELETE",
    });
    const json = await res.json();
    mutate(json, { revalidate: false });
  }

  return {
    todos,
    isLoading,
    error,
    lastSync,
    addTodo,
    updateTodo,
    deleteTodo,
    addSubTodo,
    updateSubTodo,
    deleteSubTodo,
  };
}
