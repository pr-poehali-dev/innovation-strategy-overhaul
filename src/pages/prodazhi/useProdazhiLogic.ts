import { useState, useEffect, useMemo, useRef } from "react";
import { useAppStore, getGrafiki } from "@/store/appStore";
import { calcPodrabotka } from "@/pages/dispatch/types";
import {
  ProdazhiRow, ColKey, COLUMNS,
  LS_PRODAZHI, LS_KASSA,
  loadProdazhi, saveProdazhi, loadKassaForProdazhi,
  emptyRow, toDateKey, toNum,
} from "./prodazhiShared";

const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

export const useProdazhiLogic = () => {
  const { weeklyNaryady, naryadSettings, employees, vehicles, routes } = useAppStore();
  const allGrafiki = routes.flatMap((r) => getGrafiki(r));

  const driverList = employees.filter((e) => e.dolzhnost === "Водитель"  && e.status === "active");
  const condList   = employees.filter((e) => e.dolzhnost === "Кондуктор" && e.status === "active");

  const [selectedKey, setSelectedKey] = useState(() => toDateKey(new Date()));
  const [reportDate, setReportDate] = useState(today);
  const isLoadingRef = useRef(false);

  const initDay  = toDateKey(new Date());
  const initData = loadProdazhi()[initDay];
  const [dispFio, setDispFio] = useState(() => initData?.dispFio ?? "");
  const [rows, setRows] = useState<ProdazhiRow[]>(() =>
    initData?.rows ?? Array.from({ length: 10 }, emptyRow)
  );

  // Актуальные значения для синхронного сохранения (минуя React-замыкания)
  const rowsRef     = useRef(rows);
  const dispFioRef  = useRef(dispFio);
  const keyRef      = useRef(selectedKey);
  useEffect(() => { rowsRef.current = rows; }, [rows]);
  useEffect(() => { dispFioRef.current = dispFio; }, [dispFio]);
  useEffect(() => { keyRef.current = selectedKey; }, [selectedKey]);

  const handleDateChange = (newKey: string) => {
    // Синхронно фиксируем актуальные данные для текущей даты,
    // чтобы последний ввод не потерялся при переключении.
    try {
      const data = loadProdazhi();
      data[keyRef.current] = { rows: rowsRef.current, dispFio: dispFioRef.current };
      saveProdazhi(data);
    } catch { /* noop */ }

    isLoadingRef.current = true;
    setSelectedKey(newKey);
    const fresh = loadProdazhi()[newKey];
    setRows(fresh?.rows ?? Array.from({ length: 10 }, emptyRow));
    setDispFio(fresh?.dispFio ?? "");
    setTimeout(() => { isLoadingRef.current = false; }, 0);
    if (newKey) {
      setReportDate(new Date(newKey + "T00:00:00").toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }));
    }
  };

  useEffect(() => {
    if (isLoadingRef.current) return;
    const data = loadProdazhi();
    data[selectedKey] = { rows, dispFio };
    saveProdazhi(data);
  }, [rows, dispFio, selectedKey]);

  // ─── Синхронизация из Кассы ──────────────────────────────────────────────
  const applyFromKassa = (key: string) => {
    const kassaData = loadKassaForProdazhi()[key];
    if (!kassaData?.rows) return;
    const cenaTopliva = parseFloat(naryadSettings.stoimostTopliva) || 0;

    type KassaRowMin = {
      bort?: string; rashodDt?: string;
      podrVod?: string; podrCond?: string;
      podrVodVydano?: boolean; podrCondVydano?: boolean;
      prodBilety?: string;
    };
    const byBort = new Map<string, { dt?: string; podVod?: string; podCond?: string; kolBil?: string }>();

    (kassaData.rows as KassaRowMin[]).forEach((r) => {
      if (!r.bort) return;
      const entry: { dt?: string; podVod?: string; podCond?: string; kolBil?: string } = {};
      if (r.rashodDt && parseFloat(r.rashodDt) > 0 && cenaTopliva > 0) {
        entry.dt = String(Math.round(parseFloat(r.rashodDt) / cenaTopliva * 100) / 100);
      }
      if (r.podrVodVydano  && r.podrVod  && parseFloat(r.podrVod)  > 0) entry.podVod  = r.podrVod;
      if (r.podrCondVydano && r.podrCond && parseFloat(r.podrCond) > 0) entry.podCond = r.podrCond;
      if (r.prodBilety && parseFloat(r.prodBilety) > 0) entry.kolBil = r.prodBilety;
      if (Object.keys(entry).length > 0) byBort.set(r.bort, entry);
    });

    if (byBort.size === 0) return;
    setRows((prev) => prev.map((r) => {
      const kassa = byBort.get(r.bort);
      if (!kassa) return r;
      return {
        ...r,
        ...(kassa.dt      !== undefined ? { dt:      kassa.dt }      : {}),
        ...(kassa.podVod  !== undefined ? { podVod:  kassa.podVod }  : {}),
        ...(kassa.podCond !== undefined ? { podCond: kassa.podCond } : {}),
        ...(kassa.kolBil  !== undefined ? { kolBil:  kassa.kolBil }  : {}),
      };
    }));
  };

  useEffect(() => {
    applyFromKassa(selectedKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, naryadSettings.stoimostTopliva]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KASSA) applyFromKassa(selectedKey);
      if (e.key === LS_PRODAZHI) {
        if (isLoadingRef.current) return;
        const fresh = loadProdazhi()[selectedKey];
        if (!fresh?.rows) return;
        const dtByBort = new Map<string, string>();
        (fresh.rows as Array<{ bort?: string; dt?: string }>).forEach((r) => {
          if (r.bort && r.dt) dtByBort.set(r.bort, r.dt);
        });
        if (dtByBort.size === 0) return;
        setRows((prev) => prev.map((r) => {
          const dt = dtByBort.get(r.bort);
          return dt !== undefined ? { ...r, dt } : r;
        }));
      }
    };
    // Кастомное событие: Касса обновилась в той же вкладке
    const onKassaUpdated = (e: Event) => {
      const ce = e as CustomEvent<{ key?: string }>;
      const key = ce.detail?.key;
      if (!key || key === selectedKey) applyFromKassa(selectedKey);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("kassa-updated", onKassaUpdated);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("kassa-updated", onKassaUpdated);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);

  // ─── Синхронизация из наряда ─────────────────────────────────────────────
  const naryadRows = useMemo(() => weeklyNaryady[selectedKey] ?? [], [weeklyNaryady, selectedKey]);

  useEffect(() => {
    if (!naryadRows.length) return;
    setRows((currentRows) => {
      // Индексируем ТОЛЬКО непустые борта, иначе пустые строки сольются
      const existingByBort = new Map<string, ProdazhiRow>();
      currentRows.forEach((r) => {
        if (r.bort && !existingByBort.has(r.bort)) existingByBort.set(r.bort, r);
      });
      const usedIds = new Set<number>();
      const workingRows = naryadRows.filter((r) => r.fio && !r.statusOtsutstviya);
      const mapped = workingRows.map((r) => {
        const existing = r.bortovoy ? existingByBort.get(r.bortovoy) : undefined;
        const reuse = existing && !usedIds.has(existing.id);
        const base = reuse ? existing! : emptyRow();
        if (reuse) usedIds.add(base.id);
        const calc = calcPodrabotka(r as Parameters<typeof calcPodrabotka>[0], naryadSettings);
        const existingPodVod  = reuse ? base.podVod  : "";
        const existingPodCond = reuse ? base.podCond : "";
        const newPodVod  = existingPodVod  || (calc && calc.vod  > 0 ? String(Math.round(calc.vod))  : "");
        const newPodCond = existingPodCond || (calc && calc.cond > 0 ? String(Math.round(calc.cond)) : "");
        return {
          ...base,
          bort:    r.bortovoy,
          marGr:   r.marshrut,
          fioVod:  r.fio,
          fioCond: r.fioKond || "без",
          kolBil:  r.biletov || (reuse ? base.kolBil : ""),
          podVod:  newPodVod,
          podCond: newPodCond,
        };
      });
      // После синка из наряда сразу догружаем кассу, чтобы перезаписать подработку из факта выдачи
      setTimeout(() => applyFromKassa(selectedKey), 0);
      return mapped;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naryadRows, naryadSettings]);

  // ─── Обработчики ─────────────────────────────────────────────────────────
  const updateCell = (id: number, col: ColKey, value: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [col]: value } : r)));

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const deleteRow = (id: number) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    if (e.key !== "Tab" && e.key !== "Enter") return;
    e.preventDefault();
    if (colIdx + 1 < COLUMNS.length) {
      setActiveCell({ rowId: rows[rowIdx].id, col: COLUMNS[colIdx + 1].key });
    } else if (rowIdx + 1 < rows.length) {
      setActiveCell({ rowId: rows[rowIdx + 1].id, col: COLUMNS[0].key });
    } else {
      addRow();
      setTimeout(() => setActiveCell({ rowId: rows[rows.length - 1]?.id, col: COLUMNS[0].key }), 0);
    }
  };

  const getSum = (col: ColKey) =>
    rows.reduce((acc, r) => acc + toNum(r[col] as string), 0);

  const vsegoVyshlo = rows.filter((r) => r.fioVod && !["вых", "отп", "рем"].includes(r.marGr)).length;
  const vsegoVykhod = rows.filter((r) => ["вых", "отп", "рем"].includes(r.marGr)).length;

  return {
    selectedKey, reportDate, naryadRows,
    rows, dispFio, setDispFio,
    activeCell, setActiveCell,
    driverList, condList, vehicles, allGrafiki,
    handleDateChange,
    updateCell, addRow, deleteRow, handleKeyDown,
    getSum, vsegoVyshlo, vsegoVykhod,
  };
};