import { useState } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useAppStore, Employee } from "@/store/appStore";
import { uid } from "@/lib/uid";

type TabType = "voditely" | "konduktery" | "itr";

const ITR_DOLZHNOSTI = [
  "Директор",
  "Нач. гаража",
  "Механик по выпуску",
  "Механик по ремонту",
  "Диспетчер",
  "Слесарь",
  "Медик",
  "Клининг менеджер",
];

const emptyEmployee = (dolzhnost: string, kadryTab: "voditely" | "konduktery" | "itr"): Employee => ({
  id: uid(),
  tabNum: "",
  fio: "",
  dolzhnost,
  bort: "",
  kategoriya: "",
  telefon: "",
  dataRozhd: "",
  dataPriema: "",
  status: "active",
  inn: "",
  snils: "",
  udostoverenie: "",
  udostoverenieDo: "",
  medSpravka: "",
  medSpravkaDo: "",
  adresReg: "",
  kadryTab,
});

const VOD_COLUMNS = [
  { key: "tabNum",          label: "Таб. №",           width: "70px"  },
  { key: "fio",             label: "ФИО",              width: "200px" },
  { key: "bort",            label: "Борт №",           width: "80px"  },
  { key: "kategoriya",      label: "Категория",        width: "90px"  },
  { key: "udostoverenie",   label: "Уд-ие вод. №",     width: "120px" },
  { key: "udostoverenieDo", label: "ВУ действ. до",    width: "115px" },
  { key: "medSpravka",      label: "Мед. справка №",   width: "120px" },
  { key: "medSpravkaDo",    label: "Мед. действ. до",  width: "115px" },
  { key: "telefon",         label: "Телефон",          width: "130px" },
  { key: "inn",             label: "ИНН",              width: "120px" },
  { key: "snils",           label: "СНИЛС",            width: "130px" },
  { key: "dataRozhd",       label: "Дата рождения",    width: "110px" },
  { key: "dataPriema",      label: "Дата приёма",      width: "110px" },
  { key: "adresReg",        label: "Адрес регистрации", width: "220px" },
  { key: "status",          label: "Статус",           width: "90px"  },
] as const;

const COND_COLUMNS = [
  { key: "tabNum",     label: "Таб. №",           width: "70px"  },
  { key: "fio",        label: "ФИО",              width: "200px" },
  { key: "bort",       label: "Борт №",           width: "80px"  },
  { key: "medSpravka",   label: "Мед. справка №",  width: "120px" },
  { key: "medSpravkaDo", label: "Мед. действ. до", width: "115px" },
  { key: "telefon",    label: "Телефон",          width: "130px" },
  { key: "inn",        label: "ИНН",              width: "120px" },
  { key: "snils",      label: "СНИЛС",            width: "130px" },
  { key: "dataRozhd",  label: "Дата рождения",    width: "110px" },
  { key: "dataPriema", label: "Дата приёма",      width: "110px" },
  { key: "adresReg",   label: "Адрес регистрации", width: "220px" },
  { key: "status",     label: "Статус",           width: "90px"  },
] as const;

const ITR_COLUMNS = [
  { key: "tabNum",     label: "Таб. №",        width: "70px"  },
  { key: "fio",        label: "ФИО",           width: "200px" },
  { key: "dolzhnost",  label: "Должность",     width: "160px" },
  { key: "telefon",    label: "Телефон",       width: "130px" },
  { key: "inn",        label: "ИНН",           width: "120px" },
  { key: "snils",      label: "СНИЛС",         width: "130px" },
  { key: "dataRozhd",  label: "Дата рождения", width: "110px" },
  { key: "dataPriema", label: "Дата приёма",   width: "110px" },
  { key: "status",     label: "Статус",        width: "90px"  },
] as const;

const ITR_DOLZHNOSTI_SET = new Set(ITR_DOLZHNOSTI);

