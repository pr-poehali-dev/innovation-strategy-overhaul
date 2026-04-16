import { useAppStore, CompanySettings, getGrafiki } from "@/store/appStore";

interface Props {
  setSaved: (v: boolean) => void;
}

const SettingsScheduleTab = ({ setSaved }: Props) => {
  const { routes, companies, routeSchedule, setRouteSchedule } = useAppStore();

  return (
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
  );
};

export default SettingsScheduleTab;
