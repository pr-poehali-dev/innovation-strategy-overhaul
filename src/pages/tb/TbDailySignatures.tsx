import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { useAppStore, CompanySettings } from "@/store/appStore";
import { getDaysInMonth, toDisplayDate } from "./tbShared";

interface Props {
  monthKey: string;
  company: CompanySettings;
  companyIdx: number;
}

const TbDailySignatures = ({ monthKey, companyIdx }: Props) => {
  const { weeklyNaryady, weeklyDayMeta, employees, routes } = useAppStore();

  const days = useMemo(() => getDaysInMonth(monthKey), [monthKey]);

  const companyRouteNomers = useMemo(
    () => new Set(routes.filter((r) => r.companyIdx === companyIdx).map((r) => r.nomer)),
    [routes, companyIdx]
  );

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

export default TbDailySignatures;
