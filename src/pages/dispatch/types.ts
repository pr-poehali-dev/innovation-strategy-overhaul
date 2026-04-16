export interface NaryadRow {
  id: number;
  bortovoy: string;
  fio: string;
  fioKond: string;
  garazhny: string;
  putevoy: string;
  podrabotka: boolean;
  biletov: string;
}

export interface NormaSettings {
  stoimostBileta: string;
  stoimostTopliva: string;
  rashod: string;
  procentBez: string;
  procentVodS: string;
  procentCondS: string;
}

export const emptyRow = (): NaryadRow => ({
  id: Date.now() + Math.random(),
  bortovoy: "",
  fio: "",
  fioKond: "",
  garazhny: "",
  putevoy: "",
  podrabotka: false,
  biletov: "",
});

export const DEFAULT_SETTINGS: NormaSettings = {
  stoimostBileta: "40",
  stoimostTopliva: "75",
  rashod: "30",
  procentBez: "37",
  procentVodS: "22",
  procentCondS: "15",
};

export const TEXT_COLS = [
  { key: "bortovoy", label: "Бортовой №",     width: "120px" },
  { key: "fio",      label: "ФИО водителя",   width: "200px" },
  { key: "fioKond",  label: "ФИО кондуктора", width: "200px" },
  { key: "garazhny", label: "Гаражный №",     width: "110px" },
  { key: "putevoy",  label: "Путевой лист",   width: "140px" },
] as const;

export function calcPodrabotka(
  row: NaryadRow,
  s: NormaSettings,
): { vod: number; cond: number } | null {
  if (!row.podrabotka || !row.biletov) return null;
  const bilety = parseFloat(row.biletov) || 0;
  const cena = parseFloat(s.stoimostBileta) || 0;
  const toplivoRub =
    (parseFloat(s.rashod) / 100) * bilety * (parseFloat(s.stoimostTopliva) || 0);
  const vyuchka = bilety * cena - toplivoRub;
  const hasCond = row.fioKond.trim().length > 0;
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
