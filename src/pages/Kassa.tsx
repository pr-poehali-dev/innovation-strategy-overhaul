import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useAppStore } from "@/store/appStore";
import {
  KassaRow, VyplataRow, ChastRow, Day,
  MAIN_COLS, VYP_COLS,
  toNum, emptyRow, emptyVyp, emptyChastRow,
} from "./kassa/kassaTypes";
import KassaOtchet from "./kassa/KassaOtchet";
import ChastVydacha from "./kassa/ChastVydacha";

const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

const Kassa = () => {
  const { naryadEntries, employees } = useAppStore();

  const [tab, setTab] = useState<"kassa" | "chast">("kassa");
  const [rows, setRows] = useState<KassaRow[]>(() => Array.from({ length: 12 }, () => emptyRow()));
  const [vyplaty, setVyplaty] = useState<VyplataRow[]>(() => Array.from({ length: 10 }, emptyVyp));
  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);
  const [activeVyp, setActiveVyp] = useState<{ rowId: number; col: string } | null>(null);
  const prevEntriesRef = useRef<typeof naryadEntries>([]);

  const [chastRows, setChastRows] = useState<ChastRow[]>(() =>
    employees
      .filter((e) => e.status === "active")
      .sort((a, b) => a.fio.localeCompare(b.fio, "ru"))
      .map((e) => emptyChastRow(e.fio, ""))
      .concat(Array.from({ length: 30 }, () => emptyChastRow()))
  );

  // Автоматическая синхронизация из наряда
  useEffect(() => {
    if (!naryadEntries.length) return;
    prevEntriesRef.current = naryadEntries;

    setRows((currentRows) => {
      const existingByBort = new Map(currentRows.map((r) => [r.bort, r]));
      const syncedRows: KassaRow[] = naryadEntries.map((e) => {
        const existing = existingByBort.get(e.bortovoy);
        return {
          ...(existing ?? emptyRow()),
          type:     "route" as const,
          mar:      e.marshrut,
          bort:     e.bortovoy,
          fioVod:   e.fioVod,
          fioCond:  e.fioKond || "без",
          kolBil:   e.biletov,
          podrVod:  e.podrabotkaVod  > 0 ? String(Math.round(e.podrabotkaVod))  : (existing?.podrVod  ?? ""),
          podrCond: e.podrabotkaKond > 0 ? String(Math.round(e.podrabotkaKond)) : (existing?.podrCond ?? ""),
        };
      });
      const dispRows = currentRows.filter((r) => r.type === "disp");
      return [...syncedRows, ...dispRows];
    });
  }, [naryadEntries]);

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
            <div>
              <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Касса</h1>
              <p className="text-xs text-gray-500 mt-0.5">ООО «Дальавтотранс» · {today}</p>
            </div>
            <div className="flex items-center gap-2">
              {naryadEntries.length > 0 && (
                <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded flex items-center gap-1">
                  <Icon name="RefreshCw" size={11} />
                  Синхронизировано с нарядом ({naryadEntries.length})
                </span>
              )}
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
