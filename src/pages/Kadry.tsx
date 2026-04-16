import { useState } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useAppStore, Employee } from "@/store/appStore";

type TabType = "voditely" | "konduktery";

const emptyEmployee = (dolzhnost: string): Employee => ({
  id: Date.now() + Math.random(),
  tabNum: "",
  fio: "",
  dolzhnost,
  bort: "",
  kategoriya: "",
  telefon: "",
  dataRozhd: "",
  dataPriema: "",
  status: "active",
});

const VOD_COLUMNS = [
  { key: "tabNum",     label: "Таб. №",       width: "70px"  },
  { key: "fio",        label: "ФИО",          width: "200px" },
  { key: "bort",       label: "Борт №",       width: "80px"  },
  { key: "kategoriya", label: "Категория",    width: "90px"  },
  { key: "telefon",    label: "Телефон",      width: "130px" },
  { key: "dataRozhd",  label: "Дата рождения", width: "110px" },
  { key: "dataPriema", label: "Дата приёма",  width: "110px" },
  { key: "status",     label: "Статус",       width: "90px"  },
] as const;

const COND_COLUMNS = [
  { key: "tabNum",     label: "Таб. №",       width: "70px"  },
  { key: "fio",        label: "ФИО",          width: "200px" },
  { key: "bort",       label: "Борт №",       width: "80px"  },
  { key: "telefon",    label: "Телефон",      width: "130px" },
  { key: "dataRozhd",  label: "Дата рождения", width: "110px" },
  { key: "dataPriema", label: "Дата приёма",  width: "110px" },
  { key: "status",     label: "Статус",       width: "90px"  },
] as const;

const StatusBadge = ({ value, onChange }: { value: "active" | "inactive"; onChange: (v: "active" | "inactive") => void }) => (
  <button
    onClick={() => onChange(value === "active" ? "inactive" : "active")}
    className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
      value === "active"
        ? "bg-green-100 text-green-700 hover:bg-green-200"
        : "bg-red-100 text-red-600 hover:bg-red-200"
    }`}
  >
    {value === "active" ? "Активен" : "Уволен"}
  </button>
);

const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

const Kadry = () => {
  const { employees, setEmployees } = useAppStore();
  const [tab, setTab] = useState<TabType>("voditely");
  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);

  const voditely   = employees.filter((e) => e.dolzhnost === "Водитель");
  const konduktery = employees.filter((e) => e.dolzhnost === "Кондуктор");

  const rows    = tab === "voditely" ? voditely : konduktery;
  const columns = tab === "voditely" ? VOD_COLUMNS : COND_COLUMNS;

  const updateCell = (id: number, col: keyof Employee, value: string) => {
    setEmployees((prev) => prev.map((r) => (r.id === id ? { ...r, [col]: value } : r)));
  };

  const addRow = () =>
    setEmployees((prev) => [...prev, emptyEmployee(tab === "voditely" ? "Водитель" : "Кондуктор")]);

  const deleteRow = (id: number) => {
    if (rows.length === 1) return;
    setEmployees((prev) => prev.filter((r) => r.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      const editableCols = columns.filter((c) => c.key !== "status");
      const editableIdx = editableCols.findIndex((_, i) => i === colIdx);
      if (editableIdx + 1 < editableCols.length) {
        setActiveCell({ rowId: rows[rowIdx].id, col: editableCols[editableIdx + 1].key });
      } else if (rowIdx + 1 < rows.length) {
        setActiveCell({ rowId: rows[rowIdx + 1].id, col: editableCols[0].key });
      }
    }
  };

  const activeCount = rows.filter((r) => r.status === "active").length;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Кадры" />

      <div className="px-4 py-5 max-w-5xl mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-300 px-5 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Кадры</h1>
              <p className="text-xs text-gray-500 mt-0.5">ООО «Дальавтотранс» · {today}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addRow}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Icon name="Plus" size={14} />
                Добавить
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors print:hidden"
              >
                <Icon name="Printer" size={14} />
                Печать
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-300">
            <button
              onClick={() => setTab("voditely")}
              className={`px-6 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === "voditely"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon name="Steering" size={15} />
                Водители
                <span className="ml-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
                  {voditely.filter((r) => r.status === "active").length}
                </span>
              </span>
            </button>
            <button
              onClick={() => setTab("konduktery")}
              className={`px-6 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === "konduktery"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon name="Ticket" size={15} />
                Кондукторы
                <span className="ml-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
                  {konduktery.filter((r) => r.status === "active").length}
                </span>
              </span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="border-collapse text-xs w-full">
              <thead>
                <tr style={{ backgroundColor: "#1a3a6b" }}>
                  <th className="border border-blue-900 px-1 py-1.5 text-white font-semibold text-center" style={{ width: "28px" }}>№</th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-left"
                      style={{ width: col.width, minWidth: col.width }}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="border border-blue-900 px-1 py-1 text-white" style={{ width: "28px" }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={row.id} className={rowIdx % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                    <td className="border border-gray-300 text-center text-gray-400 select-none py-0" style={{ width: "28px" }}>
                      {rowIdx + 1}
                    </td>
                    {columns.map((col, colIdx) => {
                      if (col.key === "status") {
                        return (
                          <td key={col.key} className="border border-gray-300 px-2 py-1" style={{ width: col.width }}>
                            <StatusBadge
                              value={row.status}
                              onChange={(v) => updateCell(row.id, "status", v)}
                            />
                          </td>
                        );
                      }
                      const isActive = activeCell?.rowId === row.id && activeCell?.col === col.key;
                      return (
                        <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
                          <input
                            type="text"
                            value={row[col.key as keyof Employee] as string}
                            onChange={(e) => updateCell(row.id, col.key as keyof Employee, e.target.value)}
                            onFocus={() => setActiveCell({ rowId: row.id, col: col.key })}
                            onBlur={() => setActiveCell(null)}
                            onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                            autoFocus={isActive}
                            className={`w-full h-7 px-2 text-gray-800 bg-transparent outline-none border-2 ${
                              isActive ? "border-blue-500 bg-blue-50" : "border-transparent"
                            } transition-colors`}
                          />
                        </td>
                      );
                    })}
                    <td className="border border-gray-300 text-center" style={{ width: "28px" }}>
                      <button onClick={() => deleteRow(row.id)} className="text-gray-300 hover:text-red-500 transition-colors p-0.5">
                        <Icon name="X" size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-300 px-5 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-400 print:hidden">
            <span>Активных: {activeCount} / Всего: {rows.length}</span>
            <span>Tab / Enter — переход между ячейками</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kadry;