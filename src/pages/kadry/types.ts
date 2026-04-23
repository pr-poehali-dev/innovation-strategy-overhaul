import { Employee } from "@/store/appStore";
import { uid } from "@/lib/uid";

export type TabType = "voditely" | "konduktery" | "itr";

export const ITR_DOLZHNOSTI = [
  "Директор",
  "Нач. гаража",
  "Механик по выпуску",
  "Механик по ремонту",
  "Диспетчер",
  "Слесарь",
  "Медик",
  "Клининг менеджер",
];

export const ITR_DOLZHNOSTI_SET = new Set(ITR_DOLZHNOSTI);

export const emptyEmployee = (dolzhnost: string, kadryTab: "voditely" | "konduktery" | "itr"): Employee => ({
  id: uid(),
  tabNum: "",
  fio: "",
  dolzhnost,
  bort: "",
  kategoriya: "",
  telefon: "",
  dataRozhd: "",
  dataPriema: "",
  status: "active",
  inn: "",
  snils: "",
  udostoverenie: "",
  udostoverenieDo: "",
  medSpravka: "",
  medSpravkaDo: "",
  adresReg: "",
  kadryTab,
});

export const VOD_COLUMNS = [
  { key: "tabNum",          label: "Таб. №",           width: "70px"  },
  { key: "fio",             label: "ФИО",              width: "200px" },
  { key: "bort",            label: "Борт №",           width: "80px"  },
  { key: "kategoriya",      label: "Категория",        width: "90px"  },
  { key: "udostoverenie",   label: "Уд-ие вод. №",     width: "120px" },
  { key: "udostoverenieDo", label: "ВУ действ. до",    width: "115px" },
  { key: "medSpravka",      label: "Мед. справка №",   width: "120px" },
  { key: "medSpravkaDo",    label: "Мед. действ. до",  width: "115px" },
  { key: "telefon",         label: "Телефон",          width: "130px" },
  { key: "inn",             label: "ИНН",              width: "120px" },
  { key: "snils",           label: "СНИЛС",            width: "130px" },
  { key: "dataRozhd",       label: "Дата рождения",    width: "110px" },
  { key: "dataPriema",      label: "Дата приёма",      width: "110px" },
  { key: "adresReg",        label: "Адрес регистрации", width: "220px" },
  { key: "status",          label: "Статус",           width: "90px"  },
] as const;

export const COND_COLUMNS = [
  { key: "tabNum",     label: "Таб. №",           width: "70px"  },
  { key: "fio",        label: "ФИО",              width: "200px" },
  { key: "bort",       label: "Борт №",           width: "80px"  },
  { key: "medSpravka",   label: "Мед. справка №",  width: "120px" },
  { key: "medSpravkaDo", label: "Мед. действ. до", width: "115px" },
  { key: "telefon",    label: "Телефон",          width: "130px" },
  { key: "inn",        label: "ИНН",              width: "120px" },
  { key: "snils",      label: "СНИЛС",            width: "130px" },
  { key: "dataRozhd",  label: "Дата рождения",    width: "110px" },
  { key: "dataPriema", label: "Дата приёма",      width: "110px" },
  { key: "adresReg",   label: "Адрес регистрации", width: "220px" },
  { key: "status",     label: "Статус",           width: "90px"  },
] as const;

export const ITR_COLUMNS = [
  { key: "tabNum",     label: "Таб. №",        width: "70px"  },
  { key: "fio",        label: "ФИО",           width: "200px" },
  { key: "dolzhnost",  label: "Должность",     width: "160px" },
  { key: "telefon",    label: "Телефон",       width: "130px" },
  { key: "inn",        label: "ИНН",           width: "120px" },
  { key: "snils",      label: "СНИЛС",         width: "130px" },
  { key: "dataRozhd",  label: "Дата рождения", width: "110px" },
  { key: "dataPriema", label: "Дата приёма",   width: "110px" },
  { key: "status",     label: "Статус",        width: "90px"  },
] as const;

export type KadryColumn =
  | (typeof VOD_COLUMNS)[number]
  | (typeof COND_COLUMNS)[number]
  | (typeof ITR_COLUMNS)[number];

export const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
