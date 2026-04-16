import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useAppStore } from "@/store/appStore";
import { TabType, SimpleRow, emptySimpleRow, FixedValueTab, PercentTable } from "./settingsShared";

interface Props {
  tab: TabType;
  setSaved: (v: boolean) => void;
}

const PERCENT_TABS: TabType[] = ["procentVodBezCond", "procentVodSCond", "procentCond"];

const SettingsNormsTab = ({ tab, setSaved }: Props) => {
  const { naryadSettings, setNaryadSettings } = useAppStore();

  const upd = (key: keyof typeof naryadSettings, v: string) => {
    setNaryadSettings((prev) => ({ ...prev, [key]: v }));
    setSaved(false);
  };

  const stoimostProezda = naryadSettings.stoimostProezda;
  const stoimostTopliva = naryadSettings.stoimostTopliva;
  const zpVodDezhurki   = naryadSettings.zpVodDezhurki;
  const dezhDt          = naryadSettings.dezhDt;
  const hozNuzhdyGarazh = naryadSettings.hozNuzhdyGarazh;
  const fixedRoute6     = naryadSettings.fixedRoute6;

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

  return (
    <>
      {/* Фиксированные вкладки */}
      {tab === "stoimostProezda" && (
        <FixedValueTab label="Стоимость проезда" unit="₽" value={stoimostProezda} onChange={(v) => upd("stoimostProezda", v)} />
      )}
      {tab === "stoimostTopliva" && (
        <FixedValueTab label="Стоимость топлива" unit="₽/л" value={stoimostTopliva} onChange={(v) => upd("stoimostTopliva", v)} />
      )}
      {tab === "zpVodDezhurki" && (
        <FixedValueTab label="ЗП водителя дежурки" unit="₽" value={zpVodDezhurki} onChange={(v) => upd("zpVodDezhurki", v)} />
      )}
      {tab === "dezhDt" && (
        <FixedValueTab label="Дежурка ДТ" unit="₽" value={dezhDt} onChange={(v) => upd("dezhDt", v)} />
      )}
      {tab === "hozNuzhdyGarazh" && (
        <FixedValueTab label="Хоз. нужды гараж" unit="₽" value={hozNuzhdyGarazh} onChange={(v) => upd("hozNuzhdyGarazh", v)} />
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
                  onChange={(e) => upd("obedVod", e.target.value)}
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
                  onChange={(e) => upd("obedVodKond", e.target.value)}
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
                onChange={(e) => upd("fixedRoute6", e.target.value)}
                className="w-24 h-7 px-2 text-xs text-gray-800 border border-gray-300 rounded outline-none focus:border-blue-500 focus:bg-blue-50 transition-colors text-right"
              />
              <span className="text-xs text-gray-500">₽</span>
            </div>
            <span className="text-xs text-gray-400 italic">независимо от выручки</span>
          </div>
        </div>
      )}

      {/* Процентные вкладки */}
      {PERCENT_TABS.includes(tab) && (
        <PercentTable
          {...makePercentHandlers(tab)}
          unit="%"
        />
      )}
    </>
  );
};

export default SettingsNormsTab;
