import { createContext, useContext, useState, ReactNode } from "react";

// ─── ТС ────────────────────────────────────────────────────────────────────
export interface TsDoc {
  id: number;
  name: string;
  type: string;        // osago, osgop, arenda, lizing, other
  url: string;
  expiry?: string;
}

export interface TsVehicle {
  id: number;
  bortovoy: string;    // бортовой номер
  gos: string;         // гос. знак
  marka: string;       // марка / модель
  god: string;         // год выпуска
  garazhny: string;    // гаражный №
  sobstvennik: string; // собственник
  vin: string;
  reestr: string;      // реестр РОСАВТОДОРА
  ekKlass: string;     // экологический класс
  docs: TsDoc[];
}

// ─── Наряд (shared entry) ──────────────────────────────────────────────────
export interface NaryadEntry {
  date: string;
  bortovoy: string;
  gos: string;
  marka: string;
  marshrut: string;
  fioVod: string;
  fioKond: string;
  putevoy: string;
  biletov: string;
  terminal: string;
  podrabotkaVod: number;
  podrabotkaKond: number;
}

// ─── Начальные данные ТС ───────────────────────────────────────────────────
const INITIAL_VEHICLES: TsVehicle[] = [
  { id: 1,  bortovoy: "502", gos: "А244МК27",  marka: "DAEWOO BS 106",              god: "2007", garazhny: "502", sobstvennik: "ДАТ", vin: "KL5UM52PD7P025174",  reestr: "АТТ0202852", ekKlass: "4", docs: [] },
  { id: 2,  bortovoy: "504", gos: "А590ТА27",  marka: "HYUNDAI Super Aero City",    god: "2010", garazhny: "504", sobstvennik: "ДАТ", vin: "KMJTA18BPBC007982",  reestr: "АТТ0202860", ekKlass: "4", docs: [] },
  { id: 3,  bortovoy: "505", gos: "А591ТА27",  marka: "HYUNDAI Super Aero City",    god: "2010", garazhny: "505", sobstvennik: "ДАТ", vin: "KMJTA18BPBC007980",  reestr: "АТТ0202861", ekKlass: "4", docs: [] },
  { id: 4,  bortovoy: "506", gos: "А592ТА27",  marka: "HYUNDAI Super Aero City",    god: "2010", garazhny: "506", sobstvennik: "ДАТ", vin: "KMJTA18BPBC007981",  reestr: "АТТ0202859", ekKlass: "4", docs: [] },
  { id: 5,  bortovoy: "508", gos: "А058ТА27",  marka: "DAEWOO BS 106",              god: "2008", garazhny: "508", sobstvennik: "ДАТ", vin: "KL2UR52BD8P017994",  reestr: "АТТ0202855", ekKlass: "4", docs: [] },
  { id: 6,  bortovoy: "509", gos: "А531ОТ27",  marka: "DAEWOO BS 106",              god: "2008", garazhny: "509", sobstvennik: "ДАТ", vin: "KL2UR52BD8P017420",  reestr: "",           ekKlass: "4", docs: [] },
  { id: 7,  bortovoy: "510", gos: "К960ТУ27",  marka: "HYUNDAI Aero City 540",      god: "1999", garazhny: "510", sobstvennik: "ДАТ", vin: "KMJTA18BPXC607364",  reestr: "АТТ0202865", ekKlass: "0", docs: [] },
  { id: 8,  bortovoy: "512", gos: "А803ХР27",  marka: "DAEWOO BS 106",              god: "2009", garazhny: "512", sobstvennik: "ДАТ", vin: "KL5UM52JD9P023380",  reestr: "АТТ0202857", ekKlass: "4", docs: [] },
  { id: 9,  bortovoy: "514", gos: "В509НХ125", marka: "HYUNDAI Aero City",          god: "2011", garazhny: "514", sobstvennik: "ДАТ", vin: "KMJTA18LPBC007294",  reestr: "АТТ0202862", ekKlass: "4", docs: [] },
  { id: 10, bortovoy: "515", gos: "Х087ВК138", marka: "HYUNDAI Aero City",          god: "2012", garazhny: "515", sobstvennik: "ДАТ", vin: "KMJTA18BPCC012157",  reestr: "АТТ0202863", ekKlass: "4", docs: [] },
  { id: 11, bortovoy: "518", gos: "АВ51827",   marka: "ZHONG TONG LKC6105HG LCK5", god: "2024", garazhny: "518", sobstvennik: "ТИТ", vin: "LDYGCS1D1R0034308",  reestr: "АТТ0261260", ekKlass: "5", docs: [] },
  { id: 12, bortovoy: "519", gos: "АВ51927",   marka: "ZHONG TONG LKC6105HG LCK5", god: "2024", garazhny: "519", sobstvennik: "ТИТ", vin: "LDYGCS1DXR0034307",  reestr: "АТТ0261261", ekKlass: "5", docs: [] },
  { id: 13, bortovoy: "523", gos: "В087СН27",  marka: "HYUNDAI Aero City 540",      god: "1999", garazhny: "523", sobstvennik: "ДАТ", vin: "KMJTA18VPXC601555",  reestr: "АТТ0202864", ekKlass: "0", docs: [] },
  { id: 14, bortovoy: "524", gos: "В092СН27",  marka: "HYUNDAI Aero City 540",      god: "1999", garazhny: "524", sobstvennik: "ДАТ", vin: "KMJTA18VPXC602331",  reestr: "АТТ0202867", ekKlass: "0", docs: [] },
  { id: 15, bortovoy: "525", gos: "Н972НК27",  marka: "ПАЗ 4234",                   god: "2012", garazhny: "525", sobstvennik: "ДО",  vin: "X1M4234K0C0000359",  reestr: "АТТ0203094", ekKlass: "4", docs: [] },
  { id: 16, bortovoy: "527", gos: "А359ТА27",  marka: "HYUNDAI Aero City",          god: "2000", garazhny: "527", sobstvennik: "ТиТ", vin: "KMJTA18VPYC604834",  reestr: "АТТ0203085", ekKlass: "2", docs: [] },
  { id: 17, bortovoy: "528", gos: "Р032НК27",  marka: "ПАЗ VECTOR NEXT",            god: "2021", garazhny: "528", sobstvennik: "ДАТ", vin: "X1M3204FSM0000433",  reestr: "АТТ0261257", ekKlass: "5", docs: [] },
  { id: 18, bortovoy: "529", gos: "Р389НК27",  marka: "ПАЗ VECTOR NEXT",            god: "2021", garazhny: "529", sobstvennik: "ДАТ", vin: "X1M3204FSM0000423",  reestr: "АТТ0202869", ekKlass: "5", docs: [] },
  { id: 19, bortovoy: "530", gos: "Р456НК27",  marka: "ПАЗ VECTOR NEXT",            god: "2021", garazhny: "530", sobstvennik: "ДАТ", vin: "X1M3204FSM0000415",  reestr: "АТТ0202870", ekKlass: "5", docs: [] },
  { id: 20, bortovoy: "531", gos: "Р463НК27",  marka: "ПАЗ VECTOR NEXT",            god: "2021", garazhny: "531", sobstvennik: "ДАТ", vin: "X1M3204FSM0000411",  reestr: "АТТ0202871", ekKlass: "5", docs: [] },
  { id: 21, bortovoy: "532", gos: "Р465НК27",  marka: "ПАЗ VECTOR NEXT",            god: "2021", garazhny: "532", sobstvennik: "ДАТ", vin: "X1M3204FSM0000438",  reestr: "АТТ0202868", ekKlass: "5", docs: [] },
  { id: 22, bortovoy: "533", gos: "Р848НУ27",  marka: "ПАЗ VECTOR NEXT",            god: "2021", garazhny: "533", sobstvennik: "ДО",  vin: "X1M3204FSM0000433",  reestr: "АТТ0261257", ekKlass: "5", docs: [] },
  { id: 23, bortovoy: "534", gos: "АВ49127",   marka: "ZHONG TONG LKC6105HG LCK5", god: "2023", garazhny: "534", sobstvennik: "ДАТ", vin: "LDYGCS1D9N0025902",  reestr: "АТТ0202873", ekKlass: "5", docs: [] },
  { id: 24, bortovoy: "535", gos: "Р609ТС27",  marka: "ZHONG TONG LKC6105HG LCK5", god: "2024", garazhny: "535", sobstvennik: "СН",  vin: "LDYGCS1D5P0030498",  reestr: "АТТ0202872", ekKlass: "5", docs: [] },
  { id: 25, bortovoy: "538", gos: "А961УН27",  marka: "DAEWOO BS 106",              god: "2009", garazhny: "538", sobstvennik: "ДАТ", vin: "KL5UM52JD9P023982",  reestr: "АТТ0202858", ekKlass: "4", docs: [] },
  { id: 26, bortovoy: "541", gos: "В916МТ27",  marka: "DAEWOO BS 106",              god: "2010", garazhny: "541", sobstvennik: "ТиТ", vin: "KL2UR52SDAP021157",  reestr: "АТТ0203090", ekKlass: "4", docs: [] },
  { id: 27, bortovoy: "543", gos: "АВ54327",   marka: "ZHONG TONG LKC6105HG LCK6", god: "2025", garazhny: "543", sobstvennik: "ДАТ", vin: "LDYGCS1D9S0048253",  reestr: "АТТ0261259", ekKlass: "5", docs: [] },
  { id: 28, bortovoy: "544", gos: "Н420РМ27",  marka: "DAEWOO BS 106-01",           god: "2000", garazhny: "544", sobstvennik: "ТиТ", vin: "KL2UL52BDYP011028",  reestr: "АТТ0203091", ekKlass: "0", docs: [] },
  { id: 29, bortovoy: "548", gos: "Н168НМ27",  marka: "ПАЗ 4234",                   god: "2012", garazhny: "548", sobstvennik: "ДО",  vin: "X1M4234K0C0000284",  reestr: "АТТ0203095", ekKlass: "4", docs: [] },
  { id: 30, bortovoy: "554", gos: "АВ55427",   marka: "ZHONG TONG LKC6105HG LCK5", god: "2025", garazhny: "554", sobstvennik: "ДАТ", vin: "LDYGCS1D2S0043153",  reestr: "",           ekKlass: "",  docs: [] },
  { id: 31, bortovoy: "560", gos: "А122ОР27",  marka: "DAEWOO BS 106",              god: "2000", garazhny: "560", sobstvennik: "ТиТ", vin: "KL2UR52BDYP017303",  reestr: "АТТ0203088", ekKlass: "2", docs: [] },
  { id: 32, bortovoy: "561", gos: "А148ОР27",  marka: "DAEWOO BS 106",              god: "2000", garazhny: "561", sobstvennik: "ТиТ", vin: "KL2UR52BDYP017301",  reestr: "АТТ0203092", ekKlass: "2", docs: [] },
  { id: 33, bortovoy: "501", gos: "А233МК27",  marka: "DAEWOO BS 106",              god: "2007", garazhny: "501", sobstvennik: "ДАТ", vin: "KL5U52PD7P025550",   reestr: "АТТ0202853", ekKlass: "4", docs: [] },
  { id: 34, bortovoy: "539", gos: "К854ХУ27",  marka: "ПАЗ 4230-03",               god: "2005", garazhny: "539", sobstvennik: "ТиТ", vin: "X1M4230T360000242",  reestr: "АТТ0261262", ekKlass: "2", docs: [] },
  { id: 35, bortovoy: "550", gos: "Н218НМ27",  marka: "ПАЗ 4235",                  god: "",     garazhny: "550", sobstvennik: "ДО",  vin: "X1M4234K0C0000279",  reestr: "АТТ0261258", ekKlass: "4", docs: [] },
];

