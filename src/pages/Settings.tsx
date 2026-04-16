import { useState } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useAppStore, Route, getGrafiki, CompanySettings } from "@/store/appStore";

interface SimpleRow {
  id: number;
  nazvanie: string;
  znachenie: string;
}

const emptyRoute = (companyIdx: number): Route => ({
  id: Date.now() + Math.random(),
  nomer: "", nazvanie: "", nachalo: "", konets: "", grafikov: 1, intervalMin: "", rabochieChasy: "", companyIdx,
});

const emptySimpleRow = (): SimpleRow => ({
  id: Date.now() + Math.random(),
  nazvanie: "", znachenie: "",
});

const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

type TabType =
  | "company"
  | "routes"
  | "schedule"
  | "stoimostProezda"
  | "stoimostTopliva"
  | "procentVodBezCond"
  | "procentVodSCond"
  | "procentCond"
  | "obed"
  | "zpVodDezhurki"
  | "dezhDt"
  | "hozNuzhdyGarazh";

const TABS: { key: TabType; label: string; icon: string; unit?: string }[] = [
  { key: "company",           label: "Организация",                     icon: "Building2"   },
  { key: "routes",            label: "Маршруты",                        icon: "Route"       },
  { key: "schedule",          label: "Расписание выпуска",              icon: "Clock"       },
  { key: "stoimostProezda",   label: "Стоимость проезда",               icon: "Ticket",     unit: "₽"  },
  { key: "stoimostTopliva",   label: "Стоимость топлива",               icon: "Fuel",       unit: "₽/л" },
  { key: "procentVodBezCond", label: "% водителя без кондуктора",       icon: "Percent",    unit: "%"  },
  { key: "procentVodSCond",   label: "% водителя с кондуктором",        icon: "Percent",    unit: "%"  },
  { key: "procentCond",       label: "% кондуктора",                    icon: "Percent",    unit: "%"  },
  { key: "obed",              label: "Обеды",                           icon: "UtensilsCrossed", unit: "₽" },
  { key: "zpVodDezhurki",     label: "ЗП водителя дежурки",             icon: "Banknote",   unit: "₽"  },
  { key: "dezhDt",            label: "Дежурка ДТ",                      icon: "Droplets",   unit: "л"  },
  { key: "hozNuzhdyGarazh",   label: "Хоз. нужды гараж",               icon: "Wrench",     unit: "₽"  },
];

type RouteStringKey = "nomer" | "nazvanie" | "nachalo" | "konets" | "intervalMin" | "rabochieChasy";

const ROUTE_COLS: { key: RouteStringKey; label: string; width: string }[] = [
  { key: "nomer",         label: "№ маршрута",    width: "90px"  },
  { key: "nazvanie",      label: "Название",       width: "180px" },
  { key: "nachalo",       label: "Начало",         width: "130px" },
  { key: "konets",        label: "Конец",          width: "130px" },
  { key: "intervalMin",   label: "Интервал (мин)", width: "110px" },
  { key: "rabochieChasy", label: "Часы работы",    width: "110px" },
];

