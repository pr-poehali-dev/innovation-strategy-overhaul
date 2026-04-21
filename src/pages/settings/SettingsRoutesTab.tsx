import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useAppStore, Route, getGrafiki } from "@/store/appStore";
import { uid } from "@/lib/uid";

const emptyRoute = (companyIdx: number): Route => ({
  id: uid(),
  nomer: "", nazvanie: "", nachalo: "", konets: "", grafikov: 1, intervalMin: "", rabochieChasy: "", companyIdx,
});

type RouteStringKey = "nomer" | "nazvanie" | "nachalo" | "konets" | "intervalMin" | "rabochieChasy";

const ROUTE_COLS: { key: RouteStringKey; label: string; width: string }[] = [
  { key: "nomer",         label: "№ маршрута",    width: "90px"  },
  { key: "nazvanie",      label: "Название",       width: "180px" },
  { key: "nachalo",       label: "Начало",         width: "130px" },
  { key: "konets",        label: "Конец",          width: "130px" },
  { key: "intervalMin",   label: "Интервал (мин)", width: "110px" },
  { key: "rabochieChasy", label: "Часы работы",    width: "110px" },
];

interface Props {
  setSaved: (v: boolean) => void;
}

const SettingsRoutesTab = ({ setSaved }: Props) => {
  const { companies, activeCompanyIdx, routes, setRoutes } = useAppStore();
  const company = companies[activeCompanyIdx];
  const compRoutes = routes.filter((r) => r.companyIdx === activeCompanyIdx);

  const [routeActiveCell, setRouteActiveCell] = useState<{ rowId: number; col: string } | null>(null);

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

  return (
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
  );
};

export default SettingsRoutesTab;