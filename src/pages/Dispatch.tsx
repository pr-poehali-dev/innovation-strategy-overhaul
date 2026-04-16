import { useEffect, useCallback, useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useAppStore, NaryadEntry, NaryadRowStore, Route, emptyDayMeta, DayMeta } from "@/store/appStore";
import { NaryadRow, NormaSettings, calcPodrabotka } from "./dispatch/types";
import NormaPanel from "./dispatch/NormaPanel";
import PutevoyModal from "./dispatch/PutevoyModal";
import NaryadTable from "./dispatch/NaryadTable";
import JurnalMed from "./dispatch/JurnalMed";
import JurnalVypusk from "./dispatch/JurnalVypusk";

// ─── Утилиты дат ────────────────────────────────────────────────────────────
const toDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const toDisplayDate = (d: Date): string =>
  d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

const toMonthYear = (d: Date): string =>
  d.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

const DAY_NAMES = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

const getWeekMonday = (base: Date): Date => {
  const d = new Date(base);
  const dow = d.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getWeekDays = (monday: Date): Date[] =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

const toNaryadRow = (r: NaryadRowStore): NaryadRow => r as unknown as NaryadRow;
const uid = () => Math.random() * 1e15 + performance.now();

const makeEmptyRow = (): NaryadRowStore => ({
  id: uid(),
  vehicleId: null, bortovoy: "", gos: "", marka: "",
  marshrut: "", fio: "", fioKond: "",
  putevoy: "", terminal: "", podrabotka: false, biletov: "", statusOtsutstviya: "", dtp: false,
});

const makeRowsFromRoutes = (routes: Route[]): NaryadRowStore[] => {
  const sorted = [...routes].sort((a, b) => Number(a.nomer) - Number(b.nomer));
  const rows: NaryadRowStore[] = [];
  sorted.forEach((route) => {
    for (let i = 1; i <= route.grafikov; i++) {
      rows.push({ ...makeEmptyRow(), marshrut: `${route.nomer}/${i}` });
    }
  });
  return rows.length > 0 ? rows : [makeEmptyRow(), makeEmptyRow(), makeEmptyRow()];
};

type TabType = "narad" | "med" | "vypusk";

// ─── Панель дежурных ────────────────────────────────────────────────────────
const DayMetaPanel = ({
  meta, onChange,
}: {
  meta: DayMeta;
  onChange: (partial: Partial<DayMeta>) => void;
}) => {
  const { employees } = useAppStore();
  const disp = useMemo(() => employees.filter((e) => e.dolzhnost === "Диспетчер"          && e.status === "active"), [employees]);
  const mekh = useMemo(() => employees.filter((e) => e.dolzhnost === "Механик по выпуску" && e.status === "active"), [employees]);
  const med  = useMemo(() => employees.filter((e) => e.dolzhnost === "Медик"              && e.status === "active"), [employees]);

  const Sel = ({ label, field, opts }: { label: string; field: keyof DayMeta; opts: { fio: string }[] }) => (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-500 whitespace-nowrap">{label}:</span>
      <select
        value={meta[field]}
        onChange={(e) => onChange({ [field]: e.target.value })}
        className="text-xs border border-gray-300 rounded px-1.5 py-1 bg-white focus:outline-none focus:border-blue-500 min-w-[120px]"
      >
        <option value="">— выбрать —</option>
        {opts.map((o) => <option key={o.fio} value={o.fio}>{o.fio}</option>)}
      </select>
    </div>
  );

  return (
    <div className="border-b border-gray-200 px-4 py-2 bg-amber-50 flex flex-wrap gap-3 items-center">
      <span className="text-xs font-semibold text-amber-700">Дежурные:</span>
      <Sel label="Диспетчер" field="dispFio" opts={disp} />
      <Sel label="Механик"   field="mekhFio" opts={mekh} />
      <Sel label="Медик"     field="medFio"  opts={med}  />
    </div>
  );
};

// ─── Компонент ──────────────────────────────────────────────────────────────
const Dispatch = () => {
  const {
    setNaryadEntries,
    naryadSettings, setNaryadSettings,
    weeklyNaryady, setWeeklyNaryady,
    routes,
    dtpRecords, setDtpRecords,
    weeklyDayMeta, setWeeklyDayMeta,
    employees,
  } = useAppStore();

  const settings: NormaSettings = naryadSettings;

  const [weekMonday, setWeekMonday] = useState<Date>(() => getWeekMonday(new Date()));
  const weekDays = getWeekDays(weekMonday);

  const todayKey = toDateKey(new Date());
  const [selectedKey, setSelectedKey] = useState<string>(todayKey);
  const [activeTab, setActiveTab] = useState<TabType>("narad");

  const rowsForDay = (key: string): NaryadRowStore[] =>
    weeklyNaryady[key] ?? makeRowsFromRoutes(routes);

  const currentRows: NaryadRow[] = rowsForDay(selectedKey).map(toNaryadRow);

  // Дежурные для выбранного дня — с автозаполнением из ИТР
  const dayMeta: DayMeta = useMemo(() => {
    const stored = weeklyDayMeta[selectedKey];
    if (stored) return stored;
    const find = (d: string) => employees.find((e) => e.dolzhnost === d && e.status === "active")?.fio ?? "";
    return {
      dispFio:    find("Диспетчер"),
      mekhFio:    find("Механик по выпуску"),
      medFio:     find("Медик"),
      nachGarFio: "",
    };
  }, [selectedKey, weeklyDayMeta, employees]);

  const updateDayMeta = useCallback((partial: Partial<DayMeta>) => {
    setWeeklyDayMeta((prev) => ({
      ...prev,
      [selectedKey]: { ...(prev[selectedKey] ?? emptyDayMeta()), ...partial },
    }));
  }, [selectedKey, setWeeklyDayMeta]);

  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [putevoyRow, setPutevoyRow] = useState<NaryadRow | null>(null);

  const saveRows = useCallback((key: string, rows: NaryadRowStore[]) => {
    setWeeklyNaryady((prev) => ({ ...prev, [key]: rows }));
  }, [setWeeklyNaryady]);

  const buildEntries = useCallback((rows: NaryadRow[], s: NormaSettings): NaryadEntry[] =>
    rows.map((r) => {
      const calc = calcPodrabotka(r, s);
      return {
        date:           toDisplayDate(new Date(selectedKey + "T00:00:00")),
        bortovoy:       r.bortovoy,
        gos:            r.gos,
        marka:          r.marka,
        marshrut:       r.marshrut,
        fioVod:         r.fio,
        fioKond:        r.fioKond,
        putevoy:        r.putevoy,
        biletov:        r.biletov,
        terminal:       r.terminal,
        podrabotkaVod:  calc?.vod  ?? 0,
        podrabotkaKond: calc?.cond ?? 0,
      };
    }), [selectedKey]);

  useEffect(() => {
    setNaryadEntries(buildEntries(currentRows, settings));
  }, [weeklyNaryady, naryadSettings, selectedKey]); // eslint-disable-line

  // ─── Мутации ──────────────────────────────────────────────────────────────
  const updateCell = (id: number, col: keyof NaryadRow, value: string | boolean) => {
    const updated = rowsForDay(selectedKey).map((r) =>
      r.id === id ? { ...r, [col]: value } : r
    );
    saveRows(selectedKey, updated);
  };

  const updateRow = (id: number, partial: Partial<NaryadRow>) => {
    const updated = rowsForDay(selectedKey).map((r) =>
      r.id === id ? { ...r, ...partial } : r
    );
    saveRows(selectedKey, updated);
  };

  const addRow = () => {
    const cur = rowsForDay(selectedKey);
    saveRows(selectedKey, [...cur, makeEmptyRow()]);
  };

  const resetToRoutes = () => {
    saveRows(selectedKey, makeRowsFromRoutes(routes));
  };

  const deleteRow = (id: number) => {
    const cur = rowsForDay(selectedKey);
    if (cur.length === 1) return;
    saveRows(selectedKey, cur.filter((r) => r.id !== id));
  };

  const toggleDtp = (row: NaryadRow) => {
    const newDtp = !row.dtp;
    const updated = rowsForDay(selectedKey).map((r) =>
      r.id === row.id ? { ...r, dtp: newDtp } : r
    );
    saveRows(selectedKey, updated);
    const dateStr = toDisplayDate(new Date(selectedKey + "T00:00:00"));
    if (newDtp) {
      setDtpRecords((prev) => [...prev, {
        id: Date.now() + Math.random(),
        date: dateStr,
        bortovoy: row.bortovoy,
        marshrut: row.marshrut,
        fioVod: row.fio,
        fioKond: row.fioKond,
        putevoy: row.putevoy,
        vremya: "", mesto: "", opisanie: "", postradavshie: "", ushcherb: "",
        status: "new",
      }]);
    } else {
      setDtpRecords((prev) => prev.filter(
        (d) => !(d.bortovoy === row.bortovoy && d.status === "new" && d.date === dateStr)
      ));
    }
  };

  const setSetting = (key: keyof NormaSettings, val: string) =>
    setNaryadSettings((prev) => ({ ...prev, [key]: val }));

  const copyFromDay = (fromKey: string) => {
    if (!weeklyNaryady[fromKey]?.length) return;
    const copied = weeklyNaryady[fromKey].map((r) => ({
      ...r,
      id: Date.now() + Math.random(),
      podrabotka: false,
      biletov: "",
      dtp: false,
    }));
    saveRows(selectedKey, copied);
  };

  const prevWeek = () => {
    const d = new Date(weekMonday);
    d.setDate(d.getDate() - 7);
    setWeekMonday(d);
  };
  const nextWeek = () => {
    const d = new Date(weekMonday);
    d.setDate(d.getDate() + 7);
    setWeekMonday(d);
  };

  const selectedDate = weekDays.find((d) => toDateKey(d) === selectedKey) ?? weekDays[0];
  const displayDate  = toDisplayDate(selectedDate);
  const monthYear    = toMonthYear(selectedDate);

  const TABS: { key: TabType; label: string; icon: string }[] = [
    { key: "narad",   label: "Наряд",                    icon: "ClipboardList" },
    { key: "med",     label: "Журнал медосмотра",         icon: "Stethoscope"   },
    { key: "vypusk",  label: "Журнал выпуска на линию",   icon: "Truck"         },
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Наряд на работу" />

      {putevoyRow && (
        <PutevoyModal
          row={putevoyRow}
          today={displayDate}
          dayMeta={dayMeta}
          onClose={() => setPutevoyRow(null)}
        />
      )}

      <div className="px-4 py-4 max-w-[1920px] mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm mb-4">

          {/* ── Шапка ── */}
          <div className="border-b border-gray-300 px-5 py-3 flex items-center justify-between print:hidden">
            <div>
              <h1 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Наряд на работу</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {displayDate} · {DAY_NAMES[selectedDate.getDay()]}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border transition-colors ${
                  showSettings ? "bg-blue-600 text-white border-blue-700" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Icon name="Settings" size={14} />
                Нормы
              </button>
              <button
                onClick={resetToRoutes}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white text-gray-600 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                title="Пересоздать строки из справочника маршрутов"
              >
                <Icon name="RefreshCw" size={14} />
                Сбросить
              </button>
              <button onClick={addRow}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                <Icon name="Plus" size={14} />
                Строка
              </button>
              <button onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                <Icon name="Printer" size={14} />
                Печать
              </button>
            </div>
          </div>

          {/* ── Навигация по неделе ── */}
          <div className="border-b border-gray-200 px-4 py-2 flex items-center gap-2 print:hidden">
            <button onClick={prevWeek} className="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Предыдущая неделя">
              <Icon name="ChevronLeft" size={16} />
            </button>
            {weekDays.map((day) => {
              const key = toDateKey(day);
              const isSelected = key === selectedKey;
              const isToday    = key === todayKey;
              const hasData    = !!(weeklyNaryady[key]?.some((r) => r.bortovoy || r.fio));
              return (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`flex flex-col items-center px-3 py-1 rounded text-xs transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : isToday
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{DAY_NAMES[day.getDay()]}</span>
                  <span className="font-bold">{day.getDate()}</span>
                  {hasData && <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? "bg-blue-200" : "bg-blue-400"}`} />}
                </button>
              );
            })}
            <button onClick={nextWeek} className="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Следующая неделя">
              <Icon name="ChevronRight" size={16} />
            </button>
            <button
              onClick={() => { setWeekMonday(getWeekMonday(new Date())); setSelectedKey(todayKey); }}
              className="ml-2 px-2 py-1 text-xs text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
            >
              Сегодня
            </button>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
              <span>Скопировать из:</span>
              {weekDays
                .filter((d) => {
                  const k = toDateKey(d);
                  return k !== selectedKey && weeklyNaryady[k]?.some((r) => r.bortovoy || r.fio);
                })
                .map((d) => (
                  <button
                    key={toDateKey(d)}
                    onClick={() => copyFromDay(toDateKey(d))}
                    className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                  >
                    {DAY_NAMES[d.getDay()]} {d.getDate()}
                  </button>
                ))}
            </div>
          </div>

          {/* ── Панель дежурных ── */}
          <DayMetaPanel meta={dayMeta} onChange={updateDayMeta} />

          {/* ── Вкладки ── */}
          <div className="border-b border-gray-300 flex print:hidden">
            {TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? "border-blue-600 text-blue-700 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon name={icon} size={14} />
                {label}
              </button>
            ))}
          </div>

          {showSettings && activeTab === "narad" && (
            <NormaPanel settings={settings} onSetSetting={setSetting} />
          )}

          {/* ── Контент вкладок ── */}
          {activeTab === "narad" && (
            <NaryadTable
              rows={currentRows}
              activeCell={activeCell}
              settings={settings}
              onUpdateCell={updateCell}
              onUpdateRow={updateRow}
              onAddRow={addRow}
              onDeleteRow={deleteRow}
              onSetActiveCell={setActiveCell}
              onOpenPutevoy={setPutevoyRow}
              onToggleDtp={toggleDtp}
            />
          )}

          {activeTab === "med" && (
            <JurnalMed
              rows={currentRows}
              dayMeta={dayMeta}
              displayDate={displayDate}
              monthYear={monthYear}
            />
          )}

          {activeTab === "vypusk" && (
            <JurnalVypusk
              rows={currentRows}
              dayMeta={dayMeta}
              displayDate={displayDate}
              monthYear={monthYear}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default Dispatch;