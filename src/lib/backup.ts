// Резервное копирование: экспорт и импорт всех данных приложения
// из localStorage в один JSON-файл.

export const BACKUP_VERSION = 1;

export interface BackupFile {
  version: number;
  createdAt: string;
  // ключ localStorage → содержимое (как строка, чтобы без потерь восстановить)
  data: Record<string, string>;
}

// Все ключи приложения: всё, что начинается с "dat_" или "__uid_counter_v1".
// Захватываем и стор (dat_app_store_v1:*), и независимые модули (dat_kassa_v1, dat_prodazhi_v1 и т.д.).
function collectAppKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (k.startsWith("dat_") || k === "__uid_counter_v1") keys.push(k);
  }
  return keys;
}

export function exportBackup(): BackupFile {
  const keys = collectAppKeys();
  const data: Record<string, string> = {};
  keys.forEach((k) => {
    const v = localStorage.getItem(k);
    if (v !== null) data[k] = v;
  });
  return {
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    data,
  };
}

export function downloadBackup(): void {
  const backup = exportBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  a.href = url;
  a.download = `dat-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface RestoreOptions {
  // "replace" — полностью заменить данные (удалив существующие ключи приложения);
  // "merge"   — только добавить/перезаписать ключи из бэкапа, оставив остальное.
  mode: "replace" | "merge";
}

export function restoreBackup(file: BackupFile, opts: RestoreOptions): { restored: number; removed: number } {
  if (!file || typeof file !== "object" || !file.data || typeof file.data !== "object") {
    throw new Error("Некорректный файл резервной копии");
  }
  let removed = 0;
  if (opts.mode === "replace") {
    const keys = collectAppKeys();
    keys.forEach((k) => { localStorage.removeItem(k); removed += 1; });
  }
  let restored = 0;
  Object.entries(file.data).forEach(([k, v]) => {
    if (typeof v !== "string") return;
    localStorage.setItem(k, v);
    restored += 1;
  });
  return { restored, removed };
}

export async function importBackupFromFile(f: File, opts: RestoreOptions) {
  const text = await f.text();
  const parsed = JSON.parse(text) as BackupFile;
  return restoreBackup(parsed, opts);
}

// ─── Автоснимок ───────────────────────────────────────────────────────────
// Храним один последний автоматический слепок в ключе __auto_backup_v1.
// Раз в AUTO_BACKUP_INTERVAL_MS (по умолчанию сутки) при загрузке приложения
// вызываем autoBackupIfDue() — создаётся/обновляется автобэкап. Это спасает,
// если данные случайно затёрли или браузер почистил только часть ключей.
const AUTO_BACKUP_KEY  = "__auto_backup_v1";
const AUTO_BACKUP_MARK = "__auto_backup_v1_at";
export const AUTO_BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function autoBackupIfDue(now: number = Date.now(), intervalMs = AUTO_BACKUP_INTERVAL_MS): boolean {
  try {
    const last = parseInt(localStorage.getItem(AUTO_BACKUP_MARK) || "0", 10) || 0;
    if (now - last < intervalMs) return false;
    const backup = exportBackup();
    // Не сохраняем пустой слепок (защита от затирания рабочего автобэкапа на свежей вкладке)
    if (Object.keys(backup.data).length === 0) return false;
    localStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify(backup));
    localStorage.setItem(AUTO_BACKUP_MARK, String(now));
    return true;
  } catch { return false; }
}

export function loadLastAutoBackup(): BackupFile | null {
  try {
    const raw = localStorage.getItem(AUTO_BACKUP_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BackupFile;
  } catch { return null; }
}