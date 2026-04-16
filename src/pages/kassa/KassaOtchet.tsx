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
  onToggleVydano: (id: number, who: "vod" | "cond") => void;
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
  onUpdateCell, onToggleVydano, onDeleteRow, onSetActiveCell,
  onUpdateVyp, onAddVyp, onDeleteVyp, onSetActiveVyp,
  onKeyDown, onVypKeyDown,
  rowCount, vyplatCount,
}: Props) => {
  const routeRows = rows.filter((r) => r.type !== "disp");
  const dispRows  = rows.filter((r) => r.type === "disp");

  const getSum = (col: keyof KassaRow) =>
    rows.reduce((acc, r) => acc + toNum(r[col] as string), 0);

  const vypItogo = vyplaty.reduce((s, v) => s + toNum(v.itogo), 0);

  // Колонки только для просмотра (авторасчёт)
  // prodBilety, podrVod, podrCond, itogo — авторасчёт, только просмотр
  const READONLY_COLS = new Set(["prodBilety", "podrVod", "podrCond", "itogo"]);
  const CHECK_COLS    = new Set(["podrVodVydano", "podrCondVydano"]);

  const renderCell = (row: KassaRow, col: typeof MAIN_COLS[number], rowIdx: number, colIdx: number) => {
    const isActive   = activeCell?.rowId === row.id && activeCell?.col === col.key;
    const isViruchka = col.key === "viruchka";
    const isReadonly = READONLY_COLS.has(col.key);
    const isCheck    = CHECK_COLS.has(col.key);

    // Readonly ячейки — только просмотр
    if (isReadonly) {
      const val = row[col.key] as string;
      const bg =
        col.key === "prodBilety" ? "#eff6ff" :
        col.key === "podrVod"    ? "#fff7ed" :
        col.key === "podrCond"   ? "#fff7ed" :
        col.key === "itogo"      ? "#f0fdf4" : "#fafafa";
      const textColor =
        col.key === "prodBilety" ? "text-blue-700 font-semibold" :
        col.key === "podrVod"    ? "text-orange-700 font-semibold" :
        col.key === "podrCond"   ? "text-orange-700 font-semibold" :
        col.key === "itogo"      ? "text-green-800 font-bold" : "text-gray-500";
      const title =
        col.key === "itogo"      ? "Авто: Выручка − Безнал − QR − Обед − Расх.ДТ − Чек − Возврат − Подр.вод − Подр.конд + В плюс" :
        col.key === "prodBilety" ? "Авто: Выручка ÷ Стоимость проезда" :
        col.key === "podrVod"    ? "Авто из наряда (настройки → % водителя)" :
        col.key === "podrCond"   ? "Авто из наряда (настройки → % кондуктора)" : undefined;
      return (
        <td key={col.key} className="border border-gray-300 p-0"
          style={{ width: col.width, backgroundColor: bg }}
          title={title}
        >
          <div className={`w-full h-6 px-1 flex items-center justify-center text-xs select-none ${textColor}`}>
            {val || "—"}
          </div>
        </td>
      );
    }

    // Галочка выдачи подработки
    if (isCheck) {
      const who     = col.key === "podrVodVydano" ? "vod" : "cond";
      const checked = row[col.key] as boolean;
      const hasPod  = toNum(who === "vod" ? row.podrVod : row.podrCond) > 0;
      return (
        <td key={col.key} className="border border-gray-300 p-0 text-center"
          style={{ width: col.width, backgroundColor: checked ? "#dcfce7" : hasPod ? "#fef9c3" : undefined }}
          title={checked ? "Подработка выдана" : "Нажмите — отметить как выданную"}
        >
          <button
            onClick={() => hasPod && onToggleVydano(row.id, who)}
            disabled={!hasPod}
            className={[
              "w-full h-6 flex items-center justify-center transition-colors",
              !hasPod ? "cursor-default opacity-30" : "cursor-pointer hover:bg-green-100",
            ].join(" ")}
          >
            {checked
              ? <span className="text-green-600 font-bold text-sm">✓</span>
              : <span className="text-gray-300 text-sm">○</span>
            }
          </button>
        </td>
      );
    }

    const calcBg    = isViruchka ? "#f0fdf4" : undefined;
    const calcTitle = isViruchka ? "Авто: Кол.бил × Стоимость проезда + Безнал + QR" : undefined;
    return (
      <td
        key={col.key}
        className="border border-gray-300 p-0"
        style={{ width: col.width, backgroundColor: calcBg }}
        title={calcTitle}
      >
        <input
          type="text"
          value={row[col.key] as string}
          onChange={(e) => onUpdateCell(row.id, col.key, e.target.value)}
          onFocus={() => onSetActiveCell({ rowId: row.id, col: col.key })}
          onBlur={() => onSetActiveCell(null)}
          onKeyDown={(e) => onKeyDown(e, rowIdx, colIdx)}
          className={[
            "w-full h-6 px-1 bg-transparent outline-none border-2 transition-colors text-center",
            isActive ? "border-blue-500 bg-blue-50" : "border-transparent",
            isViruchka ? "text-green-800 font-semibold" : "text-gray-800",
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
                  <th
                    key={col.key}
                    className="border border-blue-900 px-1 py-1 text-white font-semibold text-center leading-tight"
                    style={{
                      width: col.width, minWidth: col.width,
                      backgroundColor:
                        col.key === "viruchka"                         ? "#166534" :
                        col.key === "prodBilety"                       ? "#1e3a5f" :
                        col.key === "podrVod" || col.key === "podrCond" ? "#7c3d0a" :
                        col.key === "podrVydVod" || col.key === "podrVydCond" ? "#14532d" :
                        col.key === "itogo"                            ? "#1a3a6b" : undefined,
                    }}
                    title={
                      col.key === "viruchka"    ? "Авто: Кол.бил × Стоимость проезда + Безнал + QR" :
                      col.key === "prodBilety"  ? "Авто: Выручка ÷ Стоимость проезда" :
                      col.key === "podrVod"     ? "Начислено из наряда" :
                      col.key === "podrCond"    ? "Начислено из наряда" :
                      col.key === "podrVydVod"  ? "Выдано вод. → Продажи + Ведомость" :
                      col.key === "podrVydCond" ? "Выдано конд. → Продажи + Ведомость" :
                      col.key === "itogo"       ? "Авто: Выручка−Безнал−QR−Обед−ДТ−Чек−Возврат−Подр.вод−Подр.конд+В плюс" :
                      col.key === "rashodDt"    ? "Ручной ввод → автоперенос в Продажи (ДТ)" : undefined
                    }
                  >
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