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
  const { companies, activeCompanyIdx, employees, vehicles } = useAppStore();
  const company = companies[activeCompanyIdx];

  const mekhFio = dayMeta.mekhFio || employees.find((e) => e.dolzhnost === "Механик по выпуску" && e.status === "active")?.fio || "_______________";
  const dispFio = dayMeta.dispFio || employees.find((e) => e.dolzhnost === "Диспетчер" && e.status === "active")?.fio || "_______________";
  const nachGarFio = dayMeta.nachGarFio || employees.find((e) => e.dolzhnost === "Нач. гаража" && e.status === "active")?.fio || "_______________";

  const activeRows = useMemo(
    () => rows.filter((r) => r.fio && r.fio !== "без" && r.bortovoy),
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

      <div
        id="jurnal-vypusk-print"
        className="bg-white font-serif text-[10px] leading-tight"
        style={{ minWidth: "1000px" }}
      >
        {/* Шапка */}
        <div className="text-center mb-3">
          <div className="font-bold text-[12px]">{company?.nazvanie || "___________________________"}</div>
          <div className="mt-2 font-bold text-[13px] uppercase tracking-wide">
            ЖУРНАЛ УЧЁТА ВЫХОДА ТРАНСПОРТНЫХ СРЕДСТВ НА ЛИНИЮ И ВОЗВРАТА
          </div>
          <div className="text-[10px] mt-0.5">
            (форма согласно Приказу Минтранса России от 28.09.2022 № 390)
          </div>
          <div className="mt-1">за {monthYear} г.</div>
        </div>

        {/* Реквизиты */}
        <div className="flex justify-between text-[10px] mb-3 px-2 gap-4">
          <div>Механик по выпуску: <span className="border-b border-black px-8">{mekhFio}</span></div>
          <div>Диспетчер: <span className="border-b border-black px-8">{dispFio}</span></div>
          <div>Нач. гаража: <span className="border-b border-black px-8">{nachGarFio}</span></div>
          <div>Дата: <span className="border-b border-black px-6">{displayDate}</span></div>
        </div>

        {/* Таблица */}
        <table className="border-collapse w-full text-[9px]">
          <thead>
            <tr style={{ backgroundColor: "#1a3a6b" }}>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "28px" }}>№</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "55px" }}>Борт №</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "65px" }}>Гос. знак</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "120px" }}>Марка / модель ТС</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "60px" }}>Маршрут</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "60px" }}>Путевой №</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "120px" }}>ФИО водителя</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "55px" }}>Уд-ие №</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "70px" }}>ФИО кондуктора</th>
              {/* Выезд */}
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "50px" }}>Выезд план</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "50px" }}>Выезд факт</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "60px" }}>Одометр (выезд)</th>
              {/* Техосмотр */}
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "55px" }}>Тех. контроль</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "65px" }}>Подпись механика</th>
              {/* Возврат */}
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "50px" }}>Возврат факт</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "60px" }}>Одометр (возврат)</th>
              <th className="border border-gray-600 px-1 py-1.5 text-white text-center font-semibold" style={{ width: "65px" }}>Подпись диспетчера</th>
            </tr>
          </thead>
          <tbody>
            {activeRows.map((row, idx) => {
              const veh = getVehicle(row.bortovoy);
              const vod = getVodInfo(row.fio);
              const rowBg = idx % 2 === 0 ? "#ffffff" : "#f0f4ff";
              return (
                <tr key={row.id} style={{ backgroundColor: rowBg }}>
                  <td className="border border-gray-300 text-center py-2.5 text-gray-400">{idx + 1}</td>
                  <td className="border border-gray-300 px-1 text-center font-bold text-blue-800">{row.bortovoy}</td>
                  <td className="border border-gray-300 px-1 text-center">{veh?.gos || ""}</td>
                  <td className="border border-gray-300 px-1">{veh?.marka || ""}</td>
                  <td className="border border-gray-300 px-1 text-center">{row.marshrut}</td>
                  <td className="border border-gray-300 px-1 text-center">{row.putevoy}</td>
                  <td className="border border-gray-300 px-1 font-medium">{row.fio}</td>
                  <td className="border border-gray-300 px-1 text-center text-[8px]">{vod?.udostoverenie || ""}</td>
                  <td className="border border-gray-300 px-1">{row.fioKond && row.fioKond !== "без" ? row.fioKond : ""}</td>
                  {/* Пустые ячейки для ручного заполнения */}
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300 text-center text-green-800 font-semibold">✓</td>
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300"></td>
                  <td className="border border-gray-300"></td>
                </tr>
              );
            })}
            {/* Пустые строки */}
            {Array.from({ length: Math.max(0, 5 - activeRows.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-gray-300 text-center py-3 text-gray-400">{activeRows.length + i + 1}</td>
                {Array.from({ length: 16 }).map((_, j) => (
                  <td key={j} className="border border-gray-300"></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Итог и подписи */}
        <div className="flex justify-between items-end mt-4 px-2 text-[10px]">
          <div className="space-y-1">
            <div>Всего выпущено ТС: <span className="border-b border-black px-4">{activeRows.length}</span></div>
            <div>Нач. гаража: <span className="border-b border-black px-10">{nachGarFio}</span> Подпись: <span className="border-b border-black px-8"></span></div>
          </div>
          <div className="space-y-1 text-right">
            <div>Механик по выпуску: <span className="border-b border-black px-6">{mekhFio}</span></div>
            <div>Диспетчер: <span className="border-b border-black px-6">{dispFio}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JurnalVypusk;
