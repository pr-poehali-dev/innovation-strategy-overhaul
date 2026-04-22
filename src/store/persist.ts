import { useState, useEffect } from "react";
import { uid } from "@/lib/uid";

// ─── localStorage persist ────────────────────────────────────────────────────
const LS_KEY = "dat_app_store_v1";

// Рекурсивно проходит по структуре и переставляет уникальные id в любых массивах,
// где элементы-объекты содержат поле `id`, чтобы React не падал на дублях ключей.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fixDuplicateIdsDeep(value: any): any {
  if (Array.isArray(value)) {
    const hasIdObjects = value.some((v) => v && typeof v === "object" && "id" in v);
    if (hasIdObjects) {
      const seen = new Set<unknown>();
      return value.map((item) => {
        const fixedChildren = fixDuplicateIdsDeep(item);
        if (fixedChildren && typeof fixedChildren === "object" && "id" in fixedChildren) {
          const curId = (fixedChildren as { id: unknown }).id;
          if (curId == null || seen.has(curId)) {
            return { ...(fixedChildren as object), id: uid() };
          }
          seen.add(curId);
        }
        return fixedChildren;
      });
    }
    return value.map(fixDuplicateIdsDeep);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value)) out[k] = fixDuplicateIdsDeep(value[k]);
    return out;
  }
  return value;
}

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
    const merged = mergeWithFallback(parsed, fallback);
    return fixDuplicateIdsDeep(merged) as T;
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