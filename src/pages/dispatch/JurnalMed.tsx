import { useMemo } from "react";
import { useAppStore, DayMeta } from "@/store/appStore";
import { NaryadRow } from "./types";

interface Props {
  rows: NaryadRow[];
  dayMeta: DayMeta;
  displayDate: string;
  monthYear: string;
}

const CERVONNAYA = "Червонная Л.М.";

const JurnalMed = ({ rows, dayMeta, displayDate, monthYear }: Props) => {
  const { companies, employees, vehicles, routes } = useAppStore();

  // Медик — фиксировано Червонная Л.М., иначе из дежурных/кадров
  const medik = CERVONNAYA ||
    dayMeta.medFio ||
    employees.find((e) => e.dolzhnost === "Медик" && e.status === "active")?.fio ||
    "_______________";

  const getVehicle = (bort: string) => vehicles.find((v) => v.bortovoy === bort);
  const getVodInfo = (fio: string) => employees.find((e) => e.fio === fio || (fio && fio.startsWith(e.fio.split(" ")[0])));
  // Срок действия ВУ/медсправки: "" — пустой, "ok" — ещё ок, "warn" — ≤30 дней, "exp" — просрочено
  const checkExpiry = (dateStr?: string): "" | "ok" | "warn" | "exp" => {
    if (!dateStr) return "";
    const exp = new Date(dateStr);
    if (isNaN(exp.getTime())) return "";
    const now = new Date(); now.setHours(0,0,0,0);
    const days = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
    if (days < 0) return "exp";
    if (days <= 30) return "warn";
    return "ok";
  };
  const expClass = (st: "" | "ok" | "warn" | "exp") =>
    st === "exp"  ? "text-red-600 font-semibold" :
    st === "warn" ? "text-orange-600 font-semibold" : "";
  const getRouteCompanyIdx = (marshrut: string) => {
    const num = marshrut.split("/")[0].trim();
    return routes.find((r) => r.nomer === num)?.companyIdx ?? 0;
  };

  // Активные строки с водителями
  const activeRows = useMemo(
    () => rows.filter((r) => r.fio && r.fio !== "без"),
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

  // Если строк нет — один пустой блок
  const companyGroups: Array<{ companyIdx: number; rows: NaryadRow[] }> =
    byCompany.size > 0
      ? Array.from(byCompany.entries()).map(([companyIdx, rows]) => ({ companyIdx, rows }))
      : [{ companyIdx: 0, rows: [] }];

  const renderBlock = (companyIdx: number, blockRows: NaryadRow[], isFirst: boolean) => {
    const company = companies[companyIdx];
    const startNum = 1;
    return (
      <div key={companyIdx} className={`mb-8 print-no-break${isFirst ? "" : " print-page-break"}`}>
        {/* Шапка блока */}
        <div className="text-center mb-3">
          <div className="font-bold text-[12px]">{company?.nazvanie || "___________________________"}</div>
          <div className="text-[9px] text-gray-700 mt-0.5 flex justify-center gap-3 flex-wrap">
            {company?.inn  && <span>ИНН: {company.inn}</span>}
            {company?.kpp  && <span>КПП: {company.kpp}</span>}
            {company?.ogrn && <span>ОГРН: {company.ogrn}</span>}
            {company?.adresYur && <span>Адрес: {company.adresYur}</span>}
          </div>
          <div className="mt-1.5 font-bold text-[13px] uppercase tracking-wide">
            ЖУРНАЛ РЕГИСТРАЦИИ ПРЕДРЕЙСОВЫХ МЕДИЦИНСКИХ ОСМОТРОВ ВОДИТЕЛЕЙ
          </div>
          <div className="text-[9px] mt-0.5 text-gray-600">
            (форма согласно Приказу Минздрава России от 15.12.2014 № 835н)
          </div>
          <div className="mt-1">за {monthYear} г.</div>
        </div>

        {/* Реквизиты */}
        <div className="flex justify-between text-[10px] mb-2 px-2">
          <div>Медицинский работник: <span className="border-b border-black px-8 font-semibold">{medik}</span></div>
          <div>Дата: <span className="border-b border-black px-6">{displayDate}</span></div>
        </div>

        {/* Таблица */}
        <table className="border-collapse w-full text-[9px]">
          <thead>
            <tr style={{ backgroundColor: "#1a3a6b" }}>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "28px" }}>№</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "130px" }}>ФИО водителя</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "60px" }}>Дата рождения</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "80px" }}>СНИЛС</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "70px" }}>Уд-ие №</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "50px" }}>Борт №</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "65px" }}>Гос. знак</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "60px" }}>Маршрут</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "55px" }}>Путевой №</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "65px" }}>Время осмотра</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "55px" }}>АД (мм рт.ст.)</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "45px" }}>Пульс</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "45px" }}>Алкотестер</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "65px" }}>Результат</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "65px" }}>Подпись медработника</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "65px" }}>Подпись водителя</th>
            </tr>
          </thead>
          <tbody>
            {blockRows.map((row, idx) => {
              const veh = getVehicle(row.bortovoy);
              const vod = getVodInfo(row.fio);
              return (
                <tr key={`med-${row.id}`} style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f5f8ff" }}>
                  <td className="border border-gray-300 text-center py-2">{startNum + idx}</td>
                  <td className="border border-gray-300 px-1 py-2 font-medium">{row.fio}</td>
                  <td className="border border-gray-300 px-1 py-2 text-center">{vod?.dataRozhd || ""}</td>
                  <td className="border border-gray-300 px-1 py-2 text-center text-[8px]">{vod?.snils || ""}</td>
                  <td
                    className={`border border-gray-300 px-1 py-2 text-center text-[8px] ${expClass(checkExpiry(vod?.udostoverenieDo))}`}
                    title={checkExpiry(vod?.udostoverenieDo) === "exp" ? `ВУ просрочено (до ${vod?.udostoverenieDo})` : checkExpiry(vod?.udostoverenieDo) === "warn" ? `ВУ скоро истекает (${vod?.udostoverenieDo})` : undefined}
                  >
                    {vod?.udostoverenie || ""}
                    {vod?.udostoverenieDo && <div className="text-[7px] text-gray-500">до {vod.udostoverenieDo}</div>}
                  </td>
                  <td className="border border-gray-300 px-1 py-2 text-center font-bold">{row.bortovoy}</td>
                  <td className="border border-gray-300 px-1 py-2 text-center">{veh?.gos || ""}</td>
                  <td className="border border-gray-300 px-1 py-2 text-center">{row.marshrut}</td>
                  <td className="border border-gray-300 px-1 py-2 text-center font-semibold text-blue-700">{row.putevoy}</td>
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300 text-center text-gray-400">0,00</td>
                  <td className="border border-gray-300 text-center font-semibold text-green-800">допущен</td>
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300"></td>
                </tr>
              );
            })}
            {Array.from({ length: Math.max(0, 3 - blockRows.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-gray-300 text-center py-3 text-gray-300">{blockRows.length + i + 1}</td>
                {Array.from({ length: 15 }).map((_, j) => (
                  <td key={j} className="border border-gray-300 py-3"></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Подпись блока */}
        <div className="flex justify-between mt-3 px-2 text-[10px]">
          <div>
            Медицинский работник: <span className="border-b border-black px-8 font-semibold">{medik}</span>
            &nbsp;&nbsp;Подпись: <span className="border-b border-black px-10"></span>
          </div>
          <div>Дата: <span className="border-b border-black px-8">{displayDate}</span></div>
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
      <div className="bg-white font-serif text-[10px] leading-tight" style={{ minWidth: "900px" }}>
        {companyGroups.map(({ companyIdx, rows }, i) => renderBlock(companyIdx, rows, i === 0))}
      </div>
    </div>
  );
};

export default JurnalMed;