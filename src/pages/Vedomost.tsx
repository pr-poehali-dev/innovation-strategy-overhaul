import NavBar from "@/components/NavBar";
import VedomostHeader from "./vedomost/VedomostHeader";
import VedomostTable from "./vedomost/VedomostTable";
import { useVedomostLogic } from "./vedomost/useVedomostLogic";

// Ре-экспорты для обратной совместимости (используются в src/pages/kassa/useKassaLogic.ts)
export {
  LS_VEDOMOST,
  loadVedomostRows,
  NACH_KEYS_VED,
  UDERZH_KEYS_VED,
  calcVedomostRow,
} from "./vedomost/types";
export type { VedomostRow } from "./vedomost/types";

const Vedomost = () => {
  const {
    rows,
    activeCell,
    setActiveCell,
    monthKey,
    setMonthKey,
    syncFromKadryAndKassa,
    updateCell,
    addRow,
    deleteRow,
    handleKeyDown,
    totals,
  } = useVedomostLogic();

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Ведомость" />

      <div className="px-4 py-5 max-w-full mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm">

          {/* Шапка */}
          <VedomostHeader
            monthKey={monthKey}
            setMonthKey={setMonthKey}
            syncFromKadryAndKassa={syncFromKadryAndKassa}
            addRow={addRow}
          />

          {/* Таблица */}
          <VedomostTable
            rows={rows}
            activeCell={activeCell}
            setActiveCell={setActiveCell}
            updateCell={updateCell}
            deleteRow={deleteRow}
            handleKeyDown={handleKeyDown}
            totals={totals}
          />

          <div className="border-t border-gray-300 px-6 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-400">
            <span>Строк: {rows.length}</span>
            <span>Tab / Enter — переход между ячейками</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vedomost;