// ─── Организация ───────────────────────────────────────────────────────────
export interface CompanySettings {
  nazvanie: string;
  inn: string;
  direktor: string;
  telefon: string;
  adres: string;
}

export const INITIAL_COMPANIES: CompanySettings[] = [
  { nazvanie: 'ООО "Дальавтотранс"',        inn: "", direktor: "", telefon: "", adres: "" },
  { nazvanie: 'ООО "Техника и Технологии"', inn: "", direktor: "", telefon: "", adres: "" },
];

// ─── Терминал ───────────────────────────────────────────────────────────────
export interface Terminal {
  id: number;
  nomer: string;        // номер / название терминала
  serial: string;       // серийный номер
  model: string;        // модель
  companyIdx: number;   // привязка к организации (индекс в companies)
  status: "active" | "inactive";
  primechanie: string;
}

// ─── Сотрудник (глобально, из Кадры) ───────────────────────────────────────
export interface Employee {
  id: number;
  tabNum: string;
  fio: string;
  dolzhnost: string;   // "Водитель" | "Кондуктор"
  bort: string;
  kategoriya: string;
  telefon: string;
  dataRozhd: string;
  dataPriema: string;
  status: "active" | "inactive";
}

// ─── Маршрут ───────────────────────────────────────────────────────────────
export interface Route {
  id: number;
  nomer: string;        // номер маршрута (1, 3, 6, 15, 24)
  nazvanie: string;     // полное название
  nachalo: string;
  konets: string;
  grafikov: number;     // количество графиков
  intervalMin: string;
  rabochieChasy: string;
  companyIdx: number;   // привязка к организации
}

