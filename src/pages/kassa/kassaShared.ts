// ─── Общие LS-утилиты и типы для Кассы ───────────────────────────────────────

export const LS_KASSA    = "dat_kassa_v1";
export const LS_PRODAZHI = "dat_prodazhi_v1";
export const LS_VEDOMOST = "dat_vedomost_v1";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadKassa(): Record<string, any> {
  try { const r = localStorage.getItem(LS_KASSA); return r ? JSON.parse(r) : {}; } catch (e) { console.warn(e); return {}; }
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
  try { const r = localStorage.getItem(LS_PRODAZHI); return r ? JSON.parse(r) : {}; } catch (e) { console.warn(e); return {}; }
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
