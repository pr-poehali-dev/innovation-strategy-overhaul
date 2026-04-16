import { useRef } from "react";

interface PutevoyData {
  // Организация
  orgNazvanie: string;
  orgAdres: string;
  orgTelefon: string;
  orgInn: string;
  // Путевой лист
  nomer: string;
  data: string;
  // ТС
  marka: string;
  gos: string;
  bortovoy: string;
  garazhny: string;
  // Маршрут
  marshrut: string;
  // Водитель
  vodFio: string;
  vodUdostVerenie: string;
  vodKategoria: string;
  // Кондуктор
  kondFio: string;
  // Показания одометра
  odometrVyezd: string;
  odometrVozv: string;
  // Топливо
  toplivoMarka: string;
  toplivoVydano: string;
  toplivoOstVyezd: string;
  toplivoOstVozv: string;
  // Время
  vremyaVyezdPlan: string;
  vremyaVozvPlan: string;
  vremyaVyezdFakt: string;
  vremyaVozvFakt: string;
  // Медосмотр и тех
  medDopusk: string;
  medPodpis: string;
  tehDopusk: string;
  tehPodpis: string;
  // Диспетчер
  dispFio: string;
  dispPodpis: string;
}

interface Props {
  data: PutevoyData;
  onClose: () => void;
}

const Line = ({ label, value, width = "flex-1" }: { label: string; value?: string; width?: string }) => (
  <div className={`${width} flex flex-col`}>
    <div className="border-b border-black min-h-[18px] text-[11px] px-1">{value || "\u00A0"}</div>
    <div className="text-[8px] text-center text-gray-600 mt-0.5 leading-tight">{label}</div>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="font-bold text-[10px] uppercase border-b border-black mt-2 mb-1">{children}</div>
);

