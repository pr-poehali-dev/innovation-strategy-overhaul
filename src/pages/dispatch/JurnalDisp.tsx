import { useMemo } from "react";
import { useAppStore, DayMeta } from "@/store/appStore";
import { NaryadRow } from "./types";

// ─── Журнал учёта работы водителей и транспортных средств ────────────────────
// Официальная форма согласно Приказу Минтранса России от 18.09.2008 № 152
// (форма ПГ-1 «Журнал регистрации путевых листов»)
// + элементы формы согласно Приказу Минтранса России от 28.09.2022 № 390

interface Props {
  rows: NaryadRow[];
  dayMeta: DayMeta;
  displayDate: string;
  monthYear: string;
}

const JurnalDisp = ({ rows, dayMeta, displayDate, monthYear }: Props) => {
  const { companies, employees, vehicles, routes, routeSchedule } = useAppStore();

  const dispFio =
    dayMeta.dispFio ||
    employees.find((e) => e.dolzhnost === "Диспетчер" && e.status === "active")?.fio ||
    "_______________";
  const mekhFio =
    dayMeta.mekhFio ||
    employees.find((e) => e.dolzhnost === "Механик по выпуску" && e.status === "active")?.fio ||
    "_______________";

  const getVehicle = (bort: string) => vehicles.find((v) => v.bortovoy === bort);
  const getVodInfo = (fio: string) =>
    employees.find((e) => e.fio === fio || (fio && fio.startsWith(e.fio.split(" ")[0])));
  const getRouteCompanyIdx = (marshrut: string) => {
    const num = marshrut.split("/")[0].trim();
    return routes.find((r) => r.nomer === num)?.companyIdx ?? 0;
  };

  const activeRows = useMemo(
    () => rows.filter((r) => r.fio && r.fio !== "без" && r.bortovoy && !r.statusOtsutstviya),
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

  const companyGroups =
    byCompany.size > 0
      ? Array.from(byCompany.entries()).map(([companyIdx, rows]) => ({ companyIdx, rows }))
      : [{ companyIdx: 0, rows: [] as NaryadRow[] }];

  const renderBlock = (companyIdx: number, blockRows: NaryadRow[], isFirst: boolean) => {
    const company = companies[companyIdx];

    const byRoute = blockRows.reduce<Record<string, number>>((acc, r) => {
      const num = r.marshrut.split("/")[0];
      acc[num] = (acc[num] || 0) + 1;
      return acc;
    }, {});

    return (
      <div key={companyIdx} className={`mb-10 print-no-break${isFirst ? "" : " print-page-break"}`}>

        {/* ─── Угловой штамп (обязательный элемент формы) ─── */}
        <div className="flex justify-between items-start mb-3">
          <div className="border border-black p-2 text-[9px] min-w-[180px]">
            <div className="font-bold text-[10px] mb-0.5">{company?.nazvanie || "________________________"}</div>
            {company?.adresYur && <div>{company.adresYur}</div>}
            {!company?.adresYur && company?.adres && <div>{company.adres}</div>}
            {company?.inn && <div>ИНН: {company.inn}{company?.kpp ? ` / КПП: ${company.kpp}` : ""}</div>}
            {company?.telefon && <div>Тел.: {company.telefon}</div>}
            <div className="mt-1">ОГРН/ОГРНИП: {company?.ogrn || "________________________"}</div>
          </div>

          <div className="text-center flex-1 px-4">
            <div className="text-[9px] text-gray-500">Утверждена Приказом Минтранса России от 18.09.2008 № 152</div>
            <div className="font-bold text-[13px] uppercase tracking-wide mt-1">
              ЖУРНАЛ РЕГИСТРАЦИИ ПУТЕВЫХ ЛИСТОВ
            </div>
            <div className="text-[10px] mt-0.5">(форма ПГ-1)</div>
            <div className="text-[10px] mt-1">за {monthYear} г.</div>
          </div>

          <div className="border border-black p-2 text-[9px] min-w-[140px] text-center">
            <div className="mb-1">Код по ОКУД</div>
            <div className="border border-black py-1 font-bold text-[11px]">0345016</div>
            <div className="mt-2 mb-1">Код по ОКПО</div>
            <div className="border border-black py-1">{company?.okpo || "__________"}</div>
          </div>
        </div>

        {/* ─── Реквизиты смены ─── */}
        <div className="border border-gray-400 grid grid-cols-4 gap-x-4 gap-y-1 p-2 mb-3 text-[10px]">
          <div>Дата: <span className="border-b border-black px-6 font-semibold">{displayDate}</span></div>
          <div>Диспетчер: <span className="border-b border-black px-6 font-semibold">{dispFio}</span></div>
          <div>Механик: <span className="border-b border-black px-4 font-semibold">{mekhFio}</span></div>
          <div>Выпущено ТС: <span className="border-b border-black px-4 font-semibold">{blockRows.length}</span></div>
          <div className="col-span-4">
            По маршрутам:&nbsp;
            {Object.entries(byRoute).sort().map(([num, cnt]) => (
              <span key={num} className="mr-4">№{num} — <b>{cnt}</b> ед.</span>
            ))}
          </div>
        </div>

        {/* ─── Основная таблица формы ПГ-1 ─── */}
        <table className="border-collapse w-full text-[8.5px]">
          <thead>
            <tr style={{ backgroundColor: "#1a3a6b" }}>
              {/* Гр. 1 */}
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "22px" }}>
                <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: "7px" }}>№ п/п</div>
              </th>
              {/* Гр. 2 */}
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "48px" }}>Путевой лист №</th>
              {/* Гр. 3 */}
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "52px" }}>Дата выдачи</th>
              {/* Гр. 4-5 */}
              <th colSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold">Транспортное средство</th>
              {/* Гр. 6 */}
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "50px" }}>Марш&shy;рут, график</th>
              {/* Гр. 7-8 */}
              <th colSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold">Водитель</th>
              {/* Гр. 9 */}
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "68px" }}>Кондуктор (ФИО)</th>
              {/* Гр. 10-11 */}
              <th colSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold">Выезд</th>
              {/* Гр. 12-13 */}
              <th colSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold">Возврат</th>
              {/* Гр. 14 */}
              <th colSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold">Показания одометра (км)</th>
              {/* Гр. 16 */}
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "44px" }}>Тех&shy;ни&shy;чес&shy;кое состояние</th>
              {/* Гр. 17 */}
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "52px" }}>Подпись диспетчера о выдаче</th>
              {/* Гр. 18 */}
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "52px" }}>Подпись диспетчера о приёме</th>
              {/* Гр. 19 */}
              <th rowSpan={2} className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "55px" }}>Примечание</th>
            </tr>
            <tr style={{ backgroundColor: "#1a3a6b" }}>
              <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "42px" }}>Борт №</th>
              <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "62px" }}>Гос. знак / марка</th>
              <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "110px" }}>ФИО</th>
              <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "48px" }}>Уд-ие №</th>
              <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "40px" }}>план</th>
              <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "40px" }}>факт</th>
              <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "40px" }}>план</th>
              <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "40px" }}>факт</th>
              <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "46px" }}>при выезде</th>
              <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "46px" }}>при возврате</th>
            </tr>
            {/* Нумерация граф (обязательна по форме) */}
            <tr className="bg-gray-100">
              {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map((n) => (
                <td key={n} className="border border-gray-300 text-center text-[8px] text-gray-400 py-0.5">{n}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {blockRows.map((row, idx) => {
              const veh   = getVehicle(row.bortovoy);
              const vod   = getVodInfo(row.fio);
              const sched = routeSchedule[row.marshrut];
              const rowBg = idx % 2 === 0 ? "#ffffff" : "#f0f4ff";
              return (
                <tr key={row.id} style={{ backgroundColor: rowBg }}>
                  {/* 1 */ }<td className="border border-gray-300 text-center py-2.5 text-gray-400 text-[8px]">{idx + 1}</td>
                  {/* 2 */ }<td className="border border-gray-300 px-1 text-center font-bold text-blue-700">{row.putevoy}</td>
                  {/* 3 */ }<td className="border border-gray-300 px-1 text-center">{displayDate}</td>
                  {/* 4 */ }<td className="border border-gray-300 px-1 text-center font-bold text-blue-900">{row.bortovoy}</td>
                  {/* 5 */ }<td className="border border-gray-300 px-1 text-[8px]">{veh?.gos || ""}{veh?.marka ? ` / ${veh.marka}` : ""}</td>
                  {/* 6 */ }<td className="border border-gray-300 px-1 text-center">{row.marshrut}</td>
                  {/* 7 */ }<td className="border border-gray-300 px-1 font-medium">{row.fio}</td>
                  {/* 8 */ }<td className="border border-gray-300 px-1 text-center text-[8px]">{vod?.udostoverenie || ""}</td>
                  {/* 9 */ }<td className="border border-gray-300 px-1 text-[8px]">{row.fioKond && row.fioKond !== "без" ? row.fioKond : ""}</td>
                  {/* 10 */ }<td className="border border-gray-300 px-1 text-center font-semibold text-blue-900">{sched?.vypusk || ""}</td>
                  {/* 11 */ }<td className="border border-gray-300"></td>
                  {/* 12 */ }<td className="border border-gray-300 px-1 text-center font-semibold text-red-700">{sched?.zakhod || ""}</td>
                  {/* 13 */ }<td className="border border-gray-300"></td>
                  {/* 14 */ }<td className="border border-gray-300 px-1 text-center text-[8px]">{row.odometrVyezd || ""}</td>
                  {/* 15 */ }<td className="border border-gray-300 px-1 text-center text-[8px]">{row.odometrVozv || ""}</td>
                  {/* 16 */ }<td className="border border-gray-300 px-1 text-center text-green-800 font-semibold text-[7.5px] leading-tight">исправен</td>
                  {/* 17 */ }<td className="border border-gray-300"></td>
                  {/* 18 */ }<td className="border border-gray-300"></td>
                  {/* 19 */ }<td className="border border-gray-300"></td>
                </tr>
              );
            })}
            {Array.from({ length: Math.max(0, 3 - blockRows.length) }).map((_, i) => (
              <tr key={`e-${i}`}>
                <td className="border border-gray-300 text-center py-3 text-gray-300 text-[8px]">{blockRows.length + i + 1}</td>
                {Array.from({ length: 18 }).map((_, j) => (
                  <td key={j} className="border border-gray-300 py-3"></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* ─── Итоговая строка ─── */}
        <div className="flex justify-between items-start mt-4 px-2 text-[10px] gap-6">
          <div className="space-y-2">
            <div>Всего путевых листов выдано: <span className="border-b border-black px-6 font-semibold">{blockRows.length}</span></div>
            <div>
              Диспетчер (выдача): <span className="border-b border-black px-10 font-semibold">{dispFio}</span>
              &nbsp;&nbsp;Подпись: <span className="border-b border-black px-10"></span>
            </div>
            <div>
              Диспетчер (приём): <span className="border-b border-black px-10 font-semibold">{dispFio}</span>
              &nbsp;&nbsp;Подпись: <span className="border-b border-black px-10"></span>
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div>
              Механик по выпуску: <span className="border-b border-black px-6 font-semibold">{mekhFio}</span>
              &nbsp;&nbsp;Подпись: <span className="border-b border-black px-8"></span>
            </div>
            <div>Дата составления: <span className="border-b border-black px-8">{displayDate}</span></div>
          </div>
        </div>

        {/* ─── Сводка по маршрутам ─── */}
        <div className="mt-3 border border-gray-300 p-2 text-[9px]">
          <span className="font-semibold mr-3">Итог по маршрутам:</span>
          {Object.entries(byRoute).sort().map(([num, cnt]) => (
            <span key={num} className="mr-4">Маршрут №{num} — <b>{cnt}</b> ед.</span>
          ))}
          <span className="ml-4 font-semibold">Итого ТС: {blockRows.length}</span>
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
      <div className="bg-white font-serif text-[10px] leading-tight" style={{ minWidth: "1150px" }}>
        {companyGroups.map(({ companyIdx, rows }, i) => renderBlock(companyIdx, rows, i === 0))}
      </div>
    </div>
  );
};

export default JurnalDisp;