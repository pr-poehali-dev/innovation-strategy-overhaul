import { useState, useEffect } from "react";

// ─── localStorage persist ────────────────────────────────────────────────────
const LS_KEY = "dat_app_store_v1";

export function mergeWithFallback<T>(loaded: unknown, fallback: T): T {
  if (Array.isArray(fallback) && Array.isArray(loaded)) {
    // Массив объектов: мержим каждый элемент с первым элементом fallback (как шаблон)
    const template = fallback[0];
    if (template && typeof template === "object") {
      return (loaded as unknown[]).map((item) =>
        typeof item === "object" && item !== null ? { ...template, ...(item as object) } : item
      ) as unknown as T;
    }
    return loaded as T;
  }
  if (typeof fallback === "object" && fallback !== null && typeof loaded === "object" && loaded !== null && !Array.isArray(loaded)) {
    return { ...(fallback as object), ...(loaded as object) } as T;
  }
  return loaded as T;
}

export function loadFromLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${LS_KEY}:${key}`);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return mergeWithFallback(parsed, fallback);
  } catch {
    return fallback;
  }
}

export function saveToLS<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${LS_KEY}:${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn("localStorage write failed", e);
  }
}

export function usePersist<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => loadFromLS(key, initial));
  useEffect(() => { saveToLS(key, state); }, [key, state]);
  return [state, setState];
}
