import Icon from "@/components/ui/icon";
import { toNum } from "./kassaTypes";
import { PodrabJournalEntry } from "./kassaShared";

interface Props {
  podrabJournal: PodrabJournalEntry[];
  monthKey: string;
  onMonthChange: (v: string) => void;
}

const KassaPodrabJournal = ({ podrabJournal, monthKey, onMonthChange }: Props) => (
  <div>
    <div className="px-5 py-2 bg-amber-50 border-b border-amber-100 flex items-center justify-between text-xs text-amber-700">
      <span>
        <Icon name="Info" size={13} className="inline mr-1" />
        Зелёный ✓ — подработка выдана. При отметке сумма попадает в Ведомость (Получ. Подраб.)
      </span>
      <div className="flex items-center gap-2">
        <span className="text-gray-500">Месяц:</span>
        <input
          type="month"
          value={monthKey}
          onChange={(e) => onMonthChange(e.target.value)}
          className="border border-gray-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-400"
        />
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="border-collapse text-xs w-full">
        <thead>
          <tr style={{ backgroundColor: "#1a3a6b" }}>
            {["Дата", "Борт", "Маршрут", "Водитель", "Кондуктор", "Подр. вод, ₽", "Выд. вод", "Подр. конд, ₽", "Выд. конд"].map((h) => (
              <th key={h} className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-center leading-tight">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {podrabJournal.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center py-8 text-gray-400">
                Нет данных о подработках за выбранный месяц
              </td>
            </tr>
          )}
          {podrabJournal.map((e, i) => {
            const d = new Date(e.dateKey + "T00:00:00");
            const dateStr = d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
            const bg = i % 2 === 0 ? "#fff" : "#f5f8ff";
            return (
              <tr key={`${e.dateKey}-${e.bort}`} style={{ backgroundColor: bg }}>
                <td className="border border-gray-300 px-2 py-1 text-center">{dateStr}</td>
                <td className="border border-gray-300 px-2 py-1 text-center font-bold text-blue-800">{e.bort}</td>
                <td className="border border-gray-300 px-2 py-1 text-center">{e.mar}</td>
                <td className="border border-gray-300 px-2 py-1">{e.fioVod}</td>
                <td className="border border-gray-300 px-2 py-1 text-gray-500">{e.fioCond || "—"}</td>
                <td className="border border-gray-300 px-2 py-1 text-center text-orange-700 font-semibold">
                  {toNum(e.podrVod) > 0 ? e.podrVod : "—"}
                </td>
                <td className="border border-gray-300 text-center"
                  style={{ backgroundColor: e.vodVyd ? "#dcfce7" : toNum(e.podrVod) > 0 ? "#fef9c3" : undefined }}>
                  {toNum(e.podrVod) > 0 && (
                    <span className={`text-base font-bold ${e.vodVyd ? "text-green-600" : "text-gray-300"}`}>
                      {e.vodVyd ? "✓" : "○"}
                    </span>
                  )}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center text-orange-700 font-semibold">
                  {toNum(e.podrCond) > 0 ? e.podrCond : "—"}
                </td>
                <td className="border border-gray-300 text-center"
                  style={{ backgroundColor: e.condVyd ? "#dcfce7" : toNum(e.podrCond) > 0 ? "#fef9c3" : undefined }}>
                  {toNum(e.podrCond) > 0 && (
                    <span className={`text-base font-bold ${e.condVyd ? "text-green-600" : "text-gray-300"}`}>
                      {e.condVyd ? "✓" : "○"}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        {podrabJournal.length > 0 && (
          <tfoot>
            <tr style={{ backgroundColor: "#1a3a6b" }}>
              <td colSpan={5} className="border border-blue-900 px-2 py-1 text-white text-xs font-bold">ИТОГО</td>
              <td className="border border-blue-900 px-2 py-1 text-white text-center font-bold">
                {podrabJournal.reduce((s, e) => s + toNum(e.podrVod), 0).toLocaleString("ru-RU")}
              </td>
              <td className="border border-blue-900 px-2 py-1 text-white text-center text-xs">
                {podrabJournal.filter((e) => e.vodVyd).length} / {podrabJournal.filter((e) => toNum(e.podrVod) > 0).length}
              </td>
              <td className="border border-blue-900 px-2 py-1 text-white text-center font-bold">
                {podrabJournal.reduce((s, e) => s + toNum(e.podrCond), 0).toLocaleString("ru-RU")}
              </td>
              <td className="border border-blue-900 px-2 py-1 text-white text-center text-xs">
                {podrabJournal.filter((e) => e.condVyd).length} / {podrabJournal.filter((e) => toNum(e.podrCond) > 0).length}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  </div>
);

export default KassaPodrabJournal;
