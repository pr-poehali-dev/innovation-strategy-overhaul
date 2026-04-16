import { useState, useEffect, useMemo } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useAppStore } from "@/store/appStore";
import { calcPodrabotka } from "@/pages/dispatch/types";
import {
  KassaRow, VyplataRow, ChastRow, Day,
  MAIN_COLS, VYP_COLS,
  toNum, emptyRow, emptyVyp, emptyChastRow,
} from "./kassa/kassaTypes";
import KassaOtchet from "./kassa/KassaOtchet";
import ChastVydacha from "./kassa/ChastVydacha";

const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

const LS_KASSA = "dat_kassa_v1";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadKassa(): Record<string, any> {
  try { const r = localStorage.getItem(LS_KASSA); return r ? JSON.parse(r) : {}; } catch (e) { console.warn(e); return {}; }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveKassa(data: Record<string, any>): void {
  try { localStorage.setItem(LS_KASSA, JSON.stringify(data)); } catch (e) { console.warn(e); }
}

const toDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const Kassa = () => {
  const { weeklyNaryady, naryadSettings, employees } = useAppStore();

  const [allData, setAllData] = useState<Record<string, { rows: KassaRow[]; vyplaty: VyplataRow[] }>>(() => loadKassa());

  const [tab, setTab] = useState<"kassa" | "chast">("kassa");
  const [selectedKey, setSelectedKey] = useState(() => toDateKey(new Date()));
  const [rows, setRows] = useState<KassaRow[]>(() => {
    const saved = loadKassa()[toDateKey(new Date())];
    return saved?.rows ?? Array.from({ length: 12 }, () => emptyRow());
  });
  const [vyplaty, setVyplaty] = useState<VyplataRow[]>(() => {
    const saved = loadKassa()[toDateKey(new Date())];
    return saved?.vyplaty ?? Array.from({ length: 10 }, emptyVyp);
  });
  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);
  const [activeVyp, setActiveVyp] = useState<{ rowId: number; col: string } | null>(null);


  // При смене даты — загружаем сохранённые данные
  useEffect(() => {
    const saved = allData[selectedKey];
    setRows(saved?.rows ?? Array.from({ length: 12 }, () => emptyRow()));
    setVyplaty(saved?.vyplaty ?? Array.from({ length: 10 }, emptyVyp));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  // Сохранение при каждом изменении
  useEffect(() => {
    setAllData((prev) => {
      const updated = { ...prev, [selectedKey]: { rows, vyplaty } };
      saveKassa(updated);
      return updated;
    });
  }, [rows, vyplaty, selectedKey]);

  const [chastRows, setChastRows] = useState<ChastRow[]>(() =>
    employees
      .filter((e) => e.status === "active")
      .sort((a, b) => a.fio.localeCompare(b.fio, "ru"))
      .map((e) => emptyChastRow(e.fio, ""))
      .concat(Array.from({ length: 30 }, () => emptyChastRow()))
  );

  // Строки наряда за выбранный день
  const naryadRows = useMemo(() => weeklyNaryady[selectedKey] ?? [], [weeklyNaryady, selectedKey]);

  // Синхронизация напрямую из weeklyNaryady — не зависит от открытия Dispatch
  useEffect(() => {
    if (!naryadRows.length) return;
    setRows((currentRows) => {
      const existingByBort = new Map(currentRows.map((r) => [r.bort, r]));
      const syncedRows: KassaRow[] = naryadRows.map((r) => {
        const existing = existingByBort.get(r.bortovoy);
        const calc = calcPodrabotka(r as Parameters<typeof calcPodrabotka>[0], naryadSettings);
        return {
          ...(existing ?? emptyRow()),
          type:     "route" as const,
          mar:      r.marshrut,
          bort:     r.bortovoy,
          fioVod:   r.fio,
          fioCond:  r.fioKond || "без",
          kolBil:   r.biletov,
          podrVod:  calc && calc.vod  > 0 ? String(Math.round(calc.vod))  : (existing?.podrVod  ?? ""),
          podrCond: calc && calc.cond > 0 ? String(Math.round(calc.cond)) : (existing?.podrCond ?? ""),
        };
      });
      const dispRows = currentRows.filter((r) => r.type === "disp");
      return [...syncedRows, ...dispRows];
    });
  }, [naryadRows, naryadSettings, selectedKey]);

  // ─── Обработчики кассы ───────────────────────────────────────────────────
  const updateCell = (id: number, col: keyof KassaRow, value: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [col]: value } : r)));

  const addRow = (type: KassaRow["type"] = "route") =>
    setRows((prev) => [...prev, emptyRow(type)]);

  const deleteRow = (id: number) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    if (e.key !== "Tab" && e.key !== "Enter") return;
    e.preventDefault();
    if (colIdx + 1 < MAIN_COLS.length) {
      setActiveCell({ rowId: rows[rowIdx].id, col: MAIN_COLS[colIdx + 1].key });
    } else if (rowIdx + 1 < rows.length) {
      setActiveCell({ rowId: rows[rowIdx + 1].id, col: MAIN_COLS[0].key });
    }
  };

  // ─── Обработчики выплат ──────────────────────────────────────────────────
  const updateVyp = (id: number, col: keyof VyplataRow, val: string) => {
    setVyplaty((prev) => prev.map((v) => {
      if (v.id !== id) return v;
      const updated = { ...v, [col]: val };
      if (col === "summa" || col === "kol") {
        const s = toNum(col === "summa" ? val : updated.summa);
        const k = toNum(col === "kol"   ? val : updated.kol);
        updated.itogo = s && k ? String(Math.round(s * k)) : "";
      }
      return updated;
    }));
  };

  const addVyp = () => setVyplaty((prev) => [...prev, emptyVyp()]);
  const deleteVyp = (id: number) => setVyplaty((prev) => prev.filter((v) => v.id !== id));

  const handleVypKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    if (e.key !== "Tab" && e.key !== "Enter") return;
    e.preventDefault();
    if (colIdx + 1 < VYP_COLS.length) {
      setActiveVyp({ rowId: vyplaty[rowIdx].id, col: VYP_COLS[colIdx + 1].key });
    } else if (rowIdx + 1 < vyplaty.length) {
      setActiveVyp({ rowId: vyplaty[rowIdx + 1].id, col: VYP_COLS[0].key });
    }
  };

  // ─── Обработчики частичной выдачи ───────────────────────────────────────
  const updateChast = (id: number, field: "fio" | "nachisleno", val: string) =>
    setChastRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: val } : r));

  const updateChastDay = (id: number, day: Day, val: string) =>
    setChastRows((prev) => prev.map((r) => r.id === id ? { ...r, vyplaty: { ...r.vyplaty, [day]: val } } : r));

  const addChastRow = () => setChastRows((prev) => [...prev, emptyChastRow()]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Касса" />

      <div className="px-3 py-4 max-w-[1920px] mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm">

          {/* Шапка */}
          <div className="border-b border-gray-300 px-4 py-3 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Касса</h1>
                <p className="text-xs text-gray-500 mt-0.5">ООО «Дальавтотранс» · {today}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="font-semibold">Дата:</span>
                <input
                  type="date"
                  value={selectedKey}
                  onChange={(e) => setSelectedKey(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-400"
                />
                {naryadRows.length > 0 && (
                  <span className="text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded flex items-center gap-1">
                    <Icon name="RefreshCw" size={10} />
                    Из наряда ({naryadRows.length} ТС)
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => addRow("route")}
                className="flex items-center gap-1.5 px-2 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                <Icon name="Plus" size={12} /> Строка
              </button>
              <button onClick={() => addRow("disp")}
                className="flex items-center gap-1.5 px-2 py-1.5 text-xs bg-amber-500 text-white rounded hover:bg-amber-600">
                <Icon name="Plus" size={12} /> Диспетчер
              </button>
              <button onClick={() => window.print()}
                className="flex items-center gap-1.5 px-2 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                <Icon name="Printer" size={12} /> Печать
              </button>
            </div>
          </div>

          {/* Вкладки */}
          <div className="border-b border-gray-300 flex print:hidden">
            {([["kassa", "Кассовый отчёт"], ["chast", "Частичная выдача"]] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-5 py-2 text-sm font-medium border-b-2 transition-colors ${
                  tab === key
                    ? "border-blue-600 text-blue-700 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ═══ ВКЛАДКА: Кассовый отчёт ═══ */}
          {tab === "kassa" && (
            <KassaOtchet
              rows={rows}
              vyplaty={vyplaty}
              activeCell={activeCell}
              activeVyp={activeVyp}
              onUpdateCell={updateCell}
              onDeleteRow={deleteRow}
              onSetActiveCell={setActiveCell}
              onUpdateVyp={updateVyp}
              onAddVyp={addVyp}
              onDeleteVyp={deleteVyp}
              onSetActiveVyp={setActiveVyp}
              onKeyDown={handleKeyDown}
              onVypKeyDown={handleVypKeyDown}
              rowCount={rows.length}
              vyplatCount={vyplaty.length}
            />
          )}

          {/* ═══ ВКЛАДКА: Частичная выдача ═══ */}
          {tab === "chast" && (
            <ChastVydacha
              chastRows={chastRows}
              onUpdateChast={updateChast}
              onUpdateChastDay={updateChastDay}
              onAddChastRow={addChastRow}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default Kassa;