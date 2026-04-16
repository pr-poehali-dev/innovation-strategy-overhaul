import Icon from "@/components/ui/icon";
import { useAppStore } from "@/store/appStore";
import { TabType, FixedValueTab } from "./settingsShared";

interface Props {
  tab: TabType;
  setSaved: (v: boolean) => void;
}

const SettingsNormsTab = ({ tab, setSaved }: Props) => {
  const { naryadSettings, setNaryadSettings } = useAppStore();

  const upd = (key: keyof typeof naryadSettings, v: string) => {
    setNaryadSettings((prev) => ({ ...prev, [key]: v }));
    setSaved(false);
  };

  return (
    <>
      {/* Фиксированные вкладки */}
      {tab === "stoimostProezda" && (
        <FixedValueTab label="Стоимость проезда" unit="₽" value={naryadSettings.stoimostProezda} onChange={(v) => upd("stoimostProezda", v)} />
      )}
      {tab === "stoimostTopliva" && (
        <FixedValueTab label="Стоимость топлива" unit="₽/л" value={naryadSettings.stoimostTopliva} onChange={(v) => upd("stoimostTopliva", v)} />
      )}
      {tab === "zpVodDezhurki" && (
        <FixedValueTab label="ЗП водителя дежурки" unit="₽" value={naryadSettings.zpVodDezhurki} onChange={(v) => upd("zpVodDezhurki", v)} />
      )}
      {tab === "dezhDt" && (
        <FixedValueTab label="Дежурка ДТ" unit="₽" value={naryadSettings.dezhDt} onChange={(v) => upd("dezhDt", v)} />
      )}
      {tab === "hozNuzhdyGarazh" && (
        <FixedValueTab label="Хоз. нужды гараж" unit="₽" value={naryadSettings.hozNuzhdyGarazh} onChange={(v) => upd("hozNuzhdyGarazh", v)} />
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

      {/* % водителя без кондуктора */}
      {tab === "procentVodBezCond" && (
        <div className="px-8 py-6 max-w-md space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800">
            <Icon name="Info" size={13} className="inline mr-1" />
            Процент от выручки водителю, если он работает без кондуктора.
            <br />Выручка = Кол.билетов × Стоимость проезда − Расход топлива.
          </div>
          <div className="flex flex-col gap-3">
            <FixedValueTab
              label="% водителя без кондуктора"
              unit="%"
              value={naryadSettings.procentBez}
              onChange={(v) => upd("procentBez", v)}
            />
            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">Исключение: Маршрут №6</p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-700 flex-1">Маршрут №6 без кондуктора — фиксированная оплата за смену:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={naryadSettings.fixedRoute6}
                    onChange={(e) => upd("fixedRoute6", e.target.value)}
                    className="w-24 h-8 px-2 text-sm font-semibold text-gray-800 border border-gray-300 rounded outline-none focus:border-blue-500 focus:bg-blue-50 text-right"
                  />
                  <span className="text-xs text-gray-500">₽</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* % водителя с кондуктором */}
      {tab === "procentVodSCond" && (
        <div className="px-8 py-6 max-w-md">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800 mb-6">
            <Icon name="Info" size={13} className="inline mr-1" />
            Процент от выручки водителю, если он работает с кондуктором.
          </div>
          <FixedValueTab
            label="% водителя с кондуктором"
            unit="%"
            value={naryadSettings.procentVodS}
            onChange={(v) => upd("procentVodS", v)}
          />
        </div>
      )}

      {/* % кондуктора */}
      {tab === "procentCond" && (
        <div className="px-8 py-6 max-w-md">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800 mb-6">
            <Icon name="Info" size={13} className="inline mr-1" />
            Процент от выручки кондуктору (работает только при наличии кондуктора в строке наряда).
          </div>
          <FixedValueTab
            label="% кондуктора"
            unit="%"
            value={naryadSettings.procentCondS}
            onChange={(v) => upd("procentCondS", v)}
          />
        </div>
      )}
    </>
  );
};

export default SettingsNormsTab;