import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useProdazhiLogic } from "./prodazhi/useProdazhiLogic";
import ProdazhiTable from "./prodazhi/ProdazhiTable";

const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

const Prodazhi = () => {
  const {
    selectedKey, naryadRows,
    rows, dispFio, setDispFio,
    activeCell, setActiveCell,
    driverList, condList, vehicles, allGrafiki,
    handleDateChange,
    updateCell, addRow, deleteRow, handleKeyDown,
    getSum, vsegoVyshlo, vsegoVykhod,
  } = useProdazhiLogic();

  const vodFioList  = "vod-fio-list";
  const condFioList = "cond-fio-list";
  const bortList    = "bort-list";
  const grafikList  = "prodazhi-grafik-list";

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Продажи" />

      {/* datalists */}
      <datalist id={vodFioList}>
        <option value="без" />
        {driverList.map((e) => <option key={e.id} value={e.fio} />)}
      </datalist>
      <datalist id={condFioList}>
        <option value="без" />
        {condList.map((e) => <option key={e.id} value={e.fio} />)}
      </datalist>
      <datalist id={bortList}>
        {vehicles.map((v) => <option key={v.id} value={v.bortovoy}>{v.bortovoy} {v.marka}</option>)}
      </datalist>
      <datalist id={grafikList}>
        <option value="вых" />
        <option value="отп" />
        <option value="рем" />
        {allGrafiki.map((g) => <option key={g} value={g} />)}
      </datalist>

      <div className="px-4 py-4 max-w-[1200px] mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm">

          {/* Шапка */}
          <div className="border-b border-gray-300 px-5 py-3 flex items-center justify-between print:hidden">
            <div>
              <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Продажи / Выходы на линию</h1>
              <p className="text-xs text-gray-500 mt-0.5">ООО «Дальавтотранс» · {today}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={addRow} className="flex items-center gap-1.5 px-2 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                <Icon name="Plus" size={12} /> Строка
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-1.5 px-2 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                <Icon name="Printer" size={12} /> Печать
              </button>
            </div>
          </div>

          {/* Дата отчёта */}
          <div className="px-5 py-2 border-b border-gray-200 flex items-center gap-4 text-xs text-gray-600">
            <span className="font-semibold">Дата:</span>
            <input
              type="date"
              value={selectedKey}
              onChange={(e) => handleDateChange(e.target.value)}
              className="border border-gray-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-400"
            />
            {naryadRows.length > 0 && (
              <span className="text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded flex items-center gap-1">
                <Icon name="RefreshCw" size={10} />
                Синхронизировано из наряда ({naryadRows.length} ТС)
              </span>
            )}
          </div>

          {/* Таблица */}
          <ProdazhiTable
            rows={rows}
            activeCell={activeCell}
            onUpdateCell={updateCell}
            onDeleteRow={deleteRow}
            onSetActiveCell={setActiveCell}
            onKeyDown={handleKeyDown}
            getSum={getSum}
            vodFioList={vodFioList}
            condFioList={condFioList}
            bortList={bortList}
            grafikList={grafikList}
          />

          {/* Подвал */}
          <div className="border-t border-gray-300 px-5 py-3 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4 text-gray-600">
              <span>Вышло на линию: <b className="text-gray-800">{vsegoVyshlo}</b></span>
              <span>Вых/Отп/Рем: <b className="text-gray-800">{vsegoVykhod}</b></span>
              <span className="text-gray-400 print:hidden">Tab / Enter — переход</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-semibold">Диспетчер:</span>
              <input
                type="text"
                list={vodFioList}
                value={dispFio}
                onChange={(e) => setDispFio(e.target.value)}
                placeholder="ФИО диспетчера"
                className="border border-gray-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-400 w-40"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prodazhi;