// Генерирует все графики маршрута: "1/1", "1/2", ...
export const getGrafiki = (route: Route): string[] =>
  Array.from({ length: route.grafikov }, (_, i) => `${route.nomer}/${i + 1}`);

export const INITIAL_ROUTES: Route[] = [
  // ДАТ — маршрут №1, 10 графиков
  { id: 101, nomer: "1",  nazvanie: "3-й мкр. - ул. Уральская",          nachalo: "3-й мкр.",             konets: "ул. Уральская",      grafikov: 10, intervalMin: "", rabochieChasy: "", companyIdx: 0 },
  // ДАТ — маршрут №15, 4 графика
  { id: 102, nomer: "15", nazvanie: "мкр. Амурлитмаш — мкр. Хорпинский", nachalo: "мкр. Амурлитмаш",     konets: "мкр. Хорпинский",    grafikov: 4,  intervalMin: "", rabochieChasy: "", companyIdx: 0 },
  // ДАТ — маршрут №24, 6 графиков
  { id: 103, nomer: "24", nazvanie: "ул. Уральская - мкр. Амурлитмаш",   nachalo: "ул. Уральская",         konets: "мкр. Амурлитмаш",   grafikov: 6,  intervalMin: "", rabochieChasy: "", companyIdx: 0 },
  // ТиТ — маршрут №3, 11 графиков
  { id: 104, nomer: "3",  nazvanie: "ул. Юбилейная - ул. Уральская",      nachalo: "ул. Юбилейная",         konets: "ул. Уральская",      grafikov: 11, intervalMin: "", rabochieChasy: "", companyIdx: 1 },
  // ТиТ — маршрут №6, 4 графика
  { id: 105, nomer: "6",  nazvanie: "мкр. Индустриальный - ул. Уральская",nachalo: "мкр. Индустриальный",  konets: "ул. Уральская",      grafikov: 4,  intervalMin: "", rabochieChasy: "", companyIdx: 1 },
];

