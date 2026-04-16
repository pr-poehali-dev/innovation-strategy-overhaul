import { useEffect, useCallback, useState } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useAppStore, NaryadEntry, NaryadRowStore } from "@/store/appStore";
import { NaryadRow, NormaSettings, emptyRow, calcPodrabotka } from "./dispatch/types";
import NormaPanel from "./dispatch/NormaPanel";
import PutevoyModal from "./dispatch/PutevoyModal";
import NaryadTable from "./dispatch/NaryadTable";

// Совместимость: NaryadRowStore === NaryadRow по структуре, приводим типы
const toNaryadRow = (r: NaryadRowStore): NaryadRow => r as unknown as NaryadRow;
const toStoreRow  = (r: NaryadRow): NaryadRowStore => r as unknown as NaryadRowStore;

const Dispatch = () => {
  const today = new Date().toLocaleDateString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  const {
    setNaryadEntries,
    naryadRows, setNaryadRows,
    naryadSettings, setNaryadSettings,
  } = useAppStore();

  // Адаптеры — приводим хранимый тип к локальному
  const rows: NaryadRow[] = naryadRows.map(toNaryadRow);
  const settings: NormaSettings = naryadSettings;

  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [putevoyRow, setPutevoyRow] = useState<NaryadRow | null>(null);

  const buildEntries = useCallback((currentRows: NaryadRow[], s: NormaSettings): NaryadEntry[] =>
    currentRows.map((r) => {
      const calc = calcPodrabotka(r, s);
      return {
        date:           today,
        bortovoy:       r.bortovoy,
        gos:            r.gos,
        marka:          r.marka,
        marshrut:       r.marshrut,
        fioVod:         r.fio,
        fioKond:        r.fioKond,
        putevoy:        r.putevoy,
        biletov:        r.biletov,
        terminal:       r.terminal,
        podrabotkaVod:  calc?.vod  ?? 0,
        podrabotkaKond: calc?.cond ?? 0,
      };
    }), [today]);

  useEffect(() => {
    setNaryadEntries(buildEntries(rows, settings));
  }, [naryadRows, naryadSettings]); // eslint-disable-line

  const updateCell = (id: number, col: keyof NaryadRow, value: string | boolean) => {
    setNaryadRows((prev) => prev.map((r) => (r.id === id ? { ...r, [col]: value } : r)));
  };

  const updateRow = (id: number, partial: Partial<NaryadRow>) => {
    setNaryadRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...partial } : r)));
  };

  const addRow = () => setNaryadRows((prev) => [...prev, toStoreRow(emptyRow())]);

  const deleteRow = (id: number) => {
    if (naryadRows.length === 1) return;
    setNaryadRows((prev) => prev.filter((r) => r.id !== id));
  };

  const setSetting = (key: keyof NormaSettings, val: string) =>
    setNaryadSettings((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Наряд на работу" />

      {putevoyRow && (
        <PutevoyModal
          row={putevoyRow}
          today={today}
          onClose={() => setPutevoyRow(null)}
        />
      )}

      <div className="px-6 py-6 max-w-7xl mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm mb-4">

          <div className="border-b border-gray-300 px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Наряд на работу</h1>
              <p className="text-sm text-gray-500 mt-0.5">Дальавтотранс · {today}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${
                  showSettings ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Icon name="Settings" size={14} />
                Нормативы
              </button>
              <button
                onClick={addRow}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Icon name="Plus" size={14} />
                Добавить строку
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Icon name="Printer" size={14} />
                Печать наряда
              </button>
            </div>
          </div>

          {showSettings && (
            <NormaPanel settings={settings} onSetSetting={setSetting} />
          )}

          <NaryadTable
            rows={rows}
            activeCell={activeCell}
            settings={settings}
            onUpdateCell={updateCell}
            onUpdateRow={updateRow}
            onAddRow={addRow}
            onDeleteRow={deleteRow}
            onSetActiveCell={setActiveCell}
            onOpenPutevoy={setPutevoyRow}
          />

        </div>
      </div>
    </div>
  );
};

export default Dispatch;