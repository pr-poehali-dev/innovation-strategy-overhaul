import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useAppStore } from "@/store/appStore";

interface ProdazhiRow {
  id: number;
  marGr: string;
  bort: string;
  fioVod: string;
  fioCond: string;
  reysy: string;
  faktReys: string;
  vremya: string;
  faktVremya: string;
  dt: string;
  skhody: string;
}

const COLUMNS: { key: keyof Omit<ProdazhiRow, "id">; label: string; width: string }[] = [
  { key: "marGr",      label: "Мар. Гр",        width: "90px"  },
  { key: "bort",       label: "Борт №",          width: "70px"  },
  { key: "fioVod",     label: "ФИО Водителя",   width: "160px" },
  { key: "fioCond",    label: "ФИО кондуктора", width: "160px" },
  { key: "reysy",      label: "Рейсы",          width: "70px"  },
  { key: "faktReys",   label: "Факт рейс",      width: "80px"  },
  { key: "vremya",     label: "Время",          width: "80px"  },
  { key: "faktVremya", label: "Факт время",     width: "90px"  },
  { key: "dt",         label: "ДТ",             width: "70px"  },
  { key: "skhody",     label: "Сходы",          width: "120px" },
];

const emptyRow = (): ProdazhiRow => ({
  id: Date.now() + Math.random(),
  marGr: "", bort: "", fioVod: "", fioCond: "",
  reysy: "", faktReys: "", vremya: "",
  faktVremya: "", dt: "", skhody: "",
});

const today = new Date().toLocaleDateString("ru-RU", {
  day: "2-digit", month: "2-digit", year: "numeric",
});

const Prodazhi = () => {
  const { naryadEntries } = useAppStore();

  const [rows, setRows] = useState<ProdazhiRow[]>([
    emptyRow(), emptyRow(), emptyRow(), emptyRow(), emptyRow(),
  ]);
  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);
  const [imported, setImported] = useState(false);

  const handleImport = () => {
    if (naryadEntries.length === 0) return;
    const newRows: ProdazhiRow[] = naryadEntries.map((e) => ({
      id:         Date.now() + Math.random(),
      marGr:      e.marshrut,
      bort:       e.bortovoy,
      fioVod:     e.fioVod,
      fioCond:    e.fioKond,
      reysy:      "",
      faktReys:   "",
      vremya:     "",
      faktVremya: "",
      dt:         "",
      skhody:     "",
    }));
    setRows(newRows);
    setImported(true);
    setTimeout(() => setImported(false), 3000);
  };

  useEffect(() => {
    if (naryadEntries.length > 0) setImported(false);
  }, [naryadEntries]);

  const updateCell = (id: number, col: keyof ProdazhiRow, value: string) => {
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
      if (colIdx + 1 < COLUMNS.length) {
        setActiveCell({ rowId: rows[rowIdx].id, col: COLUMNS[colIdx + 1].key });
      } else if (rowIdx + 1 < rows.length) {
        setActiveCell({ rowId: rows[rowIdx + 1].id, col: COLUMNS[0].key });
      } else {
        addRow();
        setTimeout(() => {
          setActiveCell({ rowId: rows[rows.length - 1]?.id, col: COLUMNS[0].key });
        }, 0);
      }
    }
  };

  const numericCols: (keyof ProdazhiRow)[] = ["reysy", "faktReys", "dt"];
  const getSum = (col: keyof ProdazhiRow) =>
    rows.reduce((acc, r) => acc + (parseFloat((r[col] as string).replace(",", ".")) || 0), 0);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Продажи" />

      <div className="px-4 py-5 max-w-[1400px] mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm">
          <div className="border-b border-gray-300 px-5 py-3 flex items-center justify-between print:hidden">
            <div>
              <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Продажи / Выходы на линию</h1>
              <p className="text-xs text-gray-500 mt-0.5">ООО «Дальавтотранс» · {today}</p>
            </div>
            <div className="flex gap-2">
              {naryadEntries.length > 0 && (
                <button
                  onClick={handleImport}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${
                    imported ? "bg-green-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  <Icon name={imported ? "Check" : "Download"} size={14} />
                  {imported ? "Загружено!" : `Из наряда (${naryadEntries.length})`}
                </button>
              )}
              <button onClick={addRow} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                <Icon name="Plus" size={14} />
                Строка
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                <Icon name="Printer" size={14} />
                Печать
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="border-collapse text-xs" style={{ minWidth: "100%" }}>
              <thead>
                <tr style={{ backgroundColor: "#6fa8dc" }}>
                  <th className="border border-blue-400 px-1 py-1.5 text-white font-semibold text-center" style={{ width: "28px", minWidth: "28px" }}>№</th>
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="border border-blue-400 px-1 py-1.5 text-white font-semibold text-center leading-tight" style={{ width: col.width, minWidth: col.width }}>
                      {col.label}
                    </th>
                  ))}
                  <th className="border border-blue-400 px-1 py-1 text-white print:hidden" style={{ width: "28px" }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={row.id} className={rowIdx % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                    <td className="border border-gray-300 text-center text-gray-400 select-none py-0" style={{ width: "28px" }}>
                      {rowIdx + 1}
                    </td>
                    {COLUMNS.map((col, colIdx) => {
                      const isActive = activeCell?.rowId === row.id && activeCell?.col === col.key;
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
                            className={`w-full h-7 px-1 text-gray-800 bg-transparent outline-none border-2 ${
                              isActive ? "border-blue-500 bg-blue-50" : "border-transparent"
                            } transition-colors`}
                          />
                        </td>
                      );
                    })}
                    <td className="border border-gray-300 text-center print:hidden" style={{ width: "28px" }}>
                      <button onClick={() => deleteRow(row.id)} className="text-gray-300 hover:text-red-500 transition-colors p-0.5">
                        <Icon name="X" size={12} />
                      </button>
                    </td>
                  </tr>
                ))}

                <tr style={{ backgroundColor: "#c9daf8" }}>
                  <td className="border border-gray-400 px-1 py-1 text-center font-bold text-gray-700 text-xs">Σ</td>
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="border border-gray-400 px-1 py-1 text-center font-bold text-gray-800 text-xs">
                      {numericCols.includes(col.key)
                        ? (() => { const s = getSum(col.key); return s !== 0 ? s.toLocaleString("ru-RU") : ""; })()
                        : ""}
                    </td>
                  ))}
                  <td className="border border-gray-400 print:hidden"></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-300 px-5 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-400 print:hidden">
            <span>Строк: {rows.length}</span>
            <span>Tab / Enter — переход между ячейками</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prodazhi;
