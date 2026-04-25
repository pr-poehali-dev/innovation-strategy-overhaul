import { NaryadRowStore, Route } from "@/store/appStore";
import { NaryadRow } from "./types";
import { uid } from "@/lib/uid";

// ─── Утилиты дат ────────────────────────────────────────────────────────────
export const toDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const toDisplayDate = (d: Date): string =>
  d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

export const toMonthYear = (d: Date): string =>
  d.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

export const DAY_NAMES = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export const getWeekMonday = (base: Date): Date => {
  const d = new Date(base);
  const dow = d.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getWeekDays = (monday: Date): Date[] =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

export const toNaryadRow = (r: NaryadRowStore): NaryadRow => r as unknown as NaryadRow;

export const makeEmptyRow = (): NaryadRowStore => ({
  id: uid(),
  vehicleId: null, bortovoy: "", gos: "", marka: "",
  marshrut: "", fio: "", fioKond: "",
  putevoy: "", terminal: "", podrabotka: false, biletov: "", statusOtsutstviya: "", dtp: false,
  odometrVyezd: "", odometrVozv: "",
});

// Инкрементирует номер путевого листа: "001" → "002", "AT-15" → "AT-16"
export const nextPutevoy = (p: string): string => {
  if (!p) return p;
  const m = p.match(/^(.*?)(\d+)(\D*)$/);
  if (!m) return p;
  const num = String(parseInt(m[2], 10) + 1).padStart(m[2].length, "0");
  return m[1] + num + m[3];
};

export const makeRowsFromRoutes = (routes: Route[]): NaryadRowStore[] => {
  const sorted = [...routes].sort((a, b) => Number(a.nomer) - Number(b.nomer));
  const rows: NaryadRowStore[] = [];
  sorted.forEach((route) => {
    for (let i = 1; i <= route.grafikov; i++) {
      rows.push({ ...makeEmptyRow(), marshrut: `${route.nomer}/${i}` });
    }
  });
  return rows.length > 0 ? rows : [makeEmptyRow(), makeEmptyRow(), makeEmptyRow()];
};

export type TabType = "narad" | "med" | "postSmen" | "vypusk" | "disp";

export const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: "narad",    label: "Наряд",                             icon: "ClipboardList" },
  { key: "med",      label: "Предрейсовый медосмотр",            icon: "Stethoscope"   },
  { key: "postSmen", label: "Послесменный медосмотр",            icon: "HeartPulse"    },
  { key: "vypusk",   label: "Журнал выпуска",                    icon: "Truck"         },
  { key: "disp",     label: "Журнал путевых (ПГ-1)",             icon: "BookOpen"      },
];
