import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useAppStore } from "@/store/appStore";

// ─── Типы ──────────────────────────────────────────────────────────────────
interface KassaRow {
  id: number;
  type: "route" | "disp" | "empty"; // тип строки
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
  podrVod: string;
  podrCond: string;
  vPlus: string;
  itogo: string;
}

interface VyplataRow {
  id: number;
  fio: string;
  vid: string;   // ДТ | ЗП | ХОЗ | ...
  summa: string;
  kol: string;
  itogo: string; // авто = summa * kol
}

// ─── Константы ─────────────────────────────────────────────────────────────
// Цвета маршрутов — по первой цифре марш. группы
const ROUTE_COLORS: Record<string, string> = {
  "1":  "#e8f4e8", // зелёный
  "3":  "#e8ecf8", // голубой
  "6":  "#fef9e8", // жёлтый
  "15": "#fdeef0", // розовый
  "24": "#f0ebe8", // персиковый
};

const getRouteColor = (mar: string) => {
  const grp = mar.split("/")[0].trim();
  return ROUTE_COLORS[grp] ?? "#ffffff";
};

const MAIN_COLS: { key: keyof Omit<KassaRow, "id" | "type">; label: string; width: string; numeric?: boolean }[] = [
  { key: "mar",        label: "№ мар",             width: "55px"  },
  { key: "bort",       label: "Борт №",             width: "55px"  },
  { key: "fioVod",     label: "ФИО водитель",       width: "130px" },
  { key: "fioCond",    label: "ФИО кондуктор",      width: "100px" },
  { key: "prodBilety", label: "Проданные билеты",   width: "95px"  },
  { key: "kolBil",     label: "Кол. бил",           width: "60px",  numeric: true },
  { key: "beznal",     label: "Безнал",             width: "65px",  numeric: true },
  { key: "qr",         label: "QR код",             width: "60px",  numeric: true },
  { key: "viruchka",   label: "Выручка",            width: "75px",  numeric: true },
  { key: "obed",       label: "Обед",               width: "55px",  numeric: true },
  { key: "rashodDt",   label: "Расх. ДТ",           width: "65px",  numeric: true },
  { key: "chek",       label: "Чек",                width: "55px",  numeric: true },
  { key: "vozvrat",    label: "Возврат",            width: "65px",  numeric: true },
  { key: "podrVod",    label: "Подр. вод",          width: "70px",  numeric: true },
  { key: "podrCond",   label: "Подр. конд",         width: "70px",  numeric: true },
  { key: "vPlus",      label: "В плюс",             width: "65px",  numeric: true },
  { key: "itogo",      label: "ИТОГО",              width: "75px",  numeric: true },
];

const VYP_COLS: { key: keyof Omit<VyplataRow, "id">; label: string; width: string }[] = [
  { key: "fio",   label: "ФИО",          width: "110px" },
  { key: "vid",   label: "Вид выплаты",  width: "90px"  },
  { key: "summa", label: "Сумма",        width: "70px"  },
  { key: "kol",   label: "Кол",         width: "50px"  },
  { key: "itogo", label: "Итого",        width: "75px"  },
];

const toNum = (v: string) => parseFloat((v || "0").replace(",", ".")) || 0;

const emptyRow = (type: KassaRow["type"] = "route"): KassaRow => ({
  id: Date.now() + Math.random(),
  type,
  mar: "", bort: "", fioVod: "", fioCond: "",
  prodBilety: "", kolBil: "", beznal: "", qr: "",
  viruchka: "", obed: "", rashodDt: "", chek: "",
  vozvrat: "", podrVod: "", podrCond: "", vPlus: "", itogo: "",
});

const emptyVyp = (): VyplataRow => ({
  id: Date.now() + Math.random(),
  fio: "", vid: "", summa: "", kol: "", itogo: "",
});

const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

