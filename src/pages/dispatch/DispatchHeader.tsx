import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { useAppStore, DayMeta, WeeklyNaryady } from "@/store/appStore";
import { toDateKey, DAY_NAMES, TabType, TABS } from "./dispatchUtils";

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

interface Props {
  displayDate: string;
  selectedDate: Date;
  showSettings: boolean;
  setShowSettings: (v: boolean | ((prev: boolean) => boolean)) => void;
  resetToRoutes: () => void;
  addRow: () => void;
  weekDays: Date[];
  selectedKey: string;
  todayKey: string;
  weeklyNaryady: WeeklyNaryady;
  setSelectedKey: (k: string) => void;
  prevWeek: () => void;
  nextWeek: () => void;
  setWeekMonday: (d: Date) => void;
  copyFromDay: (k: string) => void;
  dayMeta: DayMeta;
  updateDayMeta: (partial: Partial<DayMeta>) => void;
  activeTab: TabType;
  setActiveTab: (t: TabType) => void;
}

const DispatchHeader = ({
  displayDate, selectedDate,
  showSettings, setShowSettings,
  resetToRoutes, addRow,
  weekDays, selectedKey, todayKey, weeklyNaryady,
  setSelectedKey, prevWeek, nextWeek, setWeekMonday,
  copyFromDay,
  dayMeta, updateDayMeta,
  activeTab, setActiveTab,
}: Props) => {
  const getWeekMondayLocal = (base: Date): Date => {
    const d = new Date(base);
    const dow = d.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  return (
    <>
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
          onClick={() => { setWeekMonday(getWeekMondayLocal(new Date())); setSelectedKey(todayKey); }}
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
    </>
  );
};

export default DispatchHeader;
