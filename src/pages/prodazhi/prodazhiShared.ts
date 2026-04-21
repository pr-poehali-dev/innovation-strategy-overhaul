export const LS_PRODAZHI = "dat_prodazhi_v1";
export const LS_KASSA   = "dat_kassa_v1";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadProdazhi(): Record<string, any> {
  try { const r = localStorage.getItem(LS_PRODAZHI); return r ? JSON.parse(r) : {}; } catch (e) { console.warn(e); return {}; }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function saveProdazhi(data: Record<string, any>): void {
  try { localStorage.setItem(LS_PRODAZHI, JSON.stringify(data)); } catch (e) { console.warn(e); }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadKassaForProdazhi(): Record<string, any> {
  try { const r = localStorage.getItem(LS_KASSA); return r ? JSON.parse(r) : {}; } catch (e) { console.warn(e); return {}; }
}

export interface ProdazhiRow {
  id: number;
  bort: string;
  marGr: string;
  fioVod: string;
  fioCond: string;
  dt: string;
  reysy: string;
  kolBil: string;
  valid: string;
  qr: string;
  podVod: string;
  podCond: string;
}

export type ColKey = keyof Omit<ProdazhiRow, "id">;

export const COLUMNS: { key: ColKey; label: string; width: string; numeric?: boolean }[] = [
  { key: "marGr",   label: "Мар. Гр",         width: "70px"  },
  { key: "bort",    label: "Борт №",          width: "60px"  },
  { key: "fioVod",  label: "ФИО водителя",    width: "160px" },
  { key: "fioCond", label: "ФИО кондуктора",  width: "130px" },
  { key: "dt",      label: "ДТ",              width: "60px",  numeric: true },
  { key: "reysy",   label: "Рейсы",           width: "65px",  numeric: true },
  { key: "kolBil",  label: "Кол. бил",        width: "70px",  numeric: true },
  { key: "valid",   label: "Валид",           width: "65px",  numeric: true },
  { key: "qr",      label: "QR",              width: "60px",  numeric: true },
  { key: "podVod",  label: "Вод. подр., ₽",  width: "90px",  numeric: true },
  { key: "podCond", label: "Конд. подр., ₽", width: "90px",  numeric: true },
];

// Монотонный счётчик гарантирует уникальность id даже при синхронной генерации
let __uidCounter = 0;
export const uid = (): number => {
  __uidCounter = (__uidCounter + 1) % 1_000_000;
  return Date.now() * 1_000_000 + __uidCounter;
};
export const emptyRow = (): ProdazhiRow => ({
  id: uid(),
  bort: "", marGr: "", fioVod: "", fioCond: "",
  dt: "", reysy: "", kolBil: "", valid: "", qr: "",
  podVod: "", podCond: "",
});

export const OFF_STATUSES = ["вых", "отп", "рем"];
export const toNum = (v: string) => parseFloat((v || "0").trim().replace(",", ".")) || 0;

export const toDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};