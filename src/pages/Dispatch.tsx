import { useState } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";

type EkipazType = "bez" | "s" | "";

interface NaryadRow {
  id: number;
  bortovoy: string;
  fio: string;
  garazhny: string;
  putevoy: string;
  // подработка
  podrabotka: boolean;
  biletov: string;
  ekipazh: EkipazType;
}

interface NormaSettings {
  stoimostBileta: string;
  stoimostTopliva: string;
  rashod: string;
  procentBez: string;
  procentVodS: string;
  procentCondS: string;
}

const emptyRow = (): NaryadRow => ({
  id: Date.now() + Math.random(),
  bortovoy: "",
  fio: "",
  garazhny: "",
  putevoy: "",
  podrabotka: false,
  biletov: "",
  ekipazh: "",
});

const DEFAULT_SETTINGS: NormaSettings = {
  stoimostBileta: "40",
  stoimostTopliva: "75",
  rashod: "30",
  procentBez: "37",
  procentVodS: "22",
  procentCondS: "15",
};

const TEXT_COLS = [
  { key: "bortovoy", label: "Бортовой №", width: "120px" },
  { key: "fio",      label: "ФИО водителя", width: "220px" },
  { key: "garazhny", label: "Гаражный №",  width: "110px" },
  { key: "putevoy",  label: "Путевой лист", width: "140px" },
] as const;

function calcPodrabotka(row: NaryadRow, s: NormaSettings): { vod: number; cond: number } | null {
  if (!row.podrabotka || !row.biletov || !row.ekipazh) return null;
  const bilety = parseFloat(row.biletov) || 0;
  const cena = parseFloat(s.stoimostBileta) || 0;
  const toplivoRub = (parseFloat(s.rashod) / 100) * bilety * (parseFloat(s.stoimostTopliva) || 0);
  const vyuchka = bilety * cena - toplivoRub;
  if (row.ekipazh === "bez") {
    return { vod: vyuchka * (parseFloat(s.procentBez) / 100), cond: 0 };
  }
  return {
    vod:  vyuchka * (parseFloat(s.procentVodS)  / 100),
    cond: vyuchka * (parseFloat(s.procentCondS) / 100),
  };
}

