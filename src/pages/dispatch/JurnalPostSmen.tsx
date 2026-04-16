import { useMemo } from "react";
import { useAppStore, DayMeta } from "@/store/appStore";
import { NaryadRow } from "./types";

// ─── Журнал регистрации послесменных (послерейсовых) медицинских осмотров ───
// Форма согласно Приказу Минздрава России от 15.12.2014 № 835н
// (идентична предрейсовой форме, но со своей спецификой: проводится после смены)

interface Props {
  rows: NaryadRow[];
  dayMeta: DayMeta;
  displayDate: string;
  monthYear: string;
}

const CERVONNAYA = "Червонная Л.М.";

const JurnalPostSmen = ({ rows, dayMeta, displayDate, monthYear }: Props) => {
  const { companies, employees, vehicles, routes } = useAppStore();

  const medik =
    CERVONNAYA ||
    dayMeta.medFio ||
    employees.find((e) => e.dolzhnost === "Медик" && e.status === "active")?.fio ||
    "_______________";

  const dispFio =
    dayMeta.dispFio ||
    employees.find((e) => e.dolzhnost === "Диспетчер" && e.status === "active")?.fio ||
    "_______________";

  const getVehicle = (bort: string) => vehicles.find((v) => v.bortovoy === bort);
  const getVodInfo = (fio: string) =>
    employees.find((e) => e.fio === fio || (fio && fio.startsWith(e.fio.split(" ")[0])));
  const getRouteCompanyIdx = (marshrut: string) => {
    const num = marshrut.split("/")[0].trim();
    return routes.find((r) => r.nomer === num)?.companyIdx ?? 0;
  };

  const activeRows = useMemo(
    () => rows.filter((r) => r.fio && r.fio !== "без" && !r.statusOtsutstviya),
    [rows]
  );

  const byCompany = useMemo(() => {
    const map = new Map<number, NaryadRow[]>();
    activeRows.forEach((row) => {
      const idx = getRouteCompanyIdx(row.marshrut);
      if (!map.has(idx)) map.set(idx, []);
      map.get(idx)!.push(row);
    });
    return map;
  }, [activeRows, routes]);

  const companyGroups: Array<{ companyIdx: number; rows: NaryadRow[] }> =
    byCompany.size > 0
      ? Array.from(byCompany.entries()).map(([companyIdx, rows]) => ({ companyIdx, rows }))
      : [{ companyIdx: 0, rows: [] }];

  const renderBlock = (companyIdx: number, blockRows: NaryadRow[], isFirst: boolean) => {
    const company = companies[companyIdx];
    return (
      <div key={companyIdx} className={`mb-8 print-no-break${isFirst ? "" : " print-page-break"}`}>

        {/* ─── Шапка ─── */}
        <div className="text-center mb-3">
          <div className="font-bold text-[12px]">{company?.nazvanie || "___________________________"}</div>
          <div className="mt-1.5 font-bold text-[13px] uppercase tracking-wide">
            ЖУРНАЛ РЕГИСТРАЦИИ ПОСЛЕСМЕННЫХ (ПОСЛЕРЕЙСОВЫХ) МЕДИЦИНСКИХ ОСМОТРОВ ВОДИТЕЛЕЙ
          </div>
          <div className="text-[9px] mt-0.5 text-gray-600">
            (форма согласно Приказу Минздрава России от 15.12.2014 № 835н)
          </div>
          <div className="mt-1 text-[10px]">за {monthYear} г.</div>
        </div>

        {/* ─── Реквизиты ─── */}
        <div className="flex justify-between text-[10px] mb-2 px-2 gap-4 flex-wrap">
          <div>Медицинский работник: <span className="border-b border-black px-8 font-semibold">{medik}</span></div>
          <div>Диспетчер: <span className="border-b border-black px-8 font-semibold">{dispFio}</span></div>
          <div>Дата: <span className="border-b border-black px-6">{displayDate}</span></div>
        </div>

        {/* ─── Таблица ─── */}
        <table className="border-collapse w-full text-[9px]">
          <thead>
            <tr style={{ backgroundColor: "#1a3a6b" }}>
              <th className="border border-gray-500 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "24px" }}>№</th>
              <th className="border border-gray-500 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "125px" }}>ФИО водителя</th>
              <th className="border border-gray-500 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "58px" }}>Дата рождения</th>
              <th className="border border-gray-500 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "46px" }}>Борт №</th>
              <th className="border border-gray-500 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "60px" }}>Гос. знак</th>
              <th className="border border-gray-500 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "55px" }}>Маршрут</th>
              <th className="border border-gray-500 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "50px" }}>Путевой №</th>
              <th className="border border-gray-500 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "68px" }}>Время осмотра (факт)</th>
              <th className="border border-gray-500 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "52px" }}>АД (мм рт.ст.)</th>
              <th className="border border-gray-500 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "44px" }}>Пульс (уд/мин)</th>
              <th className="border border-gray-500 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "44px" }}>Алко&shy;тестер</th>
              <th className="border border-gray-500 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "65px" }}>Жалобы / состояние</th>
              <th className="border border-gray-500 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "60px" }}>Результат</th>
              <th className="border border-gray-500 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "62px" }}>Подпись мед. работника</th>
              <th className="border border-gray-500 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "62px" }}>Подпись водителя</th>
            </tr>
          </thead>
          <tbody>
            {blockRows.map((row, idx) => {
              const veh = getVehicle(row.bortovoy);
              const vod = getVodInfo(row.fio);
              return (
                <tr key={row.id} style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f5f8ff" }}>
                  <td className="border border-gray-300 text-center py-2.5 text-gray-400">{idx + 1}</td>
                  <td className="border border-gray-300 px-1 py-2 font-medium">{row.fio}</td>
                  <td className="border border-gray-300 px-1 py-2 text-center">{vod?.dataRozhd || ""}</td>
                  <td className="border border-gray-300 px-1 py-2 text-center font-bold text-blue-800">{row.bortovoy}</td>
                  <td className="border border-gray-300 px-1 py-2 text-center">{veh?.gos || ""}</td>
                  <td className="border border-gray-300 px-1 py-2 text-center">{row.marshrut}</td>
                  <td className="border border-gray-300 px-1 py-2 text-center font-semibold text-blue-700">{row.putevoy}</td>
                  {/* Заполняется вручную после смены */}
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300 text-center text-gray-400 text-[8px]">0,00</td>
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300 text-center text-green-800 font-semibold text-[8px]">прошёл</td>
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300"></td>
                </tr>
              );
            })}
            {Array.from({ length: Math.max(0, 3 - blockRows.length) }).map((_, i) => (
              <tr key={`e-${i}`}>
                <td className="border border-gray-300 text-center py-3 text-gray-300">{blockRows.length + i + 1}</td>
                {Array.from({ length: 14 }).map((_, j) => (
                  <td key={j} className="border border-gray-300 py-3"></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* ─── Подписи ─── */}
        <div className="flex justify-between mt-3 px-2 text-[10px]">
          <div className="space-y-1.5">
            <div>
              Медицинский работник: <span className="border-b border-black px-10 font-semibold">{medik}</span>
              &nbsp;&nbsp;Подпись: <span className="border-b border-black px-10"></span>
            </div>
            <div>
              Диспетчер (принял ТС): <span className="border-b border-black px-8 font-semibold">{dispFio}</span>
              &nbsp;&nbsp;Подпись: <span className="border-b border-black px-10"></span>
            </div>
          </div>
          <div>Дата: <span className="border-b border-black px-8">{displayDate}</span></div>
        </div>

        {/* ─── Примечание (обязательное поле по форме) ─── */}
        <div className="mt-3 px-2 text-[9px] text-gray-500 border-t border-gray-200 pt-2">
          Примечание: послесменный медосмотр проводится по окончании рабочей смены (рейса) в целях выявления
          признаков воздействия вредных и (или) опасных производственных факторов (п. 5 Приказа № 835н).
        </div>
      </div>
    );
  };

  return (
    <div className="p-2">
      <div className="flex justify-end mb-3 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Печать журнала
        </button>
      </div>
      <div className="bg-white font-serif text-[10px] leading-tight" style={{ minWidth: "960px" }}>
        {companyGroups.map(({ companyIdx, rows }, i) => renderBlock(companyIdx, rows, i === 0))}
      </div>
    </div>
  );
};

export default JurnalPostSmen;
