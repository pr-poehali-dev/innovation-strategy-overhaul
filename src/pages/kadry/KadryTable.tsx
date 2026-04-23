import Icon from "@/components/ui/icon";
import { Employee } from "@/store/appStore";
import { ITR_DOLZHNOSTI, KadryColumn, TabType } from "./types";

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

interface Props {
  tab: TabType;
  rows: Employee[];
  columns: readonly KadryColumn[];
  activeCell: { rowId: number; col: string } | null;
  setActiveCell: (v: { rowId: number; col: string } | null) => void;
  updateCell: (id: number, col: keyof Employee, value: string) => void;
  deleteRow: (id: number) => void;
  handleKeyDown: (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => void;
  activeCount: number;
}

const KadryTable = ({
  tab, rows, columns, activeCell, setActiveCell, updateCell, deleteRow, handleKeyDown, activeCount,
}: Props) => {
  return (
    <>
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
              <tr key={row.id} className={row.tip === "arendator" ? "bg-yellow-100" : row.tip === "podrabotka" ? "bg-sky-100" : (rowIdx % 2 === 0 ? "bg-white" : "bg-blue-50")}>
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
                  // Должность ИТР — выпадающий список
                  if (col.key === "dolzhnost" && tab === "itr") {
                    return (
                      <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
                        <select
                          value={row.dolzhnost}
                          onChange={(e) => updateCell(row.id, "dolzhnost", e.target.value)}
                          className="w-full h-7 px-2 text-xs text-gray-800 bg-transparent outline-none border-2 border-transparent focus:border-blue-500 focus:bg-blue-50 transition-colors cursor-pointer"
                        >
                          {ITR_DOLZHNOSTI.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </td>
                    );
                  }
                  const isActive = activeCell?.rowId === row.id && activeCell?.col === col.key;
                  // Поля-даты
                  const isDate = col.key === "udostoverenieDo" || col.key === "medSpravkaDo";
                  const val = (row[col.key as keyof Employee] as string) ?? "";
                  // Подсветка: красная — просрочено, жёлтая — меньше 30 дней
                  let warnBg = "";
                  if (isDate && val) {
                    const exp = new Date(val);
                    const now = new Date(); now.setHours(0,0,0,0);
                    const days = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
                    if (days < 0) warnBg = "bg-red-100 text-red-700 font-semibold";
                    else if (days <= 30) warnBg = "bg-yellow-100 text-yellow-800 font-semibold";
                  }
                  return (
                    <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
                      <input
                        type={isDate ? "date" : "text"}
                        value={val}
                        onChange={(e) => updateCell(row.id, col.key as keyof Employee, e.target.value)}
                        onFocus={() => setActiveCell({ rowId: row.id, col: col.key })}
                        onBlur={() => setActiveCell(null)}
                        onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                        autoFocus={isActive}
                        title={isDate && warnBg.includes("red") ? "Срок действия истёк" : isDate && warnBg ? "Скоро истекает срок" : undefined}
                        className={`w-full h-7 px-2 bg-transparent outline-none border-2 ${
                          isActive ? "border-blue-500 bg-blue-50" : "border-transparent"
                        } ${warnBg || "text-gray-800"} transition-colors`}
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
    </>
  );
};

export default KadryTable;
