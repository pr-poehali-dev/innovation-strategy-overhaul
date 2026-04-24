import Icon from "@/components/ui/icon";
import BackupButtons from "@/components/BackupButtons";
import { TabType, today } from "./types";

interface HeaderProps {
  addRow: () => void;
  onRestoreInitial: () => void;
  total: number;
}

export const KadryTopBar = ({ addRow, onRestoreInitial, total }: HeaderProps) => {
  return (
    <div className="border-b border-gray-300 px-5 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Кадры</h1>
        <p className="text-xs text-gray-500 mt-0.5">ООО «Дальавтотранс» · {today} · всего: {total}</p>
      </div>
      <div className="flex gap-2 flex-wrap justify-end">
        <BackupButtons />
        <button
          onClick={onRestoreInitial}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors print:hidden"
          title="Добавить сотрудников из начального справочника, которых сейчас нет в списке. Существующие данные не будут изменены."
        >
          <Icon name="RefreshCw" size={14} />
          Восстановить список
        </button>
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
  );
};

interface TabsProps {
  tab: TabType;
  setTab: (t: TabType) => void;
  tabs: { key: TabType; label: string; icon: string; count: number }[];
}

export const KadryTabs = ({ tab, setTab, tabs }: TabsProps) => {
  return (
    <div className="flex border-b border-gray-300">
      {tabs.map(({ key, label, icon, count }) => (
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
  );
};

export default KadryTopBar;