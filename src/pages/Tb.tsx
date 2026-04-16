import { useState, useMemo, useEffect } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useAppStore, CompanySettings } from "@/store/appStore";

const LS_TB = "dat_tb_entries_v1";
function loadTbEntries(): TbEntry[] {
  try {
    const raw = localStorage.getItem(LS_TB);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { console.warn(e); return []; }
}
function saveTbEntries(entries: TbEntry[]): void {
  try { localStorage.setItem(LS_TB, JSON.stringify(entries)); } catch (e) { console.warn(e); }
}

// ─── Утилиты дат ─────────────────────────────────────────────────────────────
const toDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const toDisplayDate = (key: string): string => {
  if (!key) return "";
  const d = new Date(key + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const toMonthYear = (key: string): string => {
  if (!key) return "";
  const d = new Date(key + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
};

const getDaysInMonth = (yearMonth: string): string[] => {
  // yearMonth = "2026-04"
  const [y, m] = yearMonth.split("-").map(Number);
  const count = new Date(y, m, 0).getDate();
  return Array.from({ length: count }, (_, i) => {
    const day = String(i + 1).padStart(2, "0");
    return `${yearMonth}-${day}`;
  });
};

const currentMonthKey = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

// ─── Пустая компания ─────────────────────────────────────────────────────────
const EMPTY_COMPANY: CompanySettings = {
  nazvanie: "—", kratkoeNazvanie: "", inn: "", kpp: "", ogrn: "", okpo: "", okvad: "",
  direktor: "", dolzhnostDir: "Директор", glavbuh: "",
  adresYur: "", adres: "", telefon: "", email: "",
  bank: "", bik: "", raschetnySchet: "", korSchet: "",
  licenziya: "", licenziyaData: "", licenziyaVydan: "", reestrNomer: "",
  svidetelstvo: "", svidetelstvoData: "", dogovorZakazchik: "", zakazchik: "", zakazchikInn: "",
};

// ─── Строки инструктажа ──────────────────────────────────────────────────────
// Официальный перечень видов инструктажа по охране труда и ТБ для водителей
const INSTRUKTAZHI = [
  "Вводный инструктаж",
  "Первичный инструктаж на рабочем месте",
  "Повторный инструктаж",
  "Внеплановый инструктаж",
  "Целевой инструктаж",
  "Инструктаж по противопожарной безопасности",
  "Инструктаж по электробезопасности",
  "Инструктаж по перевозке пассажиров",
];

// ─── Тип записи журнала ──────────────────────────────────────────────────────
interface TbEntry {
  dateKey:       string;  // YYYY-MM-DD
  fio:           string;  // ФИО водителя / кондуктора
  dolzhnost:     string;
  tabNum:        string;
  vidInstruktazha: string;
  rukovoditel:   string;  // кто проводил
  podpisInstr:   string;  // подпись инструктируемого (символ/отметка)
  primechanie:   string;
}

// ─── Печать журнала ──────────────────────────────────────────────────────────
const PrintView = ({
  company,
  monthKey,
  rows,
  onClose,
}: {
  company: CompanySettings;
  monthKey: string;
  rows: TbEntry[];
  onClose: () => void;
}) => {
  const monthLabel = toMonthYear(monthKey + "-01");

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl shadow-2xl">
        {/* Управление */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-gray-50 print:hidden">
          <span className="text-sm text-gray-600 font-medium">Предпросмотр журнала ТБ</span>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Icon name="Printer" size={14} /> Печать
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              <Icon name="X" size={14} /> Закрыть
            </button>
          </div>
        </div>

        {/* Документ */}
        <div className="p-8 print:p-6 text-[11px] font-['Times_New_Roman',serif]">
          {/* Шапка */}
          <div className="text-center mb-6">
            <div className="text-xs mb-1 text-gray-600 uppercase tracking-widest">Журнал регистрации инструктажей по охране труда</div>
            <div className="text-base font-bold uppercase mb-1">{company.nazvanie || "Организация"}</div>
            <div className="text-xs text-gray-600">
              {monthLabel && `за ${monthLabel}`}
              {company.adres && ` · ${company.adres}`}
            </div>
          </div>

          {/* Реквизиты */}
          <div className="grid grid-cols-2 gap-x-8 mb-6 text-xs">
            <div className="space-y-1">
              <div><span className="text-gray-500">Руководитель организации:</span> <span className="font-semibold">{company.direktor || "_______________"}</span></div>
              <div><span className="text-gray-500">Должность:</span> <span>{company.dolzhnostDir || "Директор"}</span></div>
              <div><span className="text-gray-500">ИНН:</span> <span>{company.inn || "—"}</span></div>
            </div>
            <div className="space-y-1">
              <div><span className="text-gray-500">Адрес:</span> <span>{company.adresYur || company.adres || "—"}</span></div>
              <div><span className="text-gray-500">Телефон:</span> <span>{company.telefon || "—"}</span></div>
              <div><span className="text-gray-500">Лицензия №:</span> <span>{company.licenziya || "—"}</span></div>
            </div>
          </div>

          {/* Таблица */}
          <table className="w-full border-collapse text-[10px]" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "28px" }} />
              <col style={{ width: "72px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "80px" }} />
              <col style={{ width: "50px" }} />
              <col style={{ width: "140px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "50px" }} />
              <col style={{ width: "80px" }} />
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: "#1a3a6b" }}>
                {["№", "Дата", "ФИО инструктируемого", "Должность", "Таб. №", "Вид инструктажа", "Кто проводил", "Подпись", "Примечание"].map((h) => (
                  <th key={h} className="border border-blue-900 px-1 py-1 text-white font-semibold text-center leading-tight">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f0f4ff" }}>
                  <td className="border border-gray-400 px-1 py-1 text-center text-gray-500">{i + 1}</td>
                  <td className="border border-gray-400 px-1 py-1 text-center">{toDisplayDate(row.dateKey)}</td>
                  <td className="border border-gray-400 px-1 py-1">{row.fio}</td>
                  <td className="border border-gray-400 px-1 py-1 text-center">{row.dolzhnost}</td>
                  <td className="border border-gray-400 px-1 py-1 text-center">{row.tabNum}</td>
                  <td className="border border-gray-400 px-1 py-1">{row.vidInstruktazha}</td>
                  <td className="border border-gray-400 px-1 py-1">{row.rukovoditel}</td>
                  <td className="border border-gray-400 px-1 py-1 text-center text-gray-400 italic text-[9px]">
                    {row.podpisInstr || "/ /"}
                  </td>
                  <td className="border border-gray-400 px-1 py-1 text-gray-500">{row.primechanie}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="border border-gray-400 px-4 py-8 text-center text-gray-400">
                    Нет записей за выбранный период
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Подписи */}
          <div className="mt-8 grid grid-cols-2 gap-x-12 text-xs">
            <div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-gray-600 whitespace-nowrap">Ответственный за инструктаж:</span>
                <span className="border-b border-gray-400 flex-1 min-w-[80px]"></span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-gray-600">Подпись:</span>
                <span className="border-b border-gray-400 w-40"></span>
                <span className="text-gray-500">«___» __________ {new Date().getFullYear()} г.</span>
              </div>
            </div>
            <div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-gray-600 whitespace-nowrap">Руководитель организации:</span>
                <span className="border-b border-gray-400 flex-1 min-w-[80px]">{company.direktor}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-gray-600">Подпись:</span>
                <span className="border-b border-gray-400 w-40"></span>
                <span className="text-gray-500">М.П.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Вид: ежедневные подписи из наряда ──────────────────────────────────────
const DailySignatures = ({
  monthKey,
  company,
  companyIdx,
}: {
  monthKey: string;
  company: CompanySettings;
  companyIdx: number;
}) => {
  const { weeklyNaryady, weeklyDayMeta, employees, routes } = useAppStore();

  const days = useMemo(() => getDaysInMonth(monthKey), [monthKey]);

  // Все водители + кондукторы этой организации (по маршрутам)
  const companyRouteNomers = useMemo(
    () => new Set(routes.filter((r) => r.companyIdx === companyIdx).map((r) => r.nomer)),
    [routes, companyIdx]
  );

  // Собираем уникальных сотрудников за месяц из нарядов этой организации
  const staffSet = useMemo(() => {
    const map = new Map<string, { fio: string; dolzhnost: string; tabNum: string }>();
    days.forEach((day) => {
      const rows = weeklyNaryady[day] ?? [];
      rows.forEach((r) => {
        const routeNum = r.marshrut.split("/")[0].trim();
        if (!companyRouteNomers.has(routeNum)) return;
        if (r.fio) {
          const emp = employees.find((e) => e.fio === r.fio);
          map.set(r.fio, { fio: r.fio, dolzhnost: "Водитель", tabNum: emp?.tabNum ?? "" });
        }
        if (r.fioKond) {
          const emp = employees.find((e) => e.fio === r.fioKond);
          map.set(r.fioKond, { fio: r.fioKond, dolzhnost: "Кондуктор", tabNum: emp?.tabNum ?? "" });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => a.dolzhnost.localeCompare(b.dolzhnost, "ru") || a.fio.localeCompare(b.fio, "ru"));
  }, [days, weeklyNaryady, companyRouteNomers, employees]);

  // Для каждого сотрудника — отметки по дням (работал / не работал)
  const presenceMap = useMemo(() => {
    const m = new Map<string, Map<string, string>>();
    days.forEach((day) => {
      const rows = weeklyNaryady[day] ?? [];
      rows.forEach((r) => {
        const routeNum = r.marshrut.split("/")[0].trim();
        if (!companyRouteNomers.has(routeNum)) return;
        [{ fio: r.fio }, { fio: r.fioKond }].forEach(({ fio }) => {
          if (!fio) return;
          if (!m.has(fio)) m.set(fio, new Map());
          const status = r.statusOtsutstviya || (r.marshrut ? "✓" : "");
          m.get(fio)!.set(day, status);
        });
      });
    });
    return m;
  }, [days, weeklyNaryady, companyRouteNomers]);

  if (staffSet.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        <Icon name="Info" size={28} className="mx-auto mb-3 text-gray-300" />
        Нет данных из наряда за выбранный месяц для этой организации
      </div>
    );
  }

  const dayNums = days.map((d) => parseInt(d.split("-")[2], 10));

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-[10px]" style={{ minWidth: `${200 + days.length * 28}px` }}>
        <thead>
          <tr style={{ backgroundColor: "#1a3a6b" }}>
            <th className="border border-blue-900 px-1 py-1.5 text-white text-center sticky left-0 bg-[#1a3a6b] z-10" style={{ width: "28px" }}>№</th>
            <th className="border border-blue-900 px-2 py-1.5 text-white text-left sticky left-7 bg-[#1a3a6b] z-10" style={{ width: "160px" }}>ФИО</th>
            <th className="border border-blue-900 px-1 py-1.5 text-white text-center" style={{ width: "80px" }}>Должность</th>
            {dayNums.map((n) => (
              <th key={n} className="border border-blue-900 px-0 py-1.5 text-white text-center font-normal" style={{ width: "28px" }}>
                {n}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {staffSet.map((s, i) => {
            const dayMap = presenceMap.get(s.fio) ?? new Map();
            return (
              <tr key={s.fio} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#eff6ff" }}>
                <td className="border border-gray-300 text-center text-gray-400 sticky left-0 bg-inherit z-10" style={{ width: "28px" }}>{i + 1}</td>
                <td className="border border-gray-300 px-2 py-0.5 sticky left-7 bg-inherit z-10 whitespace-nowrap overflow-hidden text-ellipsis" style={{ maxWidth: "160px" }}>
                  <span className="font-medium">{s.fio}</span>
                  {s.tabNum && <span className="text-gray-400 ml-1">({s.tabNum})</span>}
                </td>
                <td className="border border-gray-300 px-1 py-0.5 text-center text-gray-500">{s.dolzhnost}</td>
                {days.map((day) => {
                  const val = dayMap.get(day) ?? "";
                  const isWork = val === "✓";
                  const isAbsent = val && val !== "✓";
                  return (
                    <td
                      key={day}
                      className="border border-gray-300 text-center py-0.5"
                      title={toDisplayDate(day)}
                      style={{
                        backgroundColor: isWork ? "#e8f5e9" : isAbsent ? "#fff3e0" : undefined,
                        color: isWork ? "#2e7d32" : isAbsent ? "#e65100" : "#ccc",
                        fontSize: "9px",
                      }}
                    >
                      {val || "·"}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
        {/* Дежурный персонал по дням */}
        <tfoot>
          <tr style={{ backgroundColor: "#f0f4ff" }}>
            <td colSpan={3} className="border border-gray-300 px-2 py-0.5 text-xs text-gray-500 font-semibold sticky left-0 bg-[#f0f4ff] z-10">Диспетчер</td>
            {days.map((day) => {
              const meta = weeklyDayMeta[day];
              return (
                <td key={day} className="border border-gray-300 text-center py-0.5" style={{ fontSize: "8px", color: "#555" }} title={meta?.dispFio || ""}>
                  {meta?.dispFio ? meta.dispFio.split(" ")[0][0] + "." : ""}
                </td>
              );
            })}
          </tr>
          <tr style={{ backgroundColor: "#f0f4ff" }}>
            <td colSpan={3} className="border border-gray-300 px-2 py-0.5 text-xs text-gray-500 font-semibold sticky left-0 bg-[#f0f4ff] z-10">Механик</td>
            {days.map((day) => {
              const meta = weeklyDayMeta[day];
              return (
                <td key={day} className="border border-gray-300 text-center py-0.5" style={{ fontSize: "8px", color: "#555" }} title={meta?.mekhFio || ""}>
                  {meta?.mekhFio ? meta.mekhFio.split(" ")[0][0] + "." : ""}
                </td>
              );
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

// ─── Основной компонент ───────────────────────────────────────────────────────
const Tb = () => {
  const { companies, activeCompanyIdx, setActiveCompanyIdx, employees, weeklyNaryady, weeklyDayMeta } = useAppStore();
  const company = companies[activeCompanyIdx] ?? EMPTY_COMPANY;

  const [monthKey, setMonthKey] = useState(currentMonthKey);
  const [tab, setTab] = useState<"journal" | "daily">("journal");
  const [showPrint, setShowPrint] = useState(false);

  // ─── Журнал инструктажей (ручной ввод) ───────────────────────────────────
  const emptyEntry = (): TbEntry => ({
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
    return saved.length > 0 ? saved : [emptyEntry()];
  });
  const [activeCell, setActiveCell] = useState<{ idx: number; field: string } | null>(null);

  useEffect(() => { saveTbEntries(entries); }, [entries]);

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

  // Список сотрудников для autocomplete
  const empList = useMemo(
    () => employees.filter((e) => e.status === "active"),
    [employees]
  );

  // Записи за текущий месяц (для печати)
  const monthEntries = useMemo(
    () => entries.filter((e) => e.dateKey.startsWith(monthKey)),
    [entries, monthKey]
  );

  // ─── Выбор дня для ежедневного вида ──────────────────────────────────────
  const todayKey = toDateKey(new Date());

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Журнал ТБ" />

      {showPrint && (
        <PrintView
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
              {/* Выбор организации */}
              <select
                value={activeCompanyIdx}
                onChange={(e) => setActiveCompanyIdx(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
              >
                {companies.map((c, i) => (
                  <option key={i} value={i}>{c.nazvanie || `Организация ${i + 1}`}</option>
                ))}
              </select>
              {/* Выбор месяца */}
              <input
                type="month"
                value={monthKey}
                onChange={(e) => setMonthKey(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
              />
              {tab === "journal" && (
                <button
                  onClick={() => setShowPrint(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Icon name="Printer" size={13} /> Печать
                </button>
              )}
            </div>
          </div>

          {/* Табы */}
          <div className="border-b border-gray-200 px-5 flex gap-1 pt-2 print:hidden">
            {([
              { key: "journal", label: "Журнал инструктажей", icon: "BookOpen" },
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
            <div>
              {/* Подсказка */}
              <div className="px-5 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2 text-xs text-blue-700">
                <Icon name="Info" size={13} />
                Форма по ГОСТ 12.0.004-2015 · Записи сохраняются автоматически
              </div>

              <div className="overflow-x-auto">
                <table className="border-collapse text-xs w-full" style={{ minWidth: "1000px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#1a3a6b" }}>
                      {[
                        { label: "№",              w: "32px"  },
                        { label: "Дата",           w: "110px" },
                        { label: "ФИО",            w: "200px" },
                        { label: "Должность",      w: "110px" },
                        { label: "Таб. №",         w: "70px"  },
                        { label: "Вид инструктажа",w: "200px" },
                        { label: "Кто проводил",   w: "180px" },
                        { label: "Подпись",        w: "80px"  },
                        { label: "Примечание",     w: "140px" },
                        { label: "",               w: "28px"  },
                      ].map((h) => (
                        <th key={h.label} className="border border-blue-900 px-1 py-1.5 text-white font-semibold text-center leading-tight" style={{ width: h.w }}>
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, idx) => {
                      const rowBg = idx % 2 === 0 ? "#fff" : "#eff6ff";
                      const isActive = (field: string) => activeCell?.idx === idx && activeCell?.field === field;
                      const cellCls = (field: string) =>
                        `w-full h-6 px-1 text-xs bg-transparent outline-none border-2 transition-colors ${
                          isActive(field) ? "border-blue-500 bg-blue-50" : "border-transparent"
                        }`;
                      return (
                        <tr key={idx} style={{ backgroundColor: rowBg }}>
                          {/* № */}
                          <td className="border border-gray-300 text-center text-gray-400 text-xs">{idx + 1}</td>

                          {/* Дата */}
                          <td className="border border-gray-300 p-0">
                            <input
                              type="date"
                              value={entry.dateKey}
                              onChange={(e) => updateEntry(idx, "dateKey", e.target.value)}
                              onFocus={() => setActiveCell({ idx, field: "dateKey" })}
                              onBlur={() => setActiveCell(null)}
                              className={cellCls("dateKey") + " text-center"}
                            />
                          </td>

                          {/* ФИО */}
                          <td className="border border-gray-300 p-0">
                            <input
                              type="text"
                              list="tb-fio-list"
                              value={entry.fio}
                              onChange={(e) => {
                                updateEntry(idx, "fio", e.target.value);
                                // Автозаполнение должности и таб. №
                                const emp = empList.find((emp) => emp.fio === e.target.value);
                                if (emp) {
                                  updateEntry(idx, "dolzhnost", emp.dolzhnost);
                                  updateEntry(idx, "tabNum", emp.tabNum);
                                }
                              }}
                              onFocus={() => setActiveCell({ idx, field: "fio" })}
                              onBlur={() => setActiveCell(null)}
                              className={cellCls("fio")}
                              placeholder="ФИО сотрудника"
                            />
                          </td>

                          {/* Должность */}
                          <td className="border border-gray-300 p-0">
                            <input
                              type="text"
                              value={entry.dolzhnost}
                              onChange={(e) => updateEntry(idx, "dolzhnost", e.target.value)}
                              onFocus={() => setActiveCell({ idx, field: "dolzhnost" })}
                              onBlur={() => setActiveCell(null)}
                              className={cellCls("dolzhnost")}
                            />
                          </td>

                          {/* Таб. № */}
                          <td className="border border-gray-300 p-0">
                            <input
                              type="text"
                              value={entry.tabNum}
                              onChange={(e) => updateEntry(idx, "tabNum", e.target.value)}
                              onFocus={() => setActiveCell({ idx, field: "tabNum" })}
                              onBlur={() => setActiveCell(null)}
                              className={cellCls("tabNum") + " text-center"}
                            />
                          </td>

                          {/* Вид инструктажа */}
                          <td className="border border-gray-300 p-0">
                            <select
                              value={entry.vidInstruktazha}
                              onChange={(e) => updateEntry(idx, "vidInstruktazha", e.target.value)}
                              onFocus={() => setActiveCell({ idx, field: "vidInstruktazha" })}
                              onBlur={() => setActiveCell(null)}
                              className="w-full h-6 px-1 text-xs bg-transparent outline-none border-2 border-transparent focus:border-blue-500 focus:bg-blue-50"
                            >
                              {INSTRUKTAZHI.map((v) => <option key={v} value={v}>{v}</option>)}
                            </select>
                          </td>

                          {/* Кто проводил */}
                          <td className="border border-gray-300 p-0">
                            <input
                              type="text"
                              list="tb-ruk-list"
                              value={entry.rukovoditel}
                              onChange={(e) => updateEntry(idx, "rukovoditel", e.target.value)}
                              onFocus={() => setActiveCell({ idx, field: "rukovoditel" })}
                              onBlur={() => setActiveCell(null)}
                              className={cellCls("rukovoditel")}
                              placeholder={company.direktor || "ФИО"}
                            />
                          </td>

                          {/* Подпись */}
                          <td className="border border-gray-300 p-0">
                            <input
                              type="text"
                              value={entry.podpisInstr}
                              onChange={(e) => updateEntry(idx, "podpisInstr", e.target.value)}
                              onFocus={() => setActiveCell({ idx, field: "podpisInstr" })}
                              onBlur={() => setActiveCell(null)}
                              className={cellCls("podpisInstr") + " text-center"}
                              placeholder="/ /"
                            />
                          </td>

                          {/* Примечание */}
                          <td className="border border-gray-300 p-0">
                            <input
                              type="text"
                              value={entry.primechanie}
                              onChange={(e) => updateEntry(idx, "primechanie", e.target.value)}
                              onFocus={() => setActiveCell({ idx, field: "primechanie" })}
                              onBlur={() => setActiveCell(null)}
                              className={cellCls("primechanie")}
                            />
                          </td>

                          {/* Удалить */}
                          <td className="border border-gray-300 text-center">
                            <button onClick={() => deleteEntry(idx)} className="text-gray-300 hover:text-red-500 p-0.5">
                              <Icon name="X" size={11} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Подвал */}
              <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={addEntry}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <Icon name="Plus" size={12} /> Добавить запись
                </button>
                <div className="text-xs text-gray-500">
                  Записей за {toMonthYear(monthKey + "-01")}: <b className="text-gray-800">{monthEntries.length}</b>
                </div>
              </div>

              {/* Datalists */}
              <datalist id="tb-fio-list">
                {empList.map((e) => <option key={e.id} value={e.fio}>{e.fio} · {e.dolzhnost}</option>)}
              </datalist>
              <datalist id="tb-ruk-list">
                {company.direktor && <option value={company.direktor} />}
                {empList.filter((e) => ["Директор", "Механик по выпуску", "Инженер по ОТ"].includes(e.dolzhnost)).map((e) => (
                  <option key={e.id} value={e.fio} />
                ))}
              </datalist>
            </div>
          )}

          {/* ── Ежедневные выходы из наряда ──────────────────────────────── */}
          {tab === "daily" && (
            <div>
              <div className="px-5 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-xs text-amber-700">
                <Icon name="Info" size={13} />
                Данные загружаются автоматически из Наряда · ✓ — работал, цветом — причина отсутствия
              </div>
              <div className="p-4">
                <DailySignatures
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