import Icon from "@/components/ui/icon";
import { useAppStore, getGrafiki } from "@/store/appStore";
import {
  NaryadRow,
  NormaSettings,
  TEXT_COLS,
  calcPodrabotka,
  fmt,
} from "./types";

// InputCell с datalist — datalist рендерится глобально, здесь только input
const DatalistCell = ({
  value,
  listId,
  placeholder,
  onChange,
  width,
  bold,
}: {
  value: string;
  listId: string;
  placeholder?: string;
  onChange: (v: string) => void;
  width: string;
  bold?: boolean;
}) => (
  <td className="border border-gray-300 p-0" style={{ width }}>
    <input
      type="text"
      list={listId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? ""}
      className={`w-full h-7 px-2 text-xs text-gray-800 bg-transparent outline-none border-2 border-transparent focus:border-blue-500 focus:bg-blue-50 transition-colors ${bold ? "font-semibold" : ""}`}
    />
  </td>
);

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
  const { vehicles, employees, terminals, routes } = useAppStore();

  const driverFios      = employees.filter((e) => e.dolzhnost === "Водитель"  && e.status === "active").map((e) => e.fio);
  const condFios        = employees.filter((e) => e.dolzhnost === "Кондуктор" && e.status === "active").map((e) => e.fio);
  const activeTerminals = terminals.filter((t) => t.status === "active");
  const allGrafiki      = routes.flatMap((r) => getGrafiki(r));
  const bortOptions     = [...new Set(vehicles.map((v) => v.bortovoy).filter(Boolean))].sort((a, b) => Number(a) - Number(b));

  // Глобальные id для datalist (уникальные на странице)
  const VOD_LIST    = "dl-narad-vod";
  const COND_LIST   = "dl-narad-cond";
  const GRAFIK_LIST = "dl-narad-grafik";
  const TERM_LIST   = "dl-narad-term";
  const BORT_LIST   = "dl-narad-bort";

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
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

  const podrabotkaRows = rows.filter((r) => r.podrabotka);

  return (
    <>
      {/* ── Глобальные datalist — вне таблицы, один экземпляр каждого ── */}
      <datalist id={VOD_LIST}>
        {driverFios.map((f) => <option key={f} value={f} />)}
      </datalist>
      <datalist id={COND_LIST}>
        <option value="без" />
        {condFios.map((f) => <option key={f} value={f} />)}
      </datalist>
      <datalist id={GRAFIK_LIST}>
        {allGrafiki.map((g) => <option key={g} value={g} />)}
      </datalist>
      <datalist id={TERM_LIST}>
        {activeTerminals.map((t) => (
          <option key={t.id} value={t.nomer} />
        ))}
      </datalist>
      <datalist id={BORT_LIST}>
        {bortOptions.map((b) => <option key={b} value={b} />)}
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
              <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "75px" }}>Подработка</th>
              <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "75px" }}>Путевой</th>
              <th className="border border-blue-900 px-1 py-2" style={{ width: "28px" }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={row.id} className={rowIdx % 2 === 0 ? "bg-white" : "bg-blue-50/40"}>
                <td className="border border-gray-300 text-center text-gray-400 select-none" style={{ width: "28px" }}>
                  {rowIdx + 1}
                </td>

                {/* TEXT_COLS: Борт №, Маршрут, Терминал, Путевой */}
                {TEXT_COLS.map((col, colIdx) => {
                  const isActive = activeCell?.rowId === row.id && activeCell?.col === col.key;

                  if (col.key === "bortovoy") {
                    return (
                      <DatalistCell
                        key={col.key}
                        value={row.bortovoy}
                        listId={BORT_LIST}
                        onChange={(v) => onUpdateCell(row.id, "bortovoy", v)}
                        width={col.width}
                        bold
                      />
                    );
                  }
                  if (col.key === "marshrut") {
                    return (
                      <DatalistCell
                        key={col.key}
                        value={row.marshrut}
                        listId={GRAFIK_LIST}
                        onChange={(v) => onUpdateCell(row.id, "marshrut", v)}
                        width={col.width}
                      />
                    );
                  }
                  if (col.key === "terminal") {
                    return (
                      <DatalistCell
                        key={col.key}
                        value={row.terminal}
                        listId={TERM_LIST}
                        onChange={(v) => onUpdateCell(row.id, "terminal", v)}
                        width={col.width}
                      />
                    );
                  }
                  // putevoy — обычный ввод
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
                        placeholder=""
                      />
                    </td>
                  );
                })}

                {/* ФИО водителя */}
                <DatalistCell
                  value={row.fio}
                  listId={VOD_LIST}
                  placeholder="— водитель —"
                  onChange={(v) => onUpdateCell(row.id, "fio", v)}
                  width="180px"
                />

                {/* ФИО кондуктора */}
                <DatalistCell
                  value={row.fioKond}
                  listId={COND_LIST}
                  placeholder="без"
                  onChange={(v) => onUpdateCell(row.id, "fioKond", v)}
                  width="180px"
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
            ))}
          </tbody>

          {podrabotkaRows.length > 0 && (
            <tfoot>
              <tr className="bg-gray-100 font-semibold text-xs">
                <td colSpan={TEXT_COLS.length + 3} className="border border-gray-300 px-3 py-1.5 text-right text-gray-600">
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
