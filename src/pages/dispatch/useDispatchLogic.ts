import { useEffect, useCallback, useState, useMemo } from "react";
import { useAppStore, NaryadEntry, NaryadRowStore, emptyDayMeta, DayMeta } from "@/store/appStore";
import { NaryadRow, NormaSettings, calcPodrabotka } from "./types";
import { uid } from "@/lib/uid";
import {
  toDateKey,
  toDisplayDate,
  toMonthYear,
  getWeekMonday,
  getWeekDays,
  toNaryadRow,
  makeEmptyRow,
  nextPutevoy,
  makeRowsFromRoutes,
  DAY_NAMES,
  TabType,
} from "./dispatchUtils";

export const useDispatchLogic = () => {
  const {
    setNaryadEntries,
    naryadSettings, setNaryadSettings,
    weeklyNaryady, setWeeklyNaryady,
    routes,
    setDtpRecords,
    weeklyDayMeta, setWeeklyDayMeta,
    employees,
  } = useAppStore();

  const settings: NormaSettings = naryadSettings;

  const [weekMonday, setWeekMonday] = useState<Date>(() => getWeekMonday(new Date()));
  const weekDays = getWeekDays(weekMonday);

  const todayKey = toDateKey(new Date());
  const [selectedKey, setSelectedKey] = useState<string>(todayKey);
  const [activeTab, setActiveTab] = useState<TabType>("narad");

  // Стабильный массив строк для дня: если дня ещё нет в стейте — материализуем его ОДИН раз,
  // чтобы id строк были постоянными между рендерами (иначе ввод в одну строку «дублируется» по всем).
  useEffect(() => {
    if (!weeklyNaryady[selectedKey]) {
      setWeeklyNaryady((prev) =>
        prev[selectedKey] ? prev : { ...prev, [selectedKey]: makeRowsFromRoutes(routes) }
      );
    }
  }, [selectedKey, weeklyNaryady, routes, setWeeklyNaryady]);

  const rowsForDay = useCallback(
    (key: string): NaryadRowStore[] => weeklyNaryady[key] ?? [],
    [weeklyNaryady]
  );

  const currentRows: NaryadRow[] = (weeklyNaryady[selectedKey] ?? []).map(toNaryadRow);

  // Дежурные для выбранного дня — с автозаполнением из ИТР
  const dayMeta: DayMeta = useMemo(() => {
    const stored = weeklyDayMeta[selectedKey];
    if (stored) return stored;
    const find = (d: string) => employees.find((e) => e.dolzhnost === d && e.status === "active")?.fio ?? "";
    return {
      dispFio:    find("Диспетчер"),
      mekhFio:    find("Механик по выпуску"),
      medFio:     find("Медик"),
      nachGarFio: "",
    };
  }, [selectedKey, weeklyDayMeta, employees]);

  const updateDayMeta = useCallback((partial: Partial<DayMeta>) => {
    setWeeklyDayMeta((prev) => ({
      ...prev,
      [selectedKey]: { ...(prev[selectedKey] ?? emptyDayMeta()), ...partial },
    }));
  }, [selectedKey, setWeeklyDayMeta]);

  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [putevoyRow, setPutevoyRow] = useState<NaryadRow | null>(null);

  const saveRows = useCallback((key: string, rows: NaryadRowStore[]) => {
    setWeeklyNaryady((prev) => ({ ...prev, [key]: rows }));
  }, [setWeeklyNaryady]);

  const buildEntries = useCallback((rows: NaryadRow[], s: NormaSettings): NaryadEntry[] =>
    rows.map((r) => {
      const calc = calcPodrabotka(r, s);
      return {
        date:           toDisplayDate(new Date(selectedKey + "T00:00:00")),
        bortovoy:       r.bortovoy,
        gos:            r.gos,
        marka:          r.marka,
        marshrut:       r.marshrut,
        fioVod:         r.fio,
        fioKond:        r.fioKond,
        putevoy:        r.putevoy,
        biletov:        r.biletov,
        terminal:       r.terminal,
        podrabotkaVod:  calc?.vod  ?? 0,
        podrabotkaKond: calc?.cond ?? 0,
      };
    }), [selectedKey]);

  useEffect(() => {
    setNaryadEntries(buildEntries(currentRows, settings));
  }, [weeklyNaryady, naryadSettings, selectedKey]); // eslint-disable-line

  // ─── Мутации ──────────────────────────────────────────────────────────────
  const updateCell = (id: number, col: keyof NaryadRow, value: string | boolean) => {
    const updated = rowsForDay(selectedKey).map((r) =>
      r.id === id ? { ...r, [col]: value } : r
    );
    saveRows(selectedKey, updated);
  };

  const updateRow = (id: number, partial: Partial<NaryadRow>) => {
    const updated = rowsForDay(selectedKey).map((r) =>
      r.id === id ? { ...r, ...partial } : r
    );
    saveRows(selectedKey, updated);
  };

  const addRow = () => {
    const cur = rowsForDay(selectedKey);
    saveRows(selectedKey, [...cur, makeEmptyRow()]);
  };

  const resetToRoutes = () => {
    saveRows(selectedKey, makeRowsFromRoutes(routes));
  };

  const deleteRow = (id: number) => {
    const cur = rowsForDay(selectedKey);
    if (cur.length === 1) return;
    saveRows(selectedKey, cur.filter((r) => r.id !== id));
  };

  const toggleDtp = (row: NaryadRow) => {
    const newDtp = !row.dtp;
    const updated = rowsForDay(selectedKey).map((r) =>
      r.id === row.id ? { ...r, dtp: newDtp } : r
    );
    saveRows(selectedKey, updated);
    const dateStr = toDisplayDate(new Date(selectedKey + "T00:00:00"));
    if (newDtp) {
      setDtpRecords((prev) => [...prev, {
        id: Date.now() + Math.random(),
        date: dateStr,
        bortovoy: row.bortovoy,
        marshrut: row.marshrut,
        fioVod: row.fio,
        fioKond: row.fioKond,
        putevoy: row.putevoy,
        vremya: "", mesto: "", opisanie: "", postradavshie: "", ushcherb: "",
        status: "new",
      }]);
    } else {
      setDtpRecords((prev) => prev.filter(
        (d) => !(d.bortovoy === row.bortovoy && d.status === "new" && d.date === dateStr)
      ));
    }
  };

  const setSetting = (key: keyof NormaSettings, val: string) =>
    setNaryadSettings((prev) => {
      const next = { ...prev, [key]: val };
      // Зеркалируем "Стоимость проезда" ↔ "Стоимость билета" — единая цена
      if (key === "stoimostProezda") next.stoimostBileta = val;
      if (key === "stoimostBileta")  next.stoimostProezda = val;
      return next;
    });

  const copyFromDay = (fromKey: string) => {
    if (!weeklyNaryady[fromKey]?.length) return;
    const copied = weeklyNaryady[fromKey].map((r) => ({
      ...r,
      id: uid(),
      podrabotka: false,
      biletov: "",
      dtp: false,
      // Путевой: +1 к номеру
      putevoy: nextPutevoy(r.putevoy),
      // Одометр: возврат предыдущего дня → выезд следующего
      odometrVyezd: r.odometrVozv || r.odometrVyezd,
      odometrVozv: "",
    }));
    saveRows(selectedKey, copied);
  };

  const prevWeek = () => {
    const d = new Date(weekMonday);
    d.setDate(d.getDate() - 7);
    setWeekMonday(d);
  };
  const nextWeek = () => {
    const d = new Date(weekMonday);
    d.setDate(d.getDate() + 7);
    setWeekMonday(d);
  };

  const selectedDate = weekDays.find((d) => toDateKey(d) === selectedKey) ?? weekDays[0];
  const displayDate  = toDisplayDate(selectedDate);
  const monthYear    = toMonthYear(selectedDate);

  return {
    // данные
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
    DAY_NAMES,
    // сеттеры состояния
    setSelectedKey,
    setWeekMonday,
    setActiveTab,
    setActiveCell,
    setShowSettings,
    setPutevoyRow,
    // мутации
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
  };
};
