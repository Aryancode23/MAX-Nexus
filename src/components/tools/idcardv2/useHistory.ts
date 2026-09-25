import { useCallback, useRef, useState } from "react";

export function useHistory<T>(initial: T, limit = 50) {
  const [state, setState] = useState(initial);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);

  const set = useCallback((next: T | ((prev: T) => T), recordHistory = true) => {
    setState((prev) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      if (recordHistory) {
        past.current = [...past.current.slice(-limit + 1), prev];
        future.current = [];
      }
      return resolved;
    });
  }, [limit]);

  const undo = useCallback(() => {
    setState((prev) => {
      if (past.current.length === 0) return prev;
      const last = past.current[past.current.length - 1];
      past.current = past.current.slice(0, -1);
      future.current = [prev, ...future.current];
      return last;
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (future.current.length === 0) return prev;
      const next = future.current[0];
      future.current = future.current.slice(1);
      past.current = [...past.current, prev];
      return next;
    });
  }, []);

  return { state, set, undo, redo, canUndo: past.current.length > 0, canRedo: future.current.length > 0 };
}
