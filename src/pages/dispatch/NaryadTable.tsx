import Icon from "@/components/ui/icon";
import { useAppStore, TsVehicle } from "@/store/appStore";
import {
  NaryadRow,
  NormaSettings,
  TEXT_COLS,
  calcPodrabotka,
  fmt,
} from "./types";

interface Props {
  rows: NaryadRow[];
  activeCell: { rowId: number; col: string } | null;
  settings: NormaSettings;
  onUpdateCell: (id: number, col: keyof NaryadRow, value: string | boolean) => void;
  onUpdateRow: (id: number, partial: Partial<NaryadRow>) => void;
  onAddRow: () => void;
  onDeleteRow: (id: number) => void;
  onSetActiveCell: (cell: { rowId: number; col: string } | null) => void;
  onOpenPutevoy: (row: NaryadRow) => void;
}

const NaryadTable = ({
  rows,
  activeCell,
  settings,
  onUpdateCell,
  onUpdateRow,
  onAddRow,
  onDeleteRow,
  onSetActiveCell,
  onOpenPutevoy,
}: Props) => {
  const { vehicles } = useAppStore();

  const handleKeyDown = (
    e: React.KeyboardEvent,
    rowIdx: number,
    colIdx: number,
  ) => {
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      if (colIdx + 1 < TEXT_COLS.length) {
        onSetActiveCell({ rowId: rows[rowIdx].id, col: TEXT_COLS[colIdx + 1].key });
      } else if (rowIdx + 1 < rows.length) {
        onSetActiveCell({ rowId: rows[rowIdx + 1].id, col: TEXT_COLS[0].key });
      } else {
        onAddRow();
        setTimeout(() => {
          onSetActiveCell({ rowId: rows[rows.length - 1]?.id, col: TEXT_COLS[0].key });
        }, 0);
      }
    }
  };

  const handleSelectVehicle = (rowId: number, vehicleId: string) => {
    const vid = parseInt(vehicleId);
    const v: TsVehicle | undefined = vehicles.find((veh) => veh.id === vid);
    if (!v) {
      onUpdateRow(rowId, { vehicleId: null, bortovoy: "", gos: "", marka: "", garazhny: "" });
    } else {
      onUpdateRow(rowId, {
        vehicleId: v.id,
        bortovoy: v.bortovoy,
        gos: v.gos,
        marka: v.marka,
        garazhny: v.garazhny,
      });
    }
  };

  const podrabotkaRows = rows.filter((r) => r.podrabotka);
  const totalVod  = podrabotkaRows.reduce((s, r) => s + (calcPodrabotka(r, settings)?.vod  ?? 0), 0);
  const totalCond = podrabotkaRows.reduce((s, r) => s + (calcPodrabotka(r, settings)?.cond ?? 0), 0);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs" style={{ minWidth: "1100px" }}>
          <thead>
            <tr style={{ backgroundColor: "#1a3a6b" }}>
              <th className="border border-blue-900 px-1 py-2 text-white text-center" style={{ width: "28px" }}>№</th>
              <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-left" style={{ width: "160px" }}>ТС</th>
              <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-left" style={{ width: "80px" }}>Борт/Гос</th>
              {TEXT_COLS.map((col) => (
                <th
                  key={col.key}
                  className="border border-blue-900 px-2 py-2 text-white font-semibold text-left"
                  style={{ width: col.width, minWidth: col.width }}
                >
                  {col.label}
                </th>
              ))}
              <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "80px" }}>Подработка</th>
              <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "80px" }}>Билетов</th>
              <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "100px" }}>Водитель, ₽</th>
              <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "100px" }}>Кондуктор, ₽</th>
              <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "80px" }}>Путевой</th>
              <th className="border border-blue-900 px-1 py-2" style={{ width: "28px" }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => {
              const calc = calcPodrabotka(row, settings);
              return (
                <tr key={row.id} className={rowIdx % 2 === 0 ? "bg-white" : "bg-blue-50/40"}>
                  <td className="border border-gray-300 text-center text-gray-400 select-none" style={{ width: "28px" }}>
                    {rowIdx + 1}
                  </td>

                  {/* Выбор ТС */}
                  <td className="border border-gray-300 p-0" style={{ width: "160px" }}>
                    <select
                      value={row.vehicleId ?? ""}
                      onChange={(e) => handleSelectVehicle(row.id, e.target.value)}
                      className="w-full h-7 px-1 text-xs text-gray-800 bg-transparent outline-none border-0 cursor-pointer"
                    >
                      <option value="">— выбрать ТС —</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.marka || "ТС"}{v.bortovoy ? ` (${v.bortovoy})` : ""}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Борт / Гос знак (авто из стора) */}
                  <td className="border border-gray-300 px-1 py-1 text-xs text-gray-600" style={{ width: "80px" }}>
                    <div className="leading-tight">
                      {row.bortovoy && <div className="font-semibold">{row.bortovoy}</div>}
                      {row.gos && <div className="text-gray-400">{row.gos}</div>}
                      {!row.bortovoy && !row.gos && <span className="text-gray-300">—</span>}
                    </div>
                  </td>

                  {TEXT_COLS.map((col, colIdx) => {
                    const isActive = activeCell?.rowId === row.id && activeCell?.col === col.key;
                    return (
                      <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
                        <input
                          type="text"
                          value={row[col.key as keyof NaryadRow] as string}
                          onChange={(e) => onUpdateCell(row.id, col.key as keyof NaryadRow, e.target.value)}
                          onFocus={() => onSetActiveCell({ rowId: row.id, col: col.key })}
                          onBlur={() => onSetActiveCell(null)}
                          onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                          autoFocus={isActive}
                          className={`w-full h-7 px-2 text-gray-800 bg-transparent outline-none border-2 ${
                            isActive ? "border-blue-500 bg-blue-50" : "border-transparent"
                          } transition-colors`}
                          placeholder="—"
                        />
                      </td>
                    );
                  })}

                  <td className="border border-gray-300 text-center" style={{ width: "80px" }}>
                    <input
                      type="checkbox"
                      checked={row.podrabotka}
                      onChange={(e) => onUpdateCell(row.id, "podrabotka", e.target.checked)}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                  </td>

                  <td className="border border-gray-300 p-0" style={{ width: "80px" }}>
                    {row.podrabotka ? (
                      <input
                        type="text"
                        value={row.biletov}
                        onChange={(e) => onUpdateCell(row.id, "biletov", e.target.value)}
                        className="w-full h-7 px-2 text-gray-800 bg-transparent outline-none border-2 border-transparent focus:border-blue-500 focus:bg-blue-50 transition-colors text-center"
                        placeholder="0"
                      />
                    ) : (
                      <span className="block text-center text-gray-300 select-none">—</span>
                    )}
                  </td>

                  <td className="border border-gray-300 text-center text-xs font-semibold" style={{ width: "100px" }}>
                    {calc !== null ? (
                      <span className="text-green-700">{fmt(calc.vod)}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>

                  <td className="border border-gray-300 text-center text-xs font-semibold" style={{ width: "100px" }}>
                    {calc !== null && row.fioKond.trim().length > 0 ? (
                      <span className="text-green-700">{fmt(calc.cond)}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>

                  <td className="border border-gray-300 text-center" style={{ width: "80px" }}>
                    <button
                      onClick={() => onOpenPutevoy(row)}
                      title="Открыть путевой лист"
                      className="flex items-center gap-1 mx-auto px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      <Icon name="FileText" size={11} />
                      Лист
                    </button>
                  </td>

                  <td className="border border-gray-300 text-center" style={{ width: "28px" }}>
                    <button
                      onClick={() => onDeleteRow(row.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-0.5"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {podrabotkaRows.length > 0 && (
            <tfoot>
              <tr className="bg-gray-100 font-semibold text-xs">
                <td
                  colSpan={TEXT_COLS.length + 6}
                  className="border border-gray-300 px-3 py-1.5 text-right text-gray-600"
                >
                  Итого подработка:
                </td>
                <td className="border border-gray-300 text-center text-green-700">{fmt(totalVod)}</td>
                <td className="border border-gray-300 text-center text-green-700">
                  {totalCond > 0 ? fmt(totalCond) : "—"}
                </td>
                <td className="border border-gray-300" colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="border-t border-gray-300 px-6 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-400">
        <span>Строк: {rows.length} · Подработка: {podrabotkaRows.length}</span>
        <span>Tab / Enter — переход между ячейками</span>
      </div>
    </>
  );
};

export default NaryadTable;
