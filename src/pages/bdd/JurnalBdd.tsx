import { useMemo } from "react";
import { useAppStore, DtpRecord } from "@/store/appStore";

// ─── Журнал учёта ДТП ────────────────────────────────────────────────────────
// Автоматически собирает все записи из dtpRecords и дополняет их данными
// из справочников (ТС, Кадры, Маршруты, Организации) без хранения дублей.

interface Props {
  records: DtpRecord[];
  monthYear?: string;
}

const STATUS_LABELS: Record<DtpRecord["status"], string> = {
  new: "Новое",
  investigating: "Расследование",
  closed: "Закрыто",
};

const JurnalBdd = ({ records, monthYear }: Props) => {
  const { companies, routes, vehicles, employees } = useAppStore();

  const getVehicle = (bort: string) => vehicles.find((v) => v.bortovoy === bort);
  const getVodInfo = (fio: string) =>
    employees.find((e) => e.fio === fio || (fio && fio.startsWith(e.fio.split(" ")[0])));
  const getRouteCompany = (marshrut: string) => {
    const num = marshrut.split("/")[0].trim();
    const r = routes.find((rt) => rt.nomer === num);
    return r ? companies[r.companyIdx]?.kratkoeNazvanie || companies[r.companyIdx]?.nazvanie || "" : "";
  };

  // Сортируем по дате (новые сверху)
  const sorted = useMemo(() => {
    const parse = (d: string) => {
      // "DD.MM.YYYY" → timestamp
      const [dd, mm, yyyy] = d.split(".");
      return new Date(`${yyyy}-${mm}-${dd}`).getTime() || 0;
    };
    return [...records].sort((a, b) => parse(b.date) - parse(a.date));
  }, [records]);

  const ruTitle = monthYear ? `за ${monthYear}` : "за весь период";

  return (
    <div className="bg-white border border-gray-300 p-5 text-xs font-sans">
      <div className="text-center mb-3">
        <div className="text-base font-bold uppercase">Журнал учёта ДТП</div>
        <div className="text-xs text-gray-500 mt-0.5">
          {ruTitle} · записей: {sorted.length}
        </div>
      </div>

      <table className="w-full border-collapse text-[11px]">
        <thead className="bg-gray-700">
          <tr>
            <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "30px" }}>№</th>
            <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "80px" }}>Дата</th>
            <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "55px" }}>Время</th>
            <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "60px" }}>Борт</th>
            <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "90px" }}>Гос. знак</th>
            <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold">Марка</th>
            <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "55px" }}>Марш/Гр</th>
            <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "65px" }}>Путевой №</th>
            <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold">Водитель</th>
            <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "80px" }}>Уд-ие №</th>
            <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold">Место ДТП</th>
            <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold">Описание</th>
            <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "70px" }}>Ущерб, ₽</th>
            <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "120px" }}>Организация</th>
            <th className="border border-gray-500 px-1 py-1 text-white text-center font-semibold" style={{ width: "90px" }}>Статус</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={15} className="border border-gray-300 px-2 py-6 text-center text-gray-400">
                Записей ДТП нет. Они добавляются автоматически при отметке ДТП в наряде.
              </td>
            </tr>
          ) : (
            sorted.map((rec, idx) => {
              const veh = getVehicle(rec.bortovoy);
              const vod = getVodInfo(rec.fioVod);
              const orgName = getRouteCompany(rec.marshrut);
              return (
                <tr key={rec.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-gray-300 px-1 text-center text-gray-500">{idx + 1}</td>
                  <td className="border border-gray-300 px-1 text-center">{rec.date}</td>
                  <td className="border border-gray-300 px-1 text-center">{rec.vremya || "—"}</td>
                  <td className="border border-gray-300 px-1 text-center font-semibold">{rec.bortovoy || "—"}</td>
                  <td className="border border-gray-300 px-1 text-center">{veh?.gos || "—"}</td>
                  <td className="border border-gray-300 px-1">{veh?.marka || "—"}</td>
                  <td className="border border-gray-300 px-1 text-center">{rec.marshrut || "—"}</td>
                  <td className="border border-gray-300 px-1 text-center text-blue-700 font-semibold">{rec.putevoy || "—"}</td>
                  <td className="border border-gray-300 px-1">{rec.fioVod || "—"}</td>
                  <td className="border border-gray-300 px-1 text-center text-[10px]">{vod?.udostoverenie || "—"}</td>
                  <td className="border border-gray-300 px-1">{rec.mesto || <span className="text-red-400">не указано</span>}</td>
                  <td className="border border-gray-300 px-1">{rec.opisanie || "—"}</td>
                  <td className="border border-gray-300 px-1 text-right">{rec.ushcherb || "—"}</td>
                  <td className="border border-gray-300 px-1 text-center text-[10px]">{orgName || "—"}</td>
                  <td className="border border-gray-300 px-1 text-center">{STATUS_LABELS[rec.status]}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <div className="mt-6 grid grid-cols-2 gap-8 text-xs">
        <div>
          <div className="border-b border-black min-h-[20px]"></div>
          <div className="text-gray-500 text-center mt-1">Ответственный за БДД (подпись / ФИО)</div>
        </div>
        <div>
          <div className="border-b border-black min-h-[20px]"></div>
          <div className="text-gray-500 text-center mt-1">Директор (подпись / ФИО)</div>
        </div>
      </div>
    </div>
  );
};

export default JurnalBdd;
