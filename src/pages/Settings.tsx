import { useState } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";

interface Route {
  id: number;
  nomer: string;
  nazvanie: string;
  nachalo: string;
  konets: string;
  intervalMin: string;
  rabochieChasy: string;
}

interface CompanySettings {
  nazvanie: string;
  inn: string;
  direktor: string;
  telefon: string;
  adres: string;
}

interface SimpleRow {
  id: number;
  nazvanie: string;
  znachenie: string;
}

const emptyRoute = (): Route => ({
  id: Date.now() + Math.random(),
  nomer: "", nazvanie: "", nachalo: "", konets: "", intervalMin: "", rabochieChasy: "",
});

const emptySimpleRow = (): SimpleRow => ({
  id: Date.now() + Math.random(),
  nazvanie: "", znachenie: "",
});

const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

type TabType =
  | "company"
  | "routes"
  | "stoimostProezda"
  | "stoimostTopliva"
  | "procentVodBezCond"
  | "procentVodSCond"
  | "procentCond"
  | "zpVodDezhurki"
  | "dezhDt"
  | "hozNuzhdyGarazh";

const TABS: { key: TabType; label: string; icon: string; unit?: string }[] = [
  { key: "company",           label: "Организация",                     icon: "Building2"   },
  { key: "routes",            label: "Маршруты",                        icon: "Route"       },
  { key: "stoimostProezda",   label: "Стоимость проезда",               icon: "Ticket",     unit: "₽"  },
  { key: "stoimostTopliva",   label: "Стоимость топлива",               icon: "Fuel",       unit: "₽/л" },
  { key: "procentVodBezCond", label: "% водителя без кондуктора",       icon: "Percent",    unit: "%"  },
  { key: "procentVodSCond",   label: "% водителя с кондуктором",        icon: "Percent",    unit: "%"  },
  { key: "procentCond",       label: "% кондуктора",                    icon: "Percent",    unit: "%"  },
  { key: "zpVodDezhurki",     label: "ЗП водителя дежурки",             icon: "Banknote",   unit: "₽"  },
  { key: "dezhDt",            label: "Дежурка ДТ",                      icon: "Droplets",   unit: "л"  },
  { key: "hozNuzhdyGarazh",   label: "Хоз. нужды гараж",               icon: "Wrench",     unit: "₽"  },
];

const ROUTE_COLS: { key: keyof Omit<Route, "id">; label: string; width: string }[] = [
  { key: "nomer",         label: "№ маршрута",    width: "100px" },
  { key: "nazvanie",      label: "Название",       width: "180px" },
  { key: "nachalo",       label: "Начало",         width: "140px" },
  { key: "konets",        label: "Конец",          width: "140px" },
  { key: "intervalMin",   label: "Интервал (мин)", width: "120px" },
  { key: "rabochieChasy", label: "Часы работы",    width: "130px" },
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

  const [company, setCompany] = useState<CompanySettings>({
    nazvanie: 'ООО "Дальавтотранс"',
    inn: "", direktor: "", telefon: "", adres: "",
  });
  const [routes, setRoutes] = useState<Route[]>([emptyRoute(), emptyRoute()]);
  const [routeActiveCell, setRouteActiveCell] = useState<{ rowId: number; col: string } | null>(null);

  // Фиксированные одиночные значения
  const [stoimostProezda,  setStoimostProezda]  = useState("");
  const [stoimostTopliva,  setStoimostTopliva]  = useState("");
  const [zpVodDezhurki,    setZpVodDezhurki]    = useState("");
  const [dezhDt,           setDezhDt]           = useState("");
  const [hozNuzhdyGarazh,  setHozNuzhdyGarazh]  = useState("");

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

  const updateCompany = (key: keyof CompanySettings, value: string) => {
    setCompany((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const addRoute = () => setRoutes((prev) => [...prev, emptyRoute()]);
  const deleteRoute = (id: number) => {
    if (routes.length === 1) return;
    setRoutes((prev) => prev.filter((r) => r.id !== id));
  };
  const updateRoute = (id: number, col: keyof Route, value: string) => {
    setRoutes((prev) => prev.map((r) => (r.id === id ? { ...r, [col]: value } : r)));
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
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 gap-4 max-w-lg">
                {[
                  { key: "nazvanie" as keyof CompanySettings, label: "Название организации" },
                  { key: "inn"      as keyof CompanySettings, label: "ИНН" },
                  { key: "direktor" as keyof CompanySettings, label: "Директор (ФИО)" },
                  { key: "telefon"  as keyof CompanySettings, label: "Телефон" },
                  { key: "adres"    as keyof CompanySettings, label: "Адрес" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={company[field.key]}
                      onChange={(e) => updateCompany(field.key, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Routes tab */}
          {tab === "routes" && (
            <>
              <div className="px-5 py-3 border-b border-gray-200 flex justify-end">
                <button
                  onClick={addRoute}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <Icon name="Plus" size={14} />
                  Добавить маршрут
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="border-collapse text-xs w-full">
                  <thead>
                    <tr style={{ backgroundColor: "#1a3a6b" }}>
                      <th className="border border-blue-900 px-1 py-1.5 text-white text-center" style={{ width: "28px" }}>№</th>
                      {ROUTE_COLS.map((col) => (
                        <th key={col.key} className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-left" style={{ width: col.width, minWidth: col.width }}>
                          {col.label}
                        </th>
                      ))}
                      <th className="border border-blue-900 px-1 py-1" style={{ width: "28px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map((row, rowIdx) => (
                      <tr key={row.id} className={rowIdx % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                        <td className="border border-gray-300 text-center text-gray-400 select-none" style={{ width: "28px" }}>{rowIdx + 1}</td>
                        {ROUTE_COLS.map((col) => {
                          const isActive = routeActiveCell?.rowId === row.id && routeActiveCell?.col === col.key;
                          return (
                            <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
                              <input
                                type="text"
                                value={row[col.key] as string}
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
                Маршрутов: {routes.length}
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

          {/* Процентные вкладки */}
          {Object.keys(percentMap).includes(tab) && (
            <PercentTable
              {...makePercentHandlers(tab)}
              unit="%"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;