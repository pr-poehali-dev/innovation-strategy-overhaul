import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import PutevoyList, { PutevoyData } from "@/components/PutevoyList";
import { useAppStore, DayMeta } from "@/store/appStore";
import { NaryadRow } from "./types";

interface Props {
  row: NaryadRow;
  today: string;
  dayMeta: DayMeta;
  onClose: () => void;
}

const PutevoyModal = ({ row, today, dayMeta, onClose }: Props) => {
  const { companies, employees, routes, vehicles } = useAppStore();

  // Определяем организацию по маршруту
  const routeNum = row.marshrut.split("/")[0].trim();
  const matchedRoute = routes.find((r) => r.nomer === routeNum);
  const routeCompany = matchedRoute !== undefined ? companies[matchedRoute.companyIdx] : companies[0];

  // Дежурные: сначала из DayMeta, затем из ИТР-справочника
  const itr = useMemo(() => {
    const active = employees.filter((e) => e.status === "active");
    const find = (d: string) => active.find((e) => e.dolzhnost === d)?.fio ?? "";
    return {
      medik: dayMeta.medFio  || find("Медик"),
      mekh:  dayMeta.mekhFio || find("Механик по выпуску"),
      disp:  dayMeta.dispFio || find("Диспетчер"),
    };
  }, [employees, dayMeta]);

  // ТС из справочника по борту
  const vehicleInfo = useMemo(
    () => vehicles.find((v) => v.bortovoy === row.bortovoy),
    [vehicles, row.bortovoy]
  );

  // Водитель из Кадров
  const vodInfo = useMemo(
    () => employees.find((e) => e.fio === row.fio || (row.fio && row.fio.startsWith(e.fio.split(" ")[0]))),
    [employees, row.fio]
  );

  const [extra, setExtra] = useState<Partial<PutevoyData>>({
    orgNazvanie:     routeCompany.nazvanie,
    orgAdres:        routeCompany.adres,
    orgTelefon:      routeCompany.telefon,
    orgInn:          routeCompany.inn,
    marka:           vehicleInfo?.marka ?? "",
    gos:             vehicleInfo?.gos   ?? "",
    marshrut:        matchedRoute ? `№${matchedRoute.nomer} ${matchedRoute.nazvanie}` : row.marshrut,
    vodUdostVerenie: vodInfo?.udostoverenie ?? "",
    vodKategoria:    vodInfo?.kategoriya  || "D",
    odometrVyezd:    "",
    odometrVozv:     "",
    toplivoMarka:    "ДТ",
    toplivoVydano:   "",
    toplivoOstVyezd: "",
    toplivoOstVozv:  "",
    vremyaVyezdPlan: "",
    vremyaVozvPlan:  "",
    vremyaVyezdFakt: "",
    vremyaVozvFakt:  "",
    medDopusk:       "",
    medPodpis:       itr.medik,
    tehDopusk:       "",
    tehPodpis:       itr.mekh,
    dispFio:         itr.disp,
    dispPodpis:      itr.disp,
  });
  const [showPrint, setShowPrint] = useState(false);

  const set = (key: keyof PutevoyData, val: string) =>
    setExtra((prev) => ({ ...prev, [key]: val }));

  const putevoyData: PutevoyData = {
    orgNazvanie:       extra.orgNazvanie     ?? routeCompany.nazvanie,
    orgAdres:          extra.orgAdres        ?? routeCompany.adres,
    orgTelefon:        extra.orgTelefon      ?? routeCompany.telefon,
    orgInn:            extra.orgInn          ?? routeCompany.inn,
    nomer:             row.putevoy           || row.id.toString().slice(-4),
    data:              today,
    marka:             extra.marka           ?? vehicleInfo?.marka ?? "",
    gos:               extra.gos             ?? vehicleInfo?.gos   ?? "",
    bortovoy:          row.bortovoy,
    garazhny:          vehicleInfo?.garazhny ?? row.bortovoy,
    marshrut:          extra.marshrut        ?? "",
    vodFio:            row.fio,
    vodUdostVerenie:   extra.vodUdostVerenie ?? "",
    vodKategoria:      extra.vodKategoria    ?? "D",
    kondFio:           row.fioKond,
    odometrVyezd:      extra.odometrVyezd    ?? "",
    odometrVozv:       extra.odometrVozv     ?? "",
    toplivoMarka:      extra.toplivoMarka    ?? "ДТ",
    toplivoVydano:     extra.toplivoVydano   ?? "",
    toplivoOstVyezd:   extra.toplivoOstVyezd ?? "",
    toplivoOstVozv:    extra.toplivoOstVozv  ?? "",
    vremyaVyezdPlan:   extra.vremyaVyezdPlan ?? "",
    vremyaVozvPlan:    extra.vremyaVozvPlan  ?? "",
    vremyaVyezdFakt:   extra.vremyaVyezdFakt ?? "",
    vremyaVozvFakt:    extra.vremyaVozvFakt  ?? "",
    medDopusk:         extra.medDopusk       ?? "",
    medPodpis:         extra.medPodpis       ?? itr.medik,
    tehDopusk:         extra.tehDopusk       ?? "",
    tehPodpis:         extra.tehPodpis       ?? itr.mekh,
    dispFio:           extra.dispFio         ?? itr.disp,
    dispPodpis:        extra.dispPodpis      ?? itr.disp,
  };

  if (showPrint) {
    return <PutevoyList data={putevoyData} onClose={() => setShowPrint(false)} />;
  }

  const F = ({
    label, k, placeholder,
  }: {
    label: string; k: keyof PutevoyData; placeholder?: string;
  }) => (
    <div className="flex flex-col gap-0.5">
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type="text"
        value={(extra[k] as string) ?? ""}
        onChange={(e) => set(k, e.target.value)}
        placeholder={placeholder}
        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50 rounded-t-lg sticky top-0">
          <div>
            <span className="font-semibold text-gray-800">Путевой лист</span>
            <span className="text-gray-500 text-sm ml-2">— {row.fio || "водитель"}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="bg-blue-50 rounded p-3 text-xs text-blue-700 space-y-0.5">
            <div>Водитель: <b>{row.fio || "—"}</b></div>
            {row.fioKond && <div>Кондуктор: <b>{row.fioKond}</b></div>}
            <div>Бортовой: <b>{row.bortovoy || "—"}</b> · Гос. знак: <b>{vehicleInfo?.gos || "—"}</b></div>
            <div>Маршрут: <b>{row.marshrut || "—"}</b> · Путевой лист №: <b>{row.putevoy || "—"}</b> · Дата: <b>{today}</b></div>
            <div>Организация: <b>{routeCompany.nazvanie}</b></div>
          </div>

          {/* Автозаполненные дежурные */}
          {(itr.medik || itr.mekh || itr.disp) && (
            <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-700">
              <b>Автозаполнено из дежурных:</b>
              {itr.medik && <span className="ml-2">Медик: {itr.medik}</span>}
              {itr.mekh  && <span className="ml-2">· Механик: {itr.mekh}</span>}
              {itr.disp  && <span className="ml-2">· Диспетчер: {itr.disp}</span>}
              {vodInfo?.udostoverenie && <span className="ml-2">· Уд-ие вод.: {vodInfo.udostoverenie}</span>}
            </div>
          )}

          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Организация</div>
            <div className="grid grid-cols-2 gap-2">
              <F label="Название" k="orgNazvanie" />
              <F label="ИНН" k="orgInn" />
              <F label="Адрес" k="orgAdres" />
              <F label="Телефон" k="orgTelefon" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Транспортное средство</div>
            <div className="grid grid-cols-2 gap-2">
              <F label="Марка, модель" k="marka" placeholder="ПАЗ 3205, ЛиАЗ 5292..." />
              <F label="Гос. рег. знак" k="gos" placeholder="А 000 АА 000" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Маршрут и водитель</div>
            <div className="grid grid-cols-2 gap-2">
              <F label="Маршрут (№ и наименование)" k="marshrut" placeholder="№1 Вокзал — Рынок" />
              <F label="Удостоверение водителя №" k="vodUdostVerenie" />
              <F label="Категория ТС" k="vodKategoria" placeholder="D" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Одометр (км)</div>
            <div className="grid grid-cols-2 gap-2">
              <F label="При выезде из гаража" k="odometrVyezd" placeholder="000000" />
              <F label="При возврате в гараж" k="odometrVozv" placeholder="000000" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Топливо</div>
            <div className="grid grid-cols-2 gap-2">
              <F label="Марка топлива" k="toplivoMarka" placeholder="ДТ" />
              <F label="Выдано (л)" k="toplivoVydano" />
              <F label="Остаток при выезде (л)" k="toplivoOstVyezd" />
              <F label="Остаток при возврате (л)" k="toplivoOstVozv" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Время работы</div>
            <div className="grid grid-cols-2 gap-2">
              <F label="Выезд (план)" k="vremyaVyezdPlan" placeholder="06:00" />
              <F label="Возврат (план)" k="vremyaVozvPlan" placeholder="22:00" />
              <F label="Выезд (факт)" k="vremyaVyezdFakt" placeholder="06:05" />
              <F label="Возврат (факт)" k="vremyaVozvFakt" placeholder="21:55" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Допуски</div>
            <div className="grid grid-cols-2 gap-2">
              <F label="Мед. осмотр — дата и время" k="medDopusk" placeholder="16.04.2026 05:40" />
              <F label="Мед. работник (ФИО)" k="medPodpis" />
              <F label="Тех. контроль — дата и время" k="tehDopusk" placeholder="16.04.2026 05:50" />
              <F label="Контролёр / механик (ФИО)" k="tehPodpis" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Диспетчер</div>
            <div className="grid grid-cols-2 gap-2">
              <F label="ФИО диспетчера" k="dispFio" />
              <F label="Подпись (ФИО для печати)" k="dispPodpis" />
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t bg-gray-50 rounded-b-lg flex justify-end gap-2 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={() => setShowPrint(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Icon name="FileText" size={14} />
            Предпросмотр и печать
          </button>
        </div>
      </div>
    </div>
  );
};

export default PutevoyModal;