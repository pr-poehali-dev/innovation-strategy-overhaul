import { useState } from "react";
import NavBar from "@/components/NavBar";
import { useAppStore, Employee } from "@/store/appStore";
import { INITIAL_EMPLOYEES } from "@/store/initialData";
import {
  TabType,
  ITR_DOLZHNOSTI,
  ITR_DOLZHNOSTI_SET,
  emptyEmployee,
  VOD_COLUMNS,
  COND_COLUMNS,
  ITR_COLUMNS,
} from "./kadry/types";
import { KadryTopBar, KadryTabs } from "./kadry/KadryHeader";
import KadryExpiries, { buildExpiries } from "./kadry/KadryExpiries";
import KadryTable from "./kadry/KadryTable";

const Kadry = () => {
  const { employees, setEmployees } = useAppStore();
  const [tab, setTab] = useState<TabType>("voditely");
  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);

  const voditely   = employees.filter((e) => e.kadryTab ? e.kadryTab === "voditely"   : e.dolzhnost === "Водитель");
  const konduktery = employees.filter((e) => e.kadryTab ? e.kadryTab === "konduktery" : e.dolzhnost === "Кондуктор");
  const itr        = employees.filter((e) => e.kadryTab ? e.kadryTab === "itr"        : ITR_DOLZHNOSTI_SET.has(e.dolzhnost));

  const rows    = tab === "voditely" ? voditely : tab === "konduktery" ? konduktery : itr;
  const columns = tab === "voditely" ? VOD_COLUMNS : tab === "konduktery" ? COND_COLUMNS : ITR_COLUMNS;

  const updateCell = (id: number, col: keyof Employee, value: string) => {
    setEmployees((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const updated: Employee = { ...r, [col]: value };
      // При смене должности перемещаем сотрудника в соответствующий таб
      if (col === "dolzhnost") {
        if (value === "Водитель") updated.kadryTab = "voditely";
        else if (value === "Кондуктор") updated.kadryTab = "konduktery";
        else if (ITR_DOLZHNOSTI_SET.has(value)) updated.kadryTab = "itr";
      }
      return updated;
    }));
  };

  const addRow = () => {
    const dolzhnost = tab === "voditely" ? "Водитель" : tab === "konduktery" ? "Кондуктор" : ITR_DOLZHNOSTI[0];
    setEmployees((prev) => [...prev, emptyEmployee(dolzhnost, tab)]);
  };

  // Добавляет сотрудников из начального справочника (INITIAL_EMPLOYEES),
  // которых сейчас нет в списке (матчинг по ФИО). Существующие записи не
  // затрагиваются — у них останутся пользовательские правки.
  const restoreInitial = () => {
    setEmployees((prev) => {
      const existingFios = new Set(prev.map((e) => (e.fio || "").trim()).filter(Boolean));
      const toAdd = INITIAL_EMPLOYEES.filter((e) => e.fio && !existingFios.has(e.fio.trim()))
        .map((e): Employee => {
          const kadryTab: TabType = e.dolzhnost === "Водитель"
            ? "voditely"
            : e.dolzhnost === "Кондуктор"
              ? "konduktery"
              : "itr";
          return { ...e, kadryTab };
        });
      if (toAdd.length === 0) {
         
        alert("Все сотрудники из начального справочника уже есть в списке.");
        return prev;
      }
       
      alert(`Добавлено сотрудников: ${toAdd.length}`);
      return [...prev, ...toAdd];
    });
  };

  const deleteRow = (id: number) => {
    if (rows.length === 1) return;
    setEmployees((prev) => prev.filter((r) => r.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      const editableCols = columns.filter((c) => c.key !== "status");
      if (colIdx + 1 < editableCols.length) {
        setActiveCell({ rowId: rows[rowIdx].id, col: editableCols[colIdx + 1].key });
      } else if (rowIdx + 1 < rows.length) {
        setActiveCell({ rowId: rows[rowIdx + 1].id, col: editableCols[0].key });
      }
    }
  };

  const activeCount = rows.filter((r) => r.status === "active").length;

  const TABS: { key: TabType; label: string; icon: string; count: number }[] = [
    { key: "voditely",   label: "Водители",   icon: "Steering", count: voditely.filter((r) => r.status === "active").length },
    { key: "konduktery", label: "Кондукторы", icon: "Ticket",   count: konduktery.filter((r) => r.status === "active").length },
    { key: "itr",        label: "ИТР",        icon: "HardHat",  count: itr.filter((r) => r.status === "active").length },
  ];

  const expiries = buildExpiries(employees);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Кадры" />

      <div className="px-4 py-5 max-w-5xl mx-auto">
        <div className="bg-white border border-gray-300 shadow-sm">
          <KadryTopBar addRow={addRow} onRestoreInitial={restoreInitial} total={employees.length} />

          <KadryExpiries expiries={expiries} setTab={setTab} />

          <KadryTabs tab={tab} setTab={setTab} tabs={TABS} />

          <KadryTable
            tab={tab}
            rows={rows}
            columns={columns}
            activeCell={activeCell}
            setActiveCell={setActiveCell}
            updateCell={updateCell}
            deleteRow={deleteRow}
            handleKeyDown={handleKeyDown}
            activeCount={activeCount}
          />
        </div>
      </div>
    </div>
  );
};

export default Kadry;