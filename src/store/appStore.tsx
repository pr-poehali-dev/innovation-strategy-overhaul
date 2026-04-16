import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ─── localStorage persist ────────────────────────────────────────────────────
const LS_KEY = "dat_app_store_v1";

function mergeWithFallback<T>(loaded: unknown, fallback: T): T {
  if (Array.isArray(fallback) && Array.isArray(loaded)) {
    // Массив объектов: мержим каждый элемент с первым элементом fallback (как шаблон)
    const template = fallback[0];
    if (template && typeof template === "object") {
      return (loaded as unknown[]).map((item) =>
        typeof item === "object" && item !== null ? { ...template, ...(item as object) } : item
      ) as unknown as T;
    }
    return loaded as T;
  }
  if (typeof fallback === "object" && fallback !== null && typeof loaded === "object" && loaded !== null && !Array.isArray(loaded)) {
    return { ...(fallback as object), ...(loaded as object) } as T;
  }
  return loaded as T;
}

function loadFromLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${LS_KEY}:${key}`);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return mergeWithFallback(parsed, fallback);
  } catch {
    return fallback;
  }
}

function saveToLS<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${LS_KEY}:${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn("localStorage write failed", e);
  }
}

function usePersist<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => loadFromLS(key, initial));
  useEffect(() => { saveToLS(key, state); }, [key, state]);
  return [state, setState];
}

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
  // Основные реквизиты
  nazvanie: string;         // полное наименование
  kratkoeNazvanie: string;  // краткое наименование
  inn: string;
  kpp: string;
  ogrn: string;             // ОГРН или ОГРНИП
  okpo: string;             // код по ОКПО
  okvad: string;            // основной ОКВЭД
  direktor: string;         // ФИО руководителя
  dolzhnostDir: string;     // должность руководителя
  glavbuh: string;          // ФИО главного бухгалтера
  // Адреса
  adresYur: string;         // юридический адрес
  adres: string;            // фактический/почтовый адрес
  // Контакты
  telefon: string;
  email: string;
  // Банковские реквизиты
  bank: string;             // наименование банка
  bik: string;
  raschetnySchet: string;   // расчётный счёт
  korSchet: string;         // корреспондентский счёт
  // Реквизиты для пассажирских перевозок
  licenziya: string;        // номер лицензии на перевозки
  licenziyaData: string;    // дата выдачи лицензии
  licenziyaVydan: string;   // кем выдана лицензия
  reestrNomer: string;      // реестровый номер в реестре перевозчиков
  svidetelstvo: string;     // свидетельство об осуществлении перевозок
  svidetelstvoData: string; // дата свидетельства
  dogovorZakazchik: string; // № договора с заказчиком перевозок
  zakazchik: string;        // наименование заказчика (мун. орган)
  zakazchikInn: string;     // ИНН заказчика
}

const emptyCompany = (nazvanie = ""): CompanySettings => ({
  nazvanie, kratkoeNazvanie: "", inn: "", kpp: "", ogrn: "", okpo: "", okvad: "49.31",
  direktor: "", dolzhnostDir: "Директор", glavbuh: "",
  adresYur: "", adres: "", telefon: "", email: "",
  bank: "", bik: "", raschetnySchet: "", korSchet: "",
  licenziya: "", licenziyaData: "", licenziyaVydan: "", reestrNomer: "",
  svidetelstvo: "", svidetelstvoData: "", dogovorZakazchik: "", zakazchik: "", zakazchikInn: "",
});

export const INITIAL_COMPANIES: CompanySettings[] = [
  { ...emptyCompany('ООО "Дальавтотранс"') },
  { ...emptyCompany('ООО "Техника и Технологии"') },
  { ...emptyCompany('ИП Герасимов') },
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
  inn: string;
  snils: string;
  udostoverenie: string;  // номер водительского удостоверения
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

// ─── Расписание выпуска / захода по графику ─────────────────────────────────
// ключ — "marshrut" строки наряда, например "1/1", "3/5"
export interface GrafikSchedule {
  vypusk: string;   // время выезда на линию, "HH:MM"
  zakhod: string;   // время захода с линии, "HH:MM"
}
export type RouteSchedule = Record<string, GrafikSchedule>;

export const INITIAL_ROUTE_SCHEDULE: RouteSchedule = {
  // Маршрут №1
  "1/1":  { vypusk: "06:00", zakhod: "18:52" },
  "1/2":  { vypusk: "05:55", zakhod: "19:05" },
  "1/3":  { vypusk: "05:50", zakhod: "19:25" },
  "1/4":  { vypusk: "05:40", zakhod: "18:10" },
  "1/5":  { vypusk: "05:30", zakhod: "18:20" },
  "1/6":  { vypusk: "05:10", zakhod: "19:00" },
  "1/7":  { vypusk: "05:20", zakhod: "19:30" },
  "1/8":  { vypusk: "06:30", zakhod: "19:40" },
  "1/9":  { vypusk: "06:20", zakhod: "19:45" },
  "1/10": { vypusk: "06:10", zakhod: "19:48" },
  // Маршрут №3
  "3/1":  { vypusk: "05:47", zakhod: "19:15" },
  "3/2":  { vypusk: "05:22", zakhod: "19:35" },
  "3/3":  { vypusk: "05:32", zakhod: "18:45" },
  "3/4":  { vypusk: "06:22", zakhod: "18:48" },
  "3/5":  { vypusk: "06:43", zakhod: "19:50" },
  "3/6":  { vypusk: "05:17", zakhod: "18:15" },
  "3/7":  { vypusk: "05:12", zakhod: "18:25" },
  "3/8":  { vypusk: "05:27", zakhod: "18:30" },
  "3/9":  { vypusk: "06:03", zakhod: "19:35" },
  "3/10": { vypusk: "06:32", zakhod: "18:40" },
  "3/11": { vypusk: "",      zakhod: ""       },
  // Маршрут №6
  "6/1":  { vypusk: "05:40", zakhod: "19:38" },
  "6/2":  { vypusk: "05:34", zakhod: "19:45" },
  "6/3":  { vypusk: "",      zakhod: ""       },
  "6/4":  { vypusk: "",      zakhod: ""       },
};

// dateKey format: "YYYY-MM-DD"
export type WeeklyNaryady = Record<string, NaryadRowStore[]>;

// Дежурный персонал на день (диспетчер, механик по выпуску)
export interface DayMeta {
  dispFio: string;
  mekhFio: string;
  medFio:  string;   // медик (для журнала)
  nachGarFio: string;
}
export type WeeklyDayMeta = Record<string, DayMeta>;
export const emptyDayMeta = (): DayMeta => ({ dispFio: "", mekhFio: "", medFio: "", nachGarFio: "" });

// ─── Context ───────────────────────────────────────────────────────────────
interface AppStore {
  vehicles: TsVehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<TsVehicle[]>>;
  naryadEntries: NaryadEntry[];
  setNaryadEntries: React.Dispatch<React.SetStateAction<NaryadEntry[]>>;
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
  dtpRecords: DtpRecord[];
  setDtpRecords: React.Dispatch<React.SetStateAction<DtpRecord[]>>;
  weeklyDayMeta: WeeklyDayMeta;
  setWeeklyDayMeta: React.Dispatch<React.SetStateAction<WeeklyDayMeta>>;
  routeSchedule: RouteSchedule;
  setRouteSchedule: React.Dispatch<React.SetStateAction<RouteSchedule>>;
}

// ─── ДТП ────────────────────────────────────────────────────────────────────
export interface DtpRecord {
  id: number;
  date: string;          // дата наряда
  bortovoy: string;
  marshrut: string;
  fioVod: string;
  fioKond: string;
  putevoy: string;
  // заполняется в БДД
  vremya: string;        // время ДТП
  mesto: string;         // место ДТП
  opisanie: string;      // описание
  postradavshie: string; // пострадавшие
  ushcherb: string;      // ущерб, ₽
  status: "new" | "investigating" | "closed";
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
  statusOtsutstviya: string;
  dtp: boolean;
  odometrVyezd: string;   // показание одометра при выезде
  odometrVozv: string;    // показание одометра при возврате
}

export interface NaryadSettingsStore {
  stoimostBileta: string;
  stoimostTopliva: string;
  rashod: string;
  procentBez: string;    // % водителя без кондуктора
  procentVodS: string;   // % водителя с кондуктором
  procentCondS: string;  // % кондуктора
  fixedRoute6: string;
  obedVod: string;
  obedVodKond: string;
  stoimostProezda: string;
  zpVodDezhurki: string;
  dezhDt: string;
  hozNuzhdyGarazh: string;
}


const DEFAULT_NARAD_SETTINGS: NaryadSettingsStore = {
  stoimostBileta: "40", stoimostTopliva: "75", rashod: "30",
  procentBez: "37", procentVodS: "22", procentCondS: "15",
  fixedRoute6: "7000",
  obedVod: "150",
  obedVodKond: "300",
  stoimostProezda: "40",
  zpVodDezhurki: "",
  dezhDt: "",
  hozNuzhdyGarazh: "",
};

const AppContext = createContext<AppStore | null>(null);

const INITIAL_EMPLOYEES: Employee[] = [
  // Водители
  { id: 1001, tabNum: "", fio: "Адахамов У.",        dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "26.08.1995", dataPriema: "", status: "active", inn: "270006275107",  snils: "230-697-318 69", udostoverenie: "" },
  { id: 1002, tabNum: "", fio: "Арипов С.",           dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "19.09.1995", dataPriema: "", status: "active", inn: "270317859578",  snils: "205-442-299 37", udostoverenie: "" },
  { id: 1003, tabNum: "", fio: "Арипов У.Х.",         dolzhnost: "Водитель",  bort: "561", kategoriya: "D", telefon: "", dataRozhd: "26.08.1985", dataPriema: "", status: "active", inn: "246010238526",  snils: "193-070-956 79", udostoverenie: "" },
  { id: 1004, tabNum: "", fio: "Артюшкин Н.Н.",       dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "22.12.1969", dataPriema: "", status: "active", inn: "270340028765",  snils: "052-780-618 63", udostoverenie: "" },
  { id: 1005, tabNum: "", fio: "Бабенко А.Н.",        dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "29.09.1972", dataPriema: "", status: "active", inn: "272700435931",  snils: "107-357-176 51", udostoverenie: "" },
  { id: 1006, tabNum: "", fio: "Бегеза",              dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "",           dataPriema: "", status: "active", inn: "",              snils: "",               udostoverenie: "" },
  { id: 1007, tabNum: "", fio: "Бодрин В.А.",         dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "24.08.1972", dataPriema: "", status: "active", inn: "270340086380",  snils: "052-781-020 43", udostoverenie: "" },
  { id: 1008, tabNum: "", fio: "Бурцев А.А.",         dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "17.07.1980", dataPriema: "", status: "active", inn: "270303684462",  snils: "057-166-343 68", udostoverenie: "" },
  { id: 1009, tabNum: "", fio: "Вичканов Р.А.",       dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "11.03.1980", dataPriema: "", status: "active", inn: "270322043947",  snils: "091-741-591 78", udostoverenie: "" },
  { id: 1010, tabNum: "", fio: "Володин М.Ю.",        dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "07.01.1972", dataPriema: "", status: "active", inn: "270307113283",  snils: "053-686-804 88", udostoverenie: "" },
  { id: 1011, tabNum: "", fio: "Волос А.Ю.",          dolzhnost: "Водитель",  bort: "527", kategoriya: "D", telefon: "", dataRozhd: "15.05.1972", dataPriema: "", status: "active", inn: "270314620407",  snils: "052-780-955 77", udostoverenie: "" },
  { id: 1012, tabNum: "", fio: "Головин",             dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "05.06.1966", dataPriema: "", status: "active", inn: "270320856908",  snils: "108-814-980 76", udostoverenie: "" },
  { id: 1013, tabNum: "", fio: "Гончаров",            dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "19.04.1975", dataPriema: "", status: "active", inn: "270504154306",  snils: "069-889-403 48", udostoverenie: "" },
  { id: 1014, tabNum: "", fio: "Денисов О.Б.",        dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "22.05.1974", dataPriema: "", status: "active", inn: "271203752791",  snils: "077-561-849 08", udostoverenie: "" },
  { id: 1015, tabNum: "", fio: "Дувалетиков Ю.Ф.",   dolzhnost: "Водитель",  bort: "506", kategoriya: "D", telefon: "", dataRozhd: "25.02.1955", dataPriema: "", status: "active", inn: "270320782910",  snils: "104-980-895 77", udostoverenie: "" },
  { id: 1016, tabNum: "", fio: "Жуков",               dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "",           dataPriema: "", status: "active", inn: "",              snils: "",               udostoverenie: "" },
  { id: 1017, tabNum: "", fio: "Иванцов",             dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "",           dataPriema: "", status: "active", inn: "",              snils: "",               udostoverenie: "" },
  { id: 1018, tabNum: "", fio: "Карпенко А.Л.",       dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "11.09.1969", dataPriema: "", status: "active", inn: "272700291655",  snils: "119-558-544 93", udostoverenie: "" },
  { id: 1019, tabNum: "", fio: "Киля Р.С.",           dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "04.11.1984", dataPriema: "", status: "active", inn: "270391909056",  snils: "108-324-214 20", udostoverenie: "" },
  { id: 1020, tabNum: "", fio: "Кириченко Н.А.",      dolzhnost: "Водитель",  bort: "524", kategoriya: "D", telefon: "", dataRozhd: "03.07.1965", dataPriema: "", status: "active", inn: "270391896671",  snils: "119-031-245 17", udostoverenie: "" },
  { id: 1021, tabNum: "", fio: "Котляров",            dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "",           dataPriema: "", status: "active", inn: "",              snils: "",               udostoverenie: "" },
  { id: 1022, tabNum: "", fio: "Кушнарев А.В.",       dolzhnost: "Водитель",  bort: "512", kategoriya: "D", telefon: "", dataRozhd: "30.11.1972", dataPriema: "", status: "active", inn: "271701764091",  snils: "112-861-046 26", udostoverenie: "" },
  { id: 1023, tabNum: "", fio: "Люкин А.Н.",          dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "22.01.1958", dataPriema: "", status: "active", inn: "271700095105",  snils: "037-997-759 38", udostoverenie: "" },
  { id: 1024, tabNum: "", fio: "Маркина",             dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "",           dataPriema: "", status: "active", inn: "",              snils: "",               udostoverenie: "" },
  { id: 1025, tabNum: "", fio: "Мичурин Р.Е.",        dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "10.03.1981", dataPriema: "", status: "active", inn: "270307836684",  snils: "053-049-717 46", udostoverenie: "" },
  { id: 1026, tabNum: "", fio: "Муклецов А.В.",       dolzhnost: "Водитель",  bort: "515", kategoriya: "D", telefon: "", dataRozhd: "20.04.1984", dataPriema: "", status: "active", inn: "270305624042",  snils: "074-835-140 77", udostoverenie: "" },
  { id: 1027, tabNum: "", fio: "Оборин",              dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "05.11.1980", dataPriema: "", status: "active", inn: "270310880250",  snils: "057-195-817 92", udostoverenie: "" },
  { id: 1028, tabNum: "", fio: "Пархачев Я.А.",       dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "05.03.1988", dataPriema: "", status: "active", inn: "270398982471",  snils: "128-622-603 55", udostoverenie: "" },
  { id: 1029, tabNum: "", fio: "Плотников Е.В.",      dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "21.07.1998", dataPriema: "", status: "active", inn: "270396963850",  snils: "175-792-423 12", udostoverenie: "" },
  { id: 1030, tabNum: "", fio: "Путинцев А.В.",       dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "27.06.1971", dataPriema: "", status: "active", inn: "270313826765",  snils: "075-495-592 13", udostoverenie: "" },
  { id: 1031, tabNum: "", fio: "Рожков С.С.",         dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "04.07.1963", dataPriema: "", status: "active", inn: "271203512461",  snils: "045-577-811 86", udostoverenie: "" },
  { id: 1032, tabNum: "", fio: "Рылов С.В.",          dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "29.03.1984", dataPriema: "", status: "active", inn: "270393390231",  snils: "108-324-492 40", udostoverenie: "" },
  { id: 1033, tabNum: "", fio: "Самодуров",           dolzhnost: "Водитель",  bort: "530", kategoriya: "D", telefon: "", dataRozhd: "27.05.1984", dataPriema: "", status: "active", inn: "270390552477",  snils: "113-197-045 29", udostoverenie: "" },
  { id: 1034, tabNum: "", fio: "Серяков А.В.",        dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "29.11.1978", dataPriema: "", status: "active", inn: "270306878515",  snils: "079-871-897 53", udostoverenie: "" },
  { id: 1035, tabNum: "", fio: "Смирнов А.Н.",        dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "30.06.1976", dataPriema: "", status: "active", inn: "270309154341",  snils: "071-520-583 36", udostoverenie: "" },
  { id: 1036, tabNum: "", fio: "Сухов И.С.",          dolzhnost: "Водитель",  bort: "508", kategoriya: "D", telefon: "", dataRozhd: "19.11.1977", dataPriema: "", status: "active", inn: "270313303645",  snils: "075-348-742 91", udostoverenie: "" },
  { id: 1037, tabNum: "", fio: "Тасмалы МП",          dolzhnost: "Водитель",  bort: "514", kategoriya: "D", telefon: "", dataRozhd: "24.10.1977", dataPriema: "", status: "active", inn: "272700090885",  snils: "157-447-424 89", udostoverenie: "" },
  { id: 1038, tabNum: "", fio: "Теребков",            dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "20.01.1980", dataPriema: "", status: "active", inn: "270319852803",  snils: "079-424-581 00", udostoverenie: "" },
  { id: 1039, tabNum: "", fio: "Хорошевский О.В.",    dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "23.04.1984", dataPriema: "", status: "active", inn: "270319994692",  snils: "110-162-471 88", udostoverenie: "" },
  { id: 1040, tabNum: "", fio: "Цвых С.В.",           dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "17.04.1962", dataPriema: "", status: "active", inn: "270320406112",  snils: "052-859-721 88", udostoverenie: "" },
  { id: 1041, tabNum: "", fio: "Чекотило В.В.",       dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "29.08.1970", dataPriema: "", status: "active", inn: "270301150433",  snils: "035-243-808 34", udostoverenie: "" },
  { id: 1042, tabNum: "", fio: "Чекотило Д.В.",       dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "19.08.1991", dataPriema: "", status: "active", inn: "270398238907",  snils: "141-681-580 58", udostoverenie: "" },
  { id: 1043, tabNum: "", fio: "Шелестов И.С.",       dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "03.12.1998", dataPriema: "", status: "active", inn: "270300067670",  snils: "189-514-833 18", udostoverenie: "" },
  { id: 1044, tabNum: "", fio: "Шелестов С.В.",       dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "12.01.1975", dataPriema: "", status: "active", inn: "271204469498",  snils: "117-141-169 19", udostoverenie: "" },
  { id: 1045, tabNum: "", fio: "Щепачев А.К.",        dolzhnost: "Водитель",  bort: "540", kategoriya: "D", telefon: "", dataRozhd: "02.02.1970", dataPriema: "", status: "active", inn: "270320764887",  snils: "119-031-221 09", udostoverenie: "" },
  // Водители — дополнительные
  { id: 1057, tabNum: "", fio: "Дмитриевский А.А.",   dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "14.07.1981", dataPriema: "", status: "active", inn: "270310805485",  snils: "074-905-334 76", udostoverenie: "" },
  { id: 1058, tabNum: "", fio: "Долгов И.А.",         dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "28.07.1973", dataPriema: "", status: "active", inn: "270314643901",  snils: "052-782-686 83", udostoverenie: "" },
  { id: 1059, tabNum: "", fio: "Кайбалов Р.В.",       dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "19.02.1991", dataPriema: "", status: "active", inn: "270395893128",  snils: "138-678-185 14", udostoverenie: "" },
  { id: 1060, tabNum: "", fio: "Киле И.В.",           dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "17.05.1994", dataPriema: "", status: "active", inn: "270604785665",  snils: "139-320-757 61", udostoverenie: "" },
  { id: 1061, tabNum: "", fio: "Миленко С.В.",        dolzhnost: "Водитель",  bort: "",    kategoriya: "D", telefon: "", dataRozhd: "29.04.1974", dataPriema: "", status: "active", inn: "270390765820",  snils: "192-022-046 26", udostoverenie: "" },
  // Кондукторы
  { id: 1051, tabNum: "", fio: "Протасова Е.В.",      dolzhnost: "Кондуктор", bort: "",    kategoriya: "",  telefon: "", dataRozhd: "03.01.1989", dataPriema: "", status: "active", inn: "270392358813",  snils: "122-364-798 49", udostoverenie: "" },
  { id: 1052, tabNum: "", fio: "Толстикова О.К.",     dolzhnost: "Кондуктор", bort: "",    kategoriya: "",  telefon: "", dataRozhd: "",           dataPriema: "", status: "active", inn: "",              snils: "",               udostoverenie: "" },
  { id: 1053, tabNum: "", fio: "Халилова",            dolzhnost: "Кондуктор", bort: "",    kategoriya: "",  telefon: "", dataRozhd: "",           dataPriema: "", status: "active", inn: "",              snils: "",               udostoverenie: "" },
  { id: 1054, tabNum: "", fio: "Арипова Фатхиябону",  dolzhnost: "Кондуктор", bort: "",    kategoriya: "",  telefon: "", dataRozhd: "24.09.2005", dataPriema: "", status: "active", inn: "270005959496",  snils: "229-419-571 91", udostoverenie: "" },
  { id: 1055, tabNum: "", fio: "Еремина М.Е.",        dolzhnost: "Кондуктор", bort: "",    kategoriya: "",  telefon: "", dataRozhd: "14.06.1983", dataPriema: "", status: "active", inn: "270311389421",  snils: "078-812-877 16", udostoverenie: "" },
  { id: 1056, tabNum: "", fio: "Леваева Г.Н.",        dolzhnost: "Кондуктор", bort: "",    kategoriya: "",  telefon: "", dataRozhd: "09.09.1963", dataPriema: "", status: "active", inn: "270310454879",  snils: "035-242-407 17", udostoverenie: "" },
  { id: 1062, tabNum: "", fio: "Ершова М.А.",         dolzhnost: "Кондуктор", bort: "",    kategoriya: "",  telefon: "", dataRozhd: "20.03.1959", dataPriema: "", status: "active", inn: "270303549400",  snils: "034-551-442 32", udostoverenie: "" },
  // ИТР — Директора организаций
  { id: 2001, tabNum: "", fio: "",                   dolzhnost: "Директор",  bort: "",    kategoriya: "",  telefon: "", dataRozhd: "",           dataPriema: "", status: "active", inn: "",              snils: "",               udostoverenie: "" },
  { id: 2002, tabNum: "", fio: "",                   dolzhnost: "Директор",  bort: "",    kategoriya: "",  telefon: "", dataRozhd: "",           dataPriema: "", status: "active", inn: "",              snils: "",               udostoverenie: "" },
  // ИТР — Медик (Червонная Л.М.)
  { id: 2003, tabNum: "", fio: "Червонная Л.М.",     dolzhnost: "Медик",     bort: "",    kategoriya: "",  telefon: "", dataRozhd: "",           dataPriema: "", status: "active", inn: "",              snils: "",               udostoverenie: "" },
];

const INITIAL_TERMINALS: Terminal[] = [
  { id: 301, nomer: "Терминал-1 (ИП Герасимов)", serial: "", model: "", companyIdx: 2, status: "active", primechanie: "Маршрут №3" },
  { id: 302, nomer: "Терминал-2 (ИП Герасимов)", serial: "", model: "", companyIdx: 2, status: "active", primechanie: "Маршрут №3" },
  { id: 303, nomer: "Терминал-3 (ИП Герасимов)", serial: "", model: "", companyIdx: 2, status: "active", primechanie: "Маршрут №3" },
];

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