const fmt = (n: number) =>
  n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Dispatch = () => {
  const today = new Date().toLocaleDateString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  const [rows, setRows] = useState<NaryadRow[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);
  const [settings, setSettings] = useState<NormaSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);

  const updateCell = (id: number, col: keyof NaryadRow, value: string | boolean | EkipazType) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [col]: value } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const deleteRow = (id: number) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      if (colIdx + 1 < TEXT_COLS.length) {
        setActiveCell({ rowId: rows[rowIdx].id, col: TEXT_COLS[colIdx + 1].key });
      } else if (rowIdx + 1 < rows.length) {
        setActiveCell({ rowId: rows[rowIdx + 1].id, col: TEXT_COLS[0].key });
      } else {
        addRow();
        setTimeout(() => {
          setActiveCell({ rowId: rows[rows.length - 1]?.id, col: TEXT_COLS[0].key });
        }, 0);
      }
    }
  };

  const setSetting = (key: keyof NormaSettings, val: string) =>
    setSettings((prev) => ({ ...prev, [key]: val }));

  const podrabotkaRows = rows.filter((r) => r.podrabotka);
  const totalVod  = podrabotkaRows.reduce((s, r) => s + (calcPodrabotka(r, settings)?.vod  ?? 0), 0);
  const totalCond = podrabotkaRows.reduce((s, r) => s + (calcPodrabotka(r, settings)?.cond ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Наряд на работу" />

      <div className="px-6 py-6 max-w-7xl mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm mb-4">
          {/* Header */}
          <div className="border-b border-gray-300 px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Наряд на работу</h1>
              <p className="text-sm text-gray-500 mt-0.5">Дальавтотранс · {today}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${
                  showSettings ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Icon name="Settings" size={14} />
                Нормативы
              </button>
              <button
                onClick={addRow}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Icon name="Plus" size={14} />
                Добавить строку
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Icon name="Printer" size={14} />
                Печать
              </button>
            </div>
          </div>

          {/* Нормативы */}
          {showSettings && (
            <div className="border-b border-gray-300 px-6 py-4 bg-amber-50">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">Нормативы для расчёта подработки</p>
              <div className="flex flex-wrap gap-4">
                {[
                  { key: "stoimostBileta", label: "Стоимость билета, ₽" },
                  { key: "stoimostTopliva", label: "Стоимость топлива, ₽/л" },
                  { key: "rashod", label: "Расход топлива, л/100км" },
                  { key: "procentBez", label: "% водителя без кондуктора" },
                  { key: "procentVodS", label: "% водителя с кондуктором" },
                  { key: "procentCondS", label: "% кондуктора" },
                ].map((f) => (
                  <div key={f.key} className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">{f.label}</label>
                    <input
                      type="text"
                      value={settings[f.key as keyof NormaSettings]}
                      onChange={(e) => setSetting(f.key as keyof NormaSettings, e.target.value)}
                      className="w-28 px-2 py-1 text-sm border border-amber-300 rounded focus:outline-none focus:border-amber-500 text-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="border-collapse text-xs" style={{ minWidth: "900px" }}>
              <thead>
                <tr style={{ backgroundColor: "#1a3a6b" }}>
                  <th className="border border-blue-900 px-1 py-2 text-white text-center" style={{ width: "28px" }}>№</th>
                  {TEXT_COLS.map((col) => (
                    <th key={col.key} className="border border-blue-900 px-2 py-2 text-white font-semibold text-left" style={{ width: col.width, minWidth: col.width }}>
                      {col.label}
                    </th>
                  ))}
                  {/* Подработка */}
                  <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "80px" }}>
                    Подработка
                  </th>
                  <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "90px" }}>
                    Билетов
                  </th>
                  <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "120px" }}>
                    Экипаж
                  </th>
                  <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "110px" }}>
                    Водитель, ₽
                  </th>
                  <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "110px" }}>
                    Кондуктор, ₽
                  </th>
                  <th className="border border-blue-900 px-1 py-2" style={{ width: "28px" }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => {
                  const calc = calcPodrabotka(row, settings);
                  return (
                    <tr key={row.id} className={rowIdx % 2 === 0 ? "bg-white" : "bg-blue-50/40"}>
                      <td className="border border-gray-300 text-center text-gray-400 select-none" style={{ width: "28px" }}>{rowIdx + 1}</td>

                      {TEXT_COLS.map((col, colIdx) => {
                        const isActive = activeCell?.rowId === row.id && activeCell?.col === col.key;
                        return (
                          <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
                            <input
                              type="text"
                              value={row[col.key as keyof NaryadRow] as string}
                              onChange={(e) => updateCell(row.id, col.key as keyof NaryadRow, e.target.value)}
                              onFocus={() => setActiveCell({ rowId: row.id, col: col.key })}
                              onBlur={() => setActiveCell(null)}
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

                      {/* Подработка — чекбокс */}
                      <td className="border border-gray-300 text-center" style={{ width: "80px" }}>
                        <input
                          type="checkbox"
                          checked={row.podrabotka}
                          onChange={(e) => updateCell(row.id, "podrabotka", e.target.checked)}
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
                        />
                      </td>

                      {/* Кол-во билетов */}
                      <td className="border border-gray-300 p-0" style={{ width: "90px" }}>
                        {row.podrabotka ? (
                          <input
                            type="text"
                            value={row.biletov}
                            onChange={(e) => updateCell(row.id, "biletov", e.target.value)}
                            className="w-full h-7 px-2 text-gray-800 bg-transparent outline-none border-2 border-transparent focus:border-blue-500 focus:bg-blue-50 transition-colors text-center"
                            placeholder="0"
                          />
                        ) : (
                          <span className="block text-center text-gray-300 select-none">—</span>
                        )}
                      </td>

                      {/* Тип экипажа */}
                      <td className="border border-gray-300 p-0 text-center" style={{ width: "120px" }}>
                        {row.podrabotka ? (
                          <select
                            value={row.ekipazh}
                            onChange={(e) => updateCell(row.id, "ekipazh", e.target.value as EkipazType)}
                            className="w-full h-7 px-1 text-xs text-gray-800 bg-transparent outline-none border-0 cursor-pointer"
                          >
                            <option value="">— выбрать —</option>
                            <option value="bez">Без кондуктора</option>
                            <option value="s">С кондуктором</option>
                          </select>
                        ) : (
                          <span className="block text-center text-gray-300 select-none">—</span>
                        )}
                      </td>

                      {/* Сумма водителю */}
                      <td className="border border-gray-300 text-center text-xs font-semibold" style={{ width: "110px" }}>
                        {calc !== null ? (
                          <span className="text-green-700">{fmt(calc.vod)}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Сумма кондуктору */}
                      <td className="border border-gray-300 text-center text-xs font-semibold" style={{ width: "110px" }}>
                        {calc !== null && row.ekipazh === "s" ? (
                          <span className="text-green-700">{fmt(calc.cond)}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

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
              {podrabotkaRows.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-100 font-semibold text-xs">
                    <td colSpan={TEXT_COLS.length + 4} className="border border-gray-300 px-3 py-1.5 text-right text-gray-600">
                      Итого подработка:
                    </td>
                    <td className="border border-gray-300 text-center text-green-700">{fmt(totalVod)}</td>
                    <td className="border border-gray-300 text-center text-green-700">{totalCond > 0 ? fmt(totalCond) : "—"}</td>
                    <td className="border border-gray-300"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <div className="border-t border-gray-300 px-6 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-400">
            <span>Строк: {rows.length} · Подработка: {podrabotkaRows.length}</span>
            <span>Tab / Enter — переход между ячейками</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dispatch;
