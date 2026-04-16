import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useAppStore, getGrafiki } from "@/store/appStore";

interface ProdazhiRow {
  id: number;
  bort: string;
  marGr: string;
  fioVod: string;
  fioCond: string;
  dt: string;
  reysy: string;
  kolBil: string;
  valid: string;
  qr: string;
}

type ColKey = keyof Omit<ProdazhiRow, "id">;

const COLUMNS: { key: ColKey; label: string; width: string; numeric?: boolean }[] = [
  { key: "bort",    label: "Борт №",          width: "60px"  },
  { key: "marGr",   label: "Мар. Гр",         width: "70px"  },
  { key: "fioVod",  label: "ФИО водителя",    width: "160px" },
  { key: "fioCond", label: "ФИО кондуктора",  width: "130px" },
  { key: "dt",      label: "ДТ",              width: "60px",  numeric: true },
  { key: "reysy",   label: "Рейсы",           width: "65px",  numeric: true },
  { key: "kolBil",  label: "Кол. бил",        width: "70px",  numeric: true },
  { key: "valid",   label: "Валид",           width: "65px",  numeric: true },
  { key: "qr",      label: "QR",              width: "60px",  numeric: true },
];

const emptyRow = (): ProdazhiRow => ({
  id: Date.now() + Math.random(),
  bort: "", marGr: "", fioVod: "", fioCond: "",
  dt: "", reysy: "", kolBil: "", valid: "", qr: "",
});

const toNum = (v: string) => parseFloat((v || "0").replace(",", ".")) || 0;

const today = new Date().toLocaleDateString("ru-RU", {
  day: "2-digit", month: "2-digit", year: "numeric",
});

