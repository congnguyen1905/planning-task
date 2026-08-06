"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Todo } from "./types";
import { saveTodos as saveStoredTodos } from "./store";

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
  const todosRef = useRef<Todo[]>([]);
  const isMutatingRef = useRef(false);

  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);

  const setTodosIfChanged = useCallback((nextTodos: Todo[]) => {
    setTodos((currentTodos) => (areTodoListsEqual(currentTodos, nextTodos) ? currentTodos : nextTodos));
  }, []);

  const syncTodosFromServer = useCallback(async (serverTodos: Todo[]) => {
    const currentTodos = todosRef.current;
    if (!areTodoListsEqual(currentTodos, serverTodos)) {
      await saveStoredTodos(serverTodos);
      setLastSync(new Date());
    }
    setTodosIfChanged(serverTodos);
  }, [setTodosIfChanged]);

  const loadTodos = useCallback(async (isInitial = false) => {
    try {
      const currentTodos = todosRef.current;
      setError(null);

      const res = await fetch("/api/todos");
      if (!res.ok) {
        return;
      }

      const json = await res.json();
      const serverTodos = (json?.todos as Todo[]) ?? [];
      const nextTodos = serverTodos.length > 0
        ? mergeTodos(currentTodos, serverTodos)
        : serverTodos;

      if (isMutatingRef.current) {
        setTodosIfChanged(currentTodos);
        return;
      }

      if (!areTodoListsEqual(currentTodos, nextTodos)) {
        await saveStoredTodos(nextTodos);
        setLastSync(new Date());
        setTodosIfChanged(nextTodos);
      }
    } catch (e) {
      console.error("Failed to load todos:", e);
      setError(e);
    } finally {
      setIsSyncing(false);
      if (isInitial) {
        setHasHydrated(true);
      }
    }
  }, [setTodosIfChanged]);

  useEffect(() => {
    void loadTodos(true);

    const intervalId = window.setInterval(() => {
      void loadTodos(false);
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [loadTodos]);

  async function addTodo(text: string, date: string) {
    isMutatingRef.current = true;
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, date }),
      });
      const json = await res.json();
      const serverTodos = (json?.todos as Todo[]) ?? [];
      await syncTodosFromServer(serverTodos);
    } catch (e) {
      console.error("Failed to sync todo to server:", e);
      setError(e);
    } finally {
      isMutatingRef.current = false;
    }
  }

  async function runMutationWithRefresh(request: () => Promise<Response>) {
    let res = await request();

    if (res.status === 404) {
      await loadTodos(true);
      res = await request();
    }

    if (!res.ok) {
      const errorPayload = await res.json().catch(() => ({}));
      throw new Error((errorPayload as { error?: string }).error ?? "Request failed");
    }

    const json = await res.json();
    return (json?.todos as Todo[]) ?? [];
  }

  async function updateTodo(id: string, patch: { text?: string; done?: boolean; date?: string }) {
    isMutatingRef.current = true;
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      const serverTodos = (json?.todos as Todo[]) ?? [];
      await syncTodosFromServer(serverTodos);
    } catch (e) {
      console.error("Failed to sync todo update to server:", e);
      setError(e);
    } finally {
      isMutatingRef.current = false;
    }
  }

  async function deleteTodo(id: string) {
    isMutatingRef.current = true;
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      const json = await res.json();
      const serverTodos = (json?.todos as Todo[]) ?? [];
      await syncTodosFromServer(serverTodos);
    } catch (e) {
      console.error("Failed to sync todo delete to server:", e);
      setError(e);
    } finally {
      isMutatingRef.current = false;
    }
  }

  async function addSubTodo(todoId: string, text: string, date: string) {
    isMutatingRef.current = true;
    try {
      const serverTodos = await runMutationWithRefresh(() =>
        fetch(`/api/todos/${todoId}/subtodos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, date }),
        })
      );
      await syncTodosFromServer(serverTodos);
    } catch (e) {
      console.error("Failed to sync subtask to server:", e);
      setError(e);
    } finally {
      isMutatingRef.current = false;
    }
  }

  async function updateSubTodo(
    todoId: string,
    subId: string,
    patch: { text?: string; done?: boolean; date?: string }
  ) {
    isMutatingRef.current = true;
    try {
      const serverTodos = await runMutationWithRefresh(() =>
        fetch(`/api/todos/${todoId}/subtodos/${subId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        })
      );
      await syncTodosFromServer(serverTodos);
    } catch (e) {
      console.error("Failed to sync subtask update to server:", e);
      setError(e);
    } finally {
      isMutatingRef.current = false;
    }
  }

  async function deleteSubTodo(todoId: string, subId: string) {
    isMutatingRef.current = true;
    try {
      const serverTodos = await runMutationWithRefresh(() =>
        fetch(`/api/todos/${todoId}/subtodos/${subId}`, {
          method: "DELETE",
        })
      );
      await syncTodosFromServer(serverTodos);
    } catch (e) {
      console.error("Failed to sync subtask delete to server:", e);
      setError(e);
    } finally {
      isMutatingRef.current = false;
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