// ─── Компонент ─────────────────────────────────────────────────────────────
const Kassa = () => {
  const { naryadEntries } = useAppStore();

  const [rows, setRows] = useState<KassaRow[]>(() => Array.from({ length: 12 }, () => emptyRow()));
  const [vyplaty, setVyplaty] = useState<VyplataRow[]>(() => Array.from({ length: 10 }, emptyVyp));
  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);
  const [activeVyp, setActiveVyp] = useState<{ rowId: number; col: string } | null>(null);
  const prevEntriesRef = useRef<typeof naryadEntries>([]);

  // Автоматическая синхронизация из наряда
  useEffect(() => {
    if (!naryadEntries.length) return;
    // Определяем какие строки наряда изменились
    const prev = prevEntriesRef.current;
    prevEntriesRef.current = naryadEntries;

    setRows((currentRows) => {
      // Строим map существующих строк по bortovoy для сохранения ручных правок
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

      // Сохраняем строки диспетчеров и пустые добавленные вручную
      const dispRows = currentRows.filter((r) => r.type === "disp");
      return [...syncedRows, ...dispRows];
    });
  }, [naryadEntries]);

  // Обновление строк кассы
  const updateCell = (id: number, col: keyof KassaRow, value: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [col]: value } : r)));

  const addRow = (type: KassaRow["type"] = "route") =>
    setRows((prev) => [...prev, emptyRow(type)]);

  const deleteRow = (id: number) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    if (e.key !== "Tab" && e.key !== "Enter") return;
    e.preventDefault();
    const cols = MAIN_COLS;
    if (colIdx + 1 < cols.length) {
      setActiveCell({ rowId: rows[rowIdx].id, col: cols[colIdx + 1].key });
    } else if (rowIdx + 1 < rows.length) {
      setActiveCell({ rowId: rows[rowIdx + 1].id, col: cols[0].key });
    }
  };

  // Обновление выплат
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
    const cols = VYP_COLS;
    if (colIdx + 1 < cols.length) {
      setActiveVyp({ rowId: vyplaty[rowIdx].id, col: cols[colIdx + 1].key });
    } else if (rowIdx + 1 < vyplaty.length) {
      setActiveVyp({ rowId: vyplaty[rowIdx + 1].id, col: cols[0].key });
    }
  };

  // Итоги основной таблицы
  const numericKeys = MAIN_COLS.filter((c) => c.numeric).map((c) => c.key);
  const getSum = (col: keyof KassaRow) =>
    rows.reduce((acc, r) => acc + toNum(r[col] as string), 0);

  // Итог выплат
  const vypItogo = vyplaty.reduce((s, v) => s + toNum(v.itogo), 0);

  // Строки — разбиваем на обычные и диспетчерские (тип disp)
  const routeRows = rows.filter((r) => r.type !== "disp");
  const dispRows  = rows.filter((r) => r.type === "disp");

  const renderCell = (row: KassaRow, col: typeof MAIN_COLS[number], rowIdx: number, colIdx: number) => {
    const isActive = activeCell?.rowId === row.id && activeCell?.col === col.key;
    const isPodr   = col.key === "podrVod" || col.key === "podrCond" || col.key === "rashodDt";
    return (
      <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
        <input
          type="text"
          value={row[col.key] as string}
          onChange={(e) => updateCell(row.id, col.key, e.target.value)}
          onFocus={() => setActiveCell({ rowId: row.id, col: col.key })}
          onBlur={() => setActiveCell(null)}
          onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
          autoFocus={isActive}
          className={[
            "w-full h-6 px-1 text-gray-800 bg-transparent outline-none border-2 transition-colors text-center",
            isActive ? "border-blue-500 bg-blue-50" : "border-transparent",
            isPodr ? "text-orange-700" : "",
            col.key === "itogo" ? "font-bold" : "",
          ].join(" ")}
          placeholder=""
        />
      </td>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Касса" />

      <div className="px-3 py-4 max-w-[1920px] mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm">

          {/* Шапка */}
          <div className="border-b border-gray-300 px-4 py-3 flex items-center justify-between print:hidden">
            <div>
              <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Кассовый отчёт</h1>
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

          {/* Основной блок: таблица + выплаты рядом */}
          <div className="flex gap-0 overflow-x-auto">

            {/* ── Левая таблица кассы ── */}
            <div className="flex-shrink-0">
              <table className="border-collapse text-xs" style={{ tableLayout: "fixed" }}>
                <thead>
                  <tr style={{ backgroundColor: "#1a3a6b" }}>
                    <th className="border border-blue-900 px-1 py-1 text-white text-center" style={{ width: "24px" }}>№</th>
                    {MAIN_COLS.map((col) => (
                      <th key={col.key} className="border border-blue-900 px-1 py-1 text-white font-semibold text-center leading-tight"
                        style={{ width: col.width, minWidth: col.width }}>
                        {col.label}
                      </th>
                    ))}
                    <th className="border border-blue-900 px-1 py-1 text-white font-semibold text-center" style={{ width: "36px" }} title="Право на подработку">Подр.</th>
                    <th className="border border-blue-900 px-1 py-1 print:hidden" style={{ width: "22px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {/* Маршрутные строки */}
                  {routeRows.map((row, rowIdx) => {
                    const bg = row.mar ? getRouteColor(row.mar) : rowIdx % 2 === 0 ? "#fff" : "#f5f8ff";
                    const hasPodrVod  = toNum(row.podrVod)  > 0;
                    const hasPodrCond = toNum(row.podrCond) > 0;
                    const hasPodr = hasPodrVod || hasPodrCond;
                    return (
                      <tr key={row.id} style={{ backgroundColor: bg, outline: hasPodr ? "2px solid #f97316" : undefined, outlineOffset: "-1px" }}>
                        <td className="border border-gray-300 text-center text-gray-400 select-none text-xs" style={{ width: "24px" }}>
                          {rowIdx + 1}
                        </td>
                        {MAIN_COLS.map((col, colIdx) => renderCell(row, col, rowIdx, colIdx))}
                        {/* Индикатор подработки */}
                        <td className="border border-gray-300 text-center" style={{ width: "36px" }}>
                          {hasPodr ? (
                            <div className="flex flex-col items-center gap-0.5 py-0.5">
                              {hasPodrVod && (
                                <span className="text-xs font-bold text-green-700 leading-none" title="Водитель может получить подработку">В</span>
                              )}
                              {hasPodrCond && (
                                <span className="text-xs font-bold text-blue-700 leading-none" title="Кондуктор может получить подработку">К</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-200 text-xs">—</span>
                          )}
                        </td>
                        <td className="border border-gray-300 text-center print:hidden" style={{ width: "22px" }}>
                          <button onClick={() => deleteRow(row.id)} className="text-gray-300 hover:text-red-500 p-0.5">
                            <Icon name="X" size={11} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Диспетчерские строки */}
                  {dispRows.length > 0 && (
                    <tr>
                      <td colSpan={MAIN_COLS.length + 2} className="border-0 p-0 bg-amber-50">
                        <table className="border-collapse text-xs w-full">
                          <tbody>
                            {dispRows.map((row, rowIdx) => (
                              <tr key={row.id} style={{ backgroundColor: "#fffbe6" }}>
                                <td className="border border-gray-300 text-center text-amber-600 font-semibold select-none px-1" style={{ width: "24px" }}>
                                  Д
                                </td>
                                {MAIN_COLS.map((col, colIdx) => renderCell(row, col, routeRows.length + rowIdx, colIdx))}
                                <td className="border border-gray-300 text-center print:hidden" style={{ width: "22px" }}>
                                  <button onClick={() => deleteRow(row.id)} className="text-gray-300 hover:text-red-500 p-0.5">
                                    <Icon name="X" size={11} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}

                  {/* Итоговая строка */}
                  <tr style={{ backgroundColor: "#f97316" }}>
                    <td className="border border-orange-400 px-1 py-1 text-center font-bold text-white text-xs" style={{ width: "24px" }}>Σ</td>
                    {MAIN_COLS.map((col) => (
                      <td key={col.key} className="border border-orange-400 px-1 py-1 text-center font-bold text-white text-xs" style={{ width: col.width }}>
                        {col.numeric ? (() => { const s = getSum(col.key); return s !== 0 ? s.toLocaleString("ru-RU") : ""; })() : ""}
                      </td>
                    ))}
                    <td className="border border-orange-400 text-center text-white font-bold text-xs" style={{ width: "36px" }}>
                      {routeRows.filter((r) => toNum(r.podrVod) > 0 || toNum(r.podrCond) > 0).length || ""}
                    </td>
                    <td className="border border-orange-400 print:hidden" style={{ width: "22px" }}></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── Правая панель: выплаты ── */}
            <div className="flex-shrink-0 border-l-2 border-gray-400">
              <table className="border-collapse text-xs" style={{ tableLayout: "fixed" }}>
                <thead>
                  <tr style={{ backgroundColor: "#7b3f00" }}>
                    <th className="border border-amber-900 px-1 py-1 text-white text-center" style={{ width: "22px" }}>№</th>
                    {VYP_COLS.map((col) => (
                      <th key={col.key} className="border border-amber-900 px-1 py-1 text-white font-semibold text-center leading-tight"
                        style={{ width: col.width, minWidth: col.width }}>
                        {col.label}
                      </th>
                    ))}
                    <th className="border border-amber-900 px-1 py-1 print:hidden" style={{ width: "22px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {vyplaty.map((vRow, rowIdx) => (
                    <tr key={vRow.id} className={rowIdx % 2 === 0 ? "bg-amber-50" : "bg-orange-50"}>
                      <td className="border border-gray-300 text-center text-gray-400 select-none text-xs" style={{ width: "22px" }}>
                        {rowIdx + 1}
                      </td>
                      {VYP_COLS.map((col, colIdx) => {
                        const isActive = activeVyp?.rowId === vRow.id && activeVyp?.col === col.key;
                        const isReadonly = col.key === "itogo";
                        return (
                          <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
                            <input
                              type="text"
                              value={vRow[col.key]}
                              readOnly={isReadonly}
                              onChange={(e) => !isReadonly && updateVyp(vRow.id, col.key, e.target.value)}
                              onFocus={() => setActiveVyp({ rowId: vRow.id, col: col.key })}
                              onBlur={() => setActiveVyp(null)}
                              onKeyDown={(e) => handleVypKeyDown(e, rowIdx, colIdx)}
                              autoFocus={isActive}
                              className={[
                                "w-full h-6 px-1 text-gray-800 bg-transparent outline-none border-2 transition-colors text-center",
                                isActive ? "border-amber-400 bg-amber-50" : "border-transparent",
                                isReadonly ? "font-bold text-amber-800 bg-amber-100 cursor-default" : "",
                              ].join(" ")}
                              placeholder=""
                            />
                          </td>
                        );
                      })}
                      <td className="border border-gray-300 text-center print:hidden" style={{ width: "22px" }}>
                        <button onClick={() => deleteVyp(vRow.id)} className="text-gray-300 hover:text-red-500 p-0.5">
                          <Icon name="X" size={11} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Кнопка добавить */}
                  <tr className="print:hidden">
                    <td colSpan={VYP_COLS.length + 2} className="border border-gray-200 px-2 py-1">
                      <button onClick={addVyp} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700">
                        <Icon name="Plus" size={11} /> строка
                      </button>
                    </td>
                  </tr>

                  {/* Итог выплат */}
                  <tr style={{ backgroundColor: "#7b3f00" }}>
                    <td colSpan={VYP_COLS.length + 1} className="border border-amber-900 px-2 py-1 text-right text-white font-bold text-xs">
                      Итого выплат:
                    </td>
                    <td className="border border-amber-900 px-1 py-1 text-center text-white font-bold text-xs">
                      {vypItogo > 0 ? vypItogo.toLocaleString("ru-RU") : "—"}
                    </td>
                    <td className="border border-amber-900 print:hidden" style={{ width: "22px" }}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Подвал */}
          <div className="border-t border-gray-300 px-4 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-400 print:hidden">
            <span>Строк: {rows.length} · Выплат: {vyplaty.length}</span>
            <span>Tab / Enter — переход между ячейками</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kassa;