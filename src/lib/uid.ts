// Счётчик переживает перезагрузки страницы — храним в localStorage,
// чтобы id, выдаваемые в соседние миллисекунды после перезагрузки,
// не совпадали с id, уже сохранёнными в данных пользователя.
const __COUNTER_KEY = "__uid_counter_v1";
let __counter = (() => {
  try {
    const v = parseInt(localStorage.getItem(__COUNTER_KEY) || "0", 10);
    return Number.isFinite(v) ? v : 0;
  } catch { return 0; }
})();

export const uid = (): number => {
  __counter = (__counter + 1) % 1_000_000;
  try { localStorage.setItem(__COUNTER_KEY, String(__counter)); } catch { /* noop */ }
  return Date.now() * 1_000_000 + __counter;
};