import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useAppStore } from "@/store/appStore";

interface KassaRow {
  id: number;
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

const COLUMNS: { key: keyof Omit<KassaRow, "id">; label: string; width: string }[] = [
  { key: "mar",        label: "№ мар",           width: "50px"  },
  { key: "bort",       label: "Борт №",           width: "60px"  },
  { key: "fioVod",     label: "ФИО водитель",     width: "140px" },
  { key: "fioCond",    label: "ФИО кондуктор",    width: "140px" },
  { key: "prodBilety", label: "Проданные билеты", width: "110px" },
  { key: "kolBil",     label: "Кол. бил",         width: "70px"  },
  { key: "beznal",     label: "Безнал",           width: "70px"  },
  { key: "qr",         label: "QR код",           width: "70px"  },
  { key: "viruchka",   label: "Выручка",          width: "80px"  },
  { key: "obed",       label: "Обед",             width: "60px"  },
  { key: "rashodDt",   label: "Расход ДТ",        width: "80px"  },
  { key: "chek",       label: "Чек",              width: "60px"  },
  { key: "vozvrat",    label: "Возврат",          width: "70px"  },
  { key: "podrVod",    label: "Подр. вод",        width: "80px"  },
  { key: "podrCond",   label: "Подр. конд",       width: "80px"  },
  { key: "vPlus",      label: "В плюс",           width: "70px"  },
  { key: "itogo",      label: "ИТОГО",            width: "80px"  },
];

const emptyRow = (): KassaRow => ({
  id: Date.now() + Math.random(),
  mar: "", bort: "", fioVod: "", fioCond: "",
  prodBilety: "", kolBil: "", beznal: "", qr: "",
  viruchka: "", obed: "", rashodDt: "", chek: "",
  vozvrat: "", podrVod: "", podrCond: "", vPlus: "", itogo: "",
});

const today = new Date().toLocaleDateString("ru-RU", {
  day: "2-digit", month: "2-digit", year: "numeric",
});

const Kassa = () => {
  const { naryadEntries } = useAppStore();

  const [rows, setRows] = useState<KassaRow[]>([
    emptyRow(), emptyRow(), emptyRow(), emptyRow(), emptyRow(),
  ]);
  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);
  const [imported, setImported] = useState(false);

  // При изменении naryadEntries в сторе — предлагать импорт
  const handleImport = () => {
    if (naryadEntries.length === 0) return;
    const newRows: KassaRow[] = naryadEntries.map((e) => ({
      id: Date.now() + Math.random(),
      mar:        e.marshrut,
      bort:       e.bortovoy,
      fioVod:     e.fioVod,
      fioCond:    e.fioKond,
      prodBilety: "",
      kolBil:     e.biletov,
      beznal:     "",
      qr:         "",
      viruchka:   "",
      obed:       "",
      rashodDt:   "",
      chek:       "",
      vozvrat:    "",
      podrVod:    e.podrabotkaVod > 0 ? e.podrabotkaVod.toFixed(2) : "",
      podrCond:   e.podrabotkaKond > 0 ? e.podrabotkaKond.toFixed(2) : "",
      vPlus:      "",
      itogo:      "",
    }));
    setRows(newRows);
    setImported(true);
    setTimeout(() => setImported(false), 3000);
  };

  useEffect(() => {
    if (naryadEntries.length > 0) setImported(false);
  }, [naryadEntries]);

  const updateCell = (id: number, col: keyof KassaRow, value: string) => {
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

  const numericCols: (keyof KassaRow)[] = [
    "kolBil", "beznal", "qr", "viruchka", "obed",
    "rashodDt", "chek", "vozvrat", "podrVod", "podrCond", "vPlus", "itogo",
  ];

  const getSum = (col: keyof KassaRow) =>
    rows.reduce((acc, r) => acc + (parseFloat((r[col] as string).replace(",", ".")) || 0), 0);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Касса" />

      <div className="px-4 py-5 max-w-[1700px] mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm">
          <div className="border-b border-gray-300 px-5 py-3 flex items-center justify-between print:hidden">
            <div>
              <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Кассовый отчёт</h1>
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
              <button
                onClick={addRow}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Icon name="Plus" size={14} />
                Строка
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Icon name="Printer" size={14} />
                Печать
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="border-collapse text-xs" style={{ minWidth: "100%" }}>
              <thead>
                <tr style={{ backgroundColor: "#1a3a6b" }}>
                  <th className="border border-blue-900 px-1 py-1 text-white font-semibold text-center" style={{ width: "28px", minWidth: "28px" }}>№</th>
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="border border-blue-900 px-1 py-1 text-white font-semibold text-center leading-tight" style={{ width: col.width, minWidth: col.width }}>
                      {col.label}
                    </th>
                  ))}
                  <th className="border border-blue-900 px-1 py-1 text-white font-semibold print:hidden" style={{ width: "28px" }}></th>
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
                            placeholder=""
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

                <tr style={{ backgroundColor: "#d6e4f7" }}>
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

export default Kassa;
