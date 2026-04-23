import { useMemo } from "react";
import { useAppStore, DayMeta } from "@/store/appStore";
import { NaryadRow } from "./types";

interface Props {
  rows: NaryadRow[];
  dayMeta: DayMeta;
  displayDate: string;
  monthYear: string;
}

const JurnalVypusk = ({ rows, dayMeta, displayDate, monthYear }: Props) => {
  const { companies, employees, vehicles, routes, routeSchedule } = useAppStore();

  const mekhFio = dayMeta.mekhFio || employees.find((e) => e.dolzhnost === "Механик по выпуску" && e.status === "active")?.fio || "_______________";
  const dispFio = dayMeta.dispFio || employees.find((e) => e.dolzhnost === "Диспетчер"          && e.status === "active")?.fio || "_______________";

  const getVehicle = (bort: string) => vehicles.find((v) => v.bortovoy === bort);
  const getVodInfo = (fio: string) => employees.find((e) => e.fio === fio || (fio && fio.startsWith(e.fio.split(" ")[0])));
  const getRouteCompanyIdx = (marshrut: string) => {
    const num = marshrut.split("/")[0].trim();
    return routes.find((r) => r.nomer === num)?.companyIdx ?? 0;
  };

  const activeRows = useMemo(
    () => rows.filter((r) => r.fio && r.fio !== "без" && r.bortovoy),
    [rows]
  );

  // Группировка по организации
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
        {/* Шапка */}
        <div className="text-center mb-3">
          <div className="font-bold text-[12px]">{company?.nazvanie || "___________________________"}</div>
          <div className="text-[9px] text-gray-700 mt-0.5 flex justify-center gap-3 flex-wrap">
            {company?.inn  && <span>ИНН: {company.inn}</span>}
            {company?.kpp  && <span>КПП: {company.kpp}</span>}
            {company?.ogrn && <span>ОГРН: {company.ogrn}</span>}
            {company?.adresYur && <span>Адрес: {company.adresYur}</span>}
          </div>
          <div className="mt-1.5 font-bold text-[13px] uppercase tracking-wide">
            ЖУРНАЛ УЧЁТА ВЫХОДА ТРАНСПОРТНЫХ СРЕДСТВ НА ЛИНИЮ И ВОЗВРАТА
          </div>
          <div className="text-[9px] mt-0.5 text-gray-600">
            (форма согласно Приказу Минтранса России от 28.09.2022 № 390)
          </div>
          <div className="mt-1">за {monthYear} г.</div>
        </div>

        {/* Реквизиты */}
        <div className="flex justify-between text-[10px] mb-2 px-2 gap-4">
          <div>Механик по выпуску: <span className="border-b border-black px-8 font-semibold">{mekhFio}</span></div>
          <div>Диспетчер: <span className="border-b border-black px-8 font-semibold">{dispFio}</span></div>
          <div>Дата: <span className="border-b border-black px-6">{displayDate}</span></div>
        </div>

        {/* Таблица */}
        <table className="border-collapse w-full text-[9px]">
          <thead>
            <tr style={{ backgroundColor: "#1a3a6b" }}>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "24px" }}>№</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "50px" }}>Борт №</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "65px" }}>Гос. знак</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "110px" }}>Марка / модель ТС</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "55px" }}>Маршрут</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "55px" }}>Путевой №</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "120px" }}>ФИО водителя</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "55px" }}>Уд-ие №</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "78px" }}>СНИЛС</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "80px" }}>ФИО кондуктора</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "48px" }}>Выезд план</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "48px" }}>Выезд факт</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "55px" }}>Одометр выезд</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "50px" }}>Тех. контроль</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "60px" }}>Подпись мех.</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "48px" }}>Возврат факт</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "55px" }}>Одометр возврат</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "60px" }}>Подпись диспетч.</th>
            </tr>
          </thead>
          <tbody>
            {blockRows.map((row, idx) => {
              const veh = getVehicle(row.bortovoy);
              const vod   = getVodInfo(row.fio);
              const sched = routeSchedule[row.marshrut];
              return (
                <tr key={row.id} style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f0f4ff" }}>
                  <td className="border border-gray-300 text-center py-2.5 text-gray-400">{idx + 1}</td>
                  <td className="border border-gray-300 px-1 text-center font-bold text-blue-800">{row.bortovoy}</td>
                  <td className="border border-gray-300 px-1 text-center">{veh?.gos || ""}</td>
                  <td className="border border-gray-300 px-1">{veh?.marka || ""}</td>
                  <td className="border border-gray-300 px-1 text-center">{row.marshrut}</td>
                  <td className="border border-gray-300 px-1 text-center font-semibold text-blue-700">{row.putevoy}</td>
                  <td className="border border-gray-300 px-1 font-medium">{row.fio}</td>
                  <td className="border border-gray-300 px-1 text-center text-[8px]">{vod?.udostoverenie || ""}</td>
                  <td className="border border-gray-300 px-1 text-center text-[8px]">{vod?.snils || ""}</td>
                  <td className="border border-gray-300 px-1">{row.fioKond && row.fioKond !== "без" ? row.fioKond : ""}</td>
                  <td className="border border-gray-300 px-1 text-center font-semibold text-blue-900">{sched?.vypusk || ""}</td>
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300 px-1 text-center text-green-800 font-semibold text-[8px] leading-tight">пройден/<br/>исправен</td>
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300 px-1 text-center font-semibold text-red-700">{sched?.zakhod || ""}</td>
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300"></td>
                </tr>
              );
            })}
            {Array.from({ length: Math.max(0, 3 - blockRows.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-gray-300 text-center py-3 text-gray-300">{blockRows.length + i + 1}</td>
                {Array.from({ length: 17 }).map((_, j) => (
                  <td key={j} className="border border-gray-300 py-3"></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Итог */}
        <div className="flex justify-between items-end mt-3 px-2 text-[10px]">
          <div>Всего выпущено ТС: <span className="border-b border-black px-4 font-semibold">{blockRows.length}</span></div>
          <div className="space-y-1 text-right">
            <div>Механик по выпуску: <span className="border-b border-black px-6 font-semibold">{mekhFio}</span>&nbsp;&nbsp;Подпись: <span className="border-b border-black px-8"></span></div>
            <div>Диспетчер: <span className="border-b border-black px-6 font-semibold">{dispFio}</span>&nbsp;&nbsp;Подпись: <span className="border-b border-black px-8"></span></div>
          </div>
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
      <div className="bg-white font-serif text-[10px] leading-tight" style={{ minWidth: "1000px" }}>
        {companyGroups.map(({ companyIdx, rows }, i) => renderBlock(companyIdx, rows, i === 0))}
      </div>
    </div>
  );
};

export default JurnalVypusk;