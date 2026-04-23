import { uid } from "@/lib/uid";

export const LS_VEDOMOST = "dat_vedomost_v1";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadVedomostRows(): any[] {
  try { const r = localStorage.getItem(LS_VEDOMOST); return r ? JSON.parse(r) : []; } catch (e) { console.warn(e); return []; }
}

export interface VedomostRow {
  id: number;
  fio: string;
  // Начислено
  nachisl: string;
  otpusk: string;
  doplata: string;
  pererab: string;
  // Удержано
  ndfl: string;
  poluchPodrab: string;
  otpuskPol: string;
  ispL: string;
  avansKarta: string;
  zpKarta: string;
  dolg: string;
  narusheniya: string;
  shtrafGarazh: string;
  avans: string;
  // Подпись
  podpis: string;
}

export const emptyRow = (): VedomostRow => ({
  id: uid(),
  fio: "",
  nachisl: "",
  otpusk: "",
  doplata: "",
  pererab: "",
  ndfl: "",
  poluchPodrab: "",
  otpuskPol: "",
  ispL: "",
  avansKarta: "",
  zpKarta: "",
  dolg: "",
  narusheniya: "",
  shtrafGarazh: "",
  avans: "",
  podpis: "",
});

export type ColKey = keyof Omit<VedomostRow, "id">;

export interface ColDef {
  key: ColKey;
  label: string;
  width: string;
  group: "fio" | "nach" | "uderzhano" | "podpis";
  numeric?: boolean;
}

export const COLS: ColDef[] = [
  { key: "fio",          label: "Ф.И.О",           width: "180px", group: "fio"       },
  { key: "nachisl",      label: "Начисл",            width: "90px",  group: "nach",      numeric: true },
  { key: "otpusk",       label: "Отпуск, б/л",       width: "90px",  group: "nach",      numeric: true },
  { key: "doplata",      label: "Доплата",            width: "80px",  group: "nach",      numeric: true },
  { key: "pererab",      label: "Переработка",        width: "90px",  group: "nach",      numeric: true },
  { key: "ndfl",         label: "НДФЛ",              width: "80px",  group: "uderzhano", numeric: true },
  { key: "poluchPodrab", label: "Получ. Подраб.",    width: "100px", group: "uderzhano", numeric: true },
  { key: "otpuskPol",    label: "Отпуск пол.",        width: "90px",  group: "uderzhano", numeric: true },
  { key: "ispL",         label: "Исп.Л., алим",      width: "90px",  group: "uderzhano", numeric: true },
  { key: "avansKarta",   label: "Аванс карта",        width: "90px",  group: "uderzhano", numeric: true },
  { key: "zpKarta",      label: "ЗП карта",           width: "80px",  group: "uderzhano", numeric: true },
  { key: "dolg",         label: "Долг",               width: "70px",  group: "uderzhano", numeric: true },
  { key: "narusheniya",  label: "Нарушения",          width: "90px",  group: "uderzhano", numeric: true },
  { key: "shtrafGarazh", label: "Штраф гараж",        width: "90px",  group: "uderzhano", numeric: true },
  { key: "avans",        label: "Аванс",              width: "80px",  group: "uderzhano", numeric: true },
  { key: "podpis",       label: "Подпись",            width: "100px", group: "podpis"    },
];

export const NACH_KEYS:   ColKey[] = ["nachisl", "otpusk", "doplata", "pererab"];
export const UDERZH_KEYS: ColKey[] = ["ndfl", "poluchPodrab", "otpuskPol", "ispL", "avansKarta", "zpKarta", "dolg", "narusheniya", "shtrafGarazh", "avans"];

export const toNum = (v: string) => parseFloat(v.replace(",", ".")) || 0;
export const fmt   = (n: number) => n === 0 ? "" : n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const NACH_KEYS_VED: ColKey[] = ["nachisl", "otpusk", "doplata", "pererab"];
export const UDERZH_KEYS_VED: ColKey[] = ["ndfl", "poluchPodrab", "otpuskPol", "ispL", "avansKarta", "zpKarta", "dolg", "narusheniya", "shtrafGarazh", "avans"];
export function calcVedomostRow(row: VedomostRow) {
  const toN = (v: string) => parseFloat(v.replace(",", ".")) || 0;
  const vsegaNach   = NACH_KEYS_VED.reduce((s, k) => s + toN(row[k]), 0);    // Всего начислено
  const vsegaPoluch = UDERZH_KEYS_VED.reduce((s, k) => s + toN(row[k]), 0);  // Всего получ. (сумма удержаний)
  return { vsegaNach, vsegaUd: vsegaPoluch, vsegaPoluch, ostatok: vsegaNach - vsegaPoluch };
}

export function calcRow(row: VedomostRow) {
  const vsegaNach   = NACH_KEYS.reduce((s, k) => s + toNum(row[k]), 0);   // ВСЕГО нач.
  const vsegaPoluch = UDERZH_KEYS.reduce((s, k) => s + toNum(row[k]), 0); // ВСЕГО получ. = сумма удержаний
  const ostatok     = vsegaNach - vsegaPoluch;                            // Остаток к получ.
  return { vsegaNach, vsegaUd: vsegaPoluch, vsegaPoluch, ostatok };
}

export const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

export const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const MONTH_NAMES = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
