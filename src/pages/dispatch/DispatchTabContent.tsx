import { DayMeta } from "@/store/appStore";
import { NaryadRow, NormaSettings } from "./types";
import { TabType } from "./dispatchUtils";
import NormaPanel from "./NormaPanel";
import NaryadTable from "./NaryadTable";
import JurnalMed from "./JurnalMed";
import JurnalVypusk from "./JurnalVypusk";
import JurnalDisp from "./JurnalDisp";
import JurnalPostSmen from "./JurnalPostSmen";

interface Props {
  activeTab: TabType;
  showSettings: boolean;
  settings: NormaSettings;
  setSetting: (key: keyof NormaSettings, val: string) => void;
  currentRows: NaryadRow[];
  activeCell: { rowId: number; col: string } | null;
  updateCell: (id: number, col: keyof NaryadRow, value: string | boolean) => void;
  updateRow: (id: number, partial: Partial<NaryadRow>) => void;
  addRow: () => void;
  deleteRow: (id: number) => void;
  setActiveCell: (c: { rowId: number; col: string } | null) => void;
  setPutevoyRow: (r: NaryadRow | null) => void;
  toggleDtp: (row: NaryadRow) => void;
  dayMeta: DayMeta;
  displayDate: string;
  monthYear: string;
}

const DispatchTabContent = ({
  activeTab,
  showSettings,
  settings, setSetting,
  currentRows, activeCell,
  updateCell, updateRow, addRow, deleteRow,
  setActiveCell, setPutevoyRow, toggleDtp,
  dayMeta, displayDate, monthYear,
}: Props) => (
  <>
    {showSettings && activeTab === "narad" && (
      <NormaPanel settings={settings} onSetSetting={setSetting} />
    )}

    {/* ── Контент вкладок ── */}
    {activeTab === "narad" && (
      <NaryadTable
        rows={currentRows}
        activeCell={activeCell}
        settings={settings}
        onUpdateCell={updateCell}
        onUpdateRow={updateRow}
        onAddRow={addRow}
        onDeleteRow={deleteRow}
        onSetActiveCell={setActiveCell}
        onOpenPutevoy={setPutevoyRow}
        onToggleDtp={toggleDtp}
      />
    )}

    {activeTab === "med" && (
      <JurnalMed
        rows={currentRows}
        dayMeta={dayMeta}
        displayDate={displayDate}
        monthYear={monthYear}
      />
    )}

    {activeTab === "postSmen" && (
      <JurnalPostSmen
        rows={currentRows}
        dayMeta={dayMeta}
        displayDate={displayDate}
        monthYear={monthYear}
      />
    )}

    {activeTab === "vypusk" && (
      <JurnalVypusk
        rows={currentRows}
        dayMeta={dayMeta}
        displayDate={displayDate}
        monthYear={monthYear}
      />
    )}

    {activeTab === "disp" && (
      <JurnalDisp
        rows={currentRows}
        dayMeta={dayMeta}
        displayDate={displayDate}
        monthYear={monthYear}
      />
    )}
  </>
);

export default DispatchTabContent;
