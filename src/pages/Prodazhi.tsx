import { useState, useEffect, useMemo } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useAppStore, getGrafiki } from "@/store/appStore";
import { calcPodrabotka } from "@/pages/dispatch/types";

const LS_PRODAZHI = "dat_prodazhi_v1";
const LS_KASSA    = "dat_kassa_v1";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadProdazhi(): Record<string, any> {
  try { const r = localStorage.getItem(LS_PRODAZHI); return r ? JSON.parse(r) : {}; } catch (e) { console.warn(e); return {}; }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveProdazhi(data: Record<string, any>): void {
  try { localStorage.setItem(LS_PRODAZHI, JSON.stringify(data)); } catch (e) { console.warn(e); }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadKassaForProdazhi(): Record<string, any> {
  try { const r = localStorage.getItem(LS_KASSA); return r ? JSON.parse(r) : {}; } catch (e) { console.warn(e); return {}; }
}

interface ProdazhiRow {
  id: number;
  bort: string;
  marGr: string;
  fioVod: string;
  fioCond: string;
  dt: string;
  reysy: string;
  kolBil: string;
  valid: string;
  qr: string;
  podVod: string;   // подработка водителя, ₽
  podCond: string;  // подработка кондуктора, ₽
}

type ColKey = keyof Omit<ProdazhiRow, "id">;

const COLUMNS: { key: ColKey; label: string; width: string; numeric?: boolean }[] = [
  { key: "marGr",   label: "Мар. Гр",         width: "70px"  },
  { key: "bort",    label: "Борт №",          width: "60px"  },
  { key: "fioVod",  label: "ФИО водителя",    width: "160px" },
  { key: "fioCond", label: "ФИО кондуктора",  width: "130px" },
  { key: "dt",      label: "ДТ",              width: "60px",  numeric: true },
  { key: "reysy",   label: "Рейсы",           width: "65px",  numeric: true },
  { key: "kolBil",  label: "Кол. бил",        width: "70px",  numeric: true },
  { key: "valid",   label: "Валид",           width: "65px",  numeric: true },
  { key: "qr",      label: "QR",              width: "60px",  numeric: true },
  { key: "podVod",  label: "Вод. подр., ₽",  width: "90px",  numeric: true },
  { key: "podCond", label: "Конд. подр., ₽", width: "90px",  numeric: true },
];

const uid = () => Math.random() * 1e15 + performance.now();
const emptyRow = (): ProdazhiRow => ({
  id: uid(),
  bort: "", marGr: "", fioVod: "", fioCond: "",
  dt: "", reysy: "", kolBil: "", valid: "", qr: "",
  podVod: "", podCond: "",
});

const OFF_STATUSES = ["вых", "отп", "рем"];
const toNum = (v: string) => parseFloat((v || "0").trim().replace(",", ".")) || 0;

const today = new Date().toLocaleDateString("ru-RU", {
  day: "2-digit", month: "2-digit", year: "numeric",
});

const toDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const Prodazhi = () => {
  const { weeklyNaryady, naryadSettings, employees, vehicles, routes } = useAppStore();
  const allGrafiki = routes.flatMap((r) => getGrafiki(r));

  const driverList = employees.filter((e) => e.dolzhnost === "Водитель"  && e.status === "active");
  const condList   = employees.filter((e) => e.dolzhnost === "Кондуктор" && e.status === "active");

  // Загрузка сохранённых данных
  const [allData, setAllData] = useState<Record<string, { rows: ProdazhiRow[]; dispFio: string }>>(() => loadProdazhi());

  const [selectedKey, setSelectedKey] = useState(() => toDateKey(new Date()));
  const [reportDate, setReportDate] = useState(today);

  // Диспетчер и строки — берём из сохранённых данных за выбранный день
  const [dispFio, setDispFio] = useState(() => allData[toDateKey(new Date())]?.dispFio ?? "");
  const [rows, setRows] = useState<ProdazhiRow[]>(() =>
    allData[toDateKey(new Date())]?.rows ?? Array.from({ length: 10 }, emptyRow)
  );

  // При смене даты — читаем свежие данные из localStorage (включая обновления из Кассы)
  useEffect(() => {
    const fresh = loadProdazhi()[selectedKey];
    setRows(fresh?.rows ?? Array.from({ length: 10 }, emptyRow));
    setDispFio(fresh?.dispFio ?? "");
   
  }, [selectedKey]);

  // Сохранение при каждом изменении строк или диспетчера
  useEffect(() => {
    setAllData((prev) => {
      const updated = { ...prev, [selectedKey]: { rows, dispFio } };
      saveProdazhi(updated);
      return updated;
    });
  }, [rows, dispFio, selectedKey]);

  // Читает из Кассы: ДТ, выданная подработка, продБилеты → kolBil
  const applyFromKassa = (key: string) => {
    const kassaData = loadKassaForProdazhi()[key];
    if (!kassaData?.rows) return;
    const cenaTopliva = parseFloat(naryadSettings.stoimostTopliva) || 0;

    type KassaRowMin = {
      bort?: string; rashodDt?: string;
      podrVydVod?: string; podrVydCond?: string;
      prodBilety?: string;
    };
    const byBort = new Map<string, { dt?: string; podVod?: string; podCond?: string; kolBil?: string }>();

    (kassaData.rows as KassaRowMin[]).forEach((r) => {
      if (!r.bort) return;
      const entry: { dt?: string; podVod?: string; podCond?: string; kolBil?: string } = {};
      if (r.rashodDt && parseFloat(r.rashodDt) > 0 && cenaTopliva > 0) {
        entry.dt = String(Math.round(parseFloat(r.rashodDt) / cenaTopliva * 100) / 100);
      }
      // Выданная подработка (не начисленная)
      if (r.podrVydVod  && parseFloat(r.podrVydVod)  > 0) entry.podVod  = r.podrVydVod;
      if (r.podrVydCond && parseFloat(r.podrVydCond) > 0) entry.podCond = r.podrVydCond;
      // Проданные билеты из кассы → Кол. бил в Продажах
      if (r.prodBilety && parseFloat(r.prodBilety) > 0) entry.kolBil = r.prodBilety;
      if (Object.keys(entry).length > 0) byBort.set(r.bort, entry);
    });

    if (byBort.size === 0) return;
    setRows((prev) => prev.map((r) => {
      const kassa = byBort.get(r.bort);
      if (!kassa) return r;
      return {
        ...r,
        ...(kassa.dt     !== undefined ? { dt:     kassa.dt }     : {}),
        ...(kassa.podVod !== undefined ? { podVod: kassa.podVod } : {}),
        ...(kassa.podCond!== undefined ? { podCond:kassa.podCond} : {}),
        ...(kassa.kolBil !== undefined ? { kolBil: kassa.kolBil } : {}),
      };
    }));
  };

  // При смене даты и при изменении стоимости топлива
  useEffect(() => {
    applyFromKassa(selectedKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, naryadSettings.stoimostTopliva]);

  // При изменении Кассы (storage event — в той же и в других вкладках)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KASSA) applyFromKassa(selectedKey);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);
  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);

  // Строки наряда за выбранный день
  const naryadRows = useMemo(() => weeklyNaryady[selectedKey] ?? [], [weeklyNaryady, selectedKey]);

  // Синхронизация из наряда: только работающие экипажи (без статуса отсутствия)
  useEffect(() => {
    if (!naryadRows.length) return;
    setRows((currentRows) => {
      const existingByBort = new Map(currentRows.map((r) => [r.bort, r]));
      // Фильтруем: только с ФИО и без статуса отсутствия
      const workingRows = naryadRows.filter((r) => r.fio && !r.statusOtsutstviya);
      return workingRows.map((r) => {
        const existing = existingByBort.get(r.bortovoy);
        const calc = calcPodrabotka(r as Parameters<typeof calcPodrabotka>[0], naryadSettings);
        return {
          ...(existing ?? emptyRow()),
          bort:    r.bortovoy,
          marGr:   r.marshrut,
          fioVod:  r.fio,
          fioCond: r.fioKond || "без",
          kolBil:  r.biletov || (existing?.kolBil ?? ""),
          podVod:  calc && calc.vod  > 0 ? String(Math.round(calc.vod))  : (existing?.podVod  ?? ""),
          podCond: calc && calc.cond > 0 ? String(Math.round(calc.cond)) : (existing?.podCond ?? ""),
        };
      });
    });
  }, [naryadRows, naryadSettings]);

  const updateCell = (id: number, col: ColKey, value: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [col]: value } : r)));

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const deleteRow = (id: number) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    if (e.key !== "Tab" && e.key !== "Enter") return;
    e.preventDefault();
    const editCols = COLUMNS.filter((c) => c.key !== "fioVod" && c.key !== "fioCond" && c.key !== "bort" && c.key !== "marGr");
    if (colIdx + 1 < COLUMNS.length) {
      setActiveCell({ rowId: rows[rowIdx].id, col: COLUMNS[colIdx + 1].key });
    } else if (rowIdx + 1 < rows.length) {
      setActiveCell({ rowId: rows[rowIdx + 1].id, col: COLUMNS[0].key });
    } else {
      addRow();
      setTimeout(() => setActiveCell({ rowId: rows[rows.length - 1]?.id, col: COLUMNS[0].key }), 0);
    }
  };

  const numericCols = COLUMNS.filter((c) => c.numeric).map((c) => c.key);
  const getSum = (col: ColKey) =>
    rows.reduce((acc, r) => acc + toNum(r[col] as string), 0);

  // Статистика
  const vsegoVyshlo = rows.filter((r) => r.fioVod && !OFF_STATUSES.includes(r.marGr)).length;
  const vsegoVykhod = rows.filter((r) => OFF_STATUSES.includes(r.marGr)).length;

  // datalist ids
  const vodFioList  = "vod-fio-list";
  const condFioList = "cond-fio-list";
  const bortList    = "bort-list";
  const grafikList  = "prodazhi-grafik-list";

  const renderCell = (row: ProdazhiRow, col: typeof COLUMNS[number], rowIdx: number, colIdx: number) => {
    const isActive = activeCell?.rowId === row.id && activeCell?.col === col.key;
    const isOff = OFF_STATUSES.includes(row.marGr);

    // ФИО водителя — с datalist
    if (col.key === "fioVod") {
      return (
        <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
          <input
            type="text"
            list={vodFioList}
            value={row.fioVod}
            onChange={(e) => updateCell(row.id, "fioVod", e.target.value)}
            onFocus={() => setActiveCell({ rowId: row.id, col: col.key })}
            onBlur={() => setActiveCell(null)}
            onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
            className={`w-full h-6 px-1 text-xs text-gray-800 bg-transparent outline-none border-2 ${isActive ? "border-blue-500 bg-blue-50" : "border-transparent"} transition-colors`}
            placeholder="—"
          />
        </td>
      );
    }
    // ФИО кондуктора — с datalist
    if (col.key === "fioCond") {
      return (
        <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
          <input
            type="text"
            list={condFioList}
            value={row.fioCond}
            onChange={(e) => updateCell(row.id, "fioCond", e.target.value)}
            onFocus={() => setActiveCell({ rowId: row.id, col: col.key })}
            onBlur={() => setActiveCell(null)}
            onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
            className={`w-full h-6 px-1 text-xs text-gray-800 bg-transparent outline-none border-2 ${isActive ? "border-blue-500 bg-blue-50" : "border-transparent"} transition-colors`}
            placeholder="без"
          />
        </td>
      );
    }
    // Маршрут/График — с datalist
    if (col.key === "marGr") {
      return (
        <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
          <input
            type="text"
            list={grafikList}
            value={row.marGr}
            onChange={(e) => updateCell(row.id, "marGr", e.target.value)}
            onFocus={() => setActiveCell({ rowId: row.id, col: col.key })}
            onBlur={() => setActiveCell(null)}
            onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
            className={`w-full h-6 px-1 text-xs text-gray-800 bg-transparent outline-none border-2 ${isActive ? "border-blue-500 bg-blue-50" : "border-transparent"} transition-colors text-center`}
            placeholder="1/1"
          />
        </td>
      );
    }
    // Борт — с datalist
    if (col.key === "bort") {
      return (
        <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
          <input
            type="text"
            list={bortList}
            value={row.bort}
            onChange={(e) => updateCell(row.id, "bort", e.target.value)}
            onFocus={() => setActiveCell({ rowId: row.id, col: col.key })}
            onBlur={() => setActiveCell(null)}
            onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
            className={`w-full h-6 px-1 text-xs font-bold text-blue-800 bg-transparent outline-none border-2 ${isActive ? "border-blue-500 bg-blue-50" : "border-transparent"} transition-colors text-center`}
            placeholder="—"
          />
        </td>
      );
    }

    const isPod = col.key === "podVod" || col.key === "podCond";
    return (
      <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width, background: isPod ? "#fff8f0" : undefined }}>
        <input
          type="text"
          value={row[col.key] as string}
          onChange={(e) => updateCell(row.id, col.key, e.target.value)}
          onFocus={() => setActiveCell({ rowId: row.id, col: col.key })}
          onBlur={() => setActiveCell(null)}
          onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
          disabled={isOff && (col.key === "dt" || col.key === "reysy" || col.key === "kolBil" || col.key === "valid" || col.key === "qr")}
          className={[
            "w-full h-6 px-1 text-xs bg-transparent outline-none border-2 transition-colors text-center",
            isActive ? "border-blue-500 bg-blue-50" : "border-transparent",
            isPod ? "text-orange-700 font-semibold" : "text-gray-800",
            isOff ? "text-gray-400" : "",
          ].join(" ")}
          placeholder=""
        />
      </td>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Продажи" />

      {/* datalists */}
      <datalist id={vodFioList}>
        <option value="без" />
        {driverList.map((e) => <option key={e.id} value={e.fio} />)}
      </datalist>
      <datalist id={condFioList}>
        <option value="без" />
        {condList.map((e) => <option key={e.id} value={e.fio} />)}
      </datalist>
      <datalist id={bortList}>
        {vehicles.map((v) => <option key={v.id} value={v.bortovoy}>{v.bortovoy} {v.marka}</option>)}
      </datalist>
      <datalist id={grafikList}>
        <option value="вых" />
        <option value="отп" />
        <option value="рем" />
        {allGrafiki.map((g) => <option key={g} value={g} />)}
      </datalist>

      <div className="px-4 py-4 max-w-[1200px] mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm">

          {/* Шапка */}
          <div className="border-b border-gray-300 px-5 py-3 flex items-center justify-between print:hidden">
            <div>
              <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Продажи / Выходы на линию</h1>
              <p className="text-xs text-gray-500 mt-0.5">ООО «Дальавтотранс» · {today}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={addRow} className="flex items-center gap-1.5 px-2 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                <Icon name="Plus" size={12} /> Строка
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-1.5 px-2 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                <Icon name="Printer" size={12} /> Печать
              </button>
            </div>
          </div>

          {/* Дата отчёта */}
          <div className="px-5 py-2 border-b border-gray-200 flex items-center gap-4 text-xs text-gray-600">
            <span className="font-semibold">Дата:</span>
            <input
              type="date"
              value={selectedKey}
              onChange={(e) => {
                setSelectedKey(e.target.value);
                setReportDate(e.target.value
                  ? new Date(e.target.value + "T00:00:00").toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
                  : today);
              }}
              className="border border-gray-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-400"
            />
            {naryadRows.length > 0 && (
              <span className="text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded flex items-center gap-1">
                <Icon name="RefreshCw" size={10} />
                Синхронизировано из наряда ({naryadRows.length} ТС)
              </span>
            )}
          </div>

          {/* Таблица */}
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
                  const rowBg = isOff
                    ? "#f5f5f0"
                    : rowIdx % 2 === 0 ? "#ffffff" : "#eff6ff";
                  return (
                    <tr key={row.id} style={{ backgroundColor: rowBg }}>
                      <td className="border border-gray-300 text-center text-gray-400 select-none" style={{ width: "28px" }}>
                        {rowIdx + 1}
                      </td>
                      {COLUMNS.map((col, colIdx) => renderCell(row, col, rowIdx, colIdx))}
                      <td className="border border-gray-300 text-center print:hidden" style={{ width: "22px" }}>
                        <button onClick={() => deleteRow(row.id)} className="text-gray-300 hover:text-red-500 p-0.5">
                          <Icon name="X" size={11} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Итоговая строка */}
              <tfoot>
                <tr style={{ backgroundColor: "#1a3a6b" }}>
                  <td className="border border-blue-900 px-1 py-1.5 text-center text-white font-bold text-xs" colSpan={2}>
                    Σ
                  </td>
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

          {/* Подвал: статистика + диспетчер */}
          <div className="border-t border-gray-300 px-5 py-3 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4 text-gray-600">
              <span>Вышло на линию: <b className="text-gray-800">{vsegoVyshlo}</b></span>
              <span>Вых/Отп/Рем: <b className="text-gray-800">{vsegoVykhod}</b></span>
              <span className="text-gray-400 print:hidden">Tab / Enter — переход</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-semibold">Диспетчер:</span>
              <input
                type="text"
                list={vodFioList}
                value={dispFio}
                onChange={(e) => setDispFio(e.target.value)}
                placeholder="ФИО диспетчера"
                className="border border-gray-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-400 w-40"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prodazhi;