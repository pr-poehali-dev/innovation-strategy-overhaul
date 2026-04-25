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

// Date.now() ≈ 1.7e12, MAX_SAFE_INTEGER ≈ 9e15 — оставляем запас 4 порядка под счётчик.
// Старая формула (×1_000_000) превышала Number.MAX_SAFE_INTEGER → JSON терял точность,
// разные строки получали одинаковые id, и React реюзал DOM (ввод «расползался»).
export const uid = (): number => {
  __counter = (__counter + 1) % 1000;
  try { localStorage.setItem(__COUNTER_KEY, String(__counter)); } catch { /* noop */ }
  return Date.now() * 1000 + __counter;
};