// Фиксированное одиночное значение
const FixedValueTab = ({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit?: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="px-8 py-10 flex flex-col items-start gap-4">
    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
      {label}{unit ? ` (${unit})` : ""}
    </label>
    <div className="flex items-center gap-3">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-48 px-4 py-3 text-2xl font-bold text-gray-800 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors text-center"
        placeholder="0"
      />
      {unit && <span className="text-lg text-gray-400 font-semibold">{unit}</span>}
    </div>
  </div>
);

// Таблица с процентами (с наименованием и значением)
const PercentTable = ({
  rows,
  onUpdate,
  onAdd,
  onDelete,
  unit,
}: {
  rows: SimpleRow[];
  onUpdate: (id: number, col: keyof SimpleRow, val: string) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
  unit?: string;
}) => {
  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);
  const COLS: { key: keyof Omit<SimpleRow, "id">; label: string; width: string }[] = [
    { key: "nazvanie",  label: "Наименование",                          width: "300px" },
    { key: "znachenie", label: `Значение${unit ? ` (${unit})` : ""}`,  width: "160px" },
  ];

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      if (colIdx + 1 < COLS.length) {
        setActiveCell({ rowId: rows[rowIdx].id, col: COLS[colIdx + 1].key });
      } else if (rowIdx + 1 < rows.length) {
        setActiveCell({ rowId: rows[rowIdx + 1].id, col: COLS[0].key });
      }
    }
  };

  return (
    <>
      <div className="px-5 py-3 border-b border-gray-200 flex justify-end">
        <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
          <Icon name="Plus" size={14} />
          Добавить строку
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs" style={{ minWidth: "400px" }}>
          <thead>
            <tr style={{ backgroundColor: "#1a3a6b" }}>
              <th className="border border-blue-900 px-1 py-1.5 text-white text-center" style={{ width: "28px" }}>№</th>
              {COLS.map((col) => (
                <th key={col.key} className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-left" style={{ width: col.width, minWidth: col.width }}>
                  {col.label}
                </th>
              ))}
              <th className="border border-blue-900 px-1 py-1" style={{ width: "28px" }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={row.id} className={rowIdx % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                <td className="border border-gray-300 text-center text-gray-400 select-none" style={{ width: "28px" }}>{rowIdx + 1}</td>
                {COLS.map((col, colIdx) => {
                  const isActive = activeCell?.rowId === row.id && activeCell?.col === col.key;
                  return (
                    <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
                      <input
                        type="text"
                        value={row[col.key] as string}
                        onChange={(e) => onUpdate(row.id, col.key, e.target.value)}
                        onFocus={() => setActiveCell({ rowId: row.id, col: col.key })}
                        onBlur={() => setActiveCell(null)}
                        onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                        autoFocus={isActive}
                        className={`w-full h-7 px-2 text-gray-800 bg-transparent outline-none border-2 ${
                          isActive ? "border-blue-500 bg-blue-50" : "border-transparent"
                        } transition-colors`}
                        placeholder={col.key === "znachenie" ? "0" : "—"}
                      />
                    </td>
                  );
                })}
                <td className="border border-gray-300 text-center" style={{ width: "28px" }}>
                  <button onClick={() => onDelete(row.id)} className="text-gray-300 hover:text-red-500 transition-colors p-0.5">
                    <Icon name="X" size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-300 px-5 py-2 bg-gray-50 text-xs text-gray-400">
        Строк: {rows.length}
      </div>
    </>
  );
};

const Settings = () => {
  const [tab, setTab] = useState<TabType>("company");
  const [saved, setSaved] = useState(false);

  const { companies, setCompanies, activeCompanyIdx, setActiveCompanyIdx, routes, setRoutes, naryadSettings, setNaryadSettings, routeSchedule, setRouteSchedule } = useAppStore();
  const company = companies[activeCompanyIdx];

  // Маршруты текущей организации
  const compRoutes = routes.filter((r) => r.companyIdx === activeCompanyIdx);

  const updateCompany = (key: keyof typeof company, value: string) => {
    setCompanies((prev) => prev.map((c, i) => i === activeCompanyIdx ? { ...c, [key]: value } : c));
    setSaved(false);
  };
  const [routeActiveCell, setRouteActiveCell] = useState<{ rowId: number; col: string } | null>(null);

  // Фиксированные одиночные значения
  const [stoimostProezda,  setStoimostProezda]  = useState("");
  const [stoimostTopliva,  setStoimostTopliva]  = useState("");
  const [zpVodDezhurki,    setZpVodDezhurki]    = useState("");
  const [dezhDt,           setDezhDt]           = useState("");
  const [hozNuzhdyGarazh,  setHozNuzhdyGarazh]  = useState("");

  // Фиксированная оплата: маршрут №6 — из appStore
  const fixedRoute6 = naryadSettings.fixedRoute6;
  const setFixedRoute6 = (v: string) => setNaryadSettings({ ...naryadSettings, fixedRoute6: v });

  // Процентные таблицы (наименование + значение)
  const [procentVodBezCond, setProcentVodBezCond] = useState<SimpleRow[]>([emptySimpleRow()]);
  const [procentVodSCond,   setProcentVodSCond]   = useState<SimpleRow[]>([emptySimpleRow()]);
  const [procentCond,       setProcentCond]       = useState<SimpleRow[]>([emptySimpleRow()]);

  const percentMap: Record<string, { rows: SimpleRow[]; setRows: React.Dispatch<React.SetStateAction<SimpleRow[]>> }> = {
    procentVodBezCond: { rows: procentVodBezCond, setRows: setProcentVodBezCond },
    procentVodSCond:   { rows: procentVodSCond,   setRows: setProcentVodSCond   },
    procentCond:       { rows: procentCond,       setRows: setProcentCond       },
  };

  const makePercentHandlers = (key: string) => {
    const { rows, setRows } = percentMap[key];
    return {
      rows,
      onUpdate: (id: number, col: keyof SimpleRow, val: string) => {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [col]: val } : r)));
        setSaved(false);
      },
      onAdd: () => setRows((prev) => [...prev, emptySimpleRow()]),
      onDelete: (id: number) => {
        if (rows.length === 1) return;
        setRows((prev) => prev.filter((r) => r.id !== id));
      },
    };
  };



  const addRoute = () => setRoutes((prev) => [...prev, emptyRoute(activeCompanyIdx)]);
  const deleteRoute = (id: number) => {
    setRoutes((prev) => prev.filter((r) => r.id !== id));
  };
  const updateRoute = (id: number, col: RouteStringKey, value: string) => {
    setRoutes((prev) => prev.map((r) => (r.id === id ? { ...r, [col]: value } : r)));
    setSaved(false);
  };
  const updateRouteGrafikov = (id: number, value: string) => {
    const n = parseInt(value) || 1;
    setRoutes((prev) => prev.map((r) => (r.id === id ? { ...r, grafikov: Math.max(1, n) } : r)));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const currentTabMeta = TABS.find((t) => t.key === tab);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Настройки" />

      <div className="px-4 py-5 max-w-5xl mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-300 px-5 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Настройки</h1>
              <p className="text-xs text-gray-500 mt-0.5">ООО «Дальавтотранс» · {today}</p>
            </div>
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-sm rounded transition-colors ${
                saved ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <Icon name={saved ? "Check" : "Save"} size={14} />
              {saved ? "Сохранено" : "Сохранить"}
            </button>
          </div>

          {/* Tabs — scrollable */}
          <div className="flex overflow-x-auto border-b border-gray-300 scrollbar-hide">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                  tab === t.key
                    ? "border-blue-600 text-blue-700 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <Icon name={t.icon as "Home"} size={13} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Company tab */}
          {tab === "company" && (
            <div className="px-6 py-6 max-w-4xl">
              {/* Переключатель организаций */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {companies.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveCompanyIdx(i)}
                    className={`px-4 py-2 text-sm rounded-lg border-2 transition-colors font-semibold ${
                      activeCompanyIdx === i
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                    }`}
                  >
                    <Icon name="Building2" size={13} className="inline mr-1.5" />
                    {c.nazvanie || `Организация ${i + 1}`}
                  </button>
                ))}
              </div>

              {/* Группы полей */}
              {([
                {
                  title: "Основные реквизиты",
                  icon: "Building2",
                  fields: [
                    { key: "nazvanie",       label: "Полное наименование",        span: 2 },
                    { key: "kratkoeNazvanie",label: "Краткое наименование",       span: 1 },
                    { key: "inn",            label: "ИНН",                        span: 1 },
                    { key: "kpp",            label: "КПП",                        span: 1 },
                    { key: "ogrn",           label: "ОГРН / ОГРНИП",              span: 1 },
                    { key: "okpo",           label: "Код ОКПО",                   span: 1 },
                    { key: "okvad",          label: "Основной ОКВЭД",             span: 1 },
                  ],
                },
                {
                  title: "Руководство",
                  icon: "UserCircle",
                  fields: [
                    { key: "direktor",      label: "ФИО руководителя",            span: 2 },
                    { key: "dolzhnostDir",  label: "Должность руководителя",      span: 1 },
                    { key: "glavbuh",       label: "ФИО главного бухгалтера",     span: 1 },
                  ],
                },
                {
                  title: "Адреса и контакты",
                  icon: "MapPin",
                  fields: [
                    { key: "adresYur",  label: "Юридический адрес",              span: 2 },
                    { key: "adres",     label: "Фактический / почтовый адрес",    span: 2 },
                    { key: "telefon",   label: "Телефон",                         span: 1 },
                    { key: "email",     label: "E-mail",                          span: 1 },
                  ],
                },
                {
                  title: "Банковские реквизиты",
                  icon: "Landmark",
                  fields: [
                    { key: "bank",            label: "Наименование банка",        span: 2 },
                    { key: "bik",             label: "БИК",                       span: 1 },
                    { key: "raschetnySchet",  label: "Расчётный счёт (р/с)",      span: 1 },
                    { key: "korSchet",        label: "Корр. счёт (к/с)",          span: 1 },
                  ],
                },
                {
                  title: "Лицензирование и реестр перевозчиков",
                  icon: "FileCheck",
                  fields: [
                    { key: "licenziya",      label: "Номер лицензии на перевозки (форма ЛСБ)",  span: 1 },
                    { key: "licenziyaData",  label: "Дата выдачи лицензии",                      span: 1 },
                    { key: "licenziyaVydan", label: "Лицензия выдана (орган)",                   span: 2 },
                    { key: "reestrNomer",    label: "Реестровый номер (реестр перевозчиков)",     span: 2 },
                  ],
                },
                {
                  title: "Муниципальные перевозки — разрешительные документы",
                  icon: "ScrollText",
                  fields: [
                    { key: "svidetelstvo",      label: "№ Свидетельства об осуществлении перевозок",      span: 1 },
                    { key: "svidetelstvoData",  label: "Дата свидетельства",                               span: 1 },
                    { key: "dogovorZakazchik",  label: "№ Договора с заказчиком перевозок",                span: 1 },
                    { key: "zakazchik",         label: "Наименование заказчика (мун. орган власти)",        span: 2 },
                    { key: "zakazchikInn",      label: "ИНН заказчика",                                    span: 1 },
                  ],
                },
              ] as Array<{ title: string; icon: string; fields: { key: keyof CompanySettings; label: string; span: number }[] }>).map((group) => (
                <div key={group.title} className="mb-8">
                  <div className="flex items-center gap-2 mb-3 pb-1 border-b border-gray-200">
                    <Icon name={group.icon as "Home"} size={15} className="text-blue-600" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{group.title}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {group.fields.map((field) => (
                      <div key={field.key} className={field.span === 2 ? "col-span-2" : "col-span-1"}>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          {field.label}
                        </label>
                        <input
                          type="text"
                          value={(company[field.key] as string) || ""}
                          onChange={(e) => updateCompany(field.key, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
                          placeholder="—"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Routes tab */}
          {tab === "routes" && (
            <>
              <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Маршруты организации: <b>{company.nazvanie}</b>
                </span>
                <button
                  onClick={addRoute}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <Icon name="Plus" size={14} />
                  Добавить маршрут
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="border-collapse text-xs" style={{ minWidth: "900px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#1a3a6b" }}>
                      <th className="border border-blue-900 px-1 py-1.5 text-white text-center" style={{ width: "28px" }}>№</th>
                      {ROUTE_COLS.map((col) => (
                        <th key={col.key} className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-left" style={{ width: col.width, minWidth: col.width }}>
                          {col.label}
                        </th>
                      ))}
                      <th className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-center" style={{ width: "75px" }}>Графиков</th>
                      <th className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-left" style={{ width: "200px" }}>Графики (список)</th>
                      <th className="border border-blue-900 px-1 py-1" style={{ width: "28px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {compRoutes.map((row, rowIdx) => (
                      <tr key={row.id} className={rowIdx % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                        <td className="border border-gray-300 text-center text-gray-400 select-none" style={{ width: "28px" }}>{rowIdx + 1}</td>
                        {ROUTE_COLS.map((col) => {
                          const isActive = routeActiveCell?.rowId === row.id && routeActiveCell?.col === col.key;
                          return (
                            <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
                              <input
                                type="text"
                                value={row[col.key]}
                                onChange={(e) => updateRoute(row.id, col.key, e.target.value)}
                                onFocus={() => setRouteActiveCell({ rowId: row.id, col: col.key })}
                                onBlur={() => setRouteActiveCell(null)}
                                autoFocus={isActive}
                                className={`w-full h-7 px-2 text-gray-800 bg-transparent outline-none border-2 ${
                                  isActive ? "border-blue-500 bg-blue-50" : "border-transparent"
                                } transition-colors`}
                              />
                            </td>
                          );
                        })}
                        {/* Кол-во графиков */}
                        <td className="border border-gray-300 p-0" style={{ width: "75px" }}>
                          <input
                            type="number"
                            min={1}
                            max={99}
                            value={row.grafikov}
                            onChange={(e) => updateRouteGrafikov(row.id, e.target.value)}
                            className="w-full h-7 px-2 text-gray-800 bg-transparent outline-none border-2 border-transparent focus:border-blue-500 focus:bg-blue-50 transition-colors text-center"
                          />
                        </td>
                        {/* Список графиков */}
                        <td className="border border-gray-300 px-2 py-1 text-xs text-gray-500" style={{ width: "200px" }}>
                          {getGrafiki(row).join(" · ")}
                        </td>
                        <td className="border border-gray-300 text-center" style={{ width: "28px" }}>
                          <button onClick={() => deleteRoute(row.id)} className="text-gray-300 hover:text-red-500 transition-colors p-0.5">
                            <Icon name="X" size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-gray-300 px-5 py-2 bg-gray-50 text-xs text-gray-400">
                Маршрутов: {compRoutes.length} · Всего графиков: {compRoutes.reduce((s, r) => s + r.grafikov, 0)}
              </div>
            </>
          )}

          {/* Фиксированные вкладки */}
          {tab === "stoimostProezda" && (
            <FixedValueTab label="Стоимость проезда" unit="₽" value={stoimostProezda} onChange={(v) => { setStoimostProezda(v); setSaved(false); }} />
          )}
          {tab === "stoimostTopliva" && (
            <FixedValueTab label="Стоимость топлива" unit="₽/л" value={stoimostTopliva} onChange={(v) => { setStoimostTopliva(v); setSaved(false); }} />
          )}
          {tab === "zpVodDezhurki" && (
            <FixedValueTab label="ЗП водителя дежурки" unit="₽" value={zpVodDezhurki} onChange={(v) => { setZpVodDezhurki(v); setSaved(false); }} />
          )}
          {tab === "dezhDt" && (
            <FixedValueTab label="Дежурка ДТ" unit="л" value={dezhDt} onChange={(v) => { setDezhDt(v); setSaved(false); }} />
          )}
          {tab === "hozNuzhdyGarazh" && (
            <FixedValueTab label="Хоз. нужды гараж" unit="₽" value={hozNuzhdyGarazh} onChange={(v) => { setHozNuzhdyGarazh(v); setSaved(false); }} />
          )}

          {/* Обеды */}
          {tab === "obed" && (
            <div className="px-6 py-6 max-w-lg">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5 text-xs text-amber-800 flex items-start gap-2">
                <Icon name="Info" size={14} className="mt-0.5 flex-shrink-0" />
                <div>
                  Суммы обедов автоматически попадают в поле <b>Обед</b> кассового отчёта при синхронизации из наряда.<br />
                  Если водитель едет <b>один</b> — начисляется первая сумма. Если <b>с кондуктором</b> — вторая.
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 border border-gray-200 rounded-lg px-4 py-3 bg-white">
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-gray-700">Водитель без кондуктора</div>
                    <div className="text-xs text-gray-400 mt-0.5">Один в рейсе</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={naryadSettings.obedVod}
                      onChange={(e) => { setNaryadSettings({ ...naryadSettings, obedVod: e.target.value }); setSaved(false); }}
                      className="w-24 h-8 px-2 text-sm font-semibold text-gray-800 border border-gray-300 rounded outline-none focus:border-blue-500 focus:bg-blue-50 text-right"
                    />
                    <span className="text-xs text-gray-500">₽</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 border border-gray-200 rounded-lg px-4 py-3 bg-white">
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-gray-700">Водитель с кондуктором</div>
                    <div className="text-xs text-gray-400 mt-0.5">Вдвоём в рейсе (суммарно)</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={naryadSettings.obedVodKond}
                      onChange={(e) => { setNaryadSettings({ ...naryadSettings, obedVodKond: e.target.value }); setSaved(false); }}
                      className="w-24 h-8 px-2 text-sm font-semibold text-gray-800 border border-gray-300 rounded outline-none focus:border-blue-500 focus:bg-blue-50 text-right"
                    />
                    <span className="text-xs text-gray-500">₽</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Блок фиксированных исключений для вкладки "% водителя без кондуктора" */}
          {tab === "procentVodBezCond" && (
            <div className="px-5 py-3 border-b border-gray-200 bg-amber-50">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Фиксированная оплата (исключения)</p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-700 w-52">Маршрут №6 — оплата за смену:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={fixedRoute6}
                    onChange={(e) => { setFixedRoute6(e.target.value); setSaved(false); }}
                    className="w-24 h-7 px-2 text-xs text-gray-800 border border-gray-300 rounded outline-none focus:border-blue-500 focus:bg-blue-50 transition-colors text-right"
                  />
                  <span className="text-xs text-gray-500">₽</span>
                </div>
                <span className="text-xs text-gray-400 italic">независимо от выручки</span>
              </div>
            </div>
          )}

          {/* Процентные вкладки */}
          {Object.keys(percentMap).includes(tab) && (
            <PercentTable
              {...makePercentHandlers(tab)}
              unit="%"
            />
          )}

          {/* Расписание выпуска */}
          {tab === "schedule" && (
            <>
              <div className="px-5 py-3 border-b border-gray-200 text-xs text-gray-500">
                Время выезда на линию и захода по каждому графику. Используется в журнале выпуска и путевых листах.
              </div>
              <div className="overflow-x-auto">
                <table className="border-collapse text-xs w-full" style={{ minWidth: "600px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#1a3a6b" }}>
                      <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-left" style={{ width: "80px" }}>Маршрут</th>
                      <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-left" style={{ width: "60px" }}>График</th>
                      <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-left" style={{ width: "120px" }}>Организация</th>
                      <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "130px" }}>Выезд на линию</th>
                      <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "130px" }}>Заход с линии</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes
                      .slice()
                      .sort((a, b) => Number(a.nomer) - Number(b.nomer))
                      .flatMap((route) =>
                        getGrafiki(route).map((grafik, idx) => {
                          const sched = routeSchedule[grafik] ?? { vypusk: "", zakhod: "" };
                          const rowBg = idx % 2 === 0 ? "#ffffff" : "#f0f4ff";
                          return (
                            <tr key={grafik} style={{ backgroundColor: rowBg }}>
                              <td className="border border-gray-300 px-2 py-1 font-bold text-blue-900">№{route.nomer}</td>
                              <td className="border border-gray-300 px-2 py-1 text-center text-gray-600">{grafik}</td>
                              <td className="border border-gray-300 px-2 py-1 text-gray-500 text-[11px]">
                                {(companies[route.companyIdx] as CompanySettings | undefined)?.nazvanie || "—"}
                              </td>
                              <td className="border border-gray-300 p-0 text-center">
                                <input
                                  type="text"
                                  value={sched.vypusk}
                                  onChange={(e) => {
                                    setRouteSchedule((prev) => ({
                                      ...prev,
                                      [grafik]: { ...sched, vypusk: e.target.value },
                                    }));
                                    setSaved(false);
                                  }}
                                  placeholder="05:00"
                                  className="w-full h-7 px-2 text-center text-gray-800 bg-transparent outline-none border-2 border-transparent focus:border-blue-500 focus:bg-blue-50 transition-colors font-semibold text-blue-900"
                                />
                              </td>
                              <td className="border border-gray-300 p-0 text-center">
                                <input
                                  type="text"
                                  value={sched.zakhod}
                                  onChange={(e) => {
                                    setRouteSchedule((prev) => ({
                                      ...prev,
                                      [grafik]: { ...sched, zakhod: e.target.value },
                                    }));
                                    setSaved(false);
                                  }}
                                  placeholder="19:00"
                                  className="w-full h-7 px-2 text-center text-gray-800 bg-transparent outline-none border-2 border-transparent focus:border-red-400 focus:bg-red-50 transition-colors font-semibold text-red-700"
                                />
                              </td>
                            </tr>
                          );
                        })
                      )}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-gray-300 px-5 py-2 bg-gray-50 text-xs text-gray-400">
                Всего графиков: {routes.reduce((s, r) => s + r.grafikov, 0)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;