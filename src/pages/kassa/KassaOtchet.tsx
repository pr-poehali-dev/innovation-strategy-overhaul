import Icon from "@/components/ui/icon";
import {
  KassaRow, VyplataRow,
  MAIN_COLS, VYP_COLS,
  toNum, getRouteColor,
} from "./kassaTypes";

interface Props {
  rows: KassaRow[];
  vyplaty: VyplataRow[];
  activeCell: { rowId: number; col: string } | null;
  activeVyp: { rowId: number; col: string } | null;
  onUpdateCell: (id: number, col: keyof KassaRow, value: string) => void;
  onDeleteRow: (id: number) => void;
  onSetActiveCell: (cell: { rowId: number; col: string } | null) => void;
  onUpdateVyp: (id: number, col: keyof VyplataRow, val: string) => void;
  onAddVyp: () => void;
  onDeleteVyp: (id: number) => void;
  onSetActiveVyp: (cell: { rowId: number; col: string } | null) => void;
  onKeyDown: (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => void;
  onVypKeyDown: (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => void;
  rowCount: number;
  vyplatCount: number;
}

const KassaOtchet = ({
  rows, vyplaty,
  activeCell, activeVyp,
  onUpdateCell, onDeleteRow, onSetActiveCell,
  onUpdateVyp, onAddVyp, onDeleteVyp, onSetActiveVyp,
  onKeyDown, onVypKeyDown,
  rowCount, vyplatCount,
}: Props) => {
  const routeRows = rows.filter((r) => r.type !== "disp");
  const dispRows  = rows.filter((r) => r.type === "disp");

  const getSum = (col: keyof KassaRow) =>
    rows.reduce((acc, r) => acc + toNum(r[col] as string), 0);

  const vypItogo = vyplaty.reduce((s, v) => s + toNum(v.itogo), 0);

  const renderCell = (row: KassaRow, col: typeof MAIN_COLS[number], rowIdx: number, colIdx: number) => {
    const isActive = activeCell?.rowId === row.id && activeCell?.col === col.key;
    const isPodr   = col.key === "podrVod" || col.key === "podrCond" || col.key === "rashodDt";
    return (
      <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
        <input
          type="text"
          value={row[col.key] as string}
          onChange={(e) => onUpdateCell(row.id, col.key, e.target.value)}
          onFocus={() => onSetActiveCell({ rowId: row.id, col: col.key })}
          onBlur={() => onSetActiveCell(null)}
          onKeyDown={(e) => onKeyDown(e, rowIdx, colIdx)}
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
    <>
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
                      <button onClick={() => onDeleteRow(row.id)} className="text-gray-300 hover:text-red-500 p-0.5">
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
                              <button onClick={() => onDeleteRow(row.id)} className="text-gray-300 hover:text-red-500 p-0.5">
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
                          onChange={(e) => !isReadonly && onUpdateVyp(vRow.id, col.key, e.target.value)}
                          onFocus={() => onSetActiveVyp({ rowId: vRow.id, col: col.key })}
                          onBlur={() => onSetActiveVyp(null)}
                          onKeyDown={(e) => onVypKeyDown(e, rowIdx, colIdx)}
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
                    <button onClick={() => onDeleteVyp(vRow.id)} className="text-gray-300 hover:text-red-500 p-0.5">
                      <Icon name="X" size={11} />
                    </button>
                  </td>
                </tr>
              ))}

              <tr className="print:hidden">
                <td colSpan={VYP_COLS.length + 2} className="border border-gray-200 px-2 py-1">
                  <button onClick={onAddVyp} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700">
                    <Icon name="Plus" size={11} /> строка
                  </button>
                </td>
              </tr>

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
        <span>Строк: {rowCount} · Выплат: {vyplatCount}</span>
        <span>Tab / Enter — переход между ячейками</span>
      </div>
    </>
  );
};

export default KassaOtchet;
