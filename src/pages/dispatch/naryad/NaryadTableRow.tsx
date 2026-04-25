import Icon from "@/components/ui/icon";
import { Employee, Terminal } from "@/store/appStore";
import { NaryadRow, STATUS_OTSUTSTVIYA, TEXT_COLS } from "../types";
import { ExclSelect, TextCell } from "./cells";

interface Props {
  row: NaryadRow;
  rowIdx: number;
  rows: NaryadRow[];
  activeCell: { rowId: number; col: string } | null;
  employees: Employee[];
  allBorts: string[];
  allUsedBorts: Set<string>;
  allGrafiki: string[];
  allUsedGrafiki: Set<string>;
  dupFios: Set<string>;
  dupKonds: Set<string>;
  getRowTerminals: (marshrut: string) => Terminal[];
  handleKeyDown: (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => void;
  onUpdateCell: (id: number, col: keyof NaryadRow, value: string | boolean) => void;
  onSetActiveCell: (cell: { rowId: number; col: string } | null) => void;
  onDeleteRow: (id: number) => void;
  onOpenPutevoy: (row: NaryadRow) => void;
  onToggleDtp: (row: NaryadRow) => void;
}

const NaryadTableRow = ({
  row, rowIdx, rows, activeCell, employees,
  allBorts, allUsedBorts, allGrafiki, allUsedGrafiki,
  dupFios, dupKonds, getRowTerminals,
  handleKeyDown, onUpdateCell, onSetActiveCell,
  onDeleteRow, onOpenPutevoy, onToggleDtp,
}: Props) => {
  const freeBorts   = allBorts.filter((b) => b === row.bortovoy || !allUsedBorts.has(b));
  const freeGrafiki = allGrafiki.filter((g) => g === row.marshrut || !allUsedGrafiki.has(g));

  // Дубли для этой строки
  const isDupFio  = !!(row.fio && dupFios.has(row.fio));
  const isDupKond = !!(row.fioKond && row.fioKond !== "без" && dupKonds.has(row.fioKond));

  // Уникальные datalist id для строки — исключаем уже занятых другими
  const vodListId  = `dl-vod-${row.id}`;
  const condListId = `dl-cond-${row.id}`;

  // Подсветка по типу водителя: арендатор — жёлтый, подработчик — голубой
  const driverEmp = employees.find((e) => e.fio === row.fio && e.dolzhnost === "Водитель");
  const isArendator = driverEmp?.tip === "arendator";
  const isPodrabotka = driverEmp?.tip === "podrabotka";
  const rowBg = isArendator
    ? "bg-yellow-100"
    : isPodrabotka
      ? "bg-sky-100"
      : (rowIdx % 2 === 0 ? "bg-white" : "bg-blue-50/40");

  return (
    <tr className={rowBg}>
      <td className="border border-gray-300 text-center text-gray-400 select-none" style={{ width: "28px" }}>
        {rowIdx + 1}
      </td>

      {/* Маршрут — select, исключает занятые графики */}
      <ExclSelect
        value={row.marshrut}
        options={freeGrafiki}
        placeholder="— График —"
        onChange={(v) => onUpdateCell(row.id, "marshrut", v)}
        width="90px"
      />

      {/* Борт № — select, исключает занятые */}
      <ExclSelect
        value={row.bortovoy}
        options={freeBorts}
        placeholder="— Борт —"
        onChange={(v) => onUpdateCell(row.id, "bortovoy", v)}
        width="90px"
        bold
      />

      {/* ФИО водителя */}
      <td className={`border p-0 ${isDupFio ? "border-red-400 bg-red-50" : "border-gray-300"}`} style={{ width: "180px" }}>
        <div className="flex items-center">
          <input
            type="text"
            name={`narad-fio-${row.id}`}
            list={vodListId}
            value={row.fio}
            onChange={(e) => onUpdateCell(row.id, "fio", e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, rowIdx, TEXT_COLS.length)}
            className={`flex-1 h-7 px-2 text-xs bg-transparent outline-none border-2 border-transparent focus:border-blue-500 focus:bg-blue-50 transition-colors min-w-0 ${isDupFio ? "text-red-600 font-semibold" : "text-gray-800"}`}
            placeholder=""
            autoComplete="off"
            title={isDupFio ? "⚠ Этот водитель уже есть в наряде!" : ""}
          />
          {row.fio && (
            <button onClick={() => onUpdateCell(row.id, "fio", "")}
              className="px-1 text-gray-300 hover:text-red-400 flex-shrink-0" tabIndex={-1} title="Очистить">×</button>
          )}
        </div>
      </td>

      {/* ФИО кондуктора */}
      <td className={`border p-0 ${isDupKond ? "border-red-400 bg-red-50" : "border-gray-300"}`} style={{ width: "180px" }}>
        <div className="flex items-center">
          <input
            type="text"
            name={`narad-kond-${row.id}`}
            list={condListId}
            value={row.fioKond}
            onChange={(e) => onUpdateCell(row.id, "fioKond", e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, rowIdx, TEXT_COLS.length + 1)}
            className={`flex-1 h-7 px-2 text-xs bg-transparent outline-none border-2 border-transparent focus:border-blue-500 focus:bg-blue-50 transition-colors min-w-0 ${isDupKond ? "text-red-600 font-semibold" : "text-gray-800"}`}
            placeholder="без"
            autoComplete="off"
            title={isDupKond ? "⚠ Этот кондуктор уже есть в наряде!" : ""}
          />
          {row.fioKond && (
            <button onClick={() => onUpdateCell(row.id, "fioKond", "")}
              className="px-1 text-gray-300 hover:text-red-400 flex-shrink-0" tabIndex={-1} title="Очистить">×</button>
          )}
        </div>
      </td>

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
          {getRowTerminals(row.marshrut).map((t, ti) => (
            <option key={`term-${ti}-${t.id}`} value={t.nomer}>{t.nomer}</option>
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

      {/* ДТП */}
      <td className="border border-gray-300 text-center" style={{ width: "55px" }}>
        <button
          onClick={() => onToggleDtp(row)}
          title={row.dtp ? "ДТП зафиксировано — нажмите для снятия" : "Отметить ДТП"}
          className={`flex items-center gap-1 mx-auto px-1.5 py-0.5 text-xs rounded border transition-colors ${
            row.dtp
              ? "bg-red-600 text-white border-red-700 hover:bg-red-700"
              : "bg-gray-50 text-gray-400 border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
          }`}
        >
          <Icon name="AlertTriangle" size={11} />
          {row.dtp ? "ДТП" : "—"}
        </button>
      </td>

      <td className="border border-gray-300 text-center" style={{ width: "28px" }}>
        <button onClick={() => onDeleteRow(row.id)} className="text-gray-300 hover:text-red-500 transition-colors p-0.5">
          <Icon name="X" size={12} />
        </button>
      </td>
    </tr>
  );
};

export default NaryadTableRow;