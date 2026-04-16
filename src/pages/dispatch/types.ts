export const STATUS_OTSUTSTVIYA = [
  "Выходной",
  "Больничный",
  "Не прошёл медика",
  "Запой",
  "Алкотестер",
] as const;

export type StatusOtsutstviya = typeof STATUS_OTSUTSTVIYA[number] | "";

export interface NaryadRow {
  id: number;
  vehicleId: number | null;
  bortovoy: string;   // Борт №
  gos: string;
  marka: string;
  marshrut: string;
  fio: string;
  fioKond: string;
  putevoy: string;
  terminal: string;
  podrabotka: boolean;
  biletov: string;
  statusOtsutstviya: StatusOtsutstviya;
}

export interface NormaSettings {
  stoimostBileta: string;
  stoimostTopliva: string;
  rashod: string;
  procentBez: string;
  procentVodS: string;
  procentCondS: string;
  fixedRoute6: string;
}

export const emptyRow = (): NaryadRow => ({
  id: Date.now() + Math.random(),
  vehicleId: null,
  bortovoy: "",
  gos: "",
  marka: "",
  marshrut: "",
  fio: "",
  fioKond: "",
  putevoy: "",
  terminal: "",
  podrabotka: false,
  biletov: "",
  statusOtsutstviya: "",
});

export const DEFAULT_SETTINGS: NormaSettings = {
  stoimostBileta: "40",
  stoimostTopliva: "75",
  rashod: "30",
  procentBez: "37",
  procentVodS: "22",
  procentCondS: "15",
  fixedRoute6: "7000",
};

// Порядок: Борт № → Маршрут → Терминал → Путевой лист
export const TEXT_COLS = [
  { key: "bortovoy", label: "Борт №",       width: "90px"  },
  { key: "marshrut", label: "Маршрут",      width: "90px"  },
  { key: "terminal", label: "Терминал",     width: "120px" },
  { key: "putevoy",  label: "Путевой лист", width: "110px" },
] as const;

export function calcPodrabotka(
  row: NaryadRow,
  s: NormaSettings,
): { vod: number; cond: number } | null {
  if (!row.podrabotka || !row.biletov) return null;
  const hasCond = row.fioKond.trim().length > 0;

  // Маршрут №6 без кондуктора — фиксированная оплата за смену
  const routeNum = row.marshrut.split("/")[0].trim();
  if (routeNum === "6" && !hasCond) {
    const fixed = parseFloat(s.fixedRoute6) || 0;
    return { vod: fixed, cond: 0 };
  }

  const bilety = parseFloat(row.biletov) || 0;
  const cena = parseFloat(s.stoimostBileta) || 0;
  const toplivoRub =
    (parseFloat(s.rashod) / 100) * bilety * (parseFloat(s.stoimostTopliva) || 0);
  const vyuchka = bilety * cena - toplivoRub;
  if (!hasCond) {
    return { vod: vyuchka * (parseFloat(s.procentBez) / 100), cond: 0 };
  }
  return {
    vod:  vyuchka * (parseFloat(s.procentVodS)  / 100),
    cond: vyuchka * (parseFloat(s.procentCondS) / 100),
  };
}

export const fmt = (n: number) =>
  n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });