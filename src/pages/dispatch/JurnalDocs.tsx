import { useMemo } from "react";
import { useAppStore } from "@/store/appStore";

// ─── Комплект разрешительной документации для муниципальных перевозок ────────
// 1. Список ТС по свидетельству об осуществлении перевозок (Приказ Минтранса 473)
// 2. Сводная таблица — маршруты + организация + лицензия
// Печать по кнопке

const JurnalDocs = () => {
  const { companies, vehicles, routes } = useAppStore();

  // Все ТС с привязкой к организации через маршруты
  const routesByCompany = useMemo(() => {
    const map = new Map<number, typeof routes>();
    routes.forEach((r) => {
      if (!map.has(r.companyIdx)) map.set(r.companyIdx, []);
      map.get(r.companyIdx)!.push(r);
    });
    return map;
  }, [routes]);

  const activeVehicles = useMemo(
    () => vehicles.filter((v) => v.bortovoy),
    [vehicles]
  );

  return (
    <div className="p-2">
      <div className="flex justify-end mb-3 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Печать комплекта
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          ДОКУМЕНТ 1: Свидетельства об осуществлении перевозок (по организациям)
          Приказ Минтранса России от 10.11.2015 № 331
      ════════════════════════════════════════════════════════════════════════ */}
      {companies.map((company, companyIdx) => {
        const compRoutes = routesByCompany.get(companyIdx) || [];
        if (compRoutes.length === 0) return null;

        return (
          <div key={`svid-${companyIdx}`} className={`bg-white font-serif text-[10px] leading-tight mb-8 print-no-break${companyIdx > 0 ? " print-page-break" : ""}`} style={{ minWidth: "800px" }}>

            {/* Шапка документа */}
            <div className="flex justify-between items-start mb-4">
              <div className="border border-black p-2 text-[9px] min-w-[200px]">
                <div className="font-bold text-[11px]">{company.nazvanie || "___________________________"}</div>
                {company.adresYur && <div className="mt-0.5">{company.adresYur}</div>}
                {company.inn && <div>ИНН: {company.inn}{company.kpp ? ` / КПП: ${company.kpp}` : ""}</div>}
                {company.ogrn && <div>ОГРН: {company.ogrn}</div>}
                {company.licenziya && <div className="mt-0.5 text-blue-800 font-semibold">Лицензия: {company.licenziya} от {company.licenziyaData}</div>}
              </div>

              <div className="text-center flex-1 px-4">
                <div className="text-[9px] text-gray-500 mb-1">
                  Приказ Минтранса России от 10.11.2015 № 331
                </div>
                <div className="font-bold text-[13px] uppercase tracking-wide">
                  СВИДЕТЕЛЬСТВО ОБ ОСУЩЕСТВЛЕНИИ ПЕРЕВОЗОК
                </div>
                <div className="text-[10px] font-semibold mt-0.5">
                  по муниципальным маршрутам регулярных перевозок
                </div>
                {company.svidetelstvo && (
                  <div className="text-[11px] font-bold mt-1">
                    № {company.svidetelstvo} от {company.svidetelstvoData}
                  </div>
                )}
                {!company.svidetelstvo && (
                  <div className="text-[10px] mt-1">
                    № __________________ от «___» ____________ 20___ г.
                  </div>
                )}
              </div>

              <div className="border border-black p-2 text-[9px] min-w-[160px]">
                {company.zakazchik ? (
                  <>
                    <div className="font-semibold mb-0.5">Заказчик перевозок:</div>
                    <div>{company.zakazchik}</div>
                    {company.zakazchikInn && <div>ИНН: {company.zakazchikInn}</div>}
                    {company.dogovorZakazchik && <div className="mt-0.5">Договор № {company.dogovorZakazchik}</div>}
                  </>
                ) : (
                  <>
                    <div className="font-semibold mb-0.5">Заказчик:</div>
                    <div className="text-gray-400">Заполните в настройках</div>
                  </>
                )}
              </div>
            </div>

            {/* Раздел I — маршруты */}
            <div className="mb-4">
              <div className="font-bold text-[11px] uppercase mb-2 border-b border-black pb-1">
                Раздел I. Маршруты регулярных перевозок
              </div>
              <table className="border-collapse w-full text-[9px]">
                <thead>
                  <tr style={{ backgroundColor: "#1a3a6b" }}>
                    <th className="border border-gray-500 px-1 py-1.5 text-white text-center" style={{ width: "28px" }}>№</th>
                    <th className="border border-gray-500 px-2 py-1.5 text-white text-left font-semibold" style={{ width: "55px" }}>№ маршрута</th>
                    <th className="border border-gray-500 px-2 py-1.5 text-white text-left font-semibold">Наименование маршрута</th>
                    <th className="border border-gray-500 px-2 py-1.5 text-white text-left font-semibold" style={{ width: "120px" }}>Начальный остановочный пункт</th>
                    <th className="border border-gray-500 px-2 py-1.5 text-white text-left font-semibold" style={{ width: "120px" }}>Конечный остановочный пункт</th>
                    <th className="border border-gray-500 px-2 py-1.5 text-white text-center font-semibold" style={{ width: "60px" }}>Кол-во рейсов / графиков</th>
                    <th className="border border-gray-500 px-2 py-1.5 text-white text-center font-semibold" style={{ width: "80px" }}>Вид перевозки</th>
                    <th className="border border-gray-500 px-2 py-1.5 text-white text-center font-semibold" style={{ width: "90px" }}>Тариф (тип)</th>
                  </tr>
                </thead>
                <tbody>
                  {compRoutes.map((r, idx) => (
                    <tr key={r.id} style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#f0f4ff" }}>
                      <td className="border border-gray-300 text-center py-2 text-gray-400">{idx + 1}</td>
                      <td className="border border-gray-300 px-2 text-center font-bold text-blue-900">№{r.nomer}</td>
                      <td className="border border-gray-300 px-2">{r.nazvanie}</td>
                      <td className="border border-gray-300 px-2">{r.nachalo}</td>
                      <td className="border border-gray-300 px-2">{r.konets}</td>
                      <td className="border border-gray-300 px-2 text-center">{r.grafikov}</td>
                      <td className="border border-gray-300 px-2 text-center text-[8px]">регулярные муниципальные</td>
                      <td className="border border-gray-300 px-2 text-center text-[8px]">регулируемый</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Раздел II — транспортные средства */}
            <div className="mb-4">
              <div className="font-bold text-[11px] uppercase mb-2 border-b border-black pb-1">
                Раздел II. Транспортные средства, используемые для перевозки
              </div>
              <table className="border-collapse w-full text-[9px]">
                <thead>
                  <tr style={{ backgroundColor: "#1a3a6b" }}>
                    <th className="border border-gray-500 px-1 py-1.5 text-white text-center" style={{ width: "28px" }}>№</th>
                    <th className="border border-gray-500 px-2 py-1.5 text-white text-center font-semibold" style={{ width: "55px" }}>Борт №</th>
                    <th className="border border-gray-500 px-2 py-1.5 text-white text-left font-semibold" style={{ width: "130px" }}>Марка / модель ТС</th>
                    <th className="border border-gray-500 px-2 py-1.5 text-white text-center font-semibold" style={{ width: "90px" }}>Гос. рег. знак</th>
                    <th className="border border-gray-500 px-2 py-1.5 text-white text-center font-semibold" style={{ width: "140px" }}>VIN</th>
                    <th className="border border-gray-500 px-2 py-1.5 text-white text-center font-semibold" style={{ width: "100px" }}>Рег. номер (реестр ТС)</th>
                    <th className="border border-gray-500 px-2 py-1.5 text-white text-center font-semibold" style={{ width: "55px" }}>Экол. класс</th>
                    <th className="border border-gray-500 px-2 py-1.5 text-white text-center font-semibold" style={{ width: "60px" }}>Год выпуска</th>
                    <th className="border border-gray-500 px-2 py-1.5 text-white text-center font-semibold" style={{ width: "80px" }}>Собственник</th>
                  </tr>
                </thead>
                <tbody>
                  {activeVehicles.map((v, idx) => (
                    <tr key={v.id} style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#f0f4ff" }}>
                      <td className="border border-gray-300 text-center py-2 text-gray-400">{idx + 1}</td>
                      <td className="border border-gray-300 px-2 text-center font-bold text-blue-900">{v.bortovoy}</td>
                      <td className="border border-gray-300 px-2">{v.marka}</td>
                      <td className="border border-gray-300 px-2 text-center font-semibold">{v.gos}</td>
                      <td className="border border-gray-300 px-2 text-center text-[8px]">{v.vin}</td>
                      <td className="border border-gray-300 px-2 text-center text-[8px]">{v.reestr}</td>
                      <td className="border border-gray-300 px-2 text-center">{v.ekKlass ? `Евро-${v.ekKlass}` : ""}</td>
                      <td className="border border-gray-300 px-2 text-center">{v.god}</td>
                      <td className="border border-gray-300 px-2 text-center text-[8px]">{v.sobstvennik}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Подписи */}
            <div className="flex justify-between mt-4 text-[10px]">
              <div className="space-y-4">
                <div>
                  {company.dolzhnostDir || "Директор"}: <span className="border-b border-black px-16 font-semibold">{company.direktor || "___________________________"}</span>
                  &nbsp;&nbsp;Подпись: <span className="border-b border-black px-10"></span>
                </div>
                {company.glavbuh && (
                  <div>
                    Гл. бухгалтер: <span className="border-b border-black px-12 font-semibold">{company.glavbuh}</span>
                    &nbsp;&nbsp;Подпись: <span className="border-b border-black px-10"></span>
                  </div>
                )}
              </div>
              <div className="text-right space-y-1">
                <div>М.П.</div>
                <div className="text-gray-400 text-[9px]">(место для печати)</div>
              </div>
            </div>
          </div>
        );
      })}

      {/* ═══════════════════════════════════════════════════════════════════════
          ДОКУМЕНТ 2: Сводная таблица маршрутов и перевозчиков
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white font-serif text-[10px] leading-tight print-page-break print-no-break" style={{ minWidth: "800px" }}>
        <div className="text-center mb-4">
          <div className="font-bold text-[13px] uppercase tracking-wide">
            СВОДНАЯ ТАБЛИЦА МУНИЦИПАЛЬНЫХ МАРШРУТОВ РЕГУЛЯРНЫХ ПЕРЕВОЗОК
          </div>
          <div className="text-[9px] text-gray-500 mt-0.5">
            Вид перевозки: регулярные, по регулируемым тарифам · Приказ Минтранса России от 31.01.2017 № 36
          </div>
        </div>

        <table className="border-collapse w-full text-[9px]">
          <thead>
            <tr style={{ backgroundColor: "#1a3a6b" }}>
              <th className="border border-gray-500 px-1 py-1.5 text-white text-center" style={{ width: "28px" }}>№</th>
              <th className="border border-gray-500 px-2 py-1.5 text-white text-center font-semibold" style={{ width: "50px" }}>№ маршрута</th>
              <th className="border border-gray-500 px-2 py-1.5 text-white text-left font-semibold">Наименование маршрута</th>
              <th className="border border-gray-500 px-2 py-1.5 text-white text-left font-semibold" style={{ width: "160px" }}>Перевозчик</th>
              <th className="border border-gray-500 px-2 py-1.5 text-white text-center font-semibold" style={{ width: "80px" }}>ИНН перевозчика</th>
              <th className="border border-gray-500 px-2 py-1.5 text-white text-center font-semibold" style={{ width: "80px" }}>Лицензия №</th>
              <th className="border border-gray-500 px-2 py-1.5 text-white text-center font-semibold" style={{ width: "80px" }}>Свидетельство №</th>
              <th className="border border-gray-500 px-2 py-1.5 text-white text-center font-semibold" style={{ width: "50px" }}>Граф.</th>
              <th className="border border-gray-500 px-2 py-1.5 text-white text-center font-semibold" style={{ width: "60px" }}>Кол-во ТС</th>
            </tr>
          </thead>
          <tbody>
            {routes
              .slice()
              .sort((a, b) => Number(a.nomer) - Number(b.nomer))
              .map((r, idx) => {
                const comp = companies[r.companyIdx];
                const routeVehicles = activeVehicles.length;
                return (
                  <tr key={r.id} style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#f0f4ff" }}>
                    <td className="border border-gray-300 text-center py-2 text-gray-400">{idx + 1}</td>
                    <td className="border border-gray-300 px-2 text-center font-bold text-blue-900">№{r.nomer}</td>
                    <td className="border border-gray-300 px-2">{r.nazvanie}</td>
                    <td className="border border-gray-300 px-2 text-[8px]">{comp?.kratkoeNazvanie || comp?.nazvanie}</td>
                    <td className="border border-gray-300 px-2 text-center text-[8px]">{comp?.inn}</td>
                    <td className="border border-gray-300 px-2 text-center text-[8px]">{comp?.licenziya}</td>
                    <td className="border border-gray-300 px-2 text-center text-[8px]">{comp?.svidetelstvo}</td>
                    <td className="border border-gray-300 px-2 text-center">{r.grafikov}</td>
                    <td className="border border-gray-300 px-2 text-center text-gray-400">{routeVehicles}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        <div className="flex justify-between mt-4 text-[10px]">
          <div>
            Итого маршрутов: <b>{routes.length}</b> · Итого графиков: <b>{routes.reduce((s, r) => s + r.grafikov, 0)}</b> · Всего ТС: <b>{activeVehicles.length}</b>
          </div>
          <div className="text-gray-400 text-[9px]">Дата составления: ___________________</div>
        </div>
      </div>
    </div>
  );
};

export default JurnalDocs;