const Prodazhi = () => {
  const { naryadEntries, employees, vehicles, routes } = useAppStore();
  const allGrafiki = routes.flatMap((r) => getGrafiki(r));

  const driverList = employees.filter((e) => e.dolzhnost === "Водитель"  && e.status === "active");
  const condList   = employees.filter((e) => e.dolzhnost === "Кондуктор" && e.status === "active");

  // Диспетчер
  const [dispFio, setDispFio] = useState("");
  const [reportDate, setReportDate] = useState(today);

  const [rows, setRows] = useState<ProdazhiRow[]>(() =>
    Array.from({ length: 10 }, emptyRow)
  );
  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);

  // Автоматическая синхронизация из наряда — сохраняет ручные правки (ДТ, рейсы и т.д.)
  useEffect(() => {
    if (!naryadEntries.length) return;
    setRows((currentRows) => {
      const existingByBort = new Map(currentRows.map((r) => [r.bort, r]));
      return naryadEntries.map((e) => {
        const existing = existingByBort.get(e.bortovoy);
        return {
          ...(existing ?? emptyRow()),
          bort:    e.bortovoy,
          marGr:   e.marshrut,
          fioVod:  e.fioVod,
          fioCond: e.fioKond || "без",
          kolBil:  e.biletov || (existing?.kolBil ?? ""),
        };
      });
    });
  }, [naryadEntries]);

  const updateCell = (id: number, col: ColKey, value: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [col]: value } : r)));

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const deleteRow = (id: number) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    if (e.key !== "Tab" && e.key !== "Enter") return;
    e.preventDefault();
    const editCols = COLUMNS.filter((c) => c.key !== "fioVod" && c.key !== "fioCond" && c.key !== "bort" && c.key !== "marGr");
    if (colIdx + 1 < COLUMNS.length) {
      setActiveCell({ rowId: rows[rowIdx].id, col: COLUMNS[colIdx + 1].key });
    } else if (rowIdx + 1 < rows.length) {
      setActiveCell({ rowId: rows[rowIdx + 1].id, col: COLUMNS[0].key });
    } else {
      addRow();
      setTimeout(() => setActiveCell({ rowId: rows[rows.length - 1]?.id, col: COLUMNS[0].key }), 0);
    }
  };

  const numericCols = COLUMNS.filter((c) => c.numeric).map((c) => c.key);
  const getSum = (col: ColKey) =>
    rows.reduce((acc, r) => acc + toNum(r[col] as string), 0);

  // Статистика
  const vsegoVyshlo = rows.filter((r) => r.fioVod && r.fioVod !== "0" && r.marGr && r.marGr !== "вых" && r.marGr !== "отп" && r.marGr !== "рем").length;
  const vsegoVykhod = rows.filter((r) => r.marGr === "вых" || r.marGr === "отп" || r.marGr === "рем").length;

  // datalist ids
  const vodFioList  = "vod-fio-list";
  const condFioList = "cond-fio-list";
  const bortList    = "bort-list";
  const grafikList  = "prodazhi-grafik-list";

  const renderCell = (row: ProdazhiRow, col: typeof COLUMNS[number], rowIdx: number, colIdx: number) => {
    const isActive = activeCell?.rowId === row.id && activeCell?.col === col.key;
    const isOff = row.marGr === "вых" || row.marGr === "отп" || row.marGr === "рем";

    // ФИО водителя — с datalist
    if (col.key === "fioVod") {
      return (
        <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
          <input
            type="text"
            list={vodFioList}
            value={row.fioVod}
            onChange={(e) => updateCell(row.id, "fioVod", e.target.value)}
            onFocus={() => setActiveCell({ rowId: row.id, col: col.key })}
            onBlur={() => setActiveCell(null)}
            onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
            autoFocus={isActive}
            className={`w-full h-6 px-1 text-xs text-gray-800 bg-transparent outline-none border-2 ${isActive ? "border-blue-500 bg-blue-50" : "border-transparent"} transition-colors`}
            placeholder="—"
          />
        </td>
      );
    }
    // ФИО кондуктора — с datalist
    if (col.key === "fioCond") {
      return (
        <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
          <input
            type="text"
            list={condFioList}
            value={row.fioCond}
            onChange={(e) => updateCell(row.id, "fioCond", e.target.value)}
            onFocus={() => setActiveCell({ rowId: row.id, col: col.key })}
            onBlur={() => setActiveCell(null)}
            onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
            autoFocus={isActive}
            className={`w-full h-6 px-1 text-xs text-gray-800 bg-transparent outline-none border-2 ${isActive ? "border-blue-500 bg-blue-50" : "border-transparent"} transition-colors`}
            placeholder="без"
          />
        </td>
      );
    }
    // Маршрут/График — с datalist
    if (col.key === "marGr") {
      return (
        <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
          <input
            type="text"
            list={grafikList}
            value={row.marGr}
            onChange={(e) => updateCell(row.id, "marGr", e.target.value)}
            onFocus={() => setActiveCell({ rowId: row.id, col: col.key })}
            onBlur={() => setActiveCell(null)}
            onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
            autoFocus={isActive}
            className={`w-full h-6 px-1 text-xs text-gray-800 bg-transparent outline-none border-2 ${isActive ? "border-blue-500 bg-blue-50" : "border-transparent"} transition-colors text-center`}
            placeholder="1/1"
          />
        </td>
      );
    }
    // Борт — с datalist
    if (col.key === "bort") {
      return (
        <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
          <input
            type="text"
            list={bortList}
            value={row.bort}
            onChange={(e) => updateCell(row.id, "bort", e.target.value)}
            onFocus={() => setActiveCell({ rowId: row.id, col: col.key })}
            onBlur={() => setActiveCell(null)}
            onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
            autoFocus={isActive}
            className={`w-full h-6 px-1 text-xs font-bold text-blue-800 bg-transparent outline-none border-2 ${isActive ? "border-blue-500 bg-blue-50" : "border-transparent"} transition-colors text-center`}
            placeholder="—"
          />
        </td>
      );
    }

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
          disabled={isOff && (col.key === "dt" || col.key === "reysy" || col.key === "kolBil" || col.key === "valid" || col.key === "qr")}
          className={[
            "w-full h-6 px-1 text-xs text-gray-800 bg-transparent outline-none border-2 transition-colors text-center",
            isActive ? "border-blue-500 bg-blue-50" : "border-transparent",
            isOff ? "text-gray-400" : "",
          ].join(" ")}
          placeholder=""
        />
      </td>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Продажи" />

      {/* datalists */}
      <datalist id={vodFioList}>
        <option value="без" />
        {driverList.map((e) => <option key={e.id} value={e.fio} />)}
      </datalist>
      <datalist id={condFioList}>
        <option value="без" />
        {condList.map((e) => <option key={e.id} value={e.fio} />)}
      </datalist>
      <datalist id={bortList}>
        {vehicles.map((v) => <option key={v.id} value={v.bortovoy}>{v.bortovoy} {v.marka}</option>)}
      </datalist>
      <datalist id={grafikList}>
        <option value="вых" />
        <option value="отп" />
        <option value="рем" />
        {allGrafiki.map((g) => <option key={g} value={g} />)}
      </datalist>

      <div className="px-4 py-4 max-w-[1200px] mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm">

          {/* Шапка */}
          <div className="border-b border-gray-300 px-5 py-3 flex items-center justify-between print:hidden">
            <div>
              <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Продажи / Выходы на линию</h1>
              <p className="text-xs text-gray-500 mt-0.5">ООО «Дальавтотранс» · {today}</p>
            </div>
            <div className="flex items-center gap-2">
              {naryadEntries.length > 0 && (
                <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded flex items-center gap-1">
                  <Icon name="RefreshCw" size={11} />
                  Синхронизировано с нарядом ({naryadEntries.length})
                </span>
              )}
              <button onClick={addRow} className="flex items-center gap-1.5 px-2 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                <Icon name="Plus" size={12} /> Строка
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-1.5 px-2 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                <Icon name="Printer" size={12} /> Печать
              </button>
            </div>
          </div>

          {/* Дата отчёта */}
          <div className="px-5 py-2 border-b border-gray-200 flex items-center gap-4 text-xs text-gray-600">
            <span className="font-semibold">Дата:</span>
            <input
              type="text"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-400 w-28"
            />
          </div>

          {/* Таблица */}
          <div className="overflow-x-auto">
            <table className="border-collapse text-xs" style={{ minWidth: "700px" }}>
              <thead>
                <tr style={{ backgroundColor: "#1a3a6b" }}>
                  <th className="border border-blue-900 px-1 py-1.5 text-white text-center" style={{ width: "28px" }}>№</th>
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="border border-blue-900 px-1 py-1.5 text-white font-semibold text-center leading-tight"
                      style={{ width: col.width, minWidth: col.width }}>
                      {col.label}
                    </th>
                  ))}
                  <th className="border border-blue-900 px-1 py-1 print:hidden" style={{ width: "22px" }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => {
                  const isOff = row.marGr === "вых" || row.marGr === "отп" || row.marGr === "рем";
                  const rowBg = isOff
                    ? "#f5f5f0"
                    : rowIdx % 2 === 0 ? "#ffffff" : "#eff6ff";
                  return (
                    <tr key={row.id} style={{ backgroundColor: rowBg }}>
                      <td className="border border-gray-300 text-center text-gray-400 select-none" style={{ width: "28px" }}>
                        {rowIdx + 1}
                      </td>
                      {COLUMNS.map((col, colIdx) => renderCell(row, col, rowIdx, colIdx))}
                      <td className="border border-gray-300 text-center print:hidden" style={{ width: "22px" }}>
                        <button onClick={() => deleteRow(row.id)} className="text-gray-300 hover:text-red-500 p-0.5">
                          <Icon name="X" size={11} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Итоговая строка */}
              <tfoot>
                <tr style={{ backgroundColor: "#1a3a6b" }}>
                  <td className="border border-blue-900 px-1 py-1.5 text-center text-white font-bold text-xs" colSpan={2}>
                    Σ
                  </td>
                  {COLUMNS.slice(1).map((col) => (
                    <td key={col.key} className="border border-blue-900 px-1 py-1.5 text-center font-bold text-white text-xs">
                      {col.numeric
                        ? (() => { const s = getSum(col.key); return s !== 0 ? s.toLocaleString("ru-RU") : ""; })()
                        : ""}
                    </td>
                  ))}
                  <td className="border border-blue-900 print:hidden"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Подвал: статистика + диспетчер */}
          <div className="border-t border-gray-300 px-5 py-3 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4 text-gray-600">
              <span>Вышло на линию: <b className="text-gray-800">{vsegoVyshlo}</b></span>
              <span>Вых/Отп/Рем: <b className="text-gray-800">{vsegoVykhod}</b></span>
              <span className="text-gray-400 print:hidden">Tab / Enter — переход</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-semibold">Диспетчер:</span>
              <input
                type="text"
                list={vodFioList}
                value={dispFio}
                onChange={(e) => setDispFio(e.target.value)}
                placeholder="ФИО диспетчера"
                className="border border-gray-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-400 w-40"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prodazhi;