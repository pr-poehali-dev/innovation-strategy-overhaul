import { uid } from "@/lib/uid";

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
  bortovoy: string;
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
  dtp: boolean;
  garazhny?: string;
  odometrVyezd: string;
  odometrVozv: string;
}

export interface NormaSettings {
  stoimostBileta: string;
  stoimostProezda: string;
  stoimostTopliva: string;
  rashod: string;
  procentBez: string;
  procentVodS: string;
  procentCondS: string;
  fixedRoute6: string;
}

export const emptyRow = (): NaryadRow => ({
  id: uid(),
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
  dtp: false,
  odometrVyezd: "",
  odometrVozv: "",
});



// Порядок в таблице: Борт № → Маршрут (остальные — отдельные ячейки)
export const TEXT_COLS = [
  { key: "marshrut", label: "Маршрут", width: "90px" },
  { key: "bortovoy", label: "Борт №",  width: "90px" },
] as const;

export function calcPodrabotka(
  row: NaryadRow,
  s: NormaSettings & { stoimostProezda?: string },
): { vod: number; cond: number } | null {
  if (!row.podrabotka) return null;

  const hasCond  = row.fioKond.trim().length > 0;
  const routeNum = row.marshrut.split("/")[0].trim();

  // Маршрут №6 без кондуктора — фиксированная оплата за смену (не зависит от билетов)
  if (routeNum === "6" && !hasCond) {
    const fixed = parseFloat(s.fixedRoute6) || 0;
    return fixed > 0 ? { vod: fixed, cond: 0 } : null;
  }

  // Для остальных маршрутов нужны билеты
  if (!row.biletov) return null;

  const bilety = parseFloat(row.biletov) || 0;
  // Используем stoimostProezda если доступна (актуальная цена из настроек)
  const cena = parseFloat(s.stoimostProezda || s.stoimostBileta) || 0;
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