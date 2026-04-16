// ─── Месячный кассовый отчёт ────────────────────────────────────────────────
export interface MonthlyKassaRow {
  id: number;
  bort: string;        // борт №
  mar: string;         // маршрут (первый встреченный за месяц)
  fioVod: string;      // ФИО водителя
  fioCond: string;     // ФИО кондуктора
  // Суммированные по дням из кассового отчёта:
  kolBil: number;      // кол. билетов за месяц
  beznal: number;      // безнал за месяц (← из Продаж: валид)
  qr: number;
  viruchka: number;    // выручка
  obed: number;
  rashodDt: number;
  chek: number;
  vozvrat: number;
  podrVod: number;
  podrCond: number;
  vPlus: number;
  itogo: number;
  // По дням (для детализации):
  byDay: Record<string, {
    kolBil: number; beznal: number; qr: number; viruchka: number;
    obed: number; rashodDt: number; chek: number; vozvrat: number;
    podrVod: number; podrCond: number; vPlus: number; itogo: number;
  }>;
}

// ─── Типы ──────────────────────────────────────────────────────────────────
export interface KassaRow {
  id: number;
  type: "route" | "disp" | "empty";
  mar: string;
  bort: string;
  fioVod: string;
  fioCond: string;
  prodBilety: string;
  kolBil: string;
  beznal: string;
  qr: string;
  viruchka: string;
  obed: string;
  rashodDt: string;
  chek: string;
  vozvrat: string;
  podrVod: string;         // начислено водителю
  podrCond: string;        // начислено кондуктору
  podrVodVydano: boolean;  // галочка: подработка водителя выдана
  podrCondVydano: boolean; // галочка: подработка кондуктора выдана
  vPlus: string;
  itogo: string;
}

export interface VyplataRow {
  id: number;
  fio: string;
  vid: string;
  summa: string;
  kol: string;
  itogo: string;
}

export const DAYS = [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31] as const;
export type Day = typeof DAYS[number];

export interface ChastRow {
  id: number;
  fio: string;
  nachisleno: string;
  vyplaty: Record<Day, string>;
}

// ─── Константы ─────────────────────────────────────────────────────────────
export const ROUTE_COLORS: Record<string, string> = {
  "1":  "#e8f4e8",
  "3":  "#e8ecf8",
  "6":  "#fef9e8",
  "15": "#fdeef0",
  "24": "#f0ebe8",
};

export const getRouteColor = (mar: string) => {
  const grp = mar.split("/")[0].trim();
  return ROUTE_COLORS[grp] ?? "#ffffff";
};

export const MAIN_COLS: { key: keyof Omit<KassaRow, "id" | "type">; label: string; width: string; numeric?: boolean }[] = [
  { key: "mar",          label: "№ мар",            width: "55px"  },
  { key: "bort",         label: "Борт №",            width: "55px"  },
  { key: "fioVod",       label: "ФИО водитель",      width: "130px" },
  { key: "fioCond",      label: "ФИО кондуктор",     width: "100px" },
  { key: "prodBilety",   label: "Прод. бил",         width: "75px"  },
  { key: "kolBil",       label: "Кол. бил",          width: "60px",  numeric: true },
  { key: "beznal",       label: "Безнал",            width: "65px",  numeric: true },
  { key: "qr",           label: "QR код",            width: "60px",  numeric: true },
  { key: "viruchka",     label: "Выручка",           width: "75px",  numeric: true },
  { key: "obed",         label: "Обед",              width: "55px",  numeric: true },
  { key: "rashodDt",     label: "Расх. ДТ",          width: "65px",  numeric: true },
  { key: "chek",         label: "Чек",               width: "55px",  numeric: true },
  { key: "vozvrat",      label: "Возврат",           width: "65px",  numeric: true },
  { key: "podrVod",         label: "Подр. вод ⟳",   width: "75px",  numeric: true },
  { key: "podrVodVydano",  label: "✓ вод",           width: "40px"  },
  { key: "podrCond",        label: "Подр. конд ⟳",  width: "80px",  numeric: true },
  { key: "podrCondVydano", label: "✓ конд",          width: "45px"  },
  { key: "vPlus",           label: "В плюс",         width: "65px",  numeric: true },
  { key: "itogo",           label: "ИТОГО",          width: "75px",  numeric: true },
];

export const VYP_COLS: { key: keyof Omit<VyplataRow, "id">; label: string; width: string }[] = [
  { key: "fio",   label: "ФИО",          width: "110px" },
  { key: "vid",   label: "Вид выплаты",  width: "90px"  },
  { key: "summa", label: "Сумма",        width: "70px"  },
  { key: "kol",   label: "Кол",          width: "50px"  },
  { key: "itogo", label: "Итого",        width: "75px"  },
];

// ─── Утилиты ───────────────────────────────────────────────────────────────
export const toNum = (v: string) => parseFloat((v || "0").replace(",", ".")) || 0;

export const emptyRow = (type: KassaRow["type"] = "route"): KassaRow => ({
  id: Math.random() * 1e15 + performance.now(),
  type,
  mar: "", bort: "", fioVod: "", fioCond: "",
  prodBilety: "", kolBil: "", beznal: "", qr: "",
  viruchka: "", obed: "", rashodDt: "", chek: "",
  vozvrat: "", podrVod: "", podrCond: "",
  podrVodVydano: false, podrCondVydano: false,
  vPlus: "", itogo: "",
});

export const emptyVyp = (): VyplataRow => ({
  id: Math.random() * 1e15 + performance.now(),
  fio: "", vid: "", summa: "", kol: "", itogo: "",
});

export const emptyChastRow = (fio = "", nach = ""): ChastRow => ({
  id: Math.random() * 1e15 + performance.now(),
  fio,
  nachisleno: nach,
  vyplaty: Object.fromEntries(DAYS.map((d) => [d, ""])) as Record<Day, string>,
});

export const calcOstatok = (row: ChastRow) => {
  const nach = toNum(row.nachisleno);
  const vydan = DAYS.reduce((s, d) => s + toNum(row.vyplaty[d]), 0);
  return nach - vydan;
};