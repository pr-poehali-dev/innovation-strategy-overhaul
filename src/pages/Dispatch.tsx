import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useAppStore, NaryadEntry } from "@/store/appStore";
import { NaryadRow, NormaSettings, emptyRow, DEFAULT_SETTINGS, calcPodrabotka } from "./dispatch/types";
import NormaPanel from "./dispatch/NormaPanel";
import PutevoyModal from "./dispatch/PutevoyModal";
import NaryadTable from "./dispatch/NaryadTable";

const Dispatch = () => {
  const today = new Date().toLocaleDateString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  const { setNaryadEntries } = useAppStore();

  const [rows, setRows] = useState<NaryadRow[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);
  const [settings, setSettings] = useState<NormaSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [putevoyRow, setPutevoyRow] = useState<NaryadRow | null>(null);

  const buildEntries = useCallback((currentRows: NaryadRow[], currentSettings: NormaSettings): NaryadEntry[] =>
    currentRows.map((r) => {
      const calc = calcPodrabotka(r, currentSettings);
      return {
        date:           today,
        bortovoy:       r.bortovoy,
        gos:            r.gos,
        marka:          r.marka,
        garazhny:       r.garazhny,
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

  // Автоматическое разнесение при любом изменении наряда
  useEffect(() => {
    setNaryadEntries(buildEntries(rows, settings));
  }, [rows, settings, buildEntries, setNaryadEntries]);

  const updateCell = (id: number, col: keyof NaryadRow, value: string | boolean) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [col]: value } : r)));
  };

  const updateRow = (id: number, partial: Partial<NaryadRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...partial } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const deleteRow = (id: number) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const setSetting = (key: keyof NormaSettings, val: string) =>
    setSettings((prev) => ({ ...prev, [key]: val }));

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