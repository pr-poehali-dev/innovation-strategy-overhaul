import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { MonthlyKassaRow, toNum, getRouteColor } from "./kassaTypes";

interface MonthlyFixed {
  byDay: Record<string, { zpVodDezhurki: number; dezhDt: number; hozNuzhdyGarazh: number; total: number }>;
  zpVodDezhurki: number;
  dezhDt: number;
  hozNuzhdyGarazh: number;
  total: number;
}

interface Props {
  rows: MonthlyKassaRow[];
  monthKey: string; // "2026-04"
  onPrint: () => void;
  monthlyFixed?: MonthlyFixed;
}

const fmt = (n: number) => n !== 0 ? n.toLocaleString("ru-RU") : "";

const COLS: { key: keyof Omit<MonthlyKassaRow, "id" | "bort" | "mar" | "fioVod" | "fioCond" | "byDay">; label: string; width: string }[] = [
  { key: "kolBil",   label: "Кол. бил",    width: "65px"  },
  { key: "beznal",   label: "Безнал",      width: "70px"  },
  { key: "viruchka", label: "Выручка",     width: "75px"  },
  { key: "obed",     label: "Обед",        width: "55px"  },
  { key: "rashodDt", label: "Расх. ДТ",   width: "65px"  },
  { key: "chek",     label: "Чек",         width: "55px"  },
  { key: "vozvrat",  label: "Возврат",     width: "65px"  },
  { key: "podrVod",  label: "Подр. вод",  width: "70px"  },
  { key: "podrCond", label: "Подр. конд", width: "70px"  },
  { key: "vPlus",    label: "В плюс",     width: "65px"  },
  { key: "itogo",    label: "ИТОГО",       width: "80px"  },
];

// Получить дни месяца из monthKey "2026-04"
function getDaysInMonth(monthKey: string): number[] {
  const [y, m] = monthKey.split("-").map(Number);
  const count = new Date(y, m, 0).getDate();
  return Array.from({ length: count }, (_, i) => i + 1);
}

function dayKey(monthKey: string, day: number) {
  const [y, m] = monthKey.split("-");
  return `${y}-${m}-${String(day).padStart(2, "0")}`;
}

