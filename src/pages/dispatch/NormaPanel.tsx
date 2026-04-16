import { NormaSettings } from "./types";

interface Props {
  settings: NormaSettings;
  onSetSetting: (key: keyof NormaSettings, val: string) => void;
}

const FIELDS: { key: keyof NormaSettings; label: string }[] = [
  { key: "stoimostBileta",  label: "Стоимость билета, ₽"       },
  { key: "stoimostTopliva", label: "Стоимость топлива, ₽/л"    },
  { key: "rashod",          label: "Расход топлива, л/100км"   },
  { key: "procentBez",      label: "% водителя без кондуктора" },
  { key: "procentVodS",     label: "% водителя с кондуктором"  },
  { key: "procentCondS",    label: "% кондуктора"              },
];

const NormaPanel = ({ settings, onSetSetting }: Props) => (
  <div className="border-b border-gray-300 px-6 py-4 bg-amber-50">
    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">
      Нормативы для расчёта подработки
    </p>
    <div className="flex flex-wrap gap-4">
      {FIELDS.map((f) => (
        <div key={f.key} className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">{f.label}</label>
          <input
            type="text"
            value={settings[f.key]}
            onChange={(e) => onSetSetting(f.key, e.target.value)}
            className="w-28 px-2 py-1 text-sm border border-amber-300 rounded focus:outline-none focus:border-amber-500 text-center"
          />
        </div>
      ))}
    </div>
  </div>
);

export default NormaPanel;
