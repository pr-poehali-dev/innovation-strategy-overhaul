import { CompanySettings } from "@/store/appStore";

// ─── localStorage ────────────────────────────────────────────────────────────
export const LS_TB = "dat_tb_entries_v1";

export function loadTbEntries(): TbEntry[] {
  try {
    const raw = localStorage.getItem(LS_TB);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { console.warn(e); return []; }
}

export function saveTbEntries(entries: TbEntry[]): void {
  try { localStorage.setItem(LS_TB, JSON.stringify(entries)); } catch (e) { console.warn(e); }
}

// ─── Утилиты дат ─────────────────────────────────────────────────────────────
export const toDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const toDisplayDate = (key: string): string => {
  if (!key) return "";
  const d = new Date(key + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export const toMonthYear = (key: string): string => {
  if (!key) return "";
  const d = new Date(key + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
};

export const getDaysInMonth = (yearMonth: string): string[] => {
  const [y, m] = yearMonth.split("-").map(Number);
  const count = new Date(y, m, 0).getDate();
  return Array.from({ length: count }, (_, i) => {
    const day = String(i + 1).padStart(2, "0");
    return `${yearMonth}-${day}`;
  });
};

export const currentMonthKey = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

// ─── Константы ───────────────────────────────────────────────────────────────
export const EMPTY_COMPANY: CompanySettings = {
  nazvanie: "—", kratkoeNazvanie: "", inn: "", kpp: "", ogrn: "", okpo: "", okvad: "",
  direktor: "", dolzhnostDir: "Директор", glavbuh: "",
  adresYur: "", adres: "", telefon: "", email: "",
  bank: "", bik: "", raschetnySchet: "", korSchet: "",
  licenziya: "", licenziyaData: "", licenziyaVydan: "", reestrNomer: "",
  svidetelstvo: "", svidetelstvoData: "", dogovorZakazchik: "", zakazchik: "", zakazchikInn: "",
};

export const INSTRUKTAZHI = [
  "Вводный инструктаж",
  "Первичный инструктаж на рабочем месте",
  "Повторный инструктаж",
  "Внеплановый инструктаж",
  "Целевой инструктаж",
  "Инструктаж по противопожарной безопасности",
  "Инструктаж по электробезопасности",
  "Инструктаж по перевозке пассажиров",
];

// ─── Тип записи журнала ──────────────────────────────────────────────────────
export interface TbEntry {
  dateKey:         string;
  fio:             string;
  dolzhnost:       string;
  tabNum:          string;
  vidInstruktazha: string;
  rukovoditel:     string;
  podpisInstr:     string;
  primechanie:     string;
}
