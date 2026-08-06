"use client";

import { useState, useEffect, useCallback } from "react";
import type { Todo } from "./types";
import { syncLocalStorageToRedis, hasLocalData, getTodos as getStoredTodos, saveTodos as saveStoredTodos } from "./store";
import { isRedisConfigured } from "./redis";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const loadTodos = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedTodos = await getStoredTodos();
      setTodos(storedTodos);
      setError(null);
    } catch (e) {
      console.error("Failed to load todos:", e);
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  useEffect(() => {
    async function performSync() {
      try {
        if (isRedisConfigured() && hasLocalData()) {
          setIsSyncing(true);
          await syncLocalStorageToRedis();
          const syncedTodos = await getStoredTodos();
          setTodos(syncedTodos);
        }
      } catch (e) {
        console.error("Failed to sync localStorage to Redis:", e);
      } finally {
        setIsSyncing(false);
        setLastSync(new Date());
      }
    }

    performSync();
  }, []);

  const persistTodos = useCallback(async (nextTodos: Todo[]) => {
    await saveStoredTodos(nextTodos);
    setTodos(nextTodos);
  }, []);

  const useRemoteStore = isRedisConfigured();

  async function addTodo(text: string) {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      done: false,
      createdAt: Date.now(),
      subtodos: [],
    };

    if (!useRemoteStore) {
      const nextTodos = [newTodo, ...todos].sort((a, b) => b.createdAt - a.createdAt);
      await persistTodos(nextTodos);
      return;
    }

    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const json = await res.json();
    const nextTodos = (json?.todos as Todo[]) ?? [];
    setTodos(nextTodos);
  }

  async function updateTodo(id: string, patch: { text?: string; done?: boolean }) {
    if (!useRemoteStore) {
      const nextTodos = todos.map((todo) => {
        if (todo.id !== id) return todo;
        return {
          ...todo,
          ...patch,
          subtodos: patch.done === undefined ? todo.subtodos : todo.subtodos.map((sub) => ({ ...sub, done: patch.done ?? sub.done })),
        };
      });
      await persistTodos(nextTodos);
      return;
    }

    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const json = await res.json();
    const nextTodos = (json?.todos as Todo[]) ?? [];
    setTodos(nextTodos);
  }

  async function deleteTodo(id: string) {
    if (!useRemoteStore) {
      const nextTodos = todos.filter((todo) => todo.id !== id);
      await persistTodos(nextTodos);
      return;
    }

    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    const json = await res.json();
    const nextTodos = (json?.todos as Todo[]) ?? [];
    setTodos(nextTodos);
  }

  async function addSubTodo(todoId: string, text: string) {
    if (!useRemoteStore) {
      const nextTodos = todos.map((todo) => {
        if (todo.id !== todoId) return todo;
        return {
          ...todo,
          subtodos: [...todo.subtodos, { id: crypto.randomUUID(), text, done: false, createdAt: Date.now() }],
        };
      });
      await persistTodos(nextTodos);
      return;
    }

    const res = await fetch(`/api/todos/${todoId}/subtodos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const json = await res.json();
    const nextTodos = (json?.todos as Todo[]) ?? [];
    setTodos(nextTodos);
  }

  async function updateSubTodo(
    todoId: string,
    subId: string,
    patch: { text?: string; done?: boolean }
  ) {
    if (!useRemoteStore) {
      const nextTodos = todos.map((todo) => {
        if (todo.id !== todoId) return todo;
        return {
          ...todo,
          subtodos: todo.subtodos.map((sub) => (sub.id === subId ? { ...sub, ...patch } : sub)),
        };
      });
      await persistTodos(nextTodos);
      return;
    }

    const res = await fetch(`/api/todos/${todoId}/subtodos/${subId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const json = await res.json();
    const nextTodos = (json?.todos as Todo[]) ?? [];
    setTodos(nextTodos);
  }

  async function deleteSubTodo(todoId: string, subId: string) {
    if (!useRemoteStore) {
      const nextTodos = todos.map((todo) => {
        if (todo.id !== todoId) return todo;
        return {
          ...todo,
          subtodos: todo.subtodos.filter((sub) => sub.id !== subId),
        };
      });
      await persistTodos(nextTodos);
      return;
    }

    const res = await fetch(`/api/todos/${todoId}/subtodos/${subId}`, {
      method: "DELETE",
    });
    const json = await res.json();
    const nextTodos = (json?.todos as Todo[]) ?? [];
    setTodos(nextTodos);
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
