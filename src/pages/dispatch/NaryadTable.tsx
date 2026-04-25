import { useCallback } from "react";
import { NaryadRow, NormaSettings, TEXT_COLS } from "./types";
import { useNaryadData } from "./naryad/useNaryadData";
import NaryadTableHeader from "./naryad/NaryadTableHeader";
import NaryadTableRow from "./naryad/NaryadTableRow";

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
  onToggleDtp: (row: NaryadRow) => void;
}

const NaryadTable = ({
  rows,
  activeCell,
  onUpdateCell,
  onAddRow,
  onDeleteRow,
  onSetActiveCell,
  onOpenPutevoy,
  onToggleDtp,
}: Props) => {
  const {
    employees,
    driverFios,
    condFios,
    getRowTerminals,
    allGrafiki,
    allBorts,
    allUsedBorts,
    allUsedGrafiki,
    dupFios,
    dupKonds,
  } = useNaryadData(rows);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
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
  }, [rows, onSetActiveCell, onAddRow]);

  const VOD_LIST  = "dl-narad-vod";
  const COND_LIST = "dl-narad-cond";

  const podrabotkaRows = rows.filter((r) => r.podrabotka);

  return (
    <>
      {/* datalist глобальные — вне таблицы, валидный HTML */}
      <datalist id={VOD_LIST}>
        {driverFios.map((f) => <option key={f} value={f} />)}
      </datalist>
      <datalist id={COND_LIST}>
        <option value="без" />
        {condFios.map((f) => <option key={f} value={f} />)}
      </datalist>
      {/* per-row datalists — вне таблицы, но доступны по id из строк */}
      {rows.map((row, rowIdx) => {
        const freeDriversForRow = driverFios.filter((f) => f === row.fio || !dupFios.has(f));
        const freeCondsForRow   = condFios.filter((f)  => f === row.fioKond || !dupKonds.has(f));
        return (
          <span key={`dl-${rowIdx}-${row.id}`} style={{ display: "none" }}>
            <datalist id={`dl-vod-${row.id}`}>
              {freeDriversForRow.map((f) => <option key={f} value={f} />)}
            </datalist>
            <datalist id={`dl-cond-${row.id}`}>
              <option value="без" />
              {freeCondsForRow.map((f) => <option key={f} value={f} />)}
            </datalist>
          </span>
        );
      })}

      <div className="overflow-x-auto">
        <table className="border-collapse text-xs" style={{ minWidth: "900px" }}>
          <NaryadTableHeader />
          <tbody>
            {rows.map((row, rowIdx) => (
              <NaryadTableRow
                key={`nar-${rowIdx}-${row.id}`}
                row={row}
                rowIdx={rowIdx}
                rows={rows}
                activeCell={activeCell}
                employees={employees}
                allBorts={allBorts}
                allUsedBorts={allUsedBorts}
                allGrafiki={allGrafiki}
                allUsedGrafiki={allUsedGrafiki}
                dupFios={dupFios}
                dupKonds={dupKonds}
                getRowTerminals={getRowTerminals}
                handleKeyDown={handleKeyDown}
                onUpdateCell={onUpdateCell}
                onSetActiveCell={onSetActiveCell}
                onDeleteRow={onDeleteRow}
                onOpenPutevoy={onOpenPutevoy}
                onToggleDtp={onToggleDtp}
              />
            ))}
          </tbody>

          {podrabotkaRows.length > 0 && (
            <tfoot>
              <tr className="bg-gray-100 font-semibold text-xs">
                <td colSpan={9} className="border border-gray-300 px-3 py-1.5 text-right text-gray-600">
                  Подработка: {podrabotkaRows.length} экипажей — суммы в Продажах
                </td>
                <td className="border border-gray-300" colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="border-t border-gray-300 px-6 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-400">
        <span>Строк: {rows.length} · Подработка: {podrabotkaRows.length}</span>
        <span>Tab / Enter — переход</span>
      </div>
    </>
  );
};

export default NaryadTable;
