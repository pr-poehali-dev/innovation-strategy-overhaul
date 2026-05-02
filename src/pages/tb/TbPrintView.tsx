import Icon from "@/components/ui/icon";
import { CompanySettings } from "@/store/appStore";
import { TbEntry, toMonthYear, toDisplayDate } from "./tbShared";

interface Props {
  company: CompanySettings;
  monthKey: string;
  rows: TbEntry[];
  onClose: () => void;
}

const TbPrintView = ({ company, monthKey, rows, onClose }: Props) => {
  const monthLabel = toMonthYear(monthKey + "-01");

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl shadow-2xl">
        {/* Управление */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-gray-50 print:hidden">
          <span className="text-sm text-gray-600 font-medium">Предпросмотр журнала ТБ</span>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Icon name="Printer" size={14} /> Печать
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              <Icon name="X" size={14} /> Закрыть
            </button>
          </div>
        </div>

        {/* Документ */}
        <div className="p-8 print:p-6 text-[11px] font-['Times_New_Roman',serif]">
          {/* Шапка */}
          <div className="text-center mb-6">
            <div className="text-xs mb-1 text-gray-600 uppercase tracking-widest">Журнал регистрации инструктажей по охране труда</div>
            <div className="text-base font-bold uppercase mb-1">{company.nazvanie || "Организация"}</div>
            <div className="text-xs text-gray-600">
              {monthLabel && `за ${monthLabel}`}
              {company.adres && ` · ${company.adres}`}
            </div>
          </div>

          {/* Реквизиты */}
          <div className="grid grid-cols-2 gap-x-8 mb-6 text-xs">
            <div className="space-y-1">
              <div><span className="text-gray-500">Руководитель организации:</span> <span className="font-semibold">{company.direktor || "_______________"}</span></div>
              <div><span className="text-gray-500">Должность:</span> <span>{company.dolzhnostDir || "Директор"}</span></div>
              <div><span className="text-gray-500">ИНН:</span> <span>{company.inn || "—"}</span></div>
            </div>
            <div className="space-y-1">
              <div><span className="text-gray-500">Адрес:</span> <span>{company.adresYur || company.adres || "—"}</span></div>
              <div><span className="text-gray-500">Телефон:</span> <span>{company.telefon || "—"}</span></div>
              <div><span className="text-gray-500">Лицензия №:</span> <span>{company.licenziya || "—"}</span></div>
            </div>
          </div>

          {/* Таблица */}
          <table className="w-full border-collapse text-[10px]" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "28px" }} />
              <col style={{ width: "72px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "80px" }} />
              <col style={{ width: "50px" }} />
              <col style={{ width: "140px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "50px" }} />
              <col style={{ width: "80px" }} />
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: "#1a3a6b" }}>
                {["№", "Дата", "ФИО инструктируемого", "Должность", "Таб. №", "Вид инструктажа", "Кто проводил", "Подпись", "Примечание"].map((h) => (
                  <th key={h} className="border border-blue-900 px-1 py-1 text-white font-semibold text-center leading-tight">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id ?? `print-${i}`} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f0f4ff" }}>
                  <td className="border border-gray-400 px-1 py-1 text-center text-gray-500">{i + 1}</td>
                  <td className="border border-gray-400 px-1 py-1 text-center">{toDisplayDate(row.dateKey)}</td>
                  <td className="border border-gray-400 px-1 py-1">{row.fio}</td>
                  <td className="border border-gray-400 px-1 py-1 text-center">{row.dolzhnost}</td>
                  <td className="border border-gray-400 px-1 py-1 text-center">{row.tabNum}</td>
                  <td className="border border-gray-400 px-1 py-1">{row.vidInstruktazha}</td>
                  <td className="border border-gray-400 px-1 py-1">{row.rukovoditel}</td>
                  <td className="border border-gray-400 px-1 py-1 text-center text-gray-400 italic text-[9px]">
                    {row.podpisInstr || "/ /"}
                  </td>
                  <td className="border border-gray-400 px-1 py-1 text-gray-500">{row.primechanie}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="border border-gray-400 px-4 py-8 text-center text-gray-400">
                    Нет записей за выбранный период
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Подписи */}
          <div className="mt-8 grid grid-cols-2 gap-x-12 text-xs">
            <div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-gray-600 whitespace-nowrap">Ответственный за инструктаж:</span>
                <span className="border-b border-gray-400 flex-1 min-w-[80px]"></span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-gray-600">Подпись:</span>
                <span className="border-b border-gray-400 w-40"></span>
                <span className="text-gray-500">«___» __________ {new Date().getFullYear()} г.</span>
              </div>
            </div>
            <div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-gray-600 whitespace-nowrap">Руководитель организации:</span>
                <span className="border-b border-gray-400 flex-1 min-w-[80px]">{company.direktor}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-gray-600">Подпись:</span>
                <span className="border-b border-gray-400 w-40"></span>
                <span className="text-gray-500">М.П.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TbPrintView;