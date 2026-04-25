import { createContext, useContext, ReactNode, useEffect } from "react";
import { usePersist } from "./persist";
import { uid } from "@/lib/uid";
import type {
  TsVehicle,
  NaryadEntry,
  NaryadSettingsStore,
  WeeklyNaryady,
  CompanySettings,
  Terminal,
  Employee,
  Route,
  DtpRecord,
  WeeklyDayMeta,
  RouteSchedule,
  AppStore,
} from "./types";
import {
  INITIAL_VEHICLES,
  INITIAL_COMPANIES,
  INITIAL_TERMINALS,
  INITIAL_EMPLOYEES,
  INITIAL_ROUTES,
  INITIAL_ROUTE_SCHEDULE,
  DEFAULT_NARAD_SETTINGS,
} from "./initialData";

// ─── Реэкспорт типов и констант (обратная совместимость) ───────────────────
export type {
  TsDoc,
  TsVehicle,
  NaryadEntry,
  CompanySettings,
  Terminal,
  Employee,
  Route,
  GrafikSchedule,
  RouteSchedule,
  WeeklyNaryady,
  DayMeta,
  WeeklyDayMeta,
  DtpRecord,
  NaryadRowStore,
  NaryadSettingsStore,
} from "./types";
export { getGrafiki, emptyDayMeta } from "./types";
export {
  INITIAL_COMPANIES,
  INITIAL_ROUTES,
  INITIAL_ROUTE_SCHEDULE,
} from "./initialData";

// ─── Context ───────────────────────────────────────────────────────────────
const AppContext = createContext<AppStore | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [vehicles,        setVehicles]        = usePersist<TsVehicle[]>           ("vehicles",        INITIAL_VEHICLES);
  const [naryadEntries,   setNaryadEntries]   = usePersist<NaryadEntry[]>         ("naryadEntries",   []);
  const [naryadSettings,  setNaryadSettings]  = usePersist<NaryadSettingsStore>   ("naryadSettings",  DEFAULT_NARAD_SETTINGS);
  const [weeklyNaryady,   setWeeklyNaryady]   = usePersist<WeeklyNaryady>         ("weeklyNaryady",   {});
  const [companies,       setCompanies]       = usePersist<CompanySettings[]>     ("companies",       INITIAL_COMPANIES);
  const [activeCompanyIdx,setActiveCompanyIdx]= usePersist<number>                ("activeCompanyIdx",0);
  const [terminals,       setTerminals]       = usePersist<Terminal[]>            ("terminals",       INITIAL_TERMINALS);
  const [employees,       setEmployees]       = usePersist<Employee[]>            ("employees",       INITIAL_EMPLOYEES);
  const [routes,          setRoutes]          = usePersist<Route[]>               ("routes",          INITIAL_ROUTES);
  const [dtpRecords,      setDtpRecords]      = usePersist<DtpRecord[]>           ("dtpRecords",      []);
  const [weeklyDayMeta,   setWeeklyDayMeta]   = usePersist<WeeklyDayMeta>         ("weeklyDayMeta",   {});
  const [routeSchedule,   setRouteSchedule]   = usePersist<RouteSchedule>         ("routeSchedule",   INITIAL_ROUTE_SCHEDULE);

  // ─── Одноразовая починка старых нарядов (последствия бага «дублирование ФИО по столбцу») ─
  // Запускается один раз: чинит дубли id и снимает повторные ФИО водителей/кондукторов в днях,
  // где явно видны следы прошлого бага (≥2 строк с одинаковым непустым ФИО).
  useEffect(() => {
    const FIX_KEY = "__naryad_dup_fix_v1";
    try {
      if (localStorage.getItem(FIX_KEY) === "1") return;
    } catch { /* noop */ }

    setWeeklyNaryady((prev) => {
      let changedAny = false;
      const next: WeeklyNaryady = {};
      for (const [dayKey, rows] of Object.entries(prev)) {
        if (!Array.isArray(rows) || rows.length === 0) {
          next[dayKey] = rows;
          continue;
        }
        // 1) Чиним дубли id
        const seenIds = new Set<number>();
        let dayChanged = false;
        const stage1 = rows.map((r) => {
          if (seenIds.has(r.id)) {
            dayChanged = true;
            return { ...r, id: uid() };
          }
          seenIds.add(r.id);
          return r;
        });
        // 2) Убираем повторы ФИО водителя — оставляем первое, остальные очищаем
        const seenVod = new Set<string>();
        const seenCond = new Set<string>();
        const stage2 = stage1.map((r) => {
          let nr = r;
          if (r.fio && r.fio.trim()) {
            if (seenVod.has(r.fio)) { nr = { ...nr, fio: "" }; dayChanged = true; }
            else seenVod.add(r.fio);
          }
          if (r.fioKond && r.fioKond.trim() && r.fioKond !== "без") {
            if (seenCond.has(r.fioKond)) { nr = { ...nr, fioKond: "" }; dayChanged = true; }
            else seenCond.add(r.fioKond);
          }
          return nr;
        });
        if (dayChanged) changedAny = true;
        next[dayKey] = stage2;
      }
      try { localStorage.setItem(FIX_KEY, "1"); } catch { /* noop */ }
      return changedAny ? next : prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Постоянная синхронизация stoimostProezda ↔ stoimostBileta ─────────────
  // Цена проезда хранится в двух полях (historical reasons): Настройки пишут в
  // stoimostProezda, панель Наряда — в stoimostBileta. Держим их равными всегда.
  useEffect(() => {
    const p = (naryadSettings.stoimostProezda || "").trim();
    const b = (naryadSettings.stoimostBileta  || "").trim();
    if (p === b) return;
    // приоритет у того поля, которое заполнено; если оба — берём stoimostProezda
    const src = p || b;
    setNaryadSettings((prev) => ({ ...prev, stoimostProezda: src, stoimostBileta: src }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naryadSettings.stoimostProezda, naryadSettings.stoimostBileta]);

  return (
    <AppContext.Provider value={{
      vehicles, setVehicles,
      naryadEntries, setNaryadEntries,
      naryadSettings, setNaryadSettings,
      weeklyNaryady, setWeeklyNaryady,
      companies, setCompanies,
      activeCompanyIdx, setActiveCompanyIdx,
      terminals, setTerminals,
      employees, setEmployees,
      routes, setRoutes,
      dtpRecords, setDtpRecords,
      weeklyDayMeta, setWeeklyDayMeta,
      routeSchedule, setRouteSchedule,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = (): AppStore => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used inside AppProvider");
  return ctx;
};