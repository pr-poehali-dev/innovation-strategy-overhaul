import { useState } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { TABS, TabType } from "./settings/settingsShared";
import SettingsCompanyTab from "./settings/SettingsCompanyTab";
import SettingsRoutesTab from "./settings/SettingsRoutesTab";
import SettingsScheduleTab from "./settings/SettingsScheduleTab";
import SettingsNormsTab from "./settings/SettingsNormsTab";

const NORMS_TABS: TabType[] = [
  "stoimostProezda", "stoimostTopliva",
  "procentVodBezCond", "procentVodSCond", "procentCond",
  "obed", "zpVodDezhurki", "dezhDt", "hozNuzhdyGarazh",
];

const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

const Settings = () => {
  const [tab, setTab] = useState<TabType>("company");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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

          {/* Tab content */}
          {tab === "company"  && <SettingsCompanyTab  setSaved={setSaved} />}
          {tab === "routes"   && <SettingsRoutesTab   setSaved={setSaved} />}
          {tab === "schedule" && <SettingsScheduleTab setSaved={setSaved} />}
          {NORMS_TABS.includes(tab) && <SettingsNormsTab tab={tab} setSaved={setSaved} />}

        </div>
      </div>
    </div>
  );
};

export default Settings;
