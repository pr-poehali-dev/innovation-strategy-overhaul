import NavBar from "@/components/NavBar";
import PutevoyModal from "./dispatch/PutevoyModal";
import DispatchHeader from "./dispatch/DispatchHeader";
import DispatchTabContent from "./dispatch/DispatchTabContent";
import { useDispatchLogic } from "./dispatch/useDispatchLogic";

const Dispatch = () => {
  const {
    weeklyNaryady,
    settings,
    currentRows,
    dayMeta,
    selectedDate,
    displayDate,
    monthYear,
    weekDays,
    todayKey,
    selectedKey,
    activeTab,
    activeCell,
    showSettings,
    putevoyRow,
    setSelectedKey,
    setWeekMonday,
    setActiveTab,
    setActiveCell,
    setShowSettings,
    setPutevoyRow,
    updateDayMeta,
    updateCell,
    updateRow,
    addRow,
    resetToRoutes,
    deleteRow,
    toggleDtp,
    setSetting,
    copyFromDay,
    prevWeek,
    nextWeek,
  } = useDispatchLogic();

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Наряд на работу" />

      {putevoyRow && (
        <PutevoyModal
          row={putevoyRow}
          today={displayDate}
          dayMeta={dayMeta}
          onClose={() => setPutevoyRow(null)}
          onSaveOdometr={(vyezd, vozv) => {
            updateRow(putevoyRow.id, { odometrVyezd: vyezd, odometrVozv: vozv });
          }}
        />
      )}

      <div className="px-4 py-4 max-w-[1920px] mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm mb-4">

          <DispatchHeader
            displayDate={displayDate}
            selectedDate={selectedDate}
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            resetToRoutes={resetToRoutes}
            addRow={addRow}
            weekDays={weekDays}
            selectedKey={selectedKey}
            todayKey={todayKey}
            weeklyNaryady={weeklyNaryady}
            setSelectedKey={setSelectedKey}
            prevWeek={prevWeek}
            nextWeek={nextWeek}
            setWeekMonday={setWeekMonday}
            copyFromDay={copyFromDay}
            dayMeta={dayMeta}
            updateDayMeta={updateDayMeta}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <DispatchTabContent
            activeTab={activeTab}
            showSettings={showSettings}
            settings={settings}
            setSetting={setSetting}
            currentRows={currentRows}
            activeCell={activeCell}
            updateCell={updateCell}
            updateRow={updateRow}
            addRow={addRow}
            deleteRow={deleteRow}
            setActiveCell={setActiveCell}
            setPutevoyRow={setPutevoyRow}
            toggleDtp={toggleDtp}
            dayMeta={dayMeta}
            displayDate={displayDate}
            monthYear={monthYear}
          />

        </div>
      </div>
    </div>
  );
};

export default Dispatch;
