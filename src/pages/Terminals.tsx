import { useState } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useAppStore, Terminal } from "@/store/appStore";

const emptyTerminal = (companyIdx = 0): Terminal => ({
  id: Date.now() + Math.random(),
  nomer: "",
  serial: "",
  model: "",
  companyIdx,
  status: "active",
  primechanie: "",
});

const COLS: { key: keyof Omit<Terminal, "id" | "companyIdx" | "status">; label: string; width: string }[] = [
  { key: "nomer",       label: "№ / Название",   width: "120px" },
  { key: "model",       label: "Модель",          width: "150px" },
  { key: "serial",      label: "Серийный №",      width: "160px" },
  { key: "primechanie", label: "Примечание",      width: "200px" },
];

const Terminals = () => {
  const { terminals, setTerminals, companies, setCompanies } = useAppStore();
  const [activeCompIdx, setActiveCompIdx] = useState(0);
  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);
  const [newCompName, setNewCompName] = useState("");
  const [showAddComp, setShowAddComp] = useState(false);

  const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

  const compTerminals = terminals.filter((t) => t.companyIdx === activeCompIdx);

  const addTerminal = () =>
    setTerminals((prev) => [...prev, emptyTerminal(activeCompIdx)]);

  const deleteTerminal = (id: number) =>
    setTerminals((prev) => prev.filter((t) => t.id !== id));

  const updateTerminal = (id: number, col: keyof Terminal, val: string) =>
    setTerminals((prev) => prev.map((t) => (t.id === id ? { ...t, [col]: val } : t)));

  const toggleStatus = (id: number) =>
    setTerminals((prev) =>
      prev.map((t) => t.id === id ? { ...t, status: t.status === "active" ? "inactive" : "active" } : t)
    );

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    if (e.key !== "Tab" && e.key !== "Enter") return;
    e.preventDefault();
    if (colIdx + 1 < COLS.length) {
      setActiveCell({ rowId: compTerminals[rowIdx].id, col: COLS[colIdx + 1].key });
    } else if (rowIdx + 1 < compTerminals.length) {
      setActiveCell({ rowId: compTerminals[rowIdx + 1].id, col: COLS[0].key });
    }
  };

  const addCompany = () => {
    const name = newCompName.trim();
    if (!name) return;
    setCompanies((prev) => [...prev, { nazvanie: name, inn: "", direktor: "", telefon: "", adres: "" }]);
    setNewCompName("");
    setShowAddComp(false);
    setActiveCompIdx(companies.length);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Терминалы" />

      <div className="px-4 py-5 max-w-5xl mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm">

          {/* Шапка */}
          <div className="border-b border-gray-300 px-5 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Терминалы</h1>
              <p className="text-xs text-gray-500 mt-0.5">Дальавтотранс · {today} · Всего: {terminals.length}</p>
            </div>
            <button
              onClick={addTerminal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <Icon name="Plus" size={14} />
              Добавить терминал
            </button>
          </div>

          {/* Вкладки организаций */}
          <div className="flex items-center gap-0 border-b border-gray-300 overflow-x-auto">
            {companies.map((c, i) => (
              <button
                key={i}
                onClick={() => setActiveCompIdx(i)}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
                  activeCompIdx === i
                    ? "border-blue-600 text-blue-700 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <Icon name="Building2" size={12} />
                {c.nazvanie}
                <span className="ml-1 text-xs bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5">
                  {terminals.filter((t) => t.companyIdx === i).length}
                </span>
              </button>
            ))}
            {/* Добавить организацию */}
            {showAddComp ? (
              <div className="flex items-center gap-1.5 px-3 py-2 flex-shrink-0">
                <input
                  autoFocus
                  type="text"
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addCompany(); if (e.key === "Escape") setShowAddComp(false); }}
                  placeholder='ООО "Название"'
                  className="px-2 py-1 text-xs border border-blue-400 rounded focus:outline-none w-44"
                />
                <button onClick={addCompany} className="text-green-600 hover:text-green-800">
                  <Icon name="Check" size={14} />
                </button>
                <button onClick={() => setShowAddComp(false)} className="text-gray-400 hover:text-gray-700">
                  <Icon name="X" size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddComp(true)}
                className="px-3 py-2.5 text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1 flex-shrink-0"
              >
                <Icon name="Plus" size={12} />
                Добавить организацию
              </button>
            )}
          </div>

          {/* Таблица терминалов */}
          <div className="overflow-x-auto">
            <table className="border-collapse text-xs" style={{ minWidth: "700px" }}>
              <thead>
                <tr style={{ backgroundColor: "#1a3a6b" }}>
                  <th className="border border-blue-900 px-1 py-1.5 text-white text-center" style={{ width: "28px" }}>№</th>
                  {COLS.map((col) => (
                    <th key={col.key} className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-left"
                      style={{ width: col.width, minWidth: col.width }}>
                      {col.label}
                    </th>
                  ))}
                  <th className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-center" style={{ width: "80px" }}>Статус</th>
                  <th className="border border-blue-900 px-1 py-1.5" style={{ width: "28px" }}></th>
                </tr>
              </thead>
              <tbody>
                {compTerminals.length === 0 ? (
                  <tr>
                    <td colSpan={COLS.length + 3} className="border border-gray-300 px-4 py-8 text-center text-gray-400 text-sm">
                      Терминалы не добавлены. Нажмите «Добавить терминал».
                    </td>
                  </tr>
                ) : (
                  compTerminals.map((t, rowIdx) => (
                    <tr key={t.id} className={rowIdx % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                      <td className="border border-gray-300 text-center text-gray-400 select-none" style={{ width: "28px" }}>
                        {rowIdx + 1}
                      </td>
                      {COLS.map((col, colIdx) => {
                        const isActive = activeCell?.rowId === t.id && activeCell?.col === col.key;
                        return (
                          <td key={col.key} className="border border-gray-300 p-0" style={{ width: col.width }}>
                            <input
                              type="text"
                              value={t[col.key] as string}
                              onChange={(e) => updateTerminal(t.id, col.key, e.target.value)}
                              onFocus={() => setActiveCell({ rowId: t.id, col: col.key })}
                              onBlur={() => setActiveCell(null)}
                              onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                              autoFocus={isActive}
                              className={`w-full h-7 px-2 text-gray-800 bg-transparent outline-none border-2 ${
                                isActive ? "border-blue-500 bg-blue-50" : "border-transparent"
                              } transition-colors`}
                              placeholder="—"
                            />
                          </td>
                        );
                      })}
                      <td className="border border-gray-300 text-center" style={{ width: "80px" }}>
                        <button
                          onClick={() => toggleStatus(t.id)}
                          className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                            t.status === "active"
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {t.status === "active" ? "Активен" : "Неактивен"}
                        </button>
                      </td>
                      <td className="border border-gray-300 text-center" style={{ width: "28px" }}>
                        <button onClick={() => deleteTerminal(t.id)} className="text-gray-300 hover:text-red-500 p-0.5">
                          <Icon name="X" size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-300 px-5 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-400">
            <span>Терминалов в организации: {compTerminals.length} · Активных: {compTerminals.filter((t) => t.status === "active").length}</span>
            <span>Tab / Enter — переход между ячейками</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminals;
