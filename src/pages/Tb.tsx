import { useState, useMemo, useEffect } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useAppStore } from "@/store/appStore";
import { uid } from "@/lib/uid";
import {
  TbEntry, EMPTY_COMPANY,
  loadTbEntries, saveTbEntries,
  toDateKey, currentMonthKey, getDaysInMonth,
} from "./tb/tbShared";
import TbPrintView from "./tb/TbPrintView";
import TbJournal from "./tb/TbJournal";
import TbDailySignatures from "./tb/TbDailySignatures";

const Tb = () => {
  const { companies, activeCompanyIdx, setActiveCompanyIdx, employees, weeklyNaryady, routes } = useAppStore();
  const company = companies[activeCompanyIdx] ?? EMPTY_COMPANY;

  const [monthKey, setMonthKey] = useState(currentMonthKey);
  const [tab, setTab] = useState<"journal" | "daily">("journal");
  const [showPrint, setShowPrint] = useState(false);

  // ─── Журнал инструктажей ──────────────────────────────────────────────────
  const emptyEntry = (): TbEntry => ({
    id: uid(),
    dateKey: toDateKey(new Date()),
    fio: "",
    dolzhnost: "Водитель",
    tabNum: "",
    vidInstruktazha: "Повторный инструктаж",
    rukovoditel: company.direktor || "",
    podpisInstr: "",
    primechanie: "",
  });

  const [entries, setEntries] = useState<TbEntry[]>(() => {
    const saved = loadTbEntries();
    if (saved.length === 0) return [emptyEntry()];
    // Миграция: добиваем id для записей без него (старые сохранения)
    return saved.map((e) => (e.id ? e : { ...e, id: uid() }));
  });
  const [activeCell, setActiveCell] = useState<{ idx: number; field: string } | null>(null);
  const [globalVid, setGlobalVid] = useState("Повторный инструктаж");

  useEffect(() => { saveTbEntries(entries); }, [entries]);

  const applyGlobalVid = (vid: string) => {
    setGlobalVid(vid);
    setEntries((prev) => prev.map((e) => ({ ...e, vidInstruktazha: vid })));
  };

  const updateEntry = (idx: number, field: keyof TbEntry, value: string) =>
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));

  const addEntry = () => setEntries((prev) => [...prev, {
    ...emptyEntry(),
    dateKey: prev[prev.length - 1]?.dateKey ?? toDateKey(new Date()),
    rukovoditel: prev[prev.length - 1]?.rukovoditel ?? company.direktor,
    vidInstruktazha: prev[prev.length - 1]?.vidInstruktazha ?? "Повторный инструктаж",
  }]);

  const deleteEntry = (idx: number) =>
    setEntries((prev) => prev.filter((_, i) => i !== idx));

  const empList = useMemo(
    () => employees.filter((e) => e.status === "active"),
    [employees]
  );

  const monthEntries = useMemo(
    () => entries.filter((e) => e.dateKey.startsWith(monthKey)),
    [entries, monthKey]
  );

  // ─── Маршруты активной организации ───────────────────────────────────────
  const companyRouteNomers = useMemo(
    () => new Set(routes.filter((r) => r.companyIdx === activeCompanyIdx).map((r) => r.nomer)),
    [routes, activeCompanyIdx]
  );

  // ─── Заполнить журнал из наряда за выбранный месяц ───────────────────────
  const fillFromNaryadMonth = () => {
    const days = getDaysInMonth(monthKey);
    const newEntries: TbEntry[] = [];
    const existingKeys = new Set(entries.map((e) => `${e.dateKey}::${e.fio}`));

    const addNaryadEntry = (day: string, fio: string, dolzhnost: string, marshrut: string) => {
      const key = `${day}::${fio}`;
      if (existingKeys.has(key)) return;
      existingKeys.add(key);
      const emp = employees.find((e) => e.fio === fio);
      newEntries.push({
        id: uid(),
        dateKey: day,
        fio,
        dolzhnost,
        tabNum: emp?.tabNum ?? "",
        vidInstruktazha: globalVid,
        rukovoditel: company.direktor || "",
        podpisInstr: "",
        primechanie: marshrut,
      });
    };

    days.forEach((day) => {
      const rows = weeklyNaryady[day] ?? [];
      rows.forEach((r) => {
        if (!r.fio && !r.fioKond) return;
        const routeNum = r.marshrut.split("/")[0].trim();
        if (!companyRouteNomers.has(routeNum)) return;
        if (r.statusOtsutstviya) return;
        if (r.fio)     addNaryadEntry(day, r.fio,     "Водитель",   r.marshrut);
        if (r.fioKond) addNaryadEntry(day, r.fioKond, "Кондуктор",  r.marshrut);
      });
    });

    if (newEntries.length === 0) {
      alert("Нет новых данных из наряда за выбранный месяц для этой организации");
      return;
    }

    newEntries.sort((a, b) => a.dateKey.localeCompare(b.dateKey) || a.fio.localeCompare(b.fio, "ru"));
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.fio !== "");
      return [...filtered, ...newEntries];
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Журнал ТБ" />

      {showPrint && (
        <TbPrintView
          company={company}
          monthKey={monthKey}
          rows={monthEntries}
          onClose={() => setShowPrint(false)}
        />
      )}

      <div className="px-4 py-4 max-w-[1400px] mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm">

          {/* Шапка */}
          <div className="border-b border-gray-300 px-5 py-3 flex items-center justify-between print:hidden">
            <div>
              <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Журнал инструктажей по ТБ</h1>
              <p className="text-xs text-gray-500 mt-0.5">{company.nazvanie}</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={activeCompanyIdx}
                onChange={(e) => setActiveCompanyIdx(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
              >
                {companies.map((c, i) => (
                  <option key={`comp-${c.inn || c.kratkoeNazvanie || i}`} value={i}>{c.nazvanie || `Организация ${i + 1}`}</option>
                ))}
              </select>
              <input
                type="month"
                value={monthKey}
                onChange={(e) => setMonthKey(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
              />
              {tab === "journal" && (
                <>
                  <button
                    onClick={fillFromNaryadMonth}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    title="Загрузить водителей и кондукторов из наряда за выбранный месяц"
                  >
                    <Icon name="Download" size={13} /> Из наряда
                  </button>
                  <button
                    onClick={() => setShowPrint(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Icon name="Printer" size={13} /> Печать
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Табы */}
          <div className="border-b border-gray-200 px-5 flex gap-1 pt-2 print:hidden">
            {([
              { key: "journal", label: "Журнал инструктажей",         icon: "BookOpen"    },
              { key: "daily",   label: "Ежедневные выходы (из наряда)", icon: "CalendarDays" },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs border-b-2 transition-colors ${
                  tab === t.key
                    ? "border-blue-600 text-blue-700 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <Icon name={t.icon as "BookOpen"} size={13} />
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Журнал инструктажей ───────────────────────────────────────── */}
          {tab === "journal" && (
            <TbJournal
              entries={entries}
              activeCell={activeCell}
              globalVid={globalVid}
              monthKey={monthKey}
              company={company}
              empList={empList}
              onUpdateEntry={updateEntry}
              onAddEntry={addEntry}
              onDeleteEntry={deleteEntry}
              onSetActiveCell={setActiveCell}
              onApplyGlobalVid={applyGlobalVid}
              monthEntries={monthEntries}
            />
          )}

          {/* ── Ежедневные выходы из наряда ──────────────────────────────── */}
          {tab === "daily" && (
            <div>
              <div className="px-5 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-xs text-amber-700">
                <Icon name="Info" size={13} />
                Данные загружаются автоматически из Наряда · ✓ — работал, цветом — причина отсутствия
              </div>
              <div className="p-4">
                <TbDailySignatures
                  monthKey={monthKey}
                  company={company}
                  companyIdx={activeCompanyIdx}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Tb;