const StatusBadge = ({ value, onChange }: { value: "active" | "inactive"; onChange: (v: "active" | "inactive") => void }) => (
  <button
    onClick={() => onChange(value === "active" ? "inactive" : "active")}
    className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
      value === "active"
        ? "bg-green-100 text-green-700 hover:bg-green-200"
        : "bg-red-100 text-red-600 hover:bg-red-200"
    }`}
  >
    {value === "active" ? "Активен" : "Уволен"}
  </button>
);

const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

const Kadry = () => {
  const { employees, setEmployees } = useAppStore();
  const [tab, setTab] = useState<TabType>("voditely");
  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);

  const voditely   = employees.filter((e) => e.kadryTab ? e.kadryTab === "voditely"   : e.dolzhnost === "Водитель");
  const konduktery = employees.filter((e) => e.kadryTab ? e.kadryTab === "konduktery" : e.dolzhnost === "Кондуктор");
  const itr        = employees.filter((e) => e.kadryTab ? e.kadryTab === "itr"        : ITR_DOLZHNOSTI_SET.has(e.dolzhnost));

  const rows    = tab === "voditely" ? voditely : tab === "konduktery" ? konduktery : itr;
  const columns = tab === "voditely" ? VOD_COLUMNS : tab === "konduktery" ? COND_COLUMNS : ITR_COLUMNS;

  const updateCell = (id: number, col: keyof Employee, value: string) => {
    setEmployees((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const updated: Employee = { ...r, [col]: value };
      // При смене должности перемещаем сотрудника в соответствующий таб
      if (col === "dolzhnost") {
        if (value === "Водитель") updated.kadryTab = "voditely";
        else if (value === "Кондуктор") updated.kadryTab = "konduktery";
        else if (ITR_DOLZHNOSTI_SET.has(value)) updated.kadryTab = "itr";
      }
      return updated;
    }));
  };

  const addRow = () => {
    const dolzhnost = tab === "voditely" ? "Водитель" : tab === "konduktery" ? "Кондуктор" : ITR_DOLZHNOSTI[0];
    setEmployees((prev) => [...prev, emptyEmployee(dolzhnost, tab)]);
  };

  const deleteRow = (id: number) => {
    if (rows.length === 1) return;
    setEmployees((prev) => prev.filter((r) => r.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      const editableCols = columns.filter((c) => c.key !== "status");
      if (colIdx + 1 < editableCols.length) {
        setActiveCell({ rowId: rows[rowIdx].id, col: editableCols[colIdx + 1].key });
      } else if (rowIdx + 1 < rows.length) {
        setActiveCell({ rowId: rows[rowIdx + 1].id, col: editableCols[0].key });
      }
    }
  };

  const activeCount = rows.filter((r) => r.status === "active").length;

  const TABS: { key: TabType; label: string; icon: string; count: number }[] = [
    { key: "voditely",   label: "Водители",   icon: "Steering", count: voditely.filter((r) => r.status === "active").length },
    { key: "konduktery", label: "Кондукторы", icon: "Ticket",   count: konduktery.filter((r) => r.status === "active").length },
    { key: "itr",        label: "ИТР",        icon: "HardHat",  count: itr.filter((r) => r.status === "active").length },
  ];

  // ─── Сводка «Скоро заканчиваются документы» ──────────────────────────────
  type ExpStatus = "exp" | "warn";
  type ExpItem = { emp: Employee; doc: "ВУ" | "Мед. справка"; date: string; days: number; status: ExpStatus; goTab: TabType };
  const now = new Date(); now.setHours(0,0,0,0);
  const expiries: ExpItem[] = [];
  const pushExp = (emp: Employee, doc: "ВУ" | "Мед. справка", date: string | undefined, goTab: TabType) => {
    if (!date) return;
    const d = new Date(date);
    if (isNaN(d.getTime())) return;
    const days = Math.ceil((d.getTime() - now.getTime()) / 86400000);
    if (days > 30) return;
    expiries.push({ emp, doc, date, days, status: days < 0 ? "exp" : "warn", goTab });
  };
  employees.filter((e) => e.status === "active").forEach((e) => {
    const goTab: TabType = e.kadryTab ?? (e.dolzhnost === "Кондуктор" ? "konduktery" : e.dolzhnost === "Водитель" ? "voditely" : "itr");
    if (e.dolzhnost === "Водитель") pushExp(e, "ВУ", e.udostoverenieDo, goTab);
    pushExp(e, "Мед. справка", e.medSpravkaDo, goTab);
  });
  expiries.sort((a, b) => a.days - b.days);
  const expiredCount = expiries.filter((x) => x.status === "exp").length;
  const warnCount    = expiries.filter((x) => x.status === "warn").length;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Кадры" />

      <div className="px-4 py-5 max-w-5xl mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-300 px-5 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Кадры</h1>
              <p className="text-xs text-gray-500 mt-0.5">ООО «Дальавтотранс» · {today}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addRow}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Icon name="Plus" size={14} />
                Добавить
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors print:hidden"
              >
                <Icon name="Printer" size={14} />
                Печать
              </button>
            </div>
          </div>

          {/* Сводка по срокам документов */}
          {expiries.length > 0 && (
            <div className="border-b border-gray-300 px-5 py-3 bg-amber-50 print:hidden">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="AlertTriangle" size={16} className="text-amber-700" />
                <span className="font-semibold text-sm text-gray-800">
                  Скоро заканчиваются документы
                </span>
                {expiredCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-semibold">
                    Просрочено: {expiredCount}
                  </span>
                )}
                {warnCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-semibold">
                    ≤ 30 дней: {warnCount}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                {expiries.map((x, i) => (
                  <button
                    key={i}
                    onClick={() => setTab(x.goTab)}
                    className={`flex items-center justify-between gap-2 px-2 py-1 rounded text-xs border text-left transition-colors ${
                      x.status === "exp"
                        ? "bg-red-50 border-red-200 hover:bg-red-100 text-red-800"
                        : "bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-900"
                    }`}
                    title={x.status === "exp" ? `Документ просрочен на ${Math.abs(x.days)} дн.` : `Осталось ${x.days} дн.`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="font-semibold truncate">{x.emp.fio || "(без ФИО)"}</span>
                      <span className="text-gray-500">·</span>
                      <span>{x.doc}</span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-gray-500">до {x.date}</span>
                      {x.status === "exp"
                        ? <span className="font-bold">просрочено {Math.abs(x.days)} дн.</span>
                        : <span className="font-bold">{x.days} дн.</span>}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-300">
            {TABS.map(({ key, label, icon, count }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-6 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  tab === key
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon name={icon} size={15} />
                  {label}
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
                    {count}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="border-collapse text-xs w-full">
              <thead>
                <tr style={{ backgroundColor: "#1a3a6b" }}>
                  <th className="border border-blue-900 px-1 py-1.5 text-white font-semibold text-center" style={{ width: "28px" }}>№</th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-left"
                      style={{ width: col.width, minWidth: col.width }}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="border border-blue-900 px-1 py-1 text-white" style={{ width: "28px" }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={row.id} className={row.tip === "arendator" ? "bg-yellow-100" : row.tip === "podrabotka" ? "bg-sky-100" : (rowIdx % 2 === 0 ? "bg-white" : "bg-blue-50")}>
                    <td className="border border-gray-300 text-center text-gray-400 select-none py-0" style={{ width: "28px" }}>
                      {rowIdx + 1}
                    </td>
                    {columns.map((col, colIdx) => {
                      if (col.key === "status") {
                        return (
                          <td key={col.key} className="border border-gray-300 px-2 py-1" style={{ width: col.width }}>
                            <StatusBadge
                              value={row.status}
                              onChange={(v) => updateCell(row.id, "status", v)}
                            />
                          </td>
                        );
                      }
                      // Должность ИТР — выпадающий список
                      if (col.key === "dolzhnost" && tab === "itr") {
                        return (
                          <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
                            <select
                              value={row.dolzhnost}
                              onChange={(e) => updateCell(row.id, "dolzhnost", e.target.value)}
                              className="w-full h-7 px-2 text-xs text-gray-800 bg-transparent outline-none border-2 border-transparent focus:border-blue-500 focus:bg-blue-50 transition-colors cursor-pointer"
                            >
                              {ITR_DOLZHNOSTI.map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </td>
                        );
                      }
                      const isActive = activeCell?.rowId === row.id && activeCell?.col === col.key;
                      // Поля-даты
                      const isDate = col.key === "udostoverenieDo" || col.key === "medSpravkaDo";
                      const val = (row[col.key as keyof Employee] as string) ?? "";
                      // Подсветка: красная — просрочено, жёлтая — меньше 30 дней
                      let warnBg = "";
                      if (isDate && val) {
                        const exp = new Date(val);
                        const now = new Date(); now.setHours(0,0,0,0);
                        const days = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
                        if (days < 0) warnBg = "bg-red-100 text-red-700 font-semibold";
                        else if (days <= 30) warnBg = "bg-yellow-100 text-yellow-800 font-semibold";
                      }
                      return (
                        <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
                          <input
                            type={isDate ? "date" : "text"}
                            value={val}
                            onChange={(e) => updateCell(row.id, col.key as keyof Employee, e.target.value)}
                            onFocus={() => setActiveCell({ rowId: row.id, col: col.key })}
                            onBlur={() => setActiveCell(null)}
                            onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                            autoFocus={isActive}
                            title={isDate && warnBg.includes("red") ? "Срок действия истёк" : isDate && warnBg ? "Скоро истекает срок" : undefined}
                            className={`w-full h-7 px-2 bg-transparent outline-none border-2 ${
                              isActive ? "border-blue-500 bg-blue-50" : "border-transparent"
                            } ${warnBg || "text-gray-800"} transition-colors`}
                          />
                        </td>
                      );
                    })}
                    <td className="border border-gray-300 text-center" style={{ width: "28px" }}>
                      <button onClick={() => deleteRow(row.id)} className="text-gray-300 hover:text-red-500 transition-colors p-0.5">
                        <Icon name="X" size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-300 px-5 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-400 print:hidden">
            <span>Активных: {activeCount} / Всего: {rows.length}</span>
            <span>Tab / Enter — переход между ячейками</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kadry;