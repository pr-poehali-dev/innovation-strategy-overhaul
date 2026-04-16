import { useMemo, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { useAppStore, getGrafiki } from "@/store/appStore";
import {
  NaryadRow,
  NormaSettings,
  TEXT_COLS,
  calcPodrabotka,
  STATUS_OTSUTSTVIYA,
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

// Выпадающая ячейка с <select> — исключает уже занятые значения
const ExclSelect = ({
  value,
  options,
  placeholder,
  onChange,
  width,
  bold,
}: {
  value: string;
  options: string[];      // только доступные (незанятые)
  placeholder: string;
  onChange: (v: string) => void;
  width: string;
  bold?: boolean;
}) => (
  <td className="border border-gray-300 p-0" style={{ width }}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full h-7 px-1 text-xs bg-transparent outline-none border-0 cursor-pointer appearance-none
        ${bold ? "font-semibold text-gray-900" : "text-gray-800"}`}
      style={{ WebkitAppearance: "none" }}
    >
      <option value="">{placeholder}</option>
      {/* текущее значение всегда показываем, даже если занято */}
      {value && !options.includes(value) && (
        <option value={value}>{value}</option>
      )}
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </td>
);

// Обычная ячейка ввода
const TextCell = ({
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  isActive,
  width,
  listId,
}: {
  value: string;
  onChange: (v: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isActive: boolean;
  width: string;
  listId?: string;
}) => (
  <td className="border border-gray-300 p-0" style={{ width }}>
    <input
      type="text"
      list={listId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      autoFocus={isActive}
      className={`w-full h-7 px-2 text-xs text-gray-800 bg-transparent outline-none border-2 transition-colors ${
        isActive ? "border-blue-500 bg-blue-50" : "border-transparent"
      }`}
      placeholder=""
    />
  </td>
);

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
  const { vehicles, employees, terminals, routes } = useAppStore();

  // Мемоизируем справочные данные — пересчитываются только при изменении источника
  const driverFios = useMemo(
    () => employees.filter((e) => e.dolzhnost === "Водитель"  && e.status === "active").map((e) => e.fio),
    [employees]
  );
  const condFios = useMemo(
    () => employees.filter((e) => e.dolzhnost === "Кондуктор" && e.status === "active").map((e) => e.fio),
    [employees]
  );
  const activeTerminals = useMemo(() => terminals.filter((t) => t.status === "active"), [terminals]);
  const allGrafiki      = useMemo(() => routes.flatMap((r) => getGrafiki(r)), [routes]);
  const allBorts        = useMemo(
    () => [...new Set(vehicles.map((v) => v.bortovoy).filter(Boolean))].sort((a, b) => Number(a) - Number(b)),
    [vehicles]
  );

  // O(n) — вычисляем один раз, не в цикле строк
  const allUsedBorts   = useMemo(() => new Set(rows.filter((r) => r.bortovoy).map((r) => r.bortovoy)), [rows]);
  const allUsedGrafiki = useMemo(() => new Set(rows.filter((r) => r.marshrut).map((r) => r.marshrut)), [rows]);

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
      {/* Глобальные datalist для ФИО и терминала */}
      <datalist id={VOD_LIST}>
        {driverFios.map((f) => <option key={f} value={f} />)}
      </datalist>
      <datalist id={COND_LIST}>
        <option value="без" />
        {condFios.map((f) => <option key={f} value={f} />)}
      </datalist>

      <div className="overflow-x-auto">
        <table className="border-collapse text-xs" style={{ minWidth: "900px" }}>
          <thead>
            <tr style={{ backgroundColor: "#1a3a6b" }}>
              <th className="border border-blue-900 px-1 py-2 text-white text-center" style={{ width: "28px" }}>№</th>
              {TEXT_COLS.map((col) => (
                <th key={col.key} className="border border-blue-900 px-2 py-2 text-white font-semibold text-left"
                  style={{ width: col.width, minWidth: col.width }}>
                  {col.label}
                </th>
              ))}
              <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-left" style={{ width: "180px" }}>ФИО водителя</th>
              <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-left" style={{ width: "180px" }}>ФИО кондуктора</th>
              <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "120px" }}>Статус</th>
              <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-left" style={{ width: "120px" }}>Терминал</th>
              <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-left" style={{ width: "110px" }}>Путевой лист</th>
              <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "75px" }}>Подработка</th>
              <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "75px" }}>Путевой</th>
              <th className="border border-blue-900 px-1 py-2" style={{ width: "28px" }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => {
              // Доступные: всё кроме занятых другими, плюс текущее значение строки
              const freeBorts   = allBorts.filter((b) => b === row.bortovoy || !allUsedBorts.has(b));
              const freeGrafiki = allGrafiki.filter((g) => g === row.marshrut || !allUsedGrafiki.has(g));

              return (
                <tr key={row.id} className={rowIdx % 2 === 0 ? "bg-white" : "bg-blue-50/40"}>
                  <td className="border border-gray-300 text-center text-gray-400 select-none" style={{ width: "28px" }}>
                    {rowIdx + 1}
                  </td>

                  {/* Борт № — select, исключает занятые */}
                  <ExclSelect
                    value={row.bortovoy}
                    options={freeBorts}
                    placeholder="— Борт —"
                    onChange={(v) => onUpdateCell(row.id, "bortovoy", v)}
                    width="90px"
                    bold
                  />

                  {/* Маршрут — select, исключает занятые графики */}
                  <ExclSelect
                    value={row.marshrut}
                    options={freeGrafiki}
                    placeholder="— График —"
                    onChange={(v) => onUpdateCell(row.id, "marshrut", v)}
                    width="90px"
                  />

                  {/* ФИО водителя */}
                  <TextCell
                    value={row.fio}
                    onChange={(v) => onUpdateCell(row.id, "fio", v)}
                    onFocus={() => onSetActiveCell({ rowId: row.id, col: "fio" })}
                    onBlur={() => onSetActiveCell(null)}
                    onKeyDown={(e) => handleKeyDown(e, rowIdx, TEXT_COLS.length)}
                    isActive={activeCell?.rowId === row.id && activeCell?.col === "fio"}
                    width="180px"
                    listId={VOD_LIST}
                  />

                  {/* ФИО кондуктора */}
                  <TextCell
                    value={row.fioKond}
                    onChange={(v) => onUpdateCell(row.id, "fioKond", v)}
                    onFocus={() => onSetActiveCell({ rowId: row.id, col: "fioKond" })}
                    onBlur={() => onSetActiveCell(null)}
                    onKeyDown={(e) => handleKeyDown(e, rowIdx, TEXT_COLS.length + 1)}
                    isActive={activeCell?.rowId === row.id && activeCell?.col === "fioKond"}
                    width="180px"
                    listId={COND_LIST}
                  />

                  {/* Статус */}
                  <td className="border border-gray-300 p-0" style={{ width: "120px" }}>
                    <select
                      value={row.statusOtsutstviya}
                      onChange={(e) => onUpdateCell(row.id, "statusOtsutstviya", e.target.value)}
                      className={`w-full h-7 px-1 text-xs bg-transparent outline-none border-2 border-transparent focus:border-blue-500 focus:bg-blue-50 transition-colors cursor-pointer ${
                        row.statusOtsutstviya ? "text-red-600 font-semibold" : "text-gray-400"
                      }`}
                    >
                      <option value="">—</option>
                      {STATUS_OTSUTSTVIYA.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>

                  {/* Терминал — select из справочника */}
                  <td className="border border-gray-300 p-0" style={{ width: "120px" }}>
                    <select
                      value={row.terminal}
                      onChange={(e) => onUpdateCell(row.id, "terminal", e.target.value)}
                      className={`w-full h-7 px-1 text-xs bg-transparent outline-none border-2 border-transparent focus:border-blue-500 focus:bg-blue-50 transition-colors cursor-pointer ${
                        row.terminal ? "text-gray-800" : "text-gray-400"
                      }`}
                    >
                      <option value="">—</option>
                      {activeTerminals.map((t) => (
                        <option key={t.id} value={t.nomer}>{t.nomer}</option>
                      ))}
                    </select>
                  </td>

                  {/* Путевой лист — текстовый ввод */}
                  <TextCell
                    value={row.putevoy}
                    onChange={(v) => onUpdateCell(row.id, "putevoy", v)}
                    onFocus={() => onSetActiveCell({ rowId: row.id, col: "putevoy" })}
                    onBlur={() => onSetActiveCell(null)}
                    onKeyDown={(e) => handleKeyDown(e, rowIdx, TEXT_COLS.length + 3)}
                    isActive={activeCell?.rowId === row.id && activeCell?.col === "putevoy"}
                    width="110px"
                  />

                  {/* Подработка */}
                  <td className="border border-gray-300 text-center" style={{ width: "75px" }}>
                    <div className="flex flex-col items-center gap-0.5 py-0.5">
                      <input
                        type="checkbox"
                        checked={row.podrabotka}
                        onChange={(e) => onUpdateCell(row.id, "podrabotka", e.target.checked)}
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                      />
                      {row.podrabotka && (
                        <input
                          type="text"
                          value={row.biletov}
                          onChange={(e) => onUpdateCell(row.id, "biletov", e.target.value)}
                          className="w-12 h-5 px-1 text-xs text-center text-gray-800 bg-white border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                          placeholder="бил"
                        />
                      )}
                    </div>
                  </td>

                  {/* Путевой лист */}
                  <td className="border border-gray-300 text-center" style={{ width: "75px" }}>
                    <button
                      onClick={() => onOpenPutevoy(row)}
                      className="flex items-center gap-1 mx-auto px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      <Icon name="FileText" size={11} />
                      Лист
                    </button>
                  </td>

                  <td className="border border-gray-300 text-center" style={{ width: "28px" }}>
                    <button onClick={() => onDeleteRow(row.id)} className="text-gray-300 hover:text-red-500 transition-colors p-0.5">
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