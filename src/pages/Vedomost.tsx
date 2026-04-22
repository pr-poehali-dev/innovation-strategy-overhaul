import { useState, useEffect, useMemo } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useAppStore } from "@/store/appStore";
import { loadKassa } from "@/pages/kassa/kassaShared";
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

const emptyRow = (): VedomostRow => ({
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

type ColKey = keyof Omit<VedomostRow, "id">;

interface ColDef {
  key: ColKey;
  label: string;
  width: string;
  group: "fio" | "nach" | "uderzhano" | "podpis";
  numeric?: boolean;
}

const COLS: ColDef[] = [
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

const NACH_KEYS:      ColKey[] = ["nachisl", "otpusk", "doplata", "pererab"];
const UDERZH_KEYS:    ColKey[] = ["ndfl", "poluchPodrab", "otpuskPol", "ispL", "avansKarta", "zpKarta", "dolg", "narusheniya", "shtrafGarazh", "avans"];

const toNum = (v: string) => parseFloat(v.replace(",", ".")) || 0;
const fmt   = (n: number) => n === 0 ? "" : n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const NACH_KEYS_VED: ColKey[] = ["nachisl", "otpusk", "doplata", "pererab"];
export const UDERZH_KEYS_VED: ColKey[] = ["ndfl", "poluchPodrab", "otpuskPol", "ispL", "avansKarta", "zpKarta", "dolg", "narusheniya", "shtrafGarazh", "avans"];
export function calcVedomostRow(row: VedomostRow) {
  const toN = (v: string) => parseFloat(v.replace(",", ".")) || 0;
  const vsegaNach   = NACH_KEYS_VED.reduce((s, k) => s + toN(row[k]), 0);    // Всего начислено
  const vsegaPoluch = UDERZH_KEYS_VED.reduce((s, k) => s + toN(row[k]), 0);  // Всего получ. (сумма удержаний)
  return { vsegaNach, vsegaUd: vsegaPoluch, vsegaPoluch, ostatok: vsegaNach - vsegaPoluch };
}

function calcRow(row: VedomostRow) {
  const vsegaNach   = NACH_KEYS.reduce((s, k) => s + toNum(row[k]), 0);   // ВСЕГО нач.
  const vsegaPoluch = UDERZH_KEYS.reduce((s, k) => s + toNum(row[k]), 0); // ВСЕГО получ. = сумма удержаний
  const ostatok     = vsegaNach - vsegaPoluch;                            // Остаток к получ.
  return { vsegaNach, vsegaUd: vsegaPoluch, vsegaPoluch, ostatok };
}

const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const MONTH_NAMES = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

const Vedomost = () => {
  const { employees } = useAppStore();
  const [rows, setRows] = useState<VedomostRow[]>(() => {
    const saved = loadVedomostRows();
    return saved.length > 0 ? saved : [emptyRow(), emptyRow(), emptyRow()];
  });
  const [activeCell, setActiveCell] = useState<{ rowId: number; col: ColKey } | null>(null);
  const [monthKey, setMonthKey] = useState<string>(currentMonthKey());
  // Тик для перечитывания кассы — инкрементим при событии "касса-обновилась"
  const [kassaTick, setKassaTick] = useState(0);

  useEffect(() => {
    try { localStorage.setItem(LS_VEDOMOST, JSON.stringify(rows)); } catch (e) { console.warn(e); }
  }, [rows]);

  // Суммы по ФИО за выбранный месяц: nachisl (Подр.вод) + poluchPodrab (выданное)
  const kassaAgg = useMemo(() => {
    const kassa = loadKassa();
    const acc: Record<string, { nachisl: number; poluch: number }> = {};
    Object.entries(kassa).forEach(([dateKey, day]) => {
      if (!dateKey.startsWith(monthKey + "-")) return;
      const kassaRows = (day as { rows?: Array<{ fioVod?: string; fioCond?: string; podrVod?: string; podrCond?: string; podrVodVydano?: boolean; podrCondVydano?: boolean }> })?.rows;
      if (!Array.isArray(kassaRows)) return;
      kassaRows.forEach((r) => {
        const pv = parseFloat((r.podrVod || "0").replace(",", ".")) || 0;
        const pc = parseFloat((r.podrCond || "0").replace(",", ".")) || 0;
        if (r.fioVod && pv > 0) {
          const k = r.fioVod.trim();
          if (!acc[k]) acc[k] = { nachisl: 0, poluch: 0 };
          acc[k].nachisl += pv;
          if (r.podrVodVydano) acc[k].poluch += pv;
        }
        if (r.fioCond && r.fioCond !== "без" && pc > 0) {
          const k = r.fioCond.trim();
          if (!acc[k]) acc[k] = { nachisl: 0, poluch: 0 };
          acc[k].nachisl += pc;
          if (r.podrCondVydano) acc[k].poluch += pc;
        }
      });
    });
    return acc;
    // kassaTick форсирует перечитывание при событии kassa-updated / storage
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey, kassaTick]);

  // Подписка на изменения Кассы: своё окно (CustomEvent) + другие вкладки (storage)
  useEffect(() => {
    const bump = () => setKassaTick((t) => t + 1);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "dat_kassa_v1" || e.key === null) bump();
    };
    window.addEventListener("kassa-updated", bump);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("kassa-updated", bump);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Автоприменение сумм из Кассы в строки Ведомости.
  // 1) Обновляет nachisl и poluchPodrab у ФИО, которые уже есть в ведомости.
  // 2) Добавляет новых сотрудников из Кассы, которых ещё нет в ведомости.
  // Ручные поля (НДФЛ, аванс и т.д.) не трогаются.
  useEffect(() => {
    setRows((prev) => {
      let changed = false;
      const existingFios = new Set(
        prev.map((r) => (r.fio || "").trim()).filter(Boolean)
      );
      const next = prev.map((r) => {
        const fio = (r.fio || "").trim();
        if (!fio) return r;
        const agg = kassaAgg[fio] || { nachisl: 0, poluch: 0 };
        const newNachisl = String(Math.round(agg.nachisl));
        const newPoluch  = String(Math.round(agg.poluch));
        const curNachisl = String(Math.round(parseFloat((r.nachisl || "0").replace(",", ".")) || 0));
        const curPoluch  = String(Math.round(parseFloat((r.poluchPodrab || "0").replace(",", ".")) || 0));
        if (curNachisl === newNachisl && curPoluch === newPoluch) return r;
        changed = true;
        return { ...r, nachisl: newNachisl, poluchPodrab: newPoluch };
      });
      // Добавляем ФИО из Кассы, которых ещё нет в ведомости
      const toAdd: VedomostRow[] = [];
      Object.entries(kassaAgg).forEach(([fio, agg]) => {
        if (!fio || existingFios.has(fio)) return;
        if (agg.nachisl <= 0 && agg.poluch <= 0) return;
        toAdd.push({
          ...emptyRow(),
          fio,
          nachisl:      String(Math.round(agg.nachisl)),
          poluchPodrab: String(Math.round(agg.poluch)),
        });
      });
      if (toAdd.length > 0) {
        changed = true;
        return [...next, ...toAdd];
      }
      return changed ? next : prev;
    });
  }, [kassaAgg]);

  // Автосинхронизация: добавить всех активных водителей/кондукторов из Кадров + заполнить Начислено и Получ.Подраб.
  const syncFromKadryAndKassa = () => {
    const staff = employees.filter((e) => e.status === "active" && (e.dolzhnost === "Водитель" || e.dolzhnost === "Кондуктор"));
    setRows((prev) => {
      const byFio = new Map(prev.filter((r) => r.fio).map((r) => [r.fio.trim(), r]));
      const result: VedomostRow[] = staff.map((e) => {
        const existing = byFio.get(e.fio.trim());
        const agg = kassaAgg[e.fio.trim()] || { nachisl: 0, poluch: 0 };
        const base = existing ?? emptyRow();
        // Всегда берём актуальные суммы из Кассы, даже если 0 —
        // чтобы при снятии галочки «выдано» значение в ведомости уменьшилось.
        return {
          ...base,
          fio: e.fio,
          nachisl:      String(Math.round(agg.nachisl)),
          poluchPodrab: String(Math.round(agg.poluch)),
        };
      });
      // Сохраняем строки, которые не нашлись в Кадрах (ручные)
      const staffFios = new Set(staff.map((s) => s.fio.trim()));
      const manual = prev.filter((r) => r.fio && !staffFios.has(r.fio.trim()));
      return result.length > 0 ? [...result, ...manual] : prev;
    });
  };

  const updateCell = (id: number, col: ColKey, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [col]: value } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const deleteRow = (id: number) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      if (colIdx + 1 < COLS.length) {
        setActiveCell({ rowId: rows[rowIdx].id, col: COLS[colIdx + 1].key });
      } else if (rowIdx + 1 < rows.length) {
        setActiveCell({ rowId: rows[rowIdx + 1].id, col: COLS[0].key });
      } else {
        addRow();
        setTimeout(() => setActiveCell({ rowId: rows[rows.length - 1]?.id, col: COLS[0].key }), 0);
      }
    }
  };

  // Итого по всем строкам
  const totals = rows.reduce(
    (acc, row) => {
      const c = calcRow(row);
      NACH_KEYS.forEach((k) => { acc.nach[k] = (acc.nach[k] || 0) + toNum(row[k]); });
      UDERZH_KEYS.forEach((k) => { acc.ud[k] = (acc.ud[k] || 0) + toNum(row[k]); });
      acc.vsegaNach  += c.vsegaNach;
      acc.vsegaUd    += c.vsegaUd;
      acc.vsegaPoluch += c.vsegaPoluch;
      acc.ostatok    += c.ostatok;
      return acc;
    },
    {
      nach: {} as Record<string, number>,
      ud:   {} as Record<string, number>,
      vsegaNach: 0, vsegaUd: 0, vsegaPoluch: 0, ostatok: 0,
    }
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Ведомость" />

      <div className="px-4 py-5 max-w-full mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm">

          {/* Шапка */}
          <div className="border-b border-gray-300 px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Расчётная ведомость</h1>
              <p className="text-sm text-gray-500 mt-0.5">Дальавтотранс · {today}</p>
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={monthKey}
                onChange={(e) => setMonthKey(e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded bg-white"
                title="Месяц для автозаполнения"
              >
                {(() => {
                  const opts: { value: string; label: string }[] = [];
                  const d = new Date();
                  for (let i = 0; i < 12; i++) {
                    const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
                    const v = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
                    opts.push({ value: v, label: `${MONTH_NAMES[dt.getMonth()]} ${dt.getFullYear()}` });
                  }
                  return opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>);
                })()}
              </select>
              <button
                onClick={syncFromKadryAndKassa}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                title="Заполнить ФИО из Кадров, Начислено и Получ. Подраб. из Кассы за выбранный месяц"
              >
                <Icon name="RefreshCw" size={14} />
                Автозаполнение
              </button>
              <button onClick={addRow} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                <Icon name="Plus" size={14} />
                Добавить строку
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                <Icon name="Printer" size={14} />
                Печать
              </button>
            </div>
          </div>

          {/* Таблица */}
          <div className="overflow-x-auto">
            <table className="border-collapse text-xs" style={{ minWidth: "1400px" }}>
              <thead>
                {/* Группы */}
                <tr style={{ backgroundColor: "#1a3a6b" }}>
                  <th className="border border-blue-900 px-1 py-1.5 text-white text-center" rowSpan={2} style={{ width: "28px" }}>№</th>
                  <th className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-center" rowSpan={2} style={{ width: "180px" }}>Ф.И.О</th>
                  <th className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-center" colSpan={4}>НАЧИСЛЕНО</th>
                  <th className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-center" rowSpan={2} style={{ width: "100px", background: "#14305a" }}>ВСЕГО нач.</th>
                  <th className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-center" colSpan={10} style={{ background: "#7b2d2d" }}>УДЕРЖАНО</th>
                  <th className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-center" rowSpan={2} style={{ width: "100px", background: "#14305a" }}>ВСЕГО получено</th>
                  <th className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-center" rowSpan={2} style={{ width: "100px", background: "#1a5c3a" }}>Остаток к получ.</th>
                  <th className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-center" rowSpan={2} style={{ width: "100px" }}>Подпись</th>
                  <th className="border border-blue-900 px-1 py-1" rowSpan={2} style={{ width: "28px" }}></th>
                </tr>
                {/* Подзаголовки */}
                <tr style={{ backgroundColor: "#243e6e" }}>
                  {NACH_KEYS.map((k) => {
                    const col = COLS.find((c) => c.key === k)!;
                    return (
                      <th key={k} className="border border-blue-900 px-1 py-1.5 text-white text-center font-normal text-xs" style={{ width: col.width, minWidth: col.width }}>
                        {col.label}
                      </th>
                    );
                  })}
                  {UDERZH_KEYS.map((k) => {
                    const col = COLS.find((c) => c.key === k)!;
                    return (
                      <th key={k} className="border border-blue-900 px-1 py-1.5 text-white text-center font-normal text-xs" style={{ width: col.width, minWidth: col.width, background: "#5a2020" }}>
                        {col.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {rows.map((row, rowIdx) => {
                  const { vsegaNach, vsegaUd, vsegaPoluch, ostatok } = calcRow(row);
                  return (
                    <tr key={row.id} className={rowIdx % 2 === 0 ? "bg-white" : "bg-blue-50/40"}>
                      {/* № */}
                      <td className="border border-gray-300 text-center text-gray-400 select-none" style={{ width: "28px" }}>{rowIdx + 1}</td>

                      {/* ФИО */}
                      <td className="border border-gray-300 p-0" style={{ width: "180px" }}>
                        {renderInput(row, "fio", rowIdx, 0, updateCell, activeCell, setActiveCell, handleKeyDown)}
                      </td>

                      {/* Начислено */}
                      {NACH_KEYS.map((k, ki) => (
                        <td key={k} className="border border-gray-300 p-0">
                          {renderInput(row, k, rowIdx, 1 + ki, updateCell, activeCell, setActiveCell, handleKeyDown, true)}
                        </td>
                      ))}

                      {/* Всего начислено */}
                      <td className="border border-gray-300 text-center font-semibold text-xs" style={{ background: "#e8f0fe" }}>
                        {vsegaNach > 0 ? <span className="text-blue-800">{fmt(vsegaNach)}</span> : <span className="text-gray-300">—</span>}
                      </td>

                      {/* Удержано */}
                      {UDERZH_KEYS.map((k, ki) => (
                        <td key={k} className="border border-gray-300 p-0" style={{ background: rowIdx % 2 === 0 ? "#fff8f8" : "#fdf0f0" }}>
                          {renderInput(row, k, rowIdx, 5 + ki, updateCell, activeCell, setActiveCell, handleKeyDown, true)}
                        </td>
                      ))}

                      {/* Всего получено */}
                      <td className="border border-gray-300 text-center font-semibold text-xs" style={{ background: "#e8f0fe" }}>
                        {vsegaPoluch !== 0 ? <span className="text-blue-800">{fmt(vsegaPoluch)}</span> : <span className="text-gray-300">—</span>}
                      </td>

                      {/* Остаток к получению */}
                      <td className="border border-gray-300 text-center font-semibold text-xs" style={{ background: rowIdx % 2 === 0 ? "#f0faf4" : "#e6f7ec" }}>
                        {ostatok !== 0 ? (
                          <span className={ostatok > 0 ? "text-green-700" : "text-red-600"}>{fmt(ostatok)}</span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>

                      {/* Подпись */}
                      <td className="border border-gray-300 p-0" style={{ width: "100px" }}>
                        {renderInput(row, "podpis", rowIdx, 15, updateCell, activeCell, setActiveCell, handleKeyDown)}
                      </td>

                      {/* Удалить */}
                      <td className="border border-gray-300 text-center" style={{ width: "28px" }}>
                        <button onClick={() => deleteRow(row.id)} className="text-gray-300 hover:text-red-500 transition-colors p-0.5">
                          <Icon name="X" size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Итого */}
              <tfoot>
                <tr className="font-bold text-xs" style={{ backgroundColor: "#1a3a6b", color: "white" }}>
                  <td className="border border-blue-900 px-1 py-2 text-center" colSpan={2}>ИТОГО</td>
                  {NACH_KEYS.map((k) => (
                    <td key={k} className="border border-blue-900 px-2 py-2 text-center">
                      {totals.nach[k] ? fmt(totals.nach[k]) : "—"}
                    </td>
                  ))}
                  <td className="border border-blue-900 px-2 py-2 text-center" style={{ background: "#14305a" }}>
                    {fmt(totals.vsegaNach)}
                  </td>
                  {UDERZH_KEYS.map((k) => (
                    <td key={k} className="border border-blue-900 px-2 py-2 text-center" style={{ background: "#5a2020" }}>
                      {totals.ud[k] ? fmt(totals.ud[k]) : "—"}
                    </td>
                  ))}
                  <td className="border border-blue-900 px-2 py-2 text-center" style={{ background: "#14305a" }}>
                    {fmt(totals.vsegaPoluch)}
                  </td>
                  <td className="border border-blue-900 px-2 py-2 text-center" style={{ background: "#1a5c3a" }}>
                    {fmt(totals.ostatok)}
                  </td>
                  <td className="border border-blue-900" colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="border-t border-gray-300 px-6 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-400">
            <span>Строк: {rows.length}</span>
            <span>Tab / Enter — переход между ячейками</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function renderInput(
  row: VedomostRow,
  col: ColKey,
  rowIdx: number,
  colIdx: number,
  updateCell: (id: number, col: ColKey, value: string) => void,
  activeCell: { rowId: number; col: ColKey } | null,
  setActiveCell: (v: { rowId: number; col: ColKey } | null) => void,
  handleKeyDown: (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => void,
  numeric = false,
) {
  const isActive = activeCell?.rowId === row.id && activeCell?.col === col;
  return (
    <input
      type="text"
      value={row[col]}
      onChange={(e) => updateCell(row.id, col, e.target.value)}
      onFocus={() => setActiveCell({ rowId: row.id, col })}
      onBlur={() => setActiveCell(null)}
      onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
      autoFocus={isActive}
      className={`w-full h-7 px-1 text-gray-800 bg-transparent outline-none border-2 ${
        isActive ? "border-blue-500 bg-blue-50" : "border-transparent"
      } transition-colors ${numeric ? "text-center" : ""}`}
      placeholder="—"
    />
  );
}

export default Vedomost;