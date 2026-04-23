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
  udostoverenie: string;      // номер водительского удостоверения
  udostoverenieDo?: string;   // дата окончания ВУ (YYYY-MM-DD)
  medSpravka?: string;        // номер мед. справки
  medSpravkaDo?: string;      // дата окончания мед. справки (YYYY-MM-DD)
  adresReg?: string;          // адрес регистрации
  tip?: string;           // тип водителя: "arendator" | "podrabotka" | "" (штатный)
  kadryTab?: "voditely" | "konduktery" | "itr"; // к какому табу принадлежит в Кадрах
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

// ─── Расписание выпуска / захода по графику ─────────────────────────────────
// ключ — "marshrut" строки наряда, например "1/1", "3/5"
export interface GrafikSchedule {
  vypusk: string;   // время выезда на линию, "HH:MM"
  zakhod: string;   // время захода с линии, "HH:MM"
}
export type RouteSchedule = Record<string, GrafikSchedule>;

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

// ─── Context store shape ───────────────────────────────────────────────────
export interface AppStore {
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