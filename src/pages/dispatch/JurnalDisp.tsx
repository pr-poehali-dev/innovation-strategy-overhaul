import { useMemo } from "react";
import { useAppStore, DayMeta } from "@/store/appStore";
import { NaryadRow } from "./types";

interface Props {
  rows: NaryadRow[];
  dayMeta: DayMeta;
  displayDate: string;
  monthYear: string;
}

// Журнал диспетчера о выпуске транспортных средств на линию
// Форма согласно Приказу Минтранса РФ от 18.01.2021 № 17 (форма № 17-диспетчер)
const JurnalDisp = ({ rows, dayMeta, displayDate, monthYear }: Props) => {
  const { companies, employees, vehicles, routes, routeSchedule } = useAppStore();

  const dispFio = dayMeta.dispFio
    || employees.find((e) => e.dolzhnost === "Диспетчер" && e.status === "active")?.fio
    || "_______________";
  const mekhFio = dayMeta.mekhFio
    || employees.find((e) => e.dolzhnost === "Механик по выпуску" && e.status === "active")?.fio
    || "_______________";

  const getVehicle = (bort: string) => vehicles.find((v) => v.bortovoy === bort);
  const getVodInfo = (fio: string) =>
    employees.find((e) => e.fio === fio || (fio && fio.startsWith(e.fio.split(" ")[0])));
  const getRouteCompanyIdx = (marshrut: string) => {
    const num = marshrut.split("/")[0].trim();
    return routes.find((r) => r.nomer === num)?.companyIdx ?? 0;
  };

  // Только строки с водителем и бортом, без статуса отсутствия
  const activeRows = useMemo(
    () => rows.filter((r) => r.fio && r.fio !== "без" && r.bortovoy && !r.statusOtsutstviya),
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

  const companyGroups =
    byCompany.size > 0
      ? Array.from(byCompany.entries()).map(([companyIdx, rows]) => ({ companyIdx, rows }))
      : [{ companyIdx: 0, rows: [] as NaryadRow[] }];

  const renderBlock = (companyIdx: number, blockRows: NaryadRow[]) => {
    const company = companies[companyIdx];

    // Итоги по маршрутам
    const byRoute = blockRows.reduce<Record<string, number>>((acc, r) => {
      const num = r.marshrut.split("/")[0];
      acc[num] = (acc[num] || 0) + 1;
      return acc;
    }, {});

    return (
      <div key={companyIdx} className="mb-10">

        {/* ─── Шапка ─── */}
        <div className="flex justify-between items-start mb-2 text-[10px]">
          <div>
            <div className="font-bold text-[11px]">{company?.nazvanie || "___________________________"}</div>
            <div className="text-gray-500">{company?.adres || ""}</div>
          </div>
          <div className="text-right text-gray-500">
            <div>ИНН: {company?.inn || "____________"}</div>
          </div>
        </div>

        <div className="text-center mb-3">
          <div className="font-bold text-[13px] uppercase tracking-wide">
            ЖУРНАЛ ДИСПЕТЧЕРА О ВЫПУСКЕ ТРАНСПОРТНЫХ СРЕДСТВ НА ЛИНИЮ
          </div>
          <div className="text-[9px] mt-0.5 text-gray-500">
            (форма согласно Приказу Минтранса России от 18.01.2021 № 17)
          </div>
          <div className="mt-1 text-[10px]">за {monthYear} г.</div>
        </div>

        {/* ─── Реквизиты смены ─── */}
        <div className="border border-gray-400 p-2 mb-3 text-[10px] grid grid-cols-3 gap-2">
          <div>Дата: <span className="border-b border-black px-6 font-semibold">{displayDate}</span></div>
          <div>Диспетчер: <span className="border-b border-black px-6 font-semibold">{dispFio}</span></div>
          <div>Механик по выпуску: <span className="border-b border-black px-4 font-semibold">{mekhFio}</span></div>
          <div>Всего ТС выпущено: <span className="border-b border-black px-4 font-semibold">{blockRows.length}</span></div>
          <div className="col-span-2">
            По маршрутам:&nbsp;
            {Object.entries(byRoute).sort().map(([num, cnt]) => (
              <span key={num} className="mr-3">№{num} — <b>{cnt}</b> ед.</span>
            ))}
          </div>
        </div>

        {/* ─── Основная таблица ─── */}
        <table className="border-collapse w-full text-[9px]">
          <thead>
            <tr style={{ backgroundColor: "#1a3a6b" }}>
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "24px" }}>№</th>
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "45px" }}>Марш&shy;рут</th>
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "45px" }}>График</th>
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "42px" }}>Борт №</th>
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "60px" }}>Гос. знак</th>
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "50px" }}>Путевой №</th>
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "115px" }}>ФИО водителя</th>
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "48px" }}>Уд-ие вод. №</th>
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "80px" }}>ФИО кондуктора</th>
              <th colSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold">Медосмотр</th>
              <th colSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold">Выезд</th>
              <th colSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold">Возврат</th>
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "55px" }}>Тех. состояние</th>
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "55px" }}>Подпись диспетч.</th>
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "70px" }}>Примечание</th>
            </tr>
            <tr style={{ backgroundColor: "#1a3a6b" }}>
              <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "38px" }}>Рез-т</th>
              <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "42px" }}>Время</th>
              <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "42px" }}>План</th>
              <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "42px" }}>Факт</th>
              <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "42px" }}>План</th>
              <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "42px" }}>Факт</th>
            </tr>
          </thead>
          <tbody>
            {blockRows.map((row, idx) => {
              const veh   = getVehicle(row.bortovoy);
              const vod   = getVodInfo(row.fio);
              const sched = routeSchedule[row.marshrut];
              const routeNum = row.marshrut.split("/")[0];
              const grafik   = row.marshrut.split("/")[1] || "";
              const rowBg    = idx % 2 === 0 ? "#ffffff" : "#f0f4ff";
              return (
                <tr key={row.id} style={{ backgroundColor: rowBg }}>
                  <td className="border border-gray-300 text-center py-2 text-gray-400">{idx + 1}</td>
                  <td className="border border-gray-300 text-center font-bold text-blue-900">{routeNum}</td>
                  <td className="border border-gray-300 text-center text-gray-600">{grafik}</td>
                  <td className="border border-gray-300 text-center font-bold text-blue-800">{row.bortovoy}</td>
                  <td className="border border-gray-300 px-1 text-center">{veh?.gos || ""}</td>
                  <td className="border border-gray-300 px-1 text-center font-semibold text-blue-700">{row.putevoy}</td>
                  <td className="border border-gray-300 px-1 font-medium">{row.fio}</td>
                  <td className="border border-gray-300 px-1 text-center text-[8px]">{vod?.udostoverenie || ""}</td>
                  <td className="border border-gray-300 px-1 text-[8px]">{row.fioKond && row.fioKond !== "без" ? row.fioKond : ""}</td>
                  {/* Медосмотр */}
                  <td className="border border-gray-300 px-1 text-center text-green-800 font-semibold text-[8px]">допущен</td>
                  <td className="border border-gray-300"></td>
                  {/* Выезд */}
                  <td className="border border-gray-300 px-1 text-center font-semibold text-blue-900">{sched?.vypusk || ""}</td>
                  <td className="border border-gray-300"></td>
                  {/* Возврат */}
                  <td className="border border-gray-300 px-1 text-center font-semibold text-red-700">{sched?.zakhod || ""}</td>
                  <td className="border border-gray-300"></td>
                  {/* Тех. состояние */}
                  <td className="border border-gray-300 px-1 text-center text-green-800 font-semibold text-[8px] leading-tight">исправен</td>
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300"></td>
                </tr>
              );
            })}
            {/* Пустые строки для дозаписи */}
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

        {/* ─── Итог / подписи ─── */}
        <div className="mt-4 text-[10px] space-y-3">
          {/* Сводка по маршрутам */}
          <div className="border border-gray-300 p-2">
            <div className="font-semibold mb-1">Сводка выпуска на линию:</div>
            <div className="flex flex-wrap gap-4">
              {Object.entries(byRoute).sort().map(([num, cnt]) => (
                <div key={num} className="text-center">
                  <div className="font-bold text-blue-900">Маршрут №{num}</div>
                  <div>Выпущено: <b>{cnt}</b> ед.</div>
                </div>
              ))}
              <div className="text-center ml-auto">
                <div className="font-bold">ИТОГО</div>
                <div>Выпущено: <b>{blockRows.length}</b> ед.</div>
              </div>
            </div>
          </div>

          {/* Подписи */}
          <div className="flex justify-between pt-2">
            <div className="space-y-4">
              <div>
                Диспетчер: <span className="border-b border-black px-16 font-semibold">{dispFio}</span>
                &nbsp;&nbsp;Подпись: <span className="border-b border-black px-12"></span>
              </div>
            </div>
            <div className="text-right">
              <div>Дата составления: <span className="border-b border-black px-8">{displayDate}</span></div>
            </div>
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
      <div className="bg-white font-serif text-[10px] leading-tight" style={{ minWidth: "1050px" }}>
        {companyGroups.map(({ companyIdx, rows }) => renderBlock(companyIdx, rows))}
      </div>
    </div>
  );
};

export default JurnalDisp;
