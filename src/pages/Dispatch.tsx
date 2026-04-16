import { useState } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import PutevoyList, { PutevoyData } from "@/components/PutevoyList";

interface NaryadRow {
  id: number;
  bortovoy: string;
  fio: string;
  fioKond: string;
  garazhny: string;
  putevoy: string;
  podrabotka: boolean;
  biletov: string;
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
  fioKond: "",
  garazhny: "",
  putevoy: "",
  podrabotka: false,
  biletov: "",
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
  { key: "bortovoy", label: "Бортовой №",     width: "120px" },
  { key: "fio",      label: "ФИО водителя",   width: "200px" },
  { key: "fioKond",  label: "ФИО кондуктора", width: "200px" },
  { key: "garazhny", label: "Гаражный №",     width: "110px" },
  { key: "putevoy",  label: "Путевой лист",   width: "140px" },
] as const;

function calcPodrabotka(row: NaryadRow, s: NormaSettings): { vod: number; cond: number } | null {
  if (!row.podrabotka || !row.biletov) return null;
  const bilety = parseFloat(row.biletov) || 0;
  const cena = parseFloat(s.stoimostBileta) || 0;
  const toplivoRub = (parseFloat(s.rashod) / 100) * bilety * (parseFloat(s.stoimostTopliva) || 0);
  const vyuchka = bilety * cena - toplivoRub;
  const hasCond = row.fioKond.trim().length > 0;
  if (!hasCond) {
    return { vod: vyuchka * (parseFloat(s.procentBez) / 100), cond: 0 };
  }
  return {
    vod:  vyuchka * (parseFloat(s.procentVodS)  / 100),
    cond: vyuchka * (parseFloat(s.procentCondS) / 100),
  };
}

const fmt = (n: number) =>
  n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const emptyPutevoyExtra = (): Partial<PutevoyData> => ({
  orgNazvanie: "ООО «Дальавтотранс»",
  orgAdres: "",
  orgTelefon: "",
  orgInn: "",
  marka: "",
  gos: "",
  marshrut: "",
  vodUdostVerenie: "",
  vodKategoria: "D",
  odometrVyezd: "",
  odometrVozv: "",
  toplivoMarka: "ДТ",
  toplivoVydano: "",
  toplivoOstVyezd: "",
  toplivoOstVozv: "",
  vremyaVyezdPlan: "",
  vremyaVozvPlan: "",
  vremyaVyezdFakt: "",
  vremyaVozvFakt: "",
  medDopusk: "",
  medPodpis: "",
  tehDopusk: "",
  tehPodpis: "",
  dispFio: "",
  dispPodpis: "",
});

