"use client";

import { useState, useEffect, useCallback } from "react";
import type { Todo } from "./types";
import { getTodos as getStoredTodos, saveTodos as saveStoredTodos } from "./store";

function mergeTodos(localTodos: Todo[], remoteTodos: Todo[]): Todo[] {
  const mergedMap = new Map<string, Todo>();

  const addTodo = (todo: Todo) => {
    const existing = mergedMap.get(todo.id);
    if (!existing) {
      mergedMap.set(todo.id, todo);
      return;
    }

    const shouldUseNewer = (todo.createdAt ?? 0) >= (existing.createdAt ?? 0);
    mergedMap.set(todo.id, shouldUseNewer ? todo : existing);
  };

  localTodos.forEach(addTodo);
  remoteTodos.forEach(addTodo);

  return Array.from(mergedMap.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const persistTodos = useCallback(async (nextTodos: Todo[]) => {
    await saveStoredTodos(nextTodos);
    setTodos(nextTodos);
  }, []);

  const loadTodos = useCallback(async () => {
    setIsLoading(true);
    try {
      const localTodos = await getStoredTodos();
      setTodos(localTodos);
      setError(null);

      const res = await fetch("/api/todos");
      if (!res.ok) {
        return;
      }

      const json = await res.json();
      const serverTodos = (json?.todos as Todo[]) ?? [];
      const mergedTodos = mergeTodos(localTodos, serverTodos);
      await saveStoredTodos(mergedTodos);
      setTodos(mergedTodos);
    } catch (e) {
      console.error("Failed to load todos:", e);
      setError(e);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
      setLastSync(new Date());
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  async function addTodo(text: string) {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      done: false,
      createdAt: Date.now(),
      subtodos: [],
    };

    const optimisticTodos = [newTodo, ...todos].sort((a, b) => b.createdAt - a.createdAt);
    await persistTodos(optimisticTodos);

    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      const serverTodos = (json?.todos as Todo[]) ?? [];
      const mergedTodos = mergeTodos(optimisticTodos, serverTodos);
      await saveStoredTodos(mergedTodos);
      setTodos(mergedTodos);
    } catch (e) {
      console.error("Failed to sync todo to server:", e);
      setError(e);
    }
  }

  async function updateTodo(id: string, patch: { text?: string; done?: boolean }) {
    const optimisticTodos = todos.map((todo) => {
      if (todo.id !== id) return todo;
      return {
        ...todo,
        ...patch,
        subtodos: patch.done === undefined
          ? todo.subtodos
          : todo.subtodos.map((sub) => ({ ...sub, done: patch.done ?? sub.done })),
      };
    });

    await persistTodos(optimisticTodos);

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      const serverTodos = (json?.todos as Todo[]) ?? [];
      const mergedTodos = mergeTodos(optimisticTodos, serverTodos);
      await saveStoredTodos(mergedTodos);
      setTodos(mergedTodos);
    } catch (e) {
      console.error("Failed to sync todo update to server:", e);
      setError(e);
    }
  }

  async function deleteTodo(id: string) {
    const optimisticTodos = todos.filter((todo) => todo.id !== id);
    await persistTodos(optimisticTodos);

    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      const json = await res.json();
      const serverTodos = (json?.todos as Todo[]) ?? [];
      const mergedTodos = mergeTodos(optimisticTodos, serverTodos);
      await saveStoredTodos(mergedTodos);
      setTodos(mergedTodos);
    } catch (e) {
      console.error("Failed to sync todo delete to server:", e);
      setError(e);
    }
  }

  async function addSubTodo(todoId: string, text: string) {
    const optimisticTodos = todos.map((todo) => {
      if (todo.id !== todoId) return todo;
      return {
        ...todo,
        subtodos: [...todo.subtodos, { id: crypto.randomUUID(), text, done: false, createdAt: Date.now() }],
      };
    });

    await persistTodos(optimisticTodos);

    try {
      const res = await fetch(`/api/todos/${todoId}/subtodos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      const serverTodos = (json?.todos as Todo[]) ?? [];
      const mergedTodos = mergeTodos(optimisticTodos, serverTodos);
      await saveStoredTodos(mergedTodos);
      setTodos(mergedTodos);
    } catch (e) {
      console.error("Failed to sync subtask to server:", e);
      setError(e);
    }
  }

  async function updateSubTodo(
    todoId: string,
    subId: string,
    patch: { text?: string; done?: boolean }
  ) {
    const optimisticTodos = todos.map((todo) => {
      if (todo.id !== todoId) return todo;
      return {
        ...todo,
        subtodos: todo.subtodos.map((sub) => (sub.id === subId ? { ...sub, ...patch } : sub)),
      };
    });

    await persistTodos(optimisticTodos);

    try {
      const res = await fetch(`/api/todos/${todoId}/subtodos/${subId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      const serverTodos = (json?.todos as Todo[]) ?? [];
      const mergedTodos = mergeTodos(optimisticTodos, serverTodos);
      await saveStoredTodos(mergedTodos);
      setTodos(mergedTodos);
    } catch (e) {
      console.error("Failed to sync subtask update to server:", e);
      setError(e);
    }
  }

  async function deleteSubTodo(todoId: string, subId: string) {
    const optimisticTodos = todos.map((todo) => {
      if (todo.id !== todoId) return todo;
      return {
        ...todo,
        subtodos: todo.subtodos.filter((sub) => sub.id !== subId),
      };
    });

    await persistTodos(optimisticTodos);

    try {
      const res = await fetch(`/api/todos/${todoId}/subtodos/${subId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      const serverTodos = (json?.todos as Todo[]) ?? [];
      const mergedTodos = mergeTodos(optimisticTodos, serverTodos);
      await saveStoredTodos(mergedTodos);
      setTodos(mergedTodos);
    } catch (e) {
      console.error("Failed to sync subtask delete to server:", e);
      setError(e);
    }
  }

  return {
    todos,
    isLoading,
    error,
    lastSync,
    isSyncing,
    addTodo,
    updateTodo,
    deleteTodo,
    addSubTodo,
    updateSubTodo,
    deleteSubTodo,
  };
}
