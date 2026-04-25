import { useMemo, useCallback } from "react";
import { useAppStore, getGrafiki } from "@/store/appStore";
import { NaryadRow } from "../types";

export const useNaryadData = (rows: NaryadRow[]) => {
  const { vehicles, employees, terminals, routes } = useAppStore();

  // Мемоизируем справочные данные — пересчитываются только при изменении источника
  const driverFios = useMemo(
    () => employees.filter((e) => e.dolzhnost === "Водитель"  && e.status === "active").map((e) => e.fio),
    [employees]
  );
  const condFios = useMemo(
    () => employees.filter((e) => e.dolzhnost === "Кондуктор" && e.status === "active").map((e) => e.fio),
    [employees]
  );
  const activeTerminals = useMemo(() => terminals.filter((t) => t.status === "active"), [terminals]);

  // Терминалы организации маршрута + ИП Герасимов (companyIdx:2) для маршрута №3
  const getRowTerminals = useCallback((marshrut: string) => {
    const routeNum = marshrut.split("/")[0].trim();
    const route = routes.find((r) => r.nomer === routeNum);
    if (!route) return activeTerminals;
    const allowed = new Set([route.companyIdx]);
    if (routeNum === "3") allowed.add(2); // ИП Герасимов обслуживает маршрут №3
    return activeTerminals.filter((t) => allowed.has(t.companyIdx));
  }, [activeTerminals, routes]);

  const allGrafiki = useMemo(() => routes.flatMap((r) => getGrafiki(r)), [routes]);
  const allBorts   = useMemo(
    () => [...new Set(vehicles.map((v) => v.bortovoy).filter(Boolean))].sort((a, b) => Number(a) - Number(b)),
    [vehicles]
  );

  // O(n) — вычисляем один раз, не в цикле строк
  const allUsedBorts   = useMemo(() => new Set(rows.filter((r) => r.bortovoy).map((r) => r.bortovoy)), [rows]);
  const allUsedGrafiki = useMemo(() => new Set(rows.filter((r) => r.marshrut).map((r) => r.marshrut)), [rows]);

  // Дубли водителей и кондукторов (fio встречается > 1 раза в наряде)
  const dupFios = useMemo(() => {
    const seen = new Set<string>();
    const dups = new Set<string>();
    rows.forEach((r) => {
      if (!r.fio) return;
      if (seen.has(r.fio)) dups.add(r.fio);
      else seen.add(r.fio);
    });
    return dups;
  }, [rows]);

  const dupKonds = useMemo(() => {
    const seen = new Set<string>();
    const dups = new Set<string>();
    rows.forEach((r) => {
      if (!r.fioKond || r.fioKond === "без") return;
      if (seen.has(r.fioKond)) dups.add(r.fioKond);
      else seen.add(r.fioKond);
    });
    return dups;
  }, [rows]);

  return {
    employees,
    driverFios,
    condFios,
    getRowTerminals,
    allGrafiki,
    allBorts,
    allUsedBorts,
    allUsedGrafiki,
    dupFios,
    dupKonds,
  };
};
