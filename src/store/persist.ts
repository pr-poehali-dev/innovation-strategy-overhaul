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

// Для справочных массивов (employees, vehicles, routes, terminals, companies,
// routeSchedule) при загрузке из localStorage добавляет недостающие начальные
// записи по ключевому полю. Пользовательские изменения сохранённых записей
// не затрагиваются. Записи, которые пользователь удалил, тоже не воскрешаются
// (добавляются только те, чьих ключей вообще нет в сохранённых данных и
// которых не удаляли в этой версии — см. признак "кадрового слепка").
const KEY_FIELDS: Record<string, string> = {
  employees: "fio",
  vehicles: "bortovoy",
  routes: "nomer",
  terminals: "nomer",
  companies: "nazvanie",
};

// Маркер «пользователь уже видел этих сотрудников»: список ФИО, которые
// присутствовали хотя бы раз. Хранится в отдельном ключе. Если сотрудник из
// initialData ни разу не фигурировал в списке у пользователя — значит мы его
// никогда не добавляли (новые фио из initialData). Добавляем их.
function getSeenFios(storeKey: string): Set<string> {
  try {
    const raw = localStorage.getItem(`${LS_KEY}:${storeKey}:__seen`);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr as string[]) : new Set();
  } catch { return new Set(); }
}
function saveSeenFios(storeKey: string, fios: Set<string>): void {
  try {
    localStorage.setItem(`${LS_KEY}:${storeKey}:__seen`, JSON.stringify([...fios]));
  } catch { /* noop */ }
}

export function loadFromLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${LS_KEY}:${key}`);
    if (raw === null) {
      // Инициализация: помечаем все ключевые значения как «виденные».
      if (Array.isArray(fallback) && KEY_FIELDS[key]) {
        const field = KEY_FIELDS[key];
        const seen = new Set(
          (fallback as unknown[])
            .map((r) => (r && typeof r === "object" ? (r as Record<string, unknown>)[field] : undefined))
            .filter((v): v is string => typeof v === "string" && v.length > 0)
        );
        saveSeenFios(key, seen);
      }
      return fallback;
    }
    const parsed = JSON.parse(raw);
    const merged = mergeWithFallback(parsed, fallback);

    // Добиваем недостающими справочными записями, которые пользователь
    // никогда не видел (новые в initialData).
    if (Array.isArray(merged) && Array.isArray(fallback) && KEY_FIELDS[key]) {
      const field = KEY_FIELDS[key];
      const seen  = getSeenFios(key);
      const currentKeys = new Set(
        (merged as unknown[])
          .map((r) => (r && typeof r === "object" ? (r as Record<string, unknown>)[field] : undefined))
          .filter((v): v is string => typeof v === "string" && v.length > 0)
      );
      const toAdd: unknown[] = [];
      (fallback as unknown[]).forEach((r) => {
        if (!r || typeof r !== "object") return;
        const k = (r as Record<string, unknown>)[field];
        if (typeof k !== "string" || !k) return;
        if (currentKeys.has(k)) return;       // уже есть
        if (seen.has(k)) return;              // пользователь удалил — не воскрешаем
        toAdd.push(r);
      });
      if (toAdd.length) {
        (merged as unknown[]).push(...toAdd);
      }
      // Обновляем «слепок виденного» — всё, что сейчас в merged + то, что уже было.
      const nextSeen = new Set(seen);
      currentKeys.forEach((k) => nextSeen.add(k));
      toAdd.forEach((r) => {
        const k = (r as Record<string, unknown>)[field];
        if (typeof k === "string") nextSeen.add(k);
      });
      saveSeenFios(key, nextSeen);
    }

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