// Модал заполнения путевого листа
const PutevoyModal = ({
  row,
  today,
  onClose,
}: {
  row: NaryadRow;
  today: string;
  onClose: () => void;
}) => {
  const [extra, setExtra] = useState<Partial<PutevoyData>>(emptyPutevoyExtra());
  const [showPrint, setShowPrint] = useState(false);

  const set = (key: keyof PutevoyData, val: string) =>
    setExtra((prev) => ({ ...prev, [key]: val }));

  const putevoyData: PutevoyData = {
    orgNazvanie:       extra.orgNazvanie     ?? "ООО «Дальавтотранс»",
    orgAdres:          extra.orgAdres        ?? "",
    orgTelefon:        extra.orgTelefon      ?? "",
    orgInn:            extra.orgInn          ?? "",
    nomer:             row.putevoy           || row.id.toString().slice(-4),
    data:              today,
    marka:             extra.marka           ?? "",
    gos:               extra.gos             ?? "",
    bortovoy:          row.bortovoy,
    garazhny:          row.garazhny,
    marshrut:          extra.marshrut        ?? "",
    vodFio:            row.fio,
    vodUdostVerenie:   extra.vodUdostVerenie ?? "",
    vodKategoria:      extra.vodKategoria    ?? "D",
    kondFio:           row.fioKond,
    odometrVyezd:      extra.odometrVyezd    ?? "",
    odometrVozv:       extra.odometrVozv     ?? "",
    toplivoMarka:      extra.toplivoMarka    ?? "ДТ",
    toplivoVydano:     extra.toplivoVydano   ?? "",
    toplivoOstVyezd:   extra.toplivoOstVyezd ?? "",
    toplivoOstVozv:    extra.toplivoOstVozv  ?? "",
    vremyaVyezdPlan:   extra.vremyaVyezdPlan ?? "",
    vremyaVozvPlan:    extra.vremyaVozvPlan  ?? "",
    vremyaVyezdFakt:   extra.vremyaVyezdFakt ?? "",
    vremyaVozvFakt:    extra.vremyaVozvFakt  ?? "",
    medDopusk:         extra.medDopusk       ?? "",
    medPodpis:         extra.medPodpis       ?? "",
    tehDopusk:         extra.tehDopusk       ?? "",
    tehPodpis:         extra.tehPodpis       ?? "",
    dispFio:           extra.dispFio         ?? "",
    dispPodpis:        extra.dispPodpis      ?? "",
  };

  if (showPrint) {
    return <PutevoyList data={putevoyData} onClose={() => setShowPrint(false)} />;
  }

  const F = ({ label, k, placeholder }: { label: string; k: keyof PutevoyData; placeholder?: string }) => (
    <div className="flex flex-col gap-0.5">
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type="text"
        value={(extra[k] as string) ?? ""}
        onChange={(e) => set(k, e.target.value)}
        placeholder={placeholder}
        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50 rounded-t-lg sticky top-0">
          <div>
            <span className="font-semibold text-gray-800">Путевой лист</span>
            <span className="text-gray-500 text-sm ml-2">— {row.fio || "водитель"}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Авто-заполненные поля */}
          <div className="bg-blue-50 rounded p-3 text-xs text-blue-700 space-y-0.5">
            <div>Водитель: <b>{row.fio || "—"}</b></div>
            {row.fioKond && <div>Кондуктор: <b>{row.fioKond}</b></div>}
            <div>Бортовой: <b>{row.bortovoy || "—"}</b> · Гаражный: <b>{row.garazhny || "—"}</b></div>
            <div>Путевой лист №: <b>{row.putevoy || "—"}</b> · Дата: <b>{today}</b></div>
          </div>

          {/* Организация */}
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Организация</div>
            <div className="grid grid-cols-2 gap-2">
              <F label="Название" k="orgNazvanie" />
              <F label="ИНН" k="orgInn" />
              <F label="Адрес" k="orgAdres" />
              <F label="Телефон" k="orgTelefon" />
            </div>
          </div>

          {/* ТС */}
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Транспортное средство</div>
            <div className="grid grid-cols-2 gap-2">
              <F label="Марка, модель" k="marka" placeholder="ПАЗ 3205, ЛиАЗ 5292..." />
              <F label="Гос. рег. знак" k="gos" placeholder="А 000 АА 000" />
            </div>
          </div>

          {/* Маршрут и водитель */}
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Маршрут и водитель</div>
            <div className="grid grid-cols-2 gap-2">
              <F label="Маршрут (№ и наименование)" k="marshrut" placeholder="№1 Вокзал — Рынок" />
              <F label="Удостоверение водителя №" k="vodUdostVerenie" />
              <F label="Категория ТС" k="vodKategoria" placeholder="D" />
            </div>
          </div>

          {/* Одометр */}
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Одометр (км)</div>
            <div className="grid grid-cols-2 gap-2">
              <F label="При выезде из гаража" k="odometrVyezd" placeholder="000000" />
              <F label="При возврате в гараж" k="odometrVozv" placeholder="000000" />
            </div>
          </div>

          {/* Топливо */}
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Топливо</div>
            <div className="grid grid-cols-2 gap-2">
              <F label="Марка топлива" k="toplivoMarka" placeholder="ДТ" />
              <F label="Выдано (л)" k="toplivoVydano" />
              <F label="Остаток при выезде (л)" k="toplivoOstVyezd" />
              <F label="Остаток при возврате (л)" k="toplivoOstVozv" />
            </div>
          </div>

          {/* Время */}
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Время работы</div>
            <div className="grid grid-cols-2 gap-2">
              <F label="Выезд (план)" k="vremyaVyezdPlan" placeholder="06:00" />
              <F label="Возврат (план)" k="vremyaVozvPlan" placeholder="22:00" />
              <F label="Выезд (факт)" k="vremyaVyezdFakt" placeholder="06:05" />
              <F label="Возврат (факт)" k="vremyaVozvFakt" placeholder="21:55" />
            </div>
          </div>

          {/* Медосмотр и тех */}
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Допуски</div>
            <div className="grid grid-cols-2 gap-2">
              <F label="Мед. осмотр — дата и время" k="medDopusk" placeholder="16.04.2026 05:40" />
              <F label="Мед. работник (подпись/ФИО)" k="medPodpis" />
              <F label="Тех. контроль — дата и время" k="tehDopusk" placeholder="16.04.2026 05:50" />
              <F label="Контролёр (подпись/ФИО)" k="tehPodpis" />
            </div>
          </div>

          {/* Диспетчер */}
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Диспетчер</div>
            <div className="grid grid-cols-2 gap-2">
              <F label="ФИО диспетчера" k="dispFio" />
              <F label="Подпись (ФИО для печати)" k="dispPodpis" />
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t bg-gray-50 rounded-b-lg flex justify-end gap-2 sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
            Отмена
          </button>
          <button
            onClick={() => setShowPrint(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Icon name="FileText" size={14} />
            Предпросмотр и печать
          </button>
        </div>
      </div>
    </div>
  );
};

const Dispatch = () => {
  const today = new Date().toLocaleDateString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  const [rows, setRows] = useState<NaryadRow[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);
  const [settings, setSettings] = useState<NormaSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [putevoyRow, setPutevoyRow] = useState<NaryadRow | null>(null);

  const updateCell = (id: number, col: keyof NaryadRow, value: string | boolean) => {
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

      {putevoyRow && (
        <PutevoyModal
          row={putevoyRow}
          today={today}
          onClose={() => setPutevoyRow(null)}
        />
      )}

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
                Печать наряда
              </button>
            </div>
          </div>

          {/* Нормативы */}
          {showSettings && (
            <div className="border-b border-gray-300 px-6 py-4 bg-amber-50">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">Нормативы для расчёта подработки</p>
              <div className="flex flex-wrap gap-4">
                {[
                  { key: "stoimostBileta",  label: "Стоимость билета, ₽"       },
                  { key: "stoimostTopliva", label: "Стоимость топлива, ₽/л"    },
                  { key: "rashod",          label: "Расход топлива, л/100км"   },
                  { key: "procentBez",      label: "% водителя без кондуктора" },
                  { key: "procentVodS",     label: "% водителя с кондуктором"  },
                  { key: "procentCondS",    label: "% кондуктора"              },
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
            <table className="border-collapse text-xs" style={{ minWidth: "1000px" }}>
              <thead>
                <tr style={{ backgroundColor: "#1a3a6b" }}>
                  <th className="border border-blue-900 px-1 py-2 text-white text-center" style={{ width: "28px" }}>№</th>
                  {TEXT_COLS.map((col) => (
                    <th key={col.key} className="border border-blue-900 px-2 py-2 text-white font-semibold text-left" style={{ width: col.width, minWidth: col.width }}>
                      {col.label}
                    </th>
                  ))}
                  <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "80px" }}>Подработка</th>
                  <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "90px" }}>Билетов</th>
                  <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "110px" }}>Водитель, ₽</th>
                  <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "110px" }}>Кондуктор, ₽</th>
                  <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "90px" }}>Путевой</th>
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

                      <td className="border border-gray-300 text-center" style={{ width: "80px" }}>
                        <input
                          type="checkbox"
                          checked={row.podrabotka}
                          onChange={(e) => updateCell(row.id, "podrabotka", e.target.checked)}
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
                        />
                      </td>

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

                      <td className="border border-gray-300 text-center text-xs font-semibold" style={{ width: "110px" }}>
                        {calc !== null ? (
                          <span className="text-green-700">{fmt(calc.vod)}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      <td className="border border-gray-300 text-center text-xs font-semibold" style={{ width: "110px" }}>
                        {calc !== null && row.fioKond.trim().length > 0 ? (
                          <span className="text-green-700">{fmt(calc.cond)}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Кнопка путевого листа */}
                      <td className="border border-gray-300 text-center" style={{ width: "90px" }}>
                        <button
                          onClick={() => setPutevoyRow(row)}
                          title="Открыть путевой лист"
                          className="flex items-center gap-1 mx-auto px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          <Icon name="FileText" size={11} />
                          Лист
                        </button>
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

              {podrabotkaRows.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-100 font-semibold text-xs">
                    <td colSpan={TEXT_COLS.length + 4} className="border border-gray-300 px-3 py-1.5 text-right text-gray-600">
                      Итого подработка:
                    </td>
                    <td className="border border-gray-300 text-center text-green-700">{fmt(totalVod)}</td>
                    <td className="border border-gray-300 text-center text-green-700">{totalCond > 0 ? fmt(totalCond) : "—"}</td>
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
        </div>
      </div>
    </div>
  );
};

export default Dispatch;
