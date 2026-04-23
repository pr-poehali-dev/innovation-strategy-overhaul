import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/appStore";
import { loadKassa } from "@/pages/kassa/kassaShared";
import {
  LS_VEDOMOST,
  loadVedomostRows,
  VedomostRow,
  ColKey,
  COLS,
  NACH_KEYS,
  UDERZH_KEYS,
  emptyRow,
  calcRow,
  toNum,
  currentMonthKey,
} from "./types";

export const useVedomostLogic = () => {
  const { employees } = useAppStore();
  const [rows, setRows] = useState<VedomostRow[]>(() => {
    const saved = loadVedomostRows();
    return saved.length > 0 ? saved : [emptyRow(), emptyRow(), emptyRow()];
  });
  const [activeCell, setActiveCell] = useState<{ rowId: number; col: ColKey } | null>(null);
  const [monthKey, setMonthKey] = useState<string>(currentMonthKey());
  // Тик для перечитывания кассы — инкрементим при событии "касса-обновилась"
  const [kassaTick, setKassaTick] = useState(0);

  useEffect(() => {
    try { localStorage.setItem(LS_VEDOMOST, JSON.stringify(rows)); } catch (e) { console.warn(e); }
  }, [rows]);

  // Суммы по ФИО за выбранный месяц: nachisl (Подр.вод) + poluchPodrab (выданное)
  const kassaAgg = useMemo(() => {
    const kassa = loadKassa();
    const acc: Record<string, { nachisl: number; poluch: number }> = {};
    Object.entries(kassa).forEach(([dateKey, day]) => {
      if (!dateKey.startsWith(monthKey + "-")) return;
      const kassaRows = (day as { rows?: Array<{ fioVod?: string; fioCond?: string; podrVod?: string; podrCond?: string; podrVodVydano?: boolean; podrCondVydano?: boolean }> })?.rows;
      if (!Array.isArray(kassaRows)) return;
      kassaRows.forEach((r) => {
        const pv = parseFloat((r.podrVod || "0").replace(",", ".")) || 0;
        const pc = parseFloat((r.podrCond || "0").replace(",", ".")) || 0;
        if (r.fioVod && pv > 0) {
          const k = r.fioVod.trim();
          if (!acc[k]) acc[k] = { nachisl: 0, poluch: 0 };
          acc[k].nachisl += pv;
          if (r.podrVodVydano) acc[k].poluch += pv;
        }
        if (r.fioCond && r.fioCond !== "без" && pc > 0) {
          const k = r.fioCond.trim();
          if (!acc[k]) acc[k] = { nachisl: 0, poluch: 0 };
          acc[k].nachisl += pc;
          if (r.podrCondVydano) acc[k].poluch += pc;
        }
      });
    });
    return acc;
    // kassaTick форсирует перечитывание при событии kassa-updated / storage
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey, kassaTick]);

  // Подписка на изменения Кассы: своё окно (CustomEvent) + другие вкладки (storage)
  useEffect(() => {
    const bump = () => setKassaTick((t) => t + 1);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "dat_kassa_v1" || e.key === null) bump();
    };
    window.addEventListener("kassa-updated", bump);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("kassa-updated", bump);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Автоприменение сумм из Кассы в строки Ведомости.
  // 1) Обновляет nachisl и poluchPodrab у ФИО, которые уже есть в ведомости.
  // 2) Добавляет новых сотрудников из Кассы, которых ещё нет в ведомости.
  // Ручные поля (НДФЛ, аванс и т.д.) не трогаются.
  useEffect(() => {
    setRows((prev) => {
      let changed = false;
      const existingFios = new Set(
        prev.map((r) => (r.fio || "").trim()).filter(Boolean)
      );
      const next = prev.map((r) => {
        const fio = (r.fio || "").trim();
        if (!fio) return r;
        const agg = kassaAgg[fio] || { nachisl: 0, poluch: 0 };
        const newNachisl = String(Math.round(agg.nachisl));
        const newPoluch  = String(Math.round(agg.poluch));
        const curNachisl = String(Math.round(parseFloat((r.nachisl || "0").replace(",", ".")) || 0));
        const curPoluch  = String(Math.round(parseFloat((r.poluchPodrab || "0").replace(",", ".")) || 0));
        if (curNachisl === newNachisl && curPoluch === newPoluch) return r;
        changed = true;
        return { ...r, nachisl: newNachisl, poluchPodrab: newPoluch };
      });
      // Добавляем ФИО из Кассы, которых ещё нет в ведомости
      const toAdd: VedomostRow[] = [];
      Object.entries(kassaAgg).forEach(([fio, agg]) => {
        if (!fio || existingFios.has(fio)) return;
        if (agg.nachisl <= 0 && agg.poluch <= 0) return;
        toAdd.push({
          ...emptyRow(),
          fio,
          nachisl:      String(Math.round(agg.nachisl)),
          poluchPodrab: String(Math.round(agg.poluch)),
        });
      });
      if (toAdd.length > 0) {
        changed = true;
        return [...next, ...toAdd];
      }
      return changed ? next : prev;
    });
  }, [kassaAgg]);

  // Автосинхронизация: добавить всех активных водителей/кондукторов из Кадров + заполнить Начислено и Получ.Подраб.
  const syncFromKadryAndKassa = () => {
    const staff = employees.filter((e) => e.status === "active" && (e.dolzhnost === "Водитель" || e.dolzhnost === "Кондуктор"));
    setRows((prev) => {
      const byFio = new Map(prev.filter((r) => r.fio).map((r) => [r.fio.trim(), r]));
      const result: VedomostRow[] = staff.map((e) => {
        const existing = byFio.get(e.fio.trim());
        const agg = kassaAgg[e.fio.trim()] || { nachisl: 0, poluch: 0 };
        const base = existing ?? emptyRow();
        // Всегда берём актуальные суммы из Кассы, даже если 0 —
        // чтобы при снятии галочки «выдано» значение в ведомости уменьшилось.
        return {
          ...base,
          fio: e.fio,
          nachisl:      String(Math.round(agg.nachisl)),
          poluchPodrab: String(Math.round(agg.poluch)),
        };
      });
      // Сохраняем строки, которые не нашлись в Кадрах (ручные)
      const staffFios = new Set(staff.map((s) => s.fio.trim()));
      const manual = prev.filter((r) => r.fio && !staffFios.has(r.fio.trim()));
      return result.length > 0 ? [...result, ...manual] : prev;
    });
  };

  const updateCell = (id: number, col: ColKey, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [col]: value } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const deleteRow = (id: number) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      if (colIdx + 1 < COLS.length) {
        setActiveCell({ rowId: rows[rowIdx].id, col: COLS[colIdx + 1].key });
      } else if (rowIdx + 1 < rows.length) {
        setActiveCell({ rowId: rows[rowIdx + 1].id, col: COLS[0].key });
      } else {
        addRow();
        setTimeout(() => setActiveCell({ rowId: rows[rows.length - 1]?.id, col: COLS[0].key }), 0);
      }
    }
  };

  // Итого по всем строкам
  const totals = rows.reduce(
    (acc, row) => {
      const c = calcRow(row);
      NACH_KEYS.forEach((k) => { acc.nach[k] = (acc.nach[k] || 0) + toNum(row[k]); });
      UDERZH_KEYS.forEach((k) => { acc.ud[k] = (acc.ud[k] || 0) + toNum(row[k]); });
      acc.vsegaNach  += c.vsegaNach;
      acc.vsegaUd    += c.vsegaUd;
      acc.vsegaPoluch += c.vsegaPoluch;
      acc.ostatok    += c.ostatok;
      return acc;
    },
    {
      nach: {} as Record<string, number>,
      ud:   {} as Record<string, number>,
      vsegaNach: 0, vsegaUd: 0, vsegaPoluch: 0, ostatok: 0,
    }
  );

  return {
    rows,
    activeCell,
    setActiveCell,
    monthKey,
    setMonthKey,
    syncFromKadryAndKassa,
    updateCell,
    addRow,
    deleteRow,
    handleKeyDown,
    totals,
  };
};
