import Icon from "@/components/ui/icon";
import { ChastRow, Day, DAYS, toNum, calcOstatok } from "./kassaTypes";

interface Props {
  chastRows: ChastRow[];
  onUpdateChast: (id: number, field: "fio" | "nachisleno", val: string) => void;
  onUpdateChastDay: (id: number, day: Day, val: string) => void;
  onAddChastRow: () => void;
}

const ChastVydacha = ({ chastRows, onUpdateChast, onUpdateChastDay, onAddChastRow }: Props) => {
  const chastTotalNach = chastRows.reduce((s, r) => s + toNum(r.nachisleno), 0);
  const chastTotalByDay = (day: Day) => chastRows.reduce((s, r) => s + toNum(r.vyplaty[day]), 0);
  const chastTotalOst = chastRows.reduce((s, r) => s + calcOstatok(r), 0);

  return (
    <div>
      <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between print:hidden">
        <span className="text-xs text-gray-500">Дни выдачи — с 5 по 31 число месяца</span>
        <button onClick={onAddChastRow}
          className="flex items-center gap-1.5 px-2 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700">
          <Icon name="Plus" size={12} /> Строка
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr style={{ backgroundColor: "#1a3a6b" }}>
              <th className="border border-blue-900 px-1 py-2 text-white text-center sticky left-0 z-10" style={{ width: "28px", backgroundColor: "#1a3a6b" }}>№</th>
              <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-left sticky left-7 z-10" style={{ width: "160px", backgroundColor: "#1a3a6b" }}>Ф.И.О.</th>
              <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "80px" }}>начислено</th>
              {DAYS.map((d) => (
                <th key={d} className="border border-blue-900 px-1 py-2 text-white font-semibold text-center" style={{ width: "48px" }}>{d}</th>
              ))}
              <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "80px" }}>остаток к выдаче</th>
            </tr>
          </thead>
          <tbody>
            {chastRows.map((row, idx) => {
              const ost = calcOstatok(row);
              const rowBg = idx % 2 === 0 ? "#ffffff" : "#f0f4ff";
              return (
                <tr key={row.id} style={{ backgroundColor: rowBg }}>
                  <td className="border border-gray-300 text-center text-gray-400 select-none sticky left-0 z-10 text-xs" style={{ width: "28px", backgroundColor: rowBg }}>{idx + 1}</td>
                  <td className="border border-gray-300 p-0 sticky left-7 z-10" style={{ width: "160px", backgroundColor: rowBg }}>
                    <input
                      type="text"
                      value={row.fio}
                      onChange={(e) => onUpdateChast(row.id, "fio", e.target.value)}
                      className="w-full h-6 px-2 text-xs text-gray-800 bg-transparent outline-none border-2 border-transparent focus:border-blue-500 focus:bg-blue-50 transition-colors font-medium"
                      placeholder="—"
                    />
                  </td>
                  <td className="border border-gray-300 p-0" style={{ width: "80px" }}>
                    <input
                      type="text"
                      value={row.nachisleno}
                      onChange={(e) => onUpdateChast(row.id, "nachisleno", e.target.value)}
                      className="w-full h-6 px-1 text-xs text-center font-bold text-blue-900 bg-transparent outline-none border-2 border-transparent focus:border-blue-500 focus:bg-blue-50 transition-colors"
                      placeholder="0"
                    />
                  </td>
                  {DAYS.map((d) => {
                    const val = row.vyplaty[d];
                    return (
                      <td key={d} className="border border-gray-300 p-0" style={{ width: "48px" }}>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => onUpdateChastDay(row.id, d, e.target.value)}
                          className="w-full h-6 px-0.5 text-xs text-center text-gray-800 bg-transparent outline-none border-2 border-transparent focus:border-blue-500 focus:bg-blue-50 transition-colors"
                          placeholder=""
                        />
                      </td>
                    );
                  })}
                  <td
                    className="border border-gray-300 px-1 text-center text-xs font-bold"
                    style={{ width: "80px", color: ost < 0 ? "#dc2626" : ost === 0 ? "#6b7280" : "#15803d" }}
                  >
                    {ost !== 0 ? ost.toLocaleString("ru-RU") : "0"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: "#1a3a6b" }}>
              <td colSpan={2} className="border border-blue-900 px-2 py-1.5 text-right text-white font-bold text-xs sticky left-0 z-10" style={{ backgroundColor: "#1a3a6b" }}>ИТОГО:</td>
              <td className="border border-blue-900 px-1 py-1.5 text-center text-white font-bold text-xs" style={{ width: "80px" }}>
                {chastTotalNach > 0 ? chastTotalNach.toLocaleString("ru-RU") : ""}
              </td>
              {DAYS.map((d) => {
                const s = chastTotalByDay(d);
                return (
                  <td key={d} className="border border-blue-900 px-0.5 py-1.5 text-center text-white font-bold text-xs" style={{ width: "48px" }}>
                    {s > 0 ? s.toLocaleString("ru-RU") : ""}
                  </td>
                );
              })}
              <td className="border border-blue-900 px-1 py-1.5 text-center font-bold text-xs" style={{ width: "80px", color: chastTotalOst < 0 ? "#fca5a5" : "#86efac" }}>
                {chastTotalOst.toLocaleString("ru-RU")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ChastVydacha;
