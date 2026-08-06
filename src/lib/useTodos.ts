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

function areTodoListsEqual(left: Todo[], right: Todo[]): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const setTodosIfChanged = useCallback((nextTodos: Todo[]) => {
    setTodos((currentTodos) => (areTodoListsEqual(currentTodos, nextTodos) ? currentTodos : nextTodos));
  }, []);

  const persistTodos = useCallback(async (nextTodos: Todo[]) => {
    await saveStoredTodos(nextTodos);
    setTodosIfChanged(nextTodos);
  }, [setTodosIfChanged]);

  const loadTodos = useCallback(async (isInitial = false) => {
    try {
      const currentTodos = todos;
      setError(null);

      const res = await fetch("/api/todos");
      if (!res.ok) {
        return;
      }

      const json = await res.json();
      const serverTodos = (json?.todos as Todo[]) ?? [];
      const nextTodos = serverTodos.length > 0
        ? mergeTodos(currentTodos, serverTodos)
        : currentTodos;

      if (!areTodoListsEqual(currentTodos, nextTodos)) {
        await saveStoredTodos(nextTodos);
      }

      setTodosIfChanged(nextTodos);
      setLastSync(new Date());
    } catch (e) {
      console.error("Failed to load todos:", e);
      setError(e);
    } finally {
      setIsSyncing(false);
      if (isInitial) {
        setHasHydrated(true);
      }
    }
  }, [setTodosIfChanged, todos]);

  useEffect(() => {
    void loadTodos(true);

    const intervalId = window.setInterval(() => {
      void loadTodos(false);
    }, 3000);

    return () => window.clearInterval(intervalId);
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
      if (!areTodoListsEqual(optimisticTodos, serverTodos)) {
        await saveStoredTodos(serverTodos);
      }
      setTodosIfChanged(serverTodos);
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
      if (!areTodoListsEqual(optimisticTodos, serverTodos)) {
        await saveStoredTodos(serverTodos);
      }
      setTodosIfChanged(serverTodos);
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
      if (!areTodoListsEqual(optimisticTodos, serverTodos)) {
        await saveStoredTodos(serverTodos);
      }
      setTodosIfChanged(serverTodos);
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
      if (!areTodoListsEqual(optimisticTodos, serverTodos)) {
        await saveStoredTodos(serverTodos);
      }
      setTodosIfChanged(serverTodos);
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
      if (!areTodoListsEqual(optimisticTodos, serverTodos)) {
        await saveStoredTodos(serverTodos);
      }
      setTodosIfChanged(serverTodos);
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
      if (!areTodoListsEqual(optimisticTodos, serverTodos)) {
        await saveStoredTodos(serverTodos);
      }
      setTodosIfChanged(serverTodos);
    } catch (e) {
      console.error("Failed to sync subtask delete to server:", e);
      setError(e);
    }
  }

  return {
    todos,
    error,
    lastSync,
    isSyncing,
    hasHydrated,
    addTodo,
    updateTodo,
    deleteTodo,
    addSubTodo,
    updateSubTodo,
    deleteSubTodo,
  };
}
