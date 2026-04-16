import Icon from "@/components/ui/icon";
import { CompanySettings } from "@/store/appStore";
import { TbEntry, INSTRUKTAZHI, toMonthYear } from "./tbShared";

interface Props {
  entries: TbEntry[];
  activeCell: { idx: number; field: string } | null;
  globalVid: string;
  monthKey: string;
  company: CompanySettings;
  empList: Array<{ id: number; fio: string; dolzhnost: string; tabNum: string }>;
  onUpdateEntry: (idx: number, field: keyof TbEntry, value: string) => void;
  onAddEntry: () => void;
  onDeleteEntry: (idx: number) => void;
  onSetActiveCell: (cell: { idx: number; field: string } | null) => void;
  onApplyGlobalVid: (vid: string) => void;
  monthEntries: TbEntry[];
}

const TbJournal = ({
  entries,
  activeCell,
  globalVid,
  monthKey,
  company,
  empList,
  onUpdateEntry,
  onAddEntry,
  onDeleteEntry,
  onSetActiveCell,
  onApplyGlobalVid,
  monthEntries,
}: Props) => {
  const cellCls = (idx: number, field: string) =>
    `w-full h-6 px-1 text-xs bg-transparent outline-none border-2 transition-colors ${
      activeCell?.idx === idx && activeCell?.field === field
        ? "border-blue-500 bg-blue-50"
        : "border-transparent"
    }`;

  return (
    <div>
      {/* Глобальный вид инструктажа */}
      <div className="px-5 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-3 text-xs">
        <Icon name="ClipboardList" size={13} className="text-amber-600 flex-shrink-0" />
        <span className="text-amber-800 font-semibold whitespace-nowrap">Вид инструктажа для всех:</span>
        <select
          value={globalVid}
          onChange={(e) => onApplyGlobalVid(e.target.value)}
          className="border border-amber-300 rounded px-2 py-0.5 text-xs bg-white focus:outline-none focus:border-blue-400 text-gray-800 flex-shrink-0"
        >
          {INSTRUKTAZHI.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <span className="text-amber-600 text-xs">← изменит вид инструктажа у всех записей</span>
      </div>

      {/* Подсказка */}
      <div className="px-5 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2 text-xs text-blue-700">
        <Icon name="Info" size={13} />
        Форма по ГОСТ 12.0.004-2015 · Записи сохраняются автоматически ·
        <span className="font-semibold">Кнопка «Из наряда»</span> — автозаполнение из данных наряда за выбранный месяц
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse text-xs w-full" style={{ minWidth: "1000px" }}>
          <thead>
            <tr style={{ backgroundColor: "#1a3a6b" }}>
              {[
                { label: "№",               w: "32px"  },
                { label: "Дата",            w: "110px" },
                { label: "ФИО",             w: "200px" },
                { label: "Должность",       w: "110px" },
                { label: "Таб. №",          w: "70px"  },
                { label: "Вид инструктажа", w: "200px" },
                { label: "Кто проводил",    w: "180px" },
                { label: "Подпись",         w: "80px"  },
                { label: "Примечание",      w: "140px" },
                { label: "",                w: "28px"  },
              ].map((h) => (
                <th key={h.label} className="border border-blue-900 px-1 py-1.5 text-white font-semibold text-center leading-tight" style={{ width: h.w }}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => {
              const rowBg = idx % 2 === 0 ? "#fff" : "#eff6ff";
              return (
                <tr key={idx} style={{ backgroundColor: rowBg }}>
                  {/* № */}
                  <td className="border border-gray-300 text-center text-gray-400 text-xs">{idx + 1}</td>

                  {/* Дата */}
                  <td className="border border-gray-300 p-0">
                    <input
                      type="date"
                      value={entry.dateKey}
                      onChange={(e) => onUpdateEntry(idx, "dateKey", e.target.value)}
                      onFocus={() => onSetActiveCell({ idx, field: "dateKey" })}
                      onBlur={() => onSetActiveCell(null)}
                      className={cellCls(idx, "dateKey") + " text-center"}
                    />
                  </td>

                  {/* ФИО */}
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      list="tb-fio-list"
                      value={entry.fio}
                      onChange={(e) => {
                        onUpdateEntry(idx, "fio", e.target.value);
                        const emp = empList.find((em) => em.fio === e.target.value);
                        if (emp) {
                          onUpdateEntry(idx, "dolzhnost", emp.dolzhnost);
                          onUpdateEntry(idx, "tabNum", emp.tabNum);
                        }
                      }}
                      onFocus={() => onSetActiveCell({ idx, field: "fio" })}
                      onBlur={() => onSetActiveCell(null)}
                      className={cellCls(idx, "fio")}
                      placeholder="ФИО сотрудника"
                    />
                  </td>

                  {/* Должность */}
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={entry.dolzhnost}
                      onChange={(e) => onUpdateEntry(idx, "dolzhnost", e.target.value)}
                      onFocus={() => onSetActiveCell({ idx, field: "dolzhnost" })}
                      onBlur={() => onSetActiveCell(null)}
                      className={cellCls(idx, "dolzhnost")}
                    />
                  </td>

                  {/* Таб. № */}
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={entry.tabNum}
                      onChange={(e) => onUpdateEntry(idx, "tabNum", e.target.value)}
                      onFocus={() => onSetActiveCell({ idx, field: "tabNum" })}
                      onBlur={() => onSetActiveCell(null)}
                      className={cellCls(idx, "tabNum") + " text-center"}
                    />
                  </td>

                  {/* Вид инструктажа */}
                  <td className="border border-gray-300 p-0">
                    <select
                      value={entry.vidInstruktazha}
                      onChange={(e) => onUpdateEntry(idx, "vidInstruktazha", e.target.value)}
                      onFocus={() => onSetActiveCell({ idx, field: "vidInstruktazha" })}
                      onBlur={() => onSetActiveCell(null)}
                      className="w-full h-6 px-1 text-xs bg-transparent outline-none border-2 border-transparent focus:border-blue-500 focus:bg-blue-50"
                    >
                      {INSTRUKTAZHI.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </td>

                  {/* Кто проводил */}
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      list="tb-ruk-list"
                      value={entry.rukovoditel}
                      onChange={(e) => onUpdateEntry(idx, "rukovoditel", e.target.value)}
                      onFocus={() => onSetActiveCell({ idx, field: "rukovoditel" })}
                      onBlur={() => onSetActiveCell(null)}
                      className={cellCls(idx, "rukovoditel")}
                      placeholder={company.direktor || "ФИО"}
                    />
                  </td>

                  {/* Подпись */}
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={entry.podpisInstr}
                      onChange={(e) => onUpdateEntry(idx, "podpisInstr", e.target.value)}
                      onFocus={() => onSetActiveCell({ idx, field: "podpisInstr" })}
                      onBlur={() => onSetActiveCell(null)}
                      className={cellCls(idx, "podpisInstr") + " text-center"}
                      placeholder="/ /"
                    />
                  </td>

                  {/* Примечание */}
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={entry.primechanie}
                      onChange={(e) => onUpdateEntry(idx, "primechanie", e.target.value)}
                      onFocus={() => onSetActiveCell({ idx, field: "primechanie" })}
                      onBlur={() => onSetActiveCell(null)}
                      className={cellCls(idx, "primechanie")}
                    />
                  </td>

                  {/* Удалить */}
                  <td className="border border-gray-300 text-center">
                    <button onClick={() => onDeleteEntry(idx)} className="text-gray-300 hover:text-red-500 p-0.5">
                      <Icon name="X" size={11} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Подвал */}
      <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between">
        <button
          onClick={onAddEntry}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Icon name="Plus" size={12} /> Добавить запись
        </button>
        <div className="text-xs text-gray-500">
          Записей за {toMonthYear(monthKey + "-01")}: <b className="text-gray-800">{monthEntries.length}</b>
        </div>
      </div>

      {/* Datalists */}
      <datalist id="tb-fio-list">
        {empList.map((e) => <option key={e.id} value={e.fio}>{e.fio} · {e.dolzhnost}</option>)}
      </datalist>
      <datalist id="tb-ruk-list">
        {company.direktor && <option value={company.direktor} />}
        {empList.filter((e) => ["Директор", "Механик по выпуску", "Инженер по ОТ"].includes(e.dolzhnost)).map((e) => (
          <option key={e.id} value={e.fio} />
        ))}
      </datalist>
    </div>
  );
};

export default TbJournal;
