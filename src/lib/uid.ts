let __counter = 0;

export const uid = (): number => {
  __counter = (__counter + 1) % 1_000_000;
  return Date.now() * 1_000_000 + __counter;
};
