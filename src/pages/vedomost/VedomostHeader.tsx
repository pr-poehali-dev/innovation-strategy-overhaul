import Icon from "@/components/ui/icon";
import { today, MONTH_NAMES } from "./types";

interface Props {
  monthKey: string;
  setMonthKey: (v: string) => void;
  syncFromKadryAndKassa: () => void;
  addRow: () => void;
}

const VedomostHeader = ({ monthKey, setMonthKey, syncFromKadryAndKassa, addRow }: Props) => {
  return (
    <div className="border-b border-gray-300 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Расчётная ведомость</h1>
        <p className="text-sm text-gray-500 mt-0.5">Дальавтотранс · {today}</p>
      </div>
      <div className="flex gap-2 items-center">
        <select
          value={monthKey}
          onChange={(e) => setMonthKey(e.target.value)}
          className="px-2 py-1.5 text-sm border border-gray-300 rounded bg-white"
          title="Месяц для автозаполнения"
        >
          {(() => {
            const opts: { value: string; label: string }[] = [];
            const d = new Date();
            for (let i = 0; i < 12; i++) {
              const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
              const v = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
              opts.push({ value: v, label: `${MONTH_NAMES[dt.getMonth()]} ${dt.getFullYear()}` });
            }
            return opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>);
          })()}
        </select>
        <button
          onClick={syncFromKadryAndKassa}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          title="Заполнить ФИО из Кадров, Начислено и Получ. Подраб. из Кассы за выбранный месяц"
        >
          <Icon name="RefreshCw" size={14} />
          Автозаполнение
        </button>
        <button onClick={addRow} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
          <Icon name="Plus" size={14} />
          Добавить строку
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          <Icon name="Printer" size={14} />
          Печать
        </button>
      </div>
    </div>
  );
};

export default VedomostHeader;
