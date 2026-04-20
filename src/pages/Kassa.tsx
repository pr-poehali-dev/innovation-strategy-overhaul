import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useKassaLogic } from "./kassa/useKassaLogic";
import KassaOtchet from "./kassa/KassaOtchet";
import ChastVydacha from "./kassa/ChastVydacha";
import KassaMonthly from "./kassa/KassaMonthly";
import KassaPodrabJournal from "./kassa/KassaPodrabJournal";

const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

const Kassa = () => {
  const {
    tab, setTab,
    selectedKey, monthKey, setMonthKey,
    rows, vyplaty, activeCell, activeVyp,
    chastRows, naryadRows,
    podrabJournal, monthlyRows,
    handleDateChange,
    updateCell, addRow, deleteRow, handleKeyDown,
    setActiveCell,
    updateVyp, addVyp, deleteVyp, handleVypKeyDown,
    setActiveVyp,
    updateChast, updateChastDay, addChastRow,
    syncFromVedomost, syncBeznal,
    toggleVydano,
    dailyFixed, updateDailyFixed,
  } = useKassaLogic();

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Касса" />

      <div className="px-3 py-4 max-w-[1920px] mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm">

          {/* Шапка */}
          <div className="border-b border-gray-300 px-4 py-3 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Касса</h1>
                <p className="text-xs text-gray-500 mt-0.5">ООО «Дальавтотранс» · {today}</p>
              </div>
              {tab !== "monthly" && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
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
                      Из наряда ({naryadRows.length} ТС)
                    </span>
                  )}
                </div>
              )}
            </div>
            {tab !== "monthly" && (
              <div className="flex items-center gap-2">
                {tab === "kassa" && (
                  <>
                    <button onClick={() => addRow("route")}
                      className="flex items-center gap-1.5 px-2 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                      <Icon name="Plus" size={12} /> Строка
                    </button>
                    <button onClick={() => addRow("disp")}
                      className="flex items-center gap-1.5 px-2 py-1.5 text-xs bg-amber-500 text-white rounded hover:bg-amber-600">
                      <Icon name="Plus" size={12} /> Диспетчер
                    </button>
                  </>
                )}
                <button onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                  <Icon name="Printer" size={12} /> Печать
                </button>
              </div>
            )}
          </div>

          {/* Вкладки */}
          <div className="border-b border-gray-300 flex print:hidden">
            {([
              ["kassa",   "Кассовый отчёт",    "Wallet"          ],
              ["chast",   "Частичная выдача",   "UserCheck"       ],
              ["podrab",  "Журнал подработок",  "BadgeDollarSign" ],
              ["monthly", "Отчёт за месяц",     "BarChart3"       ],
            ] as const).map(([key, label, icon]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-5 py-2 text-sm font-medium border-b-2 transition-colors ${
                  tab === key
                    ? "border-blue-600 text-blue-700 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon name={icon as "Wallet"} size={13} />
                {label}
              </button>
            ))}
            {/* Кнопки синхронизации */}
            <div className="ml-auto flex items-center gap-2 px-3">
              {tab === "kassa" && (
                <button
                  onClick={syncBeznal}
                  title="Заполнить Безнал из Продаж (колонка Валид) по текущей дате"
                  className="flex items-center gap-1.5 px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100"
                >
                  <Icon name="ArrowDownToLine" size={12} />
                  Безнал ← Продажи
                </button>
              )}
              {tab === "chast" && (
                <button
                  onClick={syncFromVedomost}
                  title="Заполнить 'Начислено' из Ведомости (Остаток к получению)"
                  className="flex items-center gap-1.5 px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100"
                >
                  <Icon name="ArrowDownToLine" size={12} />
                  Начислено ← Ведомость
                </button>
              )}
              {tab === "monthly" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Месяц:</span>
                  <input
                    type="month"
                    value={monthKey}
                    onChange={(e) => setMonthKey(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-400"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ═══ ВКЛАДКА: Кассовый отчёт ═══ */}
          {tab === "kassa" && (
            <KassaOtchet
              rows={rows}
              vyplaty={vyplaty}
              activeCell={activeCell}
              activeVyp={activeVyp}
              onUpdateCell={updateCell}
              onToggleVydano={toggleVydano}
              onDeleteRow={deleteRow}
              onSetActiveCell={setActiveCell}
              onUpdateVyp={updateVyp}
              onAddVyp={addVyp}
              onDeleteVyp={deleteVyp}
              onSetActiveVyp={setActiveVyp}
              onKeyDown={handleKeyDown}
              onVypKeyDown={handleVypKeyDown}
              rowCount={rows.length}
              vyplatCount={vyplaty.length}
              dailyFixed={dailyFixed}
              onUpdateDailyFixed={updateDailyFixed}
            />
          )}

          {/* ═══ ВКЛАДКА: Частичная выдача ═══ */}
          {tab === "chast" && (
            <ChastVydacha
              chastRows={chastRows}
              onUpdateChast={updateChast}
              onUpdateChastDay={updateChastDay}
              onAddChastRow={addChastRow}
            />
          )}

          {/* ═══ ВКЛАДКА: Журнал выдачи подработок ═══ */}
          {tab === "podrab" && (
            <KassaPodrabJournal
              podrabJournal={podrabJournal}
              monthKey={monthKey}
              onMonthChange={setMonthKey}
            />
          )}

          {/* ═══ ВКЛАДКА: Отчёт за месяц ═══ */}
          {tab === "monthly" && (
            <KassaMonthly
              rows={monthlyRows}
              monthKey={monthKey}
              onPrint={() => window.print()}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default Kassa;