import { useState, useEffect, useMemo, useRef } from "react";
import { useAppStore } from "@/store/appStore";
import { calcPodrabotka } from "@/pages/dispatch/types";
import { loadVedomostRows, calcVedomostRow } from "@/pages/Vedomost";
import {
  KassaRow, VyplataRow, ChastRow, Day, MonthlyKassaRow,
  MAIN_COLS, VYP_COLS,
  toNum, emptyRow, emptyVyp, emptyChastRow,
} from "./kassaTypes";
import {
  LS_PRODAZHI, LS_VEDOMOST,
  loadKassa, saveKassa, loadProdazhiAll, toDateKey,
  PodrabJournalEntry,
} from "./kassaShared";

export const useKassaLogic = () => {
  const { weeklyNaryady, naryadSettings, employees } = useAppStore();

  const [tab, setTab] = useState<"kassa" | "chast" | "podrab" | "monthly">("kassa");
  const [selectedKey, setSelectedKey] = useState(() => toDateKey(new Date()));
  const [monthKey, setMonthKey] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [rows, setRows] = useState<KassaRow[]>(() => {
    const saved = loadKassa()[toDateKey(new Date())];
    return saved?.rows ?? Array.from({ length: 12 }, () => emptyRow());
  });
  const [vyplaty, setVyplaty] = useState<VyplataRow[]>(() => {
    const saved = loadKassa()[toDateKey(new Date())];
    return saved?.vyplaty ?? Array.from({ length: 10 }, emptyVyp);
  });
  // Обязательные ежедневные расходы (вычитаются из дневного итого).
  // Дефолты тянутся из настроек Наряда (zpVodDezhurki / dezhDt / hozNuzhdyGarazh).
  const [dailyFixed, setDailyFixed] = useState<{ zpVodDezhurki: string; dezhDt: string; hozNuzhdyGarazh: string }>(() => {
    const saved = loadKassa()[toDateKey(new Date())];
    return saved?.dailyFixed ?? {
      zpVodDezhurki: naryadSettings.zpVodDezhurki || "",
      dezhDt:        naryadSettings.dezhDt        || "",
      hozNuzhdyGarazh: naryadSettings.hozNuzhdyGarazh || "",
    };
  });
  const [activeCell, setActiveCell] = useState<{ rowId: number; col: string } | null>(null);
  const [activeVyp, setActiveVyp] = useState<{ rowId: number; col: string } | null>(null);

  const isLoadingRef = useRef(false);

  // Актуальные значения для синхронного сохранения при смене даты
  const rowsRef       = useRef(rows);
  const vyplatyRef    = useRef(vyplaty);
  const dailyFixedRef = useRef(dailyFixed);
  const keyRef        = useRef(selectedKey);
  useEffect(() => { rowsRef.current = rows; },             [rows]);
  useEffect(() => { vyplatyRef.current = vyplaty; },       [vyplaty]);
  useEffect(() => { dailyFixedRef.current = dailyFixed; }, [dailyFixed]);
  useEffect(() => { keyRef.current = selectedKey; },       [selectedKey]);

  const handleDateChange = (newKey: string) => {
    // Синхронно сохраняем актуальные данные текущей даты (из refs — минуя замыкание)
    try {
      const data = loadKassa();
      data[keyRef.current] = {
        rows: rowsRef.current,
        vyplaty: vyplatyRef.current,
        dailyFixed: dailyFixedRef.current,
      };
      saveKassa(data);
    } catch { /* noop */ }

    isLoadingRef.current = true;
    setSelectedKey(newKey);
    const saved = loadKassa()[newKey];
    setRows(saved?.rows ?? Array.from({ length: 12 }, () => emptyRow()));
    setVyplaty(saved?.vyplaty ?? Array.from({ length: 10 }, emptyVyp));
    setDailyFixed(saved?.dailyFixed ?? {
      zpVodDezhurki: naryadSettings.zpVodDezhurki || "",
      dezhDt:        naryadSettings.dezhDt        || "",
      hozNuzhdyGarazh: naryadSettings.hozNuzhdyGarazh || "",
    });
    setTimeout(() => { isLoadingRef.current = false; }, 0);
  };

  useEffect(() => {
    if (isLoadingRef.current) return;
    const data = loadKassa();
    data[selectedKey] = { rows, vyplaty, dailyFixed };
    saveKassa(data);
    // Уведомляем модуль "Продажи" в той же вкладке, что касса обновилась
    try { window.dispatchEvent(new CustomEvent("kassa-updated", { detail: { key: selectedKey } })); } catch { /* noop */ }
  }, [rows, vyplaty, dailyFixed, selectedKey]);

  // ─── Живая синхронизация дефолтов фиксированных расходов из Настроек ──────
  // Если для текущей даты в кассе ещё НЕ было явно сохранённых значений — подтягиваем
  // свежие значения из naryadSettings. Как только пользователь отредактировал поле
  // в Кассе (значение отличается от дефолта в saved), оно считается «своим» и не перезаписывается.
  useEffect(() => {
    if (isLoadingRef.current) return;
    const saved = loadKassa()[selectedKey]?.dailyFixed;
    if (saved) return; // уже есть сохранённое — не трогаем
    const fromSettings = {
      zpVodDezhurki:   naryadSettings.zpVodDezhurki   || "",
      dezhDt:          naryadSettings.dezhDt          || "",
      hozNuzhdyGarazh: naryadSettings.hozNuzhdyGarazh || "",
    };
    setDailyFixed((prev) =>
      prev.zpVodDezhurki === fromSettings.zpVodDezhurki &&
      prev.dezhDt === fromSettings.dezhDt &&
      prev.hozNuzhdyGarazh === fromSettings.hozNuzhdyGarazh
        ? prev
        : fromSettings
    );
  }, [naryadSettings.zpVodDezhurki, naryadSettings.dezhDt, naryadSettings.hozNuzhdyGarazh, selectedKey]);

  const updateDailyFixed = (key: keyof typeof dailyFixed, val: string) =>
    setDailyFixed((prev) => ({ ...prev, [key]: val }));

  const [chastRows, setChastRows] = useState<ChastRow[]>(() =>
    employees
      .filter((e) => e.status === "active")
      .sort((a, b) => a.fio.localeCompare(b.fio, "ru"))
      .map((e) => emptyChastRow(e.fio, ""))
      .concat(Array.from({ length: 30 }, () => emptyChastRow()))
  );

  const naryadRows = useMemo(() => weeklyNaryady[selectedKey] ?? [], [weeklyNaryady, selectedKey]);

  // Синхронизация из наряда
  useEffect(() => {
    if (!naryadRows.length) return;
    const cena = parseFloat(naryadSettings.stoimostProezda || naryadSettings.stoimostBileta) || 0;
    setRows((currentRows) => {
      // Индексируем только по НЕпустым бортам — иначе все пустые строки
      // сольются в один ключ "" и дадут дубли id в syncedRows.
      const existingByBort = new Map<string, KassaRow>();
      currentRows.forEach((r) => {
        if (r.bort && !existingByBort.has(r.bort)) existingByBort.set(r.bort, r);
      });
      const usedIds = new Set<number>();
      const workingRows = naryadRows.filter((r) => r.fio && !r.statusOtsutstviya);
      const syncedRows: KassaRow[] = workingRows.map((r) => {
        const existing = r.bortovoy ? existingByBort.get(r.bortovoy) : undefined;
        // если existing уже использован этим циклом (двойное совпадение по борту) —
        // создаём новую строку с уникальным id
        const reuse = existing && !usedIds.has(existing.id);
        const existingRow = reuse ? existing! : emptyRow();
        if (reuse) usedIds.add(existingRow.id);
        const hasCond = !!(r.fioKond && r.fioKond.trim());
        const obedAuto = hasCond
          ? (naryadSettings.obedVodKond ?? "300")
          : (naryadSettings.obedVod ?? "150");

        // Подработка: сначала пробуем из наряда, потом из выручки кассы
        const calc = calcPodrabotka(r as Parameters<typeof calcPodrabotka>[0], naryadSettings);
        let podrVod  = calc && calc.vod  > 0 ? String(Math.round(calc.vod))  : "";
        let podrCond = calc && calc.cond > 0 ? String(Math.round(calc.cond)) : "";

        // Если наряд не дал подработку но галочка стоит — считаем из выручки кассы
        if (r.podrabotka && !podrVod && existingRow.viruchka) {
          const v = toNum(existingRow.viruchka);
          const topRub = (parseFloat(naryadSettings.rashod) / 100) * (v / cena) * (parseFloat(naryadSettings.stoimostTopliva) || 0);
          const vyuchka = v - topRub;
          if (vyuchka > 0) {
            const routeNum = r.marshrut.split("/")[0].trim();
            if (routeNum === "6" && !hasCond) {
              podrVod = naryadSettings.fixedRoute6 || "0";
            } else if (!hasCond) {
              podrVod = String(Math.round(vyuchka * (parseFloat(naryadSettings.procentBez) / 100)));
            } else {
              podrVod  = String(Math.round(vyuchka * (parseFloat(naryadSettings.procentVodS)  / 100)));
              podrCond = String(Math.round(vyuchka * (parseFloat(naryadSettings.procentCondS) / 100)));
            }
          }
        }
        // Если были старые значения и новые пустые — оставляем старые
        if (!podrVod)  podrVod  = existingRow.podrVod;
        if (!podrCond) podrCond = existingRow.podrCond;
        const kolBil = r.biletov || existingRow.kolBil;
        const viruchka = reuse
          ? existingRow.viruchka
          : (() => {
              const kol = parseFloat(kolBil) || 0;
              const bez = toNum(existingRow.beznal);
              const qrV = toNum(existingRow.qr);
              return (kol || bez || qrV) ? String(Math.round(kol * cena + bez + qrV)) : "";
            })();
        const prodBilety = viruchka && cena
          ? String(Math.round(toNum(viruchka) / cena))
          : existingRow.prodBilety;
        const rashodDt = existingRow.rashodDt;
        const itogo = (() => {
          const v  = toNum(viruchka), bez = toNum(existingRow.beznal), qrV = toNum(existingRow.qr);
          const o  = toNum(obedAuto), rd = toNum(rashodDt);
          const ch = toNum(existingRow.chek), vz = toNum(existingRow.vozvrat);
          const pv = toNum(podrVod), pk = toNum(podrCond);
          const pl = toNum(existingRow.vPlus);
          const any = v || bez || qrV || o || rd || ch || vz || pv || pk || pl;
          return any ? String(Math.round(v - bez - qrV - o - rd - ch - vz - pv - pk + pl)) : existingRow.itogo;
        })();
        // Подтягиваем № водительского удостоверения из Кадров по ФИО
        const empRec = employees.find(
          (e) => e.fio === r.fio || (r.fio && e.fio && r.fio.startsWith(e.fio.split(" ")[0]))
        );
        const vodUd = empRec?.udostoverenie || existingRow.vodUdostoverenie || "";
        return {
          ...existingRow,
          type: "route" as const,
          mar: r.marshrut, bort: r.bortovoy,
          fioVod: r.fio, vodUdostoverenie: vodUd, fioCond: r.fioKond || "без",
          kolBil, viruchka, prodBilety, obed: obedAuto,
          podrVod, podrCond,
          podrVodVydano:  existingRow.podrVodVydano  ?? false,
          podrCondVydano: existingRow.podrCondVydano ?? false,
          podrabotkaNaryad: !!r.podrabotka,
          itogo,
        };
      });
      const dispRows = currentRows.filter((r) => r.type === "disp");
      return [...syncedRows, ...dispRows];
    });
  }, [naryadRows, naryadSettings, selectedKey, employees]);

  // ─── Расчётные поля ──────────────────────────────────────────────────────
  const calcViruchka = (r: KassaRow, overrides: Partial<KassaRow> = {}): string => {
    const row    = { ...r, ...overrides };
    const kol    = toNum(row.kolBil);
    const beznal = toNum(row.beznal);
    const qr     = toNum(row.qr);
    const cena   = parseFloat(naryadSettings.stoimostProezda || naryadSettings.stoimostBileta) || 0;
    if (!kol && !beznal && !qr) return "";
    return String(Math.round(kol * cena + beznal + qr));
  };

  const calcProdBilety = (viruchka: string): string => {
    const v    = toNum(viruchka);
    const cena = parseFloat(naryadSettings.stoimostProezda || naryadSettings.stoimostBileta) || 0;
    if (!v || !cena) return "";
    return String(Math.round(v / cena));
  };

  const calcItogo = (r: KassaRow, overrides: Partial<KassaRow> = {}): string => {
    const row  = { ...r, ...overrides };
    const v    = toNum(row.viruchka);
    const bez  = toNum(row.beznal);
    const qr   = toNum(row.qr);
    const obed = toNum(row.obed);
    const rDt  = toNum(row.rashodDt);
    const chek = toNum(row.chek);
    const vozv = toNum(row.vozvrat);
    const pvod = toNum(row.podrVod);
    const pkond= toNum(row.podrCond);
    const plus = toNum(row.vPlus);
    if (!v && !bez && !qr && !obed && !rDt && !chek && !vozv && !pvod && !pkond && !plus) return "";
    return String(Math.round(v - bez - qr - obed - rDt - chek - vozv - pvod - pkond + plus));
  };

  const ITOGO_DEPS = new Set<keyof KassaRow>([
    "viruchka", "beznal", "qr", "obed", "rashodDt", "chek", "vozvrat", "podrVod", "podrCond", "vPlus",
  ]);

  // ─── Обработчики кассы ───────────────────────────────────────────────────
  const updateCell = (id: number, col: keyof KassaRow, value: string) =>
    setRows((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const updated: KassaRow = { ...r, [col]: value };
      if (col === "kolBil" || col === "beznal" || col === "qr") {
        updated.viruchka   = calcViruchka(r, { [col]: value });
        updated.prodBilety = calcProdBilety(updated.viruchka);
        // Пересчитываем подработку из новой выручки
        const newV = toNum(updated.viruchka);
        const cenaP = parseFloat(naryadSettings.stoimostProezda || naryadSettings.stoimostBileta) || 0;
        if (newV > 0 && cenaP > 0) {
          const topRub = (parseFloat(naryadSettings.rashod) / 100) * (newV / cenaP) * (parseFloat(naryadSettings.stoimostTopliva) || 0);
          const vyuchkaP = newV - topRub;
          const hasCond = !!(r.fioCond && r.fioCond !== "без" && r.fioCond.trim());
          const routeNum = r.mar?.split("/")[0]?.trim();
          if (routeNum === "6" && !hasCond) {
            updated.podrVod  = naryadSettings.fixedRoute6 || "0";
            updated.podrCond = "";
          } else if (!hasCond) {
            updated.podrVod  = vyuchkaP > 0 ? String(Math.round(vyuchkaP * (parseFloat(naryadSettings.procentBez) / 100))) : "";
            updated.podrCond = "";
          } else {
            updated.podrVod  = vyuchkaP > 0 ? String(Math.round(vyuchkaP * (parseFloat(naryadSettings.procentVodS)  / 100))) : "";
            updated.podrCond = vyuchkaP > 0 ? String(Math.round(vyuchkaP * (parseFloat(naryadSettings.procentCondS) / 100))) : "";
          }
        }
        updated.itogo = calcItogo(r, { [col]: value, viruchka: updated.viruchka, podrVod: updated.podrVod, podrCond: updated.podrCond });
      }
      if (col === "viruchka") {
        updated.prodBilety = calcProdBilety(value);
        // Пересчитываем подработку из новой выручки
        const v = toNum(value);
        const cena = parseFloat(naryadSettings.stoimostProezda || naryadSettings.stoimostBileta) || 0;
        if (v > 0 && cena > 0) {
          const topRub = (parseFloat(naryadSettings.rashod) / 100) * (v / cena) * (parseFloat(naryadSettings.stoimostTopliva) || 0);
          const vyuchka = v - topRub;
          const hasCond = !!(r.fioCond && r.fioCond !== "без" && r.fioCond.trim());
          const routeNum = r.mar?.split("/")[0]?.trim();
          if (routeNum === "6" && !hasCond) {
            updated.podrVod  = naryadSettings.fixedRoute6 || "0";
            updated.podrCond = "";
          } else if (!hasCond) {
            updated.podrVod  = vyuchka > 0 ? String(Math.round(vyuchka * (parseFloat(naryadSettings.procentBez) / 100))) : "";
            updated.podrCond = "";
          } else {
            updated.podrVod  = vyuchka > 0 ? String(Math.round(vyuchka * (parseFloat(naryadSettings.procentVodS)  / 100))) : "";
            updated.podrCond = vyuchka > 0 ? String(Math.round(vyuchka * (parseFloat(naryadSettings.procentCondS) / 100))) : "";
          }
        }
        updated.itogo = calcItogo(r, { viruchka: value, podrVod: updated.podrVod, podrCond: updated.podrCond });
      }
      if (ITOGO_DEPS.has(col) && col !== "viruchka" && col !== "kolBil" && col !== "beznal" && col !== "qr") {
        updated.itogo = calcItogo(r, { [col]: value });
      }
      if (col === "rashodDt" && r.bort) {
        const cenaTopliva = parseFloat(naryadSettings.stoimostTopliva) || 0;
        if (cenaTopliva && toNum(value) > 0) {
          const litry = String(Math.round(toNum(value) / cenaTopliva * 100) / 100);
          const prodAll = loadProdazhiAll();
          const prodDay = prodAll[selectedKey];
          if (prodDay?.rows) {
            prodDay.rows = (prodDay.rows as Array<Record<string, string>>).map((pr) =>
              pr.bort === r.bort ? { ...pr, dt: litry } : pr
            );
            prodAll[selectedKey] = prodDay;
            try {
              localStorage.setItem(LS_PRODAZHI, JSON.stringify(prodAll));
              window.dispatchEvent(new StorageEvent("storage", { key: LS_PRODAZHI }));
            } catch (e) { console.warn(e); }
          }
        }
      }
      return updated;
    }));

  const addRow = (type: KassaRow["type"] = "route") =>
    setRows((prev) => [...prev, emptyRow(type)]);

  const deleteRow = (id: number) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    if (e.key !== "Tab" && e.key !== "Enter") return;
    e.preventDefault();
    if (colIdx + 1 < MAIN_COLS.length) {
      setActiveCell({ rowId: rows[rowIdx].id, col: MAIN_COLS[colIdx + 1].key });
    } else if (rowIdx + 1 < rows.length) {
      setActiveCell({ rowId: rows[rowIdx + 1].id, col: MAIN_COLS[0].key });
    }
  };

  // ─── Обработчики выплат ──────────────────────────────────────────────────
  const updateVyp = (id: number, col: keyof VyplataRow, val: string) => {
    setVyplaty((prev) => prev.map((v) => {
      if (v.id !== id) return v;
      const updated = { ...v, [col]: val };
      if (col === "summa" || col === "kol") {
        const s = toNum(col === "summa" ? val : updated.summa);
        const k = toNum(col === "kol"   ? val : updated.kol);
        updated.itogo = s && k ? String(Math.round(s * k)) : "";
      }
      return updated;
    }));
  };

  const addVyp = () => setVyplaty((prev) => [...prev, emptyVyp()]);
  const deleteVyp = (id: number) => setVyplaty((prev) => prev.filter((v) => v.id !== id));

  const handleVypKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    if (e.key !== "Tab" && e.key !== "Enter") return;
    e.preventDefault();
    if (colIdx + 1 < VYP_COLS.length) {
      setActiveVyp({ rowId: vyplaty[rowIdx].id, col: VYP_COLS[colIdx + 1].key });
    } else if (rowIdx + 1 < vyplaty.length) {
      setActiveVyp({ rowId: vyplaty[rowIdx + 1].id, col: VYP_COLS[0].key });
    }
  };

  // ─── Обработчики частичной выдачи ───────────────────────────────────────
  const updateChast = (id: number, field: "fio" | "nachisleno", val: string) =>
    setChastRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: val } : r));

  const updateChastDay = (id: number, day: Day, val: string) =>
    setChastRows((prev) => prev.map((r) => r.id === id ? { ...r, vyplaty: { ...r.vyplaty, [day]: val } } : r));

  const addChastRow = () => setChastRows((prev) => [...prev, emptyChastRow()]);

  // ─── Синхронизация ───────────────────────────────────────────────────────
  const syncFromVedomost = () => {
    const vedRows = loadVedomostRows();
    setChastRows((prev) => prev.map((r) => {
      if (!r.fio) return r;
      const vedRow = vedRows.find((v: { fio?: string }) => v.fio === r.fio);
      if (!vedRow) return r;
      const { ostatok } = calcVedomostRow(vedRow);
      return { ...r, nachisleno: ostatok !== 0 ? String(Math.round(ostatok)) : r.nachisleno };
    }));
  };

  const syncBeznal = () => {
    const prodAll = loadProdazhiAll();
    const prodDay = prodAll[selectedKey];
    if (!prodDay?.rows) return;
    const validByBort = new Map<string, string>();
    (prodDay.rows as Array<{ bort?: string; valid?: string }>).forEach((r) => {
      if (r.bort && r.valid) validByBort.set(r.bort, r.valid);
    });
    if (validByBort.size === 0) return;
    setRows((prev) => prev.map((r) => {
      const val = validByBort.get(r.bort);
      if (!val) return r;
      // Пересчитываем выручку и ИТОГО с новым безналом
      const updated = { ...r, beznal: val };
      updated.viruchka = calcViruchka(updated);
      updated.prodBilety = calcProdBilety(updated.viruchka);
      updated.itogo = calcItogo(updated);
      return updated;
    }));
  };

  // ─── Автосинхронизация безнала из Продаж ────────────────────────────────
  useEffect(() => {
    const runSync = () => {
      const prodAll = loadProdazhiAll();
      const prodDay = prodAll[selectedKey];
      if (!prodDay?.rows) return;
      const validByBort = new Map<string, string>();
      (prodDay.rows as Array<{ bort?: string; valid?: string }>).forEach((r) => {
        if (r.bort && r.valid) validByBort.set(r.bort, r.valid);
      });
      if (validByBort.size === 0) return;
      setRows((prev) => {
        let changed = false;
        const next = prev.map((r) => {
          if (!r.bort) return r;
          const val = validByBort.get(r.bort);
          if (!val || val === r.beznal) return r;
          changed = true;
          const updated = { ...r, beznal: val };
          updated.viruchka = calcViruchka(updated);
          updated.prodBilety = calcProdBilety(updated.viruchka);
          updated.itogo = calcItogo(updated);
          return updated;
        });
        return changed ? next : prev;
      });
    };
    runSync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_PRODAZHI || e.key === null) runSync();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, naryadRows.length]);

  // ─── Подработка: выдача + синхронизация в Ведомость ─────────────────────
  const syncPodrToVedomost = (fio: string, summa: string) => {
    if (!fio || !summa) return;
    try {
      const raw = localStorage.getItem(LS_VEDOMOST);
      if (!raw) return;
      const vedRows = JSON.parse(raw) as Array<Record<string, string>>;
      const cur = vedRows.find((v) => v.fio === fio);
      if (!cur) return;
      const prev = parseFloat(cur.poluchPodrab || "0") || 0;
      const add  = parseFloat(summa) || 0;
      cur.poluchPodrab = String(Math.round(prev + add));
      localStorage.setItem(LS_VEDOMOST, JSON.stringify(vedRows));
    } catch (e) { console.warn(e); }
  };

  const toggleVydano = (id: number, who: "vod" | "cond") => {
    setRows((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const field    = who === "vod" ? "podrVodVydano"  : "podrCondVydano";
      const sumField = who === "vod" ? "podrVod" : "podrCond";
      const fio      = who === "vod" ? r.fioVod : r.fioCond;
      const newVal   = !r[field];
      const summa    = r[sumField];
      if (newVal) {
        syncPodrToVedomost(fio, summa);
      } else {
        try {
          const raw = localStorage.getItem(LS_VEDOMOST);
          if (raw) {
            const vedRows = JSON.parse(raw) as Array<Record<string, string>>;
            const cur = vedRows.find((v) => v.fio === fio);
            if (cur) {
              const prev = parseFloat(cur.poluchPodrab || "0") || 0;
              const sub  = parseFloat(summa) || 0;
              cur.poluchPodrab = String(Math.max(0, Math.round(prev - sub)));
              localStorage.setItem(LS_VEDOMOST, JSON.stringify(vedRows));
            }
          }
        } catch (e) { console.warn(e); }
      }
      return { ...r, [field]: newVal };
    }));
  };

  // ─── Журнал выдачи подработок за месяц ──────────────────────────────────
  const podrabJournal = useMemo((): PodrabJournalEntry[] => {
    const kassaAll = loadKassa();
    const result: PodrabJournalEntry[] = [];
    Object.entries(kassaAll).forEach(([dateKey, dayData]) => {
      if (!dateKey.startsWith(monthKey)) return;
      const dayRows: KassaRow[] = dayData?.rows ?? [];
      dayRows.forEach((r) => {
        if (!r.bort || r.type === "disp") return;
        if (!toNum(r.podrVod) && !toNum(r.podrCond)) return;
        result.push({
          dateKey, bort: r.bort, mar: r.mar,
          fioVod: r.fioVod, fioCond: r.fioCond,
          podrVod: r.podrVod, podrCond: r.podrCond,
          vodVyd: r.podrVodVydano ?? false,
          condVyd: r.podrCondVydano ?? false,
        });
      });
    });
    return result.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [rows, monthKey]);

  // ─── Месячный отчёт ──────────────────────────────────────────────────────
  const monthlyRows = useMemo((): MonthlyKassaRow[] => {
    const prodAll = loadProdazhiAll();
    const kassaAll = loadKassa();
    const map = new Map<string, MonthlyKassaRow>();
    Object.entries(kassaAll).forEach(([dateKey, dayData]) => {
      if (!dateKey.startsWith(monthKey)) return;
      const dayRows: KassaRow[] = dayData?.rows ?? [];
      const prodDay = prodAll[dateKey];
      const validByBort = new Map<string, string>();
      if (prodDay?.rows) {
        (prodDay.rows as Array<{ bort?: string; valid?: string }>).forEach((r) => {
          if (r.bort && r.valid) validByBort.set(r.bort, r.valid);
        });
      }
      dayRows.filter((r) => r.bort && r.type !== "disp").forEach((r) => {
        const bortKey = r.bort;
        const beznalVal = toNum(r.beznal) > 0
          ? toNum(r.beznal)
          : toNum(validByBort.get(r.bort) ?? "0");
        const dayEntry = {
          kolBil: toNum(r.kolBil), beznal: beznalVal,
          qr: toNum(r.qr), viruchka: toNum(r.viruchka),
          obed: toNum(r.obed), rashodDt: toNum(r.rashodDt),
          chek: toNum(r.chek), vozvrat: toNum(r.vozvrat),
          podrVod: toNum(r.podrVod), podrCond: toNum(r.podrCond),
          vPlus: toNum(r.vPlus), itogo: toNum(r.itogo),
        };
        if (!map.has(bortKey)) {
          map.set(bortKey, {
            id: Math.random() * 1e15 + performance.now(),
            bort: r.bort, mar: r.mar, fioVod: r.fioVod, fioCond: r.fioCond,
            kolBil: 0, beznal: 0, qr: 0, viruchka: 0,
            obed: 0, rashodDt: 0, chek: 0, vozvrat: 0,
            podrVod: 0, podrCond: 0, vPlus: 0, itogo: 0,
            byDay: {},
          });
        }
        const existing = map.get(bortKey)!;
        if (r.fioVod) existing.fioVod = r.fioVod;
        if (r.fioCond && r.fioCond !== "без") existing.fioCond = r.fioCond;
        (Object.keys(dayEntry) as (keyof typeof dayEntry)[]).forEach((k) => {
          (existing[k] as number) += dayEntry[k];
        });
        existing.byDay[dateKey] = dayEntry;
      });
    });
    return Array.from(map.values()).sort((a, b) => {
      const an = parseInt(a.mar.split("/")[0]) || 0;
      const bn = parseInt(b.mar.split("/")[0]) || 0;
      return an !== bn ? an - bn : a.bort.localeCompare(b.bort);
    });
  }, [rows, monthKey]);

  // ─── Обязательные расходы по дням за месяц ──────────────────────────────
  const monthlyFixed = useMemo(() => {
    const kassaAll = loadKassa();
    const byDay: Record<string, { zpVodDezhurki: number; dezhDt: number; hozNuzhdyGarazh: number; total: number }> = {};
    let totZp = 0, totDt = 0, totHoz = 0;
    Object.entries(kassaAll).forEach(([dateKey, dayData]) => {
      if (!dateKey.startsWith(monthKey)) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const df = (dayData as any)?.dailyFixed ?? {};
      const zp  = toNum(df.zpVodDezhurki || "");
      const dt  = toNum(df.dezhDt || "");
      const hoz = toNum(df.hozNuzhdyGarazh || "");
      if (!zp && !dt && !hoz) return;
      byDay[dateKey] = { zpVodDezhurki: zp, dezhDt: dt, hozNuzhdyGarazh: hoz, total: zp + dt + hoz };
      totZp += zp; totDt += dt; totHoz += hoz;
    });
    return { byDay, zpVodDezhurki: totZp, dezhDt: totDt, hozNuzhdyGarazh: totHoz, total: totZp + totDt + totHoz };
  }, [rows, monthKey, dailyFixed]);

  return {
    // state
    tab, setTab,
    selectedKey, monthKey, setMonthKey,
    rows, vyplaty, activeCell, activeVyp,
    chastRows, naryadRows,
    podrabJournal, monthlyRows,
    dailyFixed,
    monthlyFixed,
    // handlers
    handleDateChange,
    updateCell, addRow, deleteRow, handleKeyDown,
    setActiveCell,
    updateVyp, addVyp, deleteVyp, handleVypKeyDown,
    setActiveVyp,
    updateChast, updateChastDay, addChastRow,
    syncFromVedomost, syncBeznal,
    toggleVydano,
    updateDailyFixed,
  };
};