// dateKey format: "YYYY-MM-DD"
export type WeeklyNaryady = Record<string, NaryadRowStore[]>;

// ─── Context ───────────────────────────────────────────────────────────────
interface AppStore {
  vehicles: TsVehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<TsVehicle[]>>;
  naryadEntries: NaryadEntry[];
  setNaryadEntries: React.Dispatch<React.SetStateAction<NaryadEntry[]>>;
  naryadRows: NaryadRowStore[];
  setNaryadRows: React.Dispatch<React.SetStateAction<NaryadRowStore[]>>;
  naryadSettings: NaryadSettingsStore;
  setNaryadSettings: React.Dispatch<React.SetStateAction<NaryadSettingsStore>>;
  weeklyNaryady: WeeklyNaryady;
  setWeeklyNaryady: React.Dispatch<React.SetStateAction<WeeklyNaryady>>;
  companies: CompanySettings[];
  setCompanies: React.Dispatch<React.SetStateAction<CompanySettings[]>>;
  activeCompanyIdx: number;
  setActiveCompanyIdx: React.Dispatch<React.SetStateAction<number>>;
  terminals: Terminal[];
  setTerminals: React.Dispatch<React.SetStateAction<Terminal[]>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  routes: Route[];
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
}

// ─── Типы для наряда (хранятся в сторе) ────────────────────────────────────
export interface NaryadRowStore {
  id: number;
  vehicleId: number | null;
  bortovoy: string;
  gos: string;
  marka: string;
  marshrut: string;
  fio: string;
  fioKond: string;
  putevoy: string;
  terminal: string;
  podrabotka: boolean;
  biletov: string;
}

export interface NaryadSettingsStore {
  stoimostBileta: string;
  stoimostTopliva: string;
  rashod: string;
  procentBez: string;
  procentVodS: string;
  procentCondS: string;
}

const makeEmptyNaryadRow = (): NaryadRowStore => ({
  id: Math.random() * 1e15 + performance.now(),
  vehicleId: null, bortovoy: "", gos: "", marka: "",
  marshrut: "", fio: "", fioKond: "",
  putevoy: "", terminal: "", podrabotka: false, biletov: "",
});