const PutevoyListPrint = ({ data }: { data: PutevoyData }) => (
  <div
    id="putevoy-print"
    className="bg-white text-black font-serif"
    style={{ width: "210mm", minHeight: "297mm", padding: "10mm 12mm", fontSize: "10px", lineHeight: "1.3", boxSizing: "border-box" }}
  >
    {/* Шапка */}
    <div className="flex justify-between items-start mb-1">
      <div className="text-[8px] leading-tight max-w-[60mm]">
        <div className="font-bold">{data.orgNazvanie || "________________________________"}</div>
        <div>{data.orgAdres || "адрес: ____________________________"}</div>
        <div>тел.: {data.orgTelefon || "______________"}</div>
        <div>ИНН: {data.orgInn || "______________"}</div>
      </div>
      <div className="text-center">
        <div className="text-[13px] font-bold uppercase tracking-wide">ПУТЕВОЙ ЛИСТ</div>
        <div className="text-[10px]">автобуса</div>
        <div className="flex gap-4 mt-1 justify-center">
          <div className="flex flex-col items-center">
            <div className="border-b border-black min-w-[30mm] text-center text-[11px] font-bold">{data.nomer || "\u00A0"}</div>
            <div className="text-[8px] text-gray-600">номер</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="border-b border-black min-w-[40mm] text-center text-[11px]">{data.data || "\u00A0"}</div>
            <div className="text-[8px] text-gray-600">дата</div>
          </div>
        </div>
      </div>
      <div className="text-[8px] text-right leading-tight max-w-[55mm]">
        <div>Форма согласно</div>
        <div>Приказу Минтранса России</div>
        <div>от 28.09.2022 № 390</div>
      </div>
    </div>

    <div className="border-t-2 border-black mt-1 mb-2" />

    {/* Транспортное средство */}
    <SectionTitle>Сведения о транспортном средстве</SectionTitle>
    <div className="flex gap-2 mb-1">
      <Line label="марка, модель ТС" value={data.marka} width="flex-[2]" />
      <Line label="гос. рег. знак" value={data.gos} />
      <Line label="бортовой №" value={data.bortovoy} />
      <Line label="гаражный №" value={data.garazhny} />
    </div>

    {/* Маршрут */}
    <SectionTitle>Маршрут</SectionTitle>
    <div className="flex gap-2 mb-1">
      <Line label="№ маршрута и наименование" value={data.marshrut} width="flex-1" />
    </div>
    <div className="text-[8px] mt-0.5 mb-1">Вид перевозки: <span className="font-bold">регулярные муниципальные перевозки по регулируемым тарифам</span></div>

    {/* Водитель */}
    <SectionTitle>Сведения о водителе</SectionTitle>
    <div className="flex gap-2 mb-1">
      <Line label="фамилия, имя, отчество" value={data.vodFio} width="flex-[3]" />
      <Line label="удостоверение №" value={data.vodUdostVerenie} width="flex-[2]" />
      <Line label="категория" value={data.vodKategoria} />
    </div>

    {/* Кондуктор */}
    {data.kondFio && (
      <>
        <SectionTitle>Сведения о кондукторе</SectionTitle>
        <div className="flex gap-2 mb-1">
          <Line label="фамилия, имя, отчество" value={data.kondFio} width="flex-[3]" />
          <Line label="должность" value="кондуктор" width="flex-[2]" />
        </div>
      </>
    )}

    {/* Показания одометра */}
    <SectionTitle>Показания одометра</SectionTitle>
    <div className="flex gap-2 mb-1">
      <Line label="при выезде из гаража (км)" value={data.odometrVyezd} />
      <Line label="при возврате в гараж (км)" value={data.odometrVozv} />
      <Line
        label="пробег за смену (км)"
        value={(() => {
          const v = parseFloat(data.odometrVyezd);
          const r = parseFloat(data.odometrVozv);
          if (!isNaN(v) && !isNaN(r) && data.odometrVyezd && data.odometrVozv) {
            const diff = Math.abs(r - v);
            return diff > 0 ? String(diff) : "";
          }
          return "";
        })()}
      />
    </div>

    {/* Топливо */}
    <SectionTitle>Сведения о топливе</SectionTitle>
    <div className="flex gap-2 mb-1">
      <Line label="марка топлива" value={data.toplivoMarka || "ДТ"} />
      <Line label="выдано (л)" value={data.toplivoVydano} />
      <Line label="остаток при выезде (л)" value={data.toplivoOstVyezd} />
      <Line label="остаток при возврате (л)" value={data.toplivoOstVozv} />
    </div>

    {/* Время */}
    <SectionTitle>Время работы</SectionTitle>
    <div className="flex gap-2 mb-1">
      <div className="flex-1">
        <div className="text-[8px] font-semibold mb-0.5">По графику (план)</div>
        <div className="flex gap-2">
          <Line label="выезд из гаража" value={data.vremyaVyezdPlan} />
          <Line label="возврат в гараж" value={data.vremyaVozvPlan} />
        </div>
      </div>
      <div className="flex-1">
        <div className="text-[8px] font-semibold mb-0.5">Фактически</div>
        <div className="flex gap-2">
          <Line label="выезд из гаража" value={data.vremyaVyezdFakt} />
          <Line label="возврат в гараж" value={data.vremyaVozvFakt} />
        </div>
      </div>
    </div>

    {/* Медосмотр и технический контроль */}
    <div className="flex gap-4 mt-2">
      {/* Медосмотр */}
      <div className="flex-1 border border-black p-1.5">
        <div className="text-[9px] font-bold text-center mb-1">ПРЕДРЕЙСОВЫЙ МЕДИЦИНСКИЙ ОСМОТР</div>
        <div className="text-[8px] mb-1">Водитель прошёл предрейсовый медицинский осмотр, к управлению ТС допущен</div>
        <div className="flex gap-2 mt-2">
          <Line label="дата и время" value={data.medDopusk} />
          <Line label="подпись мед. работника" value={data.medPodpis} />
        </div>
        <div className="mt-2 border border-dashed border-black p-1 text-[8px]">
          <div className="font-semibold mb-1">ПОСЛЕРЕЙСОВЫЙ МЕДИЦИНСКИЙ ОСМОТР</div>
          <div className="flex gap-2">
            <Line label="дата и время" value="" />
            <Line label="подпись мед. работника" value="" />
          </div>
        </div>
      </div>
      {/* Тех. контроль */}
      <div className="flex-1 border border-black p-1.5">
        <div className="text-[9px] font-bold text-center mb-1">ПРЕДРЕЙСОВЫЙ ТЕХНИЧЕСКИЙ КОНТРОЛЬ</div>
        <div className="text-[8px] mb-1">Транспортное средство прошло предрейсовый технический контроль, выпуск на линию разрешён</div>
        <div className="flex gap-2 mt-2">
          <Line label="дата и время" value={data.tehDopusk} />
          <Line label="подпись контролёра" value={data.tehPodpis} />
        </div>
        <div className="mt-2 border border-dashed border-black p-1 text-[8px]">
          <div className="font-semibold mb-1">ПОСЛЕРЕЙСОВЫЙ ТЕХНИЧЕСКИЙ КОНТРОЛЬ</div>
          <div className="flex gap-2">
            <Line label="дата и время" value="" />
            <Line label="подпись контролёра" value="" />
          </div>
        </div>
      </div>
    </div>

    {/* Диспетчер */}
    <SectionTitle>Диспетчер (уполномоченное лицо)</SectionTitle>
    <div className="flex gap-2 mb-1">
      <Line label="фамилия, имя, отчество" value={data.dispFio} width="flex-[3]" />
      <Line label="подпись" value={data.dispPodpis} />
    </div>

    {/* Задание водителю */}
    <SectionTitle>Задание водителю</SectionTitle>
    <table className="w-full border-collapse text-[9px] mt-1">
      <thead>
        <tr className="border border-black">
          <th className="border border-black px-1 py-0.5 text-center">Маршрут</th>
          <th className="border border-black px-1 py-0.5 text-center">Время выезда</th>
          <th className="border border-black px-1 py-0.5 text-center">Время заезда</th>
          <th className="border border-black px-1 py-0.5 text-center">Количество рейсов (план)</th>
          <th className="border border-black px-1 py-0.5 text-center">Количество рейсов (факт)</th>
          <th className="border border-black px-1 py-0.5 text-center">Примечание</th>
        </tr>
      </thead>
      <tbody>
        {[1, 2, 3].map((i) => (
          <tr key={i} className="border border-black">
            <td className="border border-black px-1 py-2">{data.marshrut || ""}</td>
            <td className="border border-black px-1 py-2"></td>
            <td className="border border-black px-1 py-2"></td>
            <td className="border border-black px-1 py-2 text-center"></td>
            <td className="border border-black px-1 py-2 text-center"></td>
            <td className="border border-black px-1 py-2"></td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Результат работы */}
    <SectionTitle>Результат работы на линии</SectionTitle>
    <div className="flex gap-2 mb-1">
      <Line label="выполнено рейсов" value="" />
      <Line label="пробег по заданию (км)" value="" />
      <Line label="пробег фактический (км)" value="" />
      <Line label="перевезено пассажиров" value="" />
    </div>

    {/* Подписи */}
    <div className="mt-3 flex gap-8 text-[9px]">
      <div className="flex-1">
        <div className="border-b border-black mb-0.5 min-h-[16px]"></div>
        <div className="text-center text-[8px] text-gray-600">Подпись водителя</div>
      </div>
      {data.kondFio && (
        <div className="flex-1">
          <div className="border-b border-black mb-0.5 min-h-[16px]"></div>
          <div className="text-center text-[8px] text-gray-600">Подпись кондуктора</div>
        </div>
      )}
      <div className="flex-1">
        <div className="border-b border-black mb-0.5 min-h-[16px]"></div>
        <div className="text-center text-[8px] text-gray-600">Подпись диспетчера</div>
      </div>
    </div>

    <div className="mt-3 text-[8px] text-gray-500 text-center border-t border-gray-400 pt-1">
      Путевой лист оформлен в соответствии с Приказом Минтранса России от 28.09.2022 № 390
    </div>
  </div>
);

const PutevoyList = ({ data, onClose }: Props) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head>
      <meta charset="UTF-8"/>
      <title>Путевой лист № ${data.nomer}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', serif; background: white; color: black; }
        @page { size: A4; margin: 0; }
        @media print { body { -webkit-print-color-adjust: exact; } }
      </style>
      <link rel="stylesheet" href="${window.location.origin}/src/index.css"/>
    </head><body>${content.innerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); w.close(); }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto py-6">
      <div className="bg-white rounded shadow-2xl max-w-5xl w-full mx-4">
        {/* Тулбар */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50 rounded-t">
          <div>
            <span className="font-semibold text-gray-800 text-sm">Путевой лист № {data.nomer}</span>
            <span className="text-gray-400 text-xs ml-3">предпросмотр</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              🖨 Печать
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>

        {/* Предпросмотр */}
        <div className="overflow-auto p-4 bg-gray-200 min-h-[600px]">
          <div ref={printRef} className="shadow-lg mx-auto" style={{ width: "210mm" }}>
            <PutevoyListPrint data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};

export type { PutevoyData };
export default PutevoyList;