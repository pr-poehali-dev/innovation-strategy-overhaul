import Icon from "@/components/ui/icon";
import {
  VedomostRow,
  ColKey,
  COLS,
  NACH_KEYS,
  UDERZH_KEYS,
  fmt,
  calcRow,
} from "./types";

interface Totals {
  nach: Record<string, number>;
  ud: Record<string, number>;
  vsegaNach: number;
  vsegaUd: number;
  vsegaPoluch: number;
  ostatok: number;
}

interface Props {
  rows: VedomostRow[];
  activeCell: { rowId: number; col: ColKey } | null;
  setActiveCell: (v: { rowId: number; col: ColKey } | null) => void;
  updateCell: (id: number, col: ColKey, value: string) => void;
  deleteRow: (id: number) => void;
  handleKeyDown: (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => void;
  totals: Totals;
}

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

const VedomostTable = ({
  rows, activeCell, setActiveCell, updateCell, deleteRow, handleKeyDown, totals,
}: Props) => {
  return (
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
            const { vsegaNach, vsegaPoluch, ostatok } = calcRow(row);
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
  );
};

export default VedomostTable;
