import { createContext, useContext, ReactNode, useEffect } from "react";
import { usePersist } from "./persist";
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