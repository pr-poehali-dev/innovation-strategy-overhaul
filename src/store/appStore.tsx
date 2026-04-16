import { createContext, useContext, useState, ReactNode } from "react";

// ─── ТС ────────────────────────────────────────────────────────────────────
export interface TsDoc {
  id: number;
  name: string;        // имя файла
  type: string;        // тип документа: osago, osgop, arenda, lizing, other
  url: string;         // data-URL или object-URL
  expiry?: string;     // срок действия
}

export interface TsVehicle {
  id: number;
  bortovoy: string;
  gos: string;
  marka: string;
  god: string;         // год выпуска
  garazhny: string;
  docs: TsDoc[];
}

// ─── Наряд (shared entry) ──────────────────────────────────────────────────
export interface NaryadEntry {
  date: string;        // дд.мм.гггг
  bortovoy: string;
  gos: string;
  marka: string;
  garazhny: string;
  marshrut: string;
  fioVod: string;
  fioKond: string;
  putevoy: string;
  biletov: string;
  podrabotkaVod: number;
  podrabotkaKond: number;
}

// ─── Context ───────────────────────────────────────────────────────────────
interface AppStore {
  vehicles: TsVehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<TsVehicle[]>>;

  naryadEntries: NaryadEntry[];
  setNaryadEntries: React.Dispatch<React.SetStateAction<NaryadEntry[]>>;
}

const AppContext = createContext<AppStore | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [vehicles, setVehicles] = useState<TsVehicle[]>([]);
  const [naryadEntries, setNaryadEntries] = useState<NaryadEntry[]>([]);

  return (
    <AppContext.Provider value={{ vehicles, setVehicles, naryadEntries, setNaryadEntries }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = (): AppStore => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used inside AppProvider");
  return ctx;
};