const DEFAULT_NARAD_SETTINGS: NaryadSettingsStore = {
  stoimostBileta: "40", stoimostTopliva: "75", rashod: "30",
  procentBez: "37", procentVodS: "22", procentCondS: "15",
};

const AppContext = createContext<AppStore | null>(null);

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 1001, tabNum: "", fio: "Арипов У.Х.",       dolzhnost: "Водитель", bort: "561", kategoriya: "D", telefon: "", dataRozhd: "", dataPriema: "", status: "active" },
  { id: 1002, tabNum: "", fio: "Вичканов Р.А.",      dolzhnost: "Водитель", bort: "",    kategoriya: "D", telefon: "", dataRozhd: "", dataPriema: "", status: "active" },
  { id: 1003, tabNum: "", fio: "Волос А.Ю.",         dolzhnost: "Водитель", bort: "527", kategoriya: "D", telefon: "", dataRozhd: "", dataPriema: "", status: "active" },
  { id: 1004, tabNum: "", fio: "Дувалетиков Ю.Ф.",  dolzhnost: "Водитель", bort: "506", kategoriya: "D", telefon: "", dataRozhd: "", dataPriema: "", status: "active" },
  { id: 1005, tabNum: "", fio: "Кириченко Н.А.",     dolzhnost: "Водитель", bort: "524", kategoriya: "D", telefon: "", dataRozhd: "", dataPriema: "", status: "active" },
  { id: 1006, tabNum: "", fio: "Кушнарев А.В.",      dolzhnost: "Водитель", bort: "512", kategoriya: "D", telefon: "", dataRozhd: "", dataPriema: "", status: "active" },
  { id: 1007, tabNum: "", fio: "Муклецов А.В.",      dolzhnost: "Водитель", bort: "515", kategoriya: "D", telefon: "", dataRozhd: "", dataPriema: "", status: "active" },
  { id: 1008, tabNum: "", fio: "Самодуров М.Н.",     dolzhnost: "Водитель", bort: "530", kategoriya: "D", telefon: "", dataRozhd: "", dataPriema: "", status: "active" },
  { id: 1009, tabNum: "", fio: "Сухов И.С.",         dolzhnost: "Водитель", bort: "508", kategoriya: "D", telefon: "", dataRozhd: "", dataPriema: "", status: "active" },
  { id: 1010, tabNum: "", fio: "Тасмалы М.П.",       dolzhnost: "Водитель", bort: "514", kategoriya: "D", telefon: "", dataRozhd: "", dataPriema: "", status: "active" },
  { id: 1011, tabNum: "", fio: "Чекотило Д.В.",      dolzhnost: "Водитель", bort: "",    kategoriya: "D", telefon: "", dataRozhd: "", dataPriema: "", status: "active" },
  { id: 1012, tabNum: "", fio: "Щепачев А.К.",       dolzhnost: "Водитель", bort: "540", kategoriya: "D", telefon: "", dataRozhd: "", dataPriema: "", status: "active" },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [vehicles, setVehicles] = useState<TsVehicle[]>(INITIAL_VEHICLES);
  const [naryadEntries, setNaryadEntries] = useState<NaryadEntry[]>([]);
  const [naryadRows, setNaryadRows] = useState<NaryadRowStore[]>([
    makeEmptyNaryadRow(), makeEmptyNaryadRow(), makeEmptyNaryadRow(),
  ]);
  const [naryadSettings, setNaryadSettings] = useState<NaryadSettingsStore>(DEFAULT_NARAD_SETTINGS);
  const [weeklyNaryady, setWeeklyNaryady] = useState<WeeklyNaryady>({});
  const [companies, setCompanies] = useState<CompanySettings[]>(INITIAL_COMPANIES);
  const [activeCompanyIdx, setActiveCompanyIdx] = useState(0);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [routes, setRoutes] = useState<Route[]>(INITIAL_ROUTES);

  return (
    <AppContext.Provider value={{
      vehicles, setVehicles,
      naryadEntries, setNaryadEntries,
      naryadRows, setNaryadRows,
      naryadSettings, setNaryadSettings,
      weeklyNaryady, setWeeklyNaryady,
      companies, setCompanies,
      activeCompanyIdx, setActiveCompanyIdx,
      terminals, setTerminals,
      employees, setEmployees,
      routes, setRoutes,
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