const KassaMonthly = ({ rows, monthKey, onPrint, monthlyFixed }: Props) => {
  const days = useMemo(() => getDaysInMonth(monthKey), [monthKey]);

  const [y, m] = monthKey.split("-");
  const monthLabel = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

  const totals = useMemo(() => {
    const t: Record<string, number> = {};
    COLS.forEach(({ key }) => {
      t[key] = rows.reduce((s, r) => s + (r[key] as number), 0);
    });
    return t;
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Icon name="BarChart3" size={40} className="mb-3 text-gray-300" />
        <div className="text-sm font-medium">Нет данных за {monthLabel}</div>
        <div className="text-xs mt-1">Заполните кассовые отчёты за каждый день месяца</div>
      </div>
    );
  }

  return (
    <div>
      {/* Подзаголовок */}
      <div className="px-5 py-2 border-b border-gray-200 flex items-center justify-between bg-blue-50">
        <div className="text-sm font-semibold text-blue-800">
          Кассовый отчёт за {monthLabel} · {rows.length} ТС
        </div>
        <button
          onClick={onPrint}
          className="flex items-center gap-1.5 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 print:hidden"
        >
          <Icon name="Printer" size={12} /> Печать
        </button>
      </div>

      {/* ── Сводная таблица по ТС ── */}
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs" style={{ minWidth: "900px" }}>
          <thead>
            <tr style={{ backgroundColor: "#1a3a6b" }}>
              <th className="border border-blue-900 px-1 py-1.5 text-white text-center" style={{ width: "28px" }}>№</th>
              <th className="border border-blue-900 px-1 py-1.5 text-white font-semibold text-center" style={{ width: "55px" }}>Борт</th>
              <th className="border border-blue-900 px-1 py-1.5 text-white font-semibold text-center" style={{ width: "55px" }}>Мар.</th>
              <th className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-left" style={{ width: "140px" }}>Водитель</th>
              <th className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-left" style={{ width: "110px" }}>Кондуктор</th>
              {COLS.map((c) => (
                <th key={c.key} className="border border-blue-900 px-1 py-1.5 text-white font-semibold text-center leading-tight" style={{ width: c.width }}>
                  {c.label}
                </th>
              ))}
              <th className="border border-blue-900 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "35px" }}>Дней</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const bg = row.mar ? getRouteColor(row.mar) : i % 2 === 0 ? "#fff" : "#f5f8ff";
              const daysWorked = Object.keys(row.byDay).length;
              return (
                <tr key={`month-${i}-${row.id}`} style={{ backgroundColor: bg }}>
                  <td className="border border-gray-300 text-center text-gray-400 text-xs" style={{ width: "28px" }}>{i + 1}</td>
                  <td className="border border-gray-300 px-1 text-center font-bold text-blue-800 text-xs">{row.bort}</td>
                  <td className="border border-gray-300 px-1 text-center text-xs">{row.mar}</td>
                  <td className="border border-gray-300 px-2 text-xs truncate" style={{ maxWidth: "140px" }}>{row.fioVod}</td>
                  <td className="border border-gray-300 px-2 text-xs truncate text-gray-600" style={{ maxWidth: "110px" }}>{row.fioCond}</td>
                  {COLS.map((c) => {
                    const val = row[c.key] as number;
                    const isPodr = c.key === "podrVod" || c.key === "podrCond" || c.key === "rashodDt";
                    const isBeznal = c.key === "beznal";
                    const isItogo = c.key === "itogo";
                    return (
                      <td
                        key={c.key}
                        className="border border-gray-300 px-1 py-0.5 text-center text-xs"
                        style={{
                          color: isPodr ? "#c2410c" : isItogo ? "#15803d" : isBeznal ? "#1d4ed8" : undefined,
                          fontWeight: isItogo ? "700" : undefined,
                          background: isBeznal && val > 0 ? "#dbeafe" : undefined,
                        }}
                      >
                        {fmt(val)}
                      </td>
                    );
                  })}
                  <td className="border border-gray-300 text-center text-xs font-semibold text-gray-600">{daysWorked}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: "#1a3a6b" }}>
              <td colSpan={5} className="border border-blue-900 px-2 py-1.5 text-right text-white font-bold text-xs">
                ИТОГО за месяц:
              </td>
              {COLS.map((c) => (
                <td key={c.key} className="border border-blue-900 px-1 py-1.5 text-center text-white font-bold text-xs">
                  {fmt(totals[c.key])}
                </td>
              ))}
              <td className="border border-blue-900 px-1 py-1.5 text-center text-white text-xs font-bold">
                {rows.reduce((s, r) => s + Object.keys(r.byDay).length, 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Обязательные ежедневные расходы за месяц + чистый итог ── */}
      {monthlyFixed && (
        <div className="mt-4 mx-4 bg-gradient-to-r from-red-50 via-amber-50 to-green-50 border border-red-200 rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="AlertCircle" size={14} className="text-red-600" />
            <span className="text-xs font-bold text-red-700 uppercase tracking-wide">
              Обязательные расходы за {monthLabel}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-gray-600">ЗП водителя дежурки</span>
              <span className="text-sm font-bold text-red-700">− {fmt(monthlyFixed.zpVodDezhurki) || "0"} ₽</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-gray-600">Дежурка ДТ</span>
              <span className="text-sm font-bold text-red-700">− {fmt(monthlyFixed.dezhDt) || "0"} ₽</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-gray-600">Хоз. нужды гараж</span>
              <span className="text-sm font-bold text-red-700">− {fmt(monthlyFixed.hozNuzhdyGarazh) || "0"} ₽</span>
            </div>
            <div className="flex flex-col gap-0.5 border-l border-gray-300 pl-4">
              <span className="text-[11px] text-gray-600">Сумма расходов</span>
              <span className="text-sm font-extrabold text-red-800">− {fmt(monthlyFixed.total) || "0"} ₽</span>
            </div>
            <div className="flex flex-col gap-0.5 ml-auto">
              <span className="text-[11px] font-bold text-green-800 uppercase">Итого за месяц (чистыми)</span>
              <div className="px-3 py-1.5 bg-green-600 text-white font-extrabold text-base rounded shadow">
                {(rows.reduce((s, r) => s + r.itogo, 0) - monthlyFixed.total).toLocaleString("ru-RU")} ₽
              </div>
              <span className="text-[10px] text-gray-500 text-right">
                Σ строк {rows.reduce((s, r) => s + r.itogo, 0).toLocaleString("ru-RU")} − расходы {monthlyFixed.total.toLocaleString("ru-RU")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Детализация по дням ── */}
      <div className="mt-4 px-4 pb-4">
        <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Детализация по дням</div>
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="border-collapse text-[10px]" style={{ minWidth: `${200 + days.length * 60}px` }}>
            <thead>
              <tr style={{ backgroundColor: "#243e6e" }}>
                <th className="border border-blue-900 px-1 py-1 text-white text-center sticky left-0 z-10" style={{ width: "45px", backgroundColor: "#243e6e" }}>Борт</th>
                <th className="border border-blue-900 px-1 py-1 text-white text-center sticky left-[45px] z-10" style={{ width: "55px", backgroundColor: "#243e6e" }}>Мар.</th>
                {days.map((d) => (
                  <th key={d} className="border border-blue-900 px-0 py-1 text-white text-center font-normal" style={{ width: "60px" }}>
                    {d}
                  </th>
                ))}
                <th className="border border-blue-900 px-1 py-1 text-white text-center font-semibold" style={{ width: "70px" }}>Итого</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const bg = i % 2 === 0 ? "#fff" : "#eff6ff";
                return (
                  <tr key={`month-det-${i}-${row.id}`} style={{ backgroundColor: bg }}>
                    <td className="border border-gray-300 px-1 text-center font-bold text-blue-800 sticky left-0 z-10" style={{ backgroundColor: bg }}>{row.bort}</td>
                    <td className="border border-gray-300 px-1 text-center sticky left-[45px] z-10" style={{ backgroundColor: bg }}>{row.mar}</td>
                    {days.map((d) => {
                      const dk = dayKey(monthKey, d);
                      const dayData = row.byDay[dk];
                      return (
                        <td key={d} className="border border-gray-300 px-0.5 py-0.5 text-center" style={{ width: "60px" }}>
                          {dayData ? (
                            <div className="flex flex-col items-center leading-tight">
                              {dayData.viruchka > 0 && <span className="text-green-700 font-semibold">{fmt(dayData.viruchka)}</span>}
                              {dayData.beznal   > 0 && <span className="text-blue-600">{fmt(dayData.beznal)}</span>}
                              {dayData.itogo    > 0 && <span className="text-gray-500">{fmt(dayData.itogo)}</span>}
                            </div>
                          ) : (
                            <span className="text-gray-200">·</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="border border-gray-300 px-1 text-center font-bold text-green-700" style={{ width: "70px" }}>
                      {fmt(row.itogo)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KassaMonthly;