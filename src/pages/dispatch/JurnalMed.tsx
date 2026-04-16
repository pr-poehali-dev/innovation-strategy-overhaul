import { useMemo } from "react";
import { useAppStore, DayMeta } from "@/store/appStore";
import { NaryadRow } from "./types";

interface Props {
  rows: NaryadRow[];
  dayMeta: DayMeta;
  displayDate: string;
  monthYear: string; // "Апрель 2026"
}

const JurnalMed = ({ rows, dayMeta, displayDate, monthYear }: Props) => {
  const { companies, activeCompanyIdx, employees, vehicles } = useAppStore();
  const company = companies[activeCompanyIdx];

  const medik = dayMeta.medFio || employees.find((e) => e.dolzhnost === "Медик" && e.status === "active")?.fio || "_______________";

  // Только строки с водителями
  const activeRows = useMemo(
    () => rows.filter((r) => r.fio && r.fio !== "без"),
    [rows]
  );

  const getVehicle = (bort: string) => vehicles.find((v) => v.bortovoy === bort);
  const getVodInfo = (fio: string) => employees.find((e) => e.fio === fio || fio.startsWith(e.fio.split(" ")[0]));

  return (
    <div className="p-2">
      {/* Кнопка печати */}
      <div className="flex justify-end mb-3 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Печать журнала
        </button>
      </div>

      {/* ═══ Печатная форма ═══ */}
      <div
        id="jurnal-med-print"
        className="bg-white font-serif text-[10px] leading-tight"
        style={{ minWidth: "900px" }}
      >
        {/* Шапка */}
        <div className="text-center mb-3">
          <div className="font-bold text-[12px]">{company?.nazvanie || "___________________________"}</div>
          <div className="mt-2 font-bold text-[13px] uppercase tracking-wide">
            ЖУРНАЛ РЕГИСТРАЦИИ ПРЕДРЕЙСОВЫХ МЕДИЦИНСКИХ ОСМОТРОВ ВОДИТЕЛЕЙ
          </div>
          <div className="text-[10px] mt-0.5">
            (форма согласно Приказу Минздрава России от 15.12.2014 № 835н)
          </div>
          <div className="mt-1">за {monthYear} г.</div>
        </div>

        {/* Реквизиты */}
        <div className="flex justify-between text-[10px] mb-3 px-2">
          <div>Медицинский работник: <span className="border-b border-black px-8">{medik}</span></div>
          <div>Дата: <span className="border-b border-black px-6">{displayDate}</span></div>
        </div>

        {/* Таблица */}
        <table className="border-collapse w-full text-[9px]">
          <thead>
            <tr style={{ backgroundColor: "#1a3a6b" }}>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "28px" }}>№ п/п</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "130px" }}>ФИО водителя</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "60px" }}>Дата рождения</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "55px" }}>Борт №</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "65px" }}>Гос. знак</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "65px" }}>Маршрут</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "60px" }}>Путевой лист №</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "70px" }}>Время осмотра</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "55px" }}>АД (мм рт.ст.)</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "45px" }}>Пульс (уд/мин)</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "45px" }}>Алкотестер</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "65px" }}>Результат (допущен / не допущен)</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "70px" }}>Подпись мед. работника</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "70px" }}>Подпись водителя</th>
            </tr>
          </thead>
          <tbody>
            {activeRows.map((row, idx) => {
              const veh = getVehicle(row.bortovoy);
              const vod = getVodInfo(row.fio);
              const rowBg = idx % 2 === 0 ? "#ffffff" : "#f5f8ff";
              return (
                <tr key={row.id} style={{ backgroundColor: rowBg }}>
                  <td className="border border-gray-300 text-center py-2" style={{ width: "28px" }}>{idx + 1}</td>
                  <td className="border border-gray-300 px-1 py-2 font-medium" style={{ width: "130px" }}>{row.fio}</td>
                  <td className="border border-gray-300 px-1 py-2 text-center" style={{ width: "60px" }}>{vod?.dataRozhd || ""}</td>
                  <td className="border border-gray-300 px-1 py-2 text-center font-bold" style={{ width: "55px" }}>{row.bortovoy}</td>
                  <td className="border border-gray-300 px-1 py-2 text-center" style={{ width: "65px" }}>{veh?.gos || ""}</td>
                  <td className="border border-gray-300 px-1 py-2 text-center" style={{ width: "65px" }}>{row.marshrut}</td>
                  <td className="border border-gray-300 px-1 py-2 text-center" style={{ width: "60px" }}>{row.putevoy}</td>
                  <td className="border border-gray-300 text-center" style={{ width: "70px" }}></td>
                  <td className="border border-gray-300 text-center" style={{ width: "55px" }}></td>
                  <td className="border border-gray-300 text-center" style={{ width: "45px" }}></td>
                  <td className="border border-gray-300 text-center" style={{ width: "45px" }}>0,00</td>
                  <td className="border border-gray-300 text-center font-semibold text-green-800" style={{ width: "65px" }}>допущен</td>
                  <td className="border border-gray-300 text-center" style={{ width: "70px" }}></td>
                  <td className="border border-gray-300 text-center" style={{ width: "70px" }}></td>
                </tr>
              );
            })}
            {/* Пустые строки для ручной дозаписи */}
            {Array.from({ length: Math.max(0, 5 - activeRows.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-gray-300 text-center py-3">{activeRows.length + i + 1}</td>
                {Array.from({ length: 13 }).map((_, j) => (
                  <td key={j} className="border border-gray-300"></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Подпись */}
        <div className="flex justify-between mt-4 px-2 text-[10px]">
          <div>
            Медицинский работник: <span className="border-b border-black px-12">{medik}</span>
            &nbsp;&nbsp;Подпись: <span className="border-b border-black px-10"></span>
          </div>
          <div>
            Дата составления: <span className="border-b border-black px-8">{displayDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JurnalMed;
