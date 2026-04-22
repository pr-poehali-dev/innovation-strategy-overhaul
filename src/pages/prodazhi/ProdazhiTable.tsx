import Icon from "@/components/ui/icon";
import { ProdazhiRow, ColKey, COLUMNS, OFF_STATUSES, toNum } from "./prodazhiShared";

interface Props {
  rows: ProdazhiRow[];
  activeCell: { rowId: number; col: string } | null;
  onUpdateCell: (id: number, col: ColKey, value: string) => void;
  onDeleteRow: (id: number) => void;
  onSetActiveCell: (cell: { rowId: number; col: string } | null) => void;
  onKeyDown: (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => void;
  getSum: (col: ColKey) => number;
  vodFioList: string;
  condFioList: string;
  bortList: string;
  grafikList: string;
}

const ProdazhiTable = ({
  rows, activeCell,
  onUpdateCell, onDeleteRow, onSetActiveCell, onKeyDown,
  getSum,
  vodFioList, condFioList, bortList, grafikList,
}: Props) => {

  const renderCell = (row: ProdazhiRow, col: typeof COLUMNS[number], rowIdx: number, colIdx: number) => {
    const isActive = activeCell?.rowId === row.id && activeCell?.col === col.key;
    const isOff = OFF_STATUSES.includes(row.marGr);

    if (col.key === "fioVod") {
      return (
        <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
          <input type="text" list={vodFioList} value={row.fioVod}
            onChange={(e) => onUpdateCell(row.id, "fioVod", e.target.value)}
            onFocus={() => onSetActiveCell({ rowId: row.id, col: col.key })}
            onBlur={() => onSetActiveCell(null)}
            onKeyDown={(e) => onKeyDown(e, rowIdx, colIdx)}
            className={`w-full h-6 px-1 text-xs text-gray-800 bg-transparent outline-none border-2 ${isActive ? "border-blue-500 bg-blue-50" : "border-transparent"} transition-colors`}
            placeholder="—" />
        </td>
      );
    }
    if (col.key === "fioCond") {
      return (
        <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
          <input type="text" list={condFioList} value={row.fioCond}
            onChange={(e) => onUpdateCell(row.id, "fioCond", e.target.value)}
            onFocus={() => onSetActiveCell({ rowId: row.id, col: col.key })}
            onBlur={() => onSetActiveCell(null)}
            onKeyDown={(e) => onKeyDown(e, rowIdx, colIdx)}
            className={`w-full h-6 px-1 text-xs text-gray-800 bg-transparent outline-none border-2 ${isActive ? "border-blue-500 bg-blue-50" : "border-transparent"} transition-colors`}
            placeholder="без" />
        </td>
      );
    }
    if (col.key === "marGr") {
      return (
        <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
          <input type="text" list={grafikList} value={row.marGr}
            onChange={(e) => onUpdateCell(row.id, "marGr", e.target.value)}
            onFocus={() => onSetActiveCell({ rowId: row.id, col: col.key })}
            onBlur={() => onSetActiveCell(null)}
            onKeyDown={(e) => onKeyDown(e, rowIdx, colIdx)}
            className={`w-full h-6 px-1 text-xs text-gray-800 bg-transparent outline-none border-2 ${isActive ? "border-blue-500 bg-blue-50" : "border-transparent"} transition-colors text-center`}
            placeholder="1/1" />
        </td>
      );
    }
    if (col.key === "bort") {
      return (
        <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
          <input type="text" list={bortList} value={row.bort}
            onChange={(e) => onUpdateCell(row.id, "bort", e.target.value)}
            onFocus={() => onSetActiveCell({ rowId: row.id, col: col.key })}
            onBlur={() => onSetActiveCell(null)}
            onKeyDown={(e) => onKeyDown(e, rowIdx, colIdx)}
            className={`w-full h-6 px-1 text-xs font-bold text-blue-800 bg-transparent outline-none border-2 ${isActive ? "border-blue-500 bg-blue-50" : "border-transparent"} transition-colors text-center`}
            placeholder="—" />
        </td>
      );
    }

    // Галочки выдачи ЗП (только просмотр — меняются в Кассе)
    if (col.key === "podVodVydano" || col.key === "podCondVydano") {
      const who = col.key === "podVodVydano" ? "vod" : "cond";
      const checked = !!row[col.key];
      const sum = who === "vod" ? toNum(row.podVod) : toNum(row.podCond);
      const hasPod = sum > 0;
      return (
        <td key={col.key} className="border border-gray-300 p-0 text-center"
          style={{
            width: col.width,
            backgroundColor: checked ? "#dcfce7" : (hasPod ? "#fff7ed" : undefined),
          }}
          title={
            checked ? "ЗП выдана (отмечается в Кассе)" :
            hasPod  ? "ЗП начислена, но ещё не выдана (отмечается в Кассе)" :
                      "ЗП не начислена"
          }
        >
          <div className="w-full h-6 flex items-center justify-center select-none">
            {checked
              ? <span className="text-green-600 font-bold text-base">✓</span>
              : hasPod
                ? <span className="text-orange-500 font-extrabold text-base">!</span>
                : <span className="text-gray-300 text-sm">○</span>}
          </div>
        </td>
      );
    }

    const isPod      = col.key === "podVod" || col.key === "podCond";
    const isFromKassa = col.key === "dt" || col.key === "valid";
    const isReadonly =
      col.key === "kolBil" || col.key === "qr" ||
      col.key === "podVod" || col.key === "podCond" ||
      isFromKassa;

    if (isReadonly) {
      const val = row[col.key] as string;
      const bg  = isPod ? "#fff7ed" : isFromKassa ? "#fef3c7" : "#eff6ff";
      const tc  =
        isPod         ? "text-orange-700 font-semibold"
        : isFromKassa ? "text-amber-800 font-semibold"
                      : "text-blue-700 font-semibold";
      const title =
        col.key === "dt"      ? "Авто из Кассы: Расх. ДТ ÷ Стоимость топлива (л)"
        : col.key === "valid" ? "Авто из Кассы: Безнал (только просмотр)"
        : isPod               ? "Авто из Кассы: ЗП по действующей формуле"
                              : "Авто из Кассы — только просмотр";
      return (
        <td key={col.key} className="border border-gray-300 p-0"
          style={{ width: col.width, backgroundColor: bg }}
          title={title}>
          <div className={`w-full h-6 px-1 flex items-center justify-center text-xs select-none ${tc}`}>
            {val || "—"}
          </div>
        </td>
      );
    }

    return (
      <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
        <input type="text" value={row[col.key] as string}
          onChange={(e) => onUpdateCell(row.id, col.key, e.target.value)}
          onFocus={() => onSetActiveCell({ rowId: row.id, col: col.key })}
          onBlur={() => onSetActiveCell(null)}
          onKeyDown={(e) => onKeyDown(e, rowIdx, colIdx)}
          disabled={isOff && col.key === "reysy"}
          className={[
            "w-full h-6 px-1 text-xs bg-transparent outline-none border-2 transition-colors text-center",
            isActive ? "border-blue-500 bg-blue-50" : "border-transparent",
            isOff ? "text-gray-400" : "text-gray-800",
          ].join(" ")}
          placeholder="" />
      </td>
    );
  };

  return (
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
            const isOff = OFF_STATUSES.includes(row.marGr);
            const rowBg = isOff ? "#f5f5f0" : rowIdx % 2 === 0 ? "#ffffff" : "#eff6ff";
            return (
              <tr key={row.id} style={{ backgroundColor: rowBg }}>
                <td className="border border-gray-300 text-center text-gray-400 select-none" style={{ width: "28px" }}>
                  {rowIdx + 1}
                </td>
                {COLUMNS.map((col, colIdx) => renderCell(row, col, rowIdx, colIdx))}
                <td className="border border-gray-300 text-center print:hidden" style={{ width: "22px" }}>
                  <button onClick={() => onDeleteRow(row.id)} className="text-gray-300 hover:text-red-500 p-0.5">
                    <Icon name="X" size={11} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: "#1a3a6b" }}>
            <td className="border border-blue-900 px-1 py-1.5 text-center text-white font-bold text-xs" colSpan={2}>Σ</td>
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
  );
};

export default ProdazhiTable;