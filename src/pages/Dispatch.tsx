import { useState } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";

interface NaryadRow {
  id: number;
  bortovoy: string;
  fio: string;
  garazhny: string;
  putevoy: string;
}

const emptyRow = (): NaryadRow => ({
  id: Date.now() + Math.random(),
  bortovoy: "",
  fio: "",
  garazhny: "",
  putevoy: "",
});

const COLUMNS = [
  { key: "bortovoy", label: "Бортовой номер", width: "w-40" },
  { key: "fio", label: "ФИО водителя", width: "w-64" },
  { key: "garazhny", label: "Гаражный номер", width: "w-40" },
  { key: "putevoy", label: "Номер путевого листа", width: "w-48" },
] as const;

const Dispatch = () => {
  const today = new Date().toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const [rows, setRows] = useState<NaryadRow[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);

  const updateCell = (id: number, col: keyof NaryadRow, value: string) => {
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
      const nextColIdx = colIdx + 1;
      if (nextColIdx < COLUMNS.length) {
        const nextCol = COLUMNS[nextColIdx];
        setActiveCell({ rowId: rows[rowIdx].id, col: nextCol.key });
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

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Наряд на работу" />

      <div className="px-6 py-6 max-w-6xl mx-auto">
        {/* Document header */}
        <div className="bg-white border border-gray-300 shadow-sm mb-0">
          <div className="border-b border-gray-300 px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                Наряд на работу
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Дальавтотранс · {today}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addRow}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Icon name="Plus" size={14} />
                Добавить строку
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-3 py-2 text-center text-gray-600 font-semibold w-10">
                    №
                  </th>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={`border border-gray-300 px-3 py-2 text-left text-gray-700 font-semibold ${col.width} bg-gray-200`}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="border border-gray-300 px-2 py-2 w-8 bg-gray-200"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr
                    key={row.id}
                    className={rowIdx % 2 === 0 ? "bg-white" : "bg-blue-50/40"}
                  >
                    <td className="border border-gray-300 px-3 py-0 text-center text-gray-400 text-xs select-none">
                      {rowIdx + 1}
                    </td>
                    {COLUMNS.map((col, colIdx) => {
                      const isActive =
                        activeCell?.rowId === row.id && activeCell?.col === col.key;
                      return (
                        <td
                          key={col.key}
                          className={`border border-gray-300 p-0 ${col.width}`}
                        >
                          <input
                            type="text"
                            value={row[col.key as keyof NaryadRow] as string}
                            onChange={(e) =>
                              updateCell(row.id, col.key as keyof NaryadRow, e.target.value)
                            }
                            onFocus={() =>
                              setActiveCell({ rowId: row.id, col: col.key })
                            }
                            onBlur={() => setActiveCell(null)}
                            onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                            autoFocus={isActive}
                            className={`w-full h-8 px-2 text-gray-800 bg-transparent outline-none border-2 ${
                              isActive ? "border-blue-500 bg-blue-50" : "border-transparent"
                            } transition-colors`}
                            placeholder="—"
                          />
                        </td>
                      );
                    })}
                    <td className="border border-gray-300 px-1 py-0 text-center">
                      <button
                        onClick={() => deleteRow(row.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        title="Удалить строку"
                      >
                        <Icon name="X" size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-300 px-6 py-3 bg-gray-50 flex items-center justify-between text-xs text-gray-400">
            <span>Строк: {rows.length}</span>
            <span>Tab / Enter — переход между ячейками</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dispatch;