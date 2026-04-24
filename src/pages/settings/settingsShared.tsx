import { useState } from "react";
import Icon from "@/components/ui/icon";
import { uid } from "@/lib/uid";

export interface SimpleRow {
  id: number;
  nazvanie: string;
  znachenie: string;
}

export const emptySimpleRow = (): SimpleRow => ({
  id: uid(),
  nazvanie: "", znachenie: "",
});

export type TabType =
  | "company"
  | "routes"
  | "schedule"
  | "stoimostProezda"
  | "stoimostTopliva"
  | "procentVodBezCond"
  | "procentVodSCond"
  | "procentCond"
  | "obed"
  | "zpVodDezhurki"
  | "dezhDt"
  | "hozNuzhdyGarazh";

export const TABS: { key: TabType; label: string; icon: string; unit?: string }[] = [
  { key: "company",           label: "Организация",                     icon: "Building2"        },
  { key: "routes",            label: "Маршруты",                        icon: "Route"            },
  { key: "schedule",          label: "Расписание выпуска",              icon: "Clock"            },
  { key: "stoimostProezda",   label: "Стоимость проезда",               icon: "Ticket",          unit: "₽"   },
  { key: "stoimostTopliva",   label: "Стоимость топлива",               icon: "Fuel",            unit: "₽/л" },
  { key: "procentVodBezCond", label: "% водителя без кондуктора",       icon: "Percent",         unit: "%"   },
  { key: "procentVodSCond",   label: "% водителя с кондуктором",        icon: "Percent",         unit: "%"   },
  { key: "procentCond",       label: "% кондуктора",                    icon: "Percent",         unit: "%"   },
  { key: "obed",              label: "Обеды",                           icon: "UtensilsCrossed", unit: "₽"   },
  { key: "zpVodDezhurki",     label: "ЗП водителя дежурки",             icon: "Banknote",        unit: "₽"   },
  { key: "dezhDt",            label: "Дежурка ДТ",                      icon: "Droplets",        unit: "₽"   },
  { key: "hozNuzhdyGarazh",   label: "Хоз. нужды гараж",               icon: "Wrench",          unit: "₽"   },
];

// ─── Shared: FixedValueTab ────────────────────────────────────────────────────
export const FixedValueTab = ({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit?: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="px-8 py-10 flex flex-col items-start gap-4">
    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
      {label}{unit ? ` (${unit})` : ""}
    </label>
    <div className="flex items-center gap-3">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-48 px-4 py-3 text-2xl font-bold text-gray-800 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors text-center"
        placeholder="0"
      />
      {unit && <span className="text-lg text-gray-400 font-semibold">{unit}</span>}
    </div>
  </div>
);

// ─── Shared: PercentTable ─────────────────────────────────────────────────────
export const PercentTable = ({
  rows,
  onUpdate,
  onAdd,
  onDelete,
  unit,
}: {
  rows: SimpleRow[];
  onUpdate: (id: number, col: keyof SimpleRow, val: string) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
  unit?: string;
}) => {
  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);
  const COLS: { key: keyof Omit<SimpleRow, "id">; label: string; width: string }[] = [
    { key: "nazvanie",  label: "Наименование",                         width: "300px" },
    { key: "znachenie", label: `Значение${unit ? ` (${unit})` : ""}`, width: "160px" },
  ];

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      if (colIdx + 1 < COLS.length) {
        setActiveCell({ rowId: rows[rowIdx].id, col: COLS[colIdx + 1].key });
      } else if (rowIdx + 1 < rows.length) {
        setActiveCell({ rowId: rows[rowIdx + 1].id, col: COLS[0].key });
      }
    }
  };

  return (
    <>
      <div className="px-5 py-3 border-b border-gray-200 flex justify-end">
        <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
          <Icon name="Plus" size={14} />
          Добавить строку
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs" style={{ minWidth: "400px" }}>
          <thead>
            <tr style={{ backgroundColor: "#1a3a6b" }}>
              <th className="border border-blue-900 px-1 py-1.5 text-white text-center" style={{ width: "28px" }}>№</th>
              {COLS.map((col) => (
                <th key={col.key} className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-left" style={{ width: col.width, minWidth: col.width }}>
                  {col.label}
                </th>
              ))}
              <th className="border border-blue-900 px-1 py-1" style={{ width: "28px" }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={`set-${rowIdx}-${row.id}`} className={rowIdx % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                <td className="border border-gray-300 text-center text-gray-400 select-none" style={{ width: "28px" }}>{rowIdx + 1}</td>
                {COLS.map((col, colIdx) => {
                  const isActive = activeCell?.rowId === row.id && activeCell?.col === col.key;
                  return (
                    <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
                      <input
                        type="text"
                        value={row[col.key] as string}
                        onChange={(e) => onUpdate(row.id, col.key, e.target.value)}
                        onFocus={() => setActiveCell({ rowId: row.id, col: col.key })}
                        onBlur={() => setActiveCell(null)}
                        onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                        autoFocus={isActive}
                        className={`w-full h-7 px-2 text-gray-800 bg-transparent outline-none border-2 ${
                          isActive ? "border-blue-500 bg-blue-50" : "border-transparent"
                        } transition-colors`}
                        placeholder={col.key === "znachenie" ? "0" : "—"}
                      />
                    </td>
                  );
                })}
                <td className="border border-gray-300 text-center" style={{ width: "28px" }}>
                  <button onClick={() => onDelete(row.id)} className="text-gray-300 hover:text-red-500 transition-colors p-0.5">
                    <Icon name="X" size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-300 px-5 py-2 bg-gray-50 text-xs text-gray-400">
        Строк: {rows.length}
      </div>
    </>
  );
};