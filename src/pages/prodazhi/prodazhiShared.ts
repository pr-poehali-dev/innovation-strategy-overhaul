import { uid } from "@/lib/uid";
export { uid };

export const LS_PRODAZHI = "dat_prodazhi_v1";
export const LS_KASSA   = "dat_kassa_v1";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dedupeIds = <T extends { id?: any }>(rows: T[] | undefined): T[] => {
  if (!Array.isArray(rows)) return rows as unknown as T[];
  const seen = new Set<unknown>();
  return rows.map((r) => {
    if (!r || typeof r !== "object") return r;
    const curId = (r as { id?: unknown }).id;
    if (curId == null || seen.has(curId)) return { ...r, id: uid() };
    seen.add(curId);
    return r;
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadProdazhi(): Record<string, any> {
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function saveProdazhi(data: Record<string, any>): void {
  try { localStorage.setItem(LS_PRODAZHI, JSON.stringify(data)); } catch (e) { console.warn(e); }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadKassaForProdazhi(): Record<string, any> {
  try {
    const r = localStorage.getItem(LS_KASSA);
    const data = r ? JSON.parse(r) : {};
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