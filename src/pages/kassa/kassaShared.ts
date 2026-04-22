// ─── Общие LS-утилиты и типы для Кассы ───────────────────────────────────────
import { uid } from "@/lib/uid";

export const LS_KASSA    = "dat_kassa_v1";
export const LS_PRODAZHI = "dat_prodazhi_v1";
export const LS_VEDOMOST = "dat_vedomost_v1";

// Проставить уникальные id всем строкам, где id дублируются или отсутствуют.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dedupeIds = <T extends { id?: any }>(rows: T[] | undefined): T[] => {
  if (!Array.isArray(rows)) return rows as unknown as T[];
  const seen = new Set<unknown>();
  return rows.map((r) => {
    if (!r || typeof r !== "object") return r;
    const curId = (r as { id?: unknown }).id;
    if (curId == null || seen.has(curId)) {
      return { ...r, id: uid() };
    }
    seen.add(curId);
    return r;
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadKassa(): Record<string, any> {
  try {
    const r = localStorage.getItem(LS_KASSA);
    const data = r ? JSON.parse(r) : {};
    // Ленивая починка коллизий id, чтобы React не ругался на дубли ключей.
    Object.keys(data).forEach((k) => {
      const day = data[k];
      if (day && typeof day === "object") {
        if (Array.isArray(day.rows))    day.rows    = dedupeIds(day.rows);
        if (Array.isArray(day.vyplaty)) day.vyplaty = dedupeIds(day.vyplaty);
      }
    });
    return data;
  } catch (e) { console.warn(e); return {}; }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function saveKassa(data: Record<string, any>): void {
  try {
    localStorage.setItem(LS_KASSA, JSON.stringify(data));
    window.dispatchEvent(new StorageEvent("storage", { key: LS_KASSA }));
  } catch (e) { console.warn(e); }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadProdazhiAll(): Record<string, any> {
  try {
    const r = localStorage.getItem(LS_PRODAZHI);
    const data = r ? JSON.parse(r) : {};
    Object.keys(data).forEach((k) => {
      const day = data[k];
      if (day && typeof day === "object" && Array.isArray(day.rows)) {
        day.rows = dedupeIds(day.rows);
      }
    });
    return data;
  } catch (e) { console.warn(e); return {}; }
}

export const toDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export type PodrabJournalEntry = {
  dateKey: string;
  bort: string;
  mar: string;
  fioVod: string;
  fioCond: string;
  podrVod: string;
  podrCond: string;
  vodVyd: boolean;
  condVyd: boolean;
};