"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

export function useLocalStorage<T extends Record<string, any>>(key: string, initialState: T) {
  const [state, setStateInternal] = useState<T>(initialState);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        setStateInternal((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error(`Error reading localStorage key "${key}":`, e);
    }
  }, [key]);

  const setState = useCallback(
    (update: Partial<T> | ((prev: T) => T)) => {
      setStateInternal((prev) => {
        const nextState = typeof update === "function" ? update(prev) : { ...prev, ...update };
        try {
          window.localStorage.setItem(key, JSON.stringify(nextState));
        } catch (e) {
          console.error(`Error setting localStorage key "${key}":`, e);
        }
        return nextState;
      });
    },
    [key]
  );

  const setField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setState({ [field]: value } as unknown as Partial<T>);
    },
    [setState]
  );

  const resetState = useCallback(() => {
    setStateInternal(initialState);
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing localStorage key "${key}":`, e);
    }
  }, [initialState, key]);

  const canReset = useMemo(() => {
    return JSON.stringify(state) !== JSON.stringify(initialState);
  }, [state, initialState]);

  return {
    state,
    setState,
    setField,
    resetState,
    canReset,
  };
}
