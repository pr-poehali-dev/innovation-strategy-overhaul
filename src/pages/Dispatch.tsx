import { useEffect, useCallback, useState } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useAppStore, NaryadEntry, NaryadRowStore, Route } from "@/store/appStore";
import { NaryadRow, NormaSettings, calcPodrabotka } from "./dispatch/types";
import NormaPanel from "./dispatch/NormaPanel";
import PutevoyModal from "./dispatch/PutevoyModal";
import NaryadTable from "./dispatch/NaryadTable";

// ─── Утилиты дат ────────────────────────────────────────────────────────────
const toDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const toDisplayDate = (d: Date): string =>
  d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

const DAY_NAMES = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

// Получить Monday текущей или указанной даты
const getWeekMonday = (base: Date): Date => {
  const d = new Date(base);
  const dow = d.getDay(); // 0=вс, 1=пн...
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// 7 дат недели начиная с Monday
const getWeekDays = (monday: Date): Date[] =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

// Тип адаптеры
const toNaryadRow = (r: NaryadRowStore): NaryadRow => r as unknown as NaryadRow;

let _rowIdCounter = Date.now();
const nextId = () => ++_rowIdCounter;

const makeEmptyRow = (): NaryadRowStore => ({
  id: nextId(),
  vehicleId: null, bortovoy: "", gos: "", marka: "",
  marshrut: "", fio: "", fioKond: "",
  putevoy: "", terminal: "", podrabotka: false, biletov: "",
});

// Строки по маршрутам: одна строка на каждый график, маршруты отсортированы по номеру
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

// ─── Компонент ──────────────────────────────────────────────────────────────
const Dispatch = () => {
  const {
    setNaryadEntries,
    naryadSettings, setNaryadSettings,
    weeklyNaryady, setWeeklyNaryady,
    routes,
  } = useAppStore();

  const settings: NormaSettings = naryadSettings;

  // Текущая неделя (Monday)
  const [weekMonday, setWeekMonday] = useState<Date>(() => getWeekMonday(new Date()));
  const weekDays = getWeekDays(weekMonday);

  // Выбранный день (по умолчанию — сегодня или первый день недели)
  const todayKey = toDateKey(new Date());
  const [selectedKey, setSelectedKey] = useState<string>(todayKey);

  // Строки выбранного дня — если нет данных, генерируем из маршрутов
  const rowsForDay = (key: string): NaryadRowStore[] =>
    weeklyNaryady[key] ?? makeRowsFromRoutes(routes);

  const currentRows: NaryadRow[] = rowsForDay(selectedKey).map(toNaryadRow);

  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [putevoyRow, setPutevoyRow] = useState<NaryadRow | null>(null);

  // Сохранить строки для дня
  const saveRows = useCallback((key: string, rows: NaryadRowStore[]) => {
    setWeeklyNaryady((prev) => ({ ...prev, [key]: rows }));
  }, [setWeeklyNaryady]);

  // Разнесение в Кассу/Продажи — только для сегодняшнего дня
  const buildEntries = useCallback((rows: NaryadRow[], s: NormaSettings): NaryadEntry[] =>
    rows.map((r) => {
      const calc = calcPodrabotka(r, s);
      return {
        date:           toDisplayDate(new Date(selectedKey)),
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

  // Пересоздать строки из маршрутов (сбросить день)
  const resetToRoutes = () => {
    saveRows(selectedKey, makeRowsFromRoutes(routes));
  };

  const deleteRow = (id: number) => {
    const cur = rowsForDay(selectedKey);
    if (cur.length === 1) return;
    saveRows(selectedKey, cur.filter((r) => r.id !== id));
  };

  const setSetting = (key: keyof NormaSettings, val: string) =>
    setNaryadSettings((prev) => ({ ...prev, [key]: val }));

  // Копировать наряд из другого дня
  const copyFromDay = (fromKey: string) => {
    if (!weeklyNaryady[fromKey]?.length) return;
    const copied = weeklyNaryady[fromKey].map((r) => ({
      ...r,
      id: Date.now() + Math.random(),
      podrabotka: false,
      biletov: "",
    }));
    saveRows(selectedKey, copied);
  };

  // Переключение недели
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

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Наряд на работу" />

      {putevoyRow && (
        <PutevoyModal
          row={putevoyRow}
          today={toDisplayDate(selectedDate)}
          onClose={() => setPutevoyRow(null)}
        />
      )}

      <div className="px-4 py-4 max-w-7xl mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm mb-4">

          {/* ── Шапка ── */}
          <div className="border-b border-gray-300 px-5 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Наряд на работу</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {toDisplayDate(selectedDate)} · {DAY_NAMES[selectedDate.getDay()]}
              </p>
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
                onClick={resetToRoutes}
                title="Заполнить все строки по маршрутам из настроек"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              >
                <Icon name="RotateCcw" size={14} />
                По маршрутам
              </button>
              <button
                onClick={addRow}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Icon name="Plus" size={14} />
                Строку
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

          {/* ── Навигация по неделе ── */}
          <div className="border-b border-gray-200 px-4 py-2 flex items-center gap-2">
            <button
              onClick={prevWeek}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors"
              title="Предыдущая неделя"
            >
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
                  className={`flex flex-col items-center px-3 py-1.5 rounded-lg text-xs transition-colors min-w-[52px] relative ${
                    isSelected
                      ? "bg-blue-700 text-white"
                      : isToday
                      ? "bg-blue-50 text-blue-700 border border-blue-300"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="font-semibold">{DAY_NAMES[day.getDay()]}</span>
                  <span className="text-xs opacity-80">{day.getDate()}.{String(day.getMonth() + 1).padStart(2, "0")}</span>
                  {hasData && (
                    <span className={`absolute top-0.5 right-1 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-blue-500"}`} />
                  )}
                </button>
              );
            })}

            <button
              onClick={nextWeek}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors"
              title="Следующая неделя"
            >
              <Icon name="ChevronRight" size={16} />
            </button>

            {/* Кнопка «сегодня» */}
            <button
              onClick={() => {
                setWeekMonday(getWeekMonday(new Date()));
                setSelectedKey(todayKey);
              }}
              className="ml-2 px-2 py-1 text-xs text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
            >
              Сегодня
            </button>

            {/* Копировать из другого дня */}
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
                    className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                  >
                    {DAY_NAMES[d.getDay()]} {d.getDate()}
                  </button>
                ))}
            </div>
          </div>

          {showSettings && (
            <NormaPanel settings={settings} onSetSetting={setSetting} />
          )}

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
          />

        </div>
      </div>
    </div>
  );
};

export default Dispatch;