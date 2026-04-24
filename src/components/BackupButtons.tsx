import { useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { downloadBackup, importBackupFromFile, loadLastAutoBackup, restoreBackup } from "@/lib/backup";

const BackupButtons = () => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  const onDownload = () => {
    try {
      downloadBackup();
    } catch (e) {
      console.warn(e);
       
      alert("Не удалось сохранить резервную копию.");
    }
  };

  const onPickFile = () => fileRef.current?.click();

  const onRestoreAuto = () => {
    const auto = loadLastAutoBackup();
    if (!auto) {
       
      alert("Автоснимок ещё не создан. Он создаётся раз в сутки при открытии приложения.");
      return;
    }
    const when = auto.createdAt ? new Date(auto.createdAt).toLocaleString("ru-RU") : "—";
     
    const ok = window.confirm(
      `Восстановить данные из автоснимка от ${when}?\n\n` +
      "ВСЕ текущие данные будут заменены."
    );
    if (!ok) return;
    try {
      restoreBackup(auto, { mode: "replace" });
       
      alert("Данные восстановлены. Страница будет перезагружена.");
      window.location.reload();
    } catch (e) {
      console.warn(e);
       
      alert("Не удалось восстановить из автоснимка.");
    }
  };

  const onFileChosen = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0];
    ev.target.value = "";
    if (!f) return;
     
    const replace = window.confirm(
      "Восстановить данные из файла?\n\n" +
      "OK — ПОЛНАЯ ЗАМЕНА (текущие данные будут удалены)\n" +
      "Отмена — СЛИЯНИЕ (данные из файла добавятся к текущим)"
    );
    setBusy(true);
    try {
      const res = await importBackupFromFile(f, { mode: replace ? "replace" : "merge" });
       
      alert(
        `Готово. Восстановлено ключей: ${res.restored}` +
        (replace ? `, удалено старых: ${res.removed}` : "") +
        "\n\nСтраница будет перезагружена."
      );
      window.location.reload();
    } catch (e) {
      console.warn(e);
       
      alert("Не удалось восстановить из файла. Проверь, что выбран корректный JSON-бэкап.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onFileChosen}
      />
      <button
        onClick={onDownload}
        disabled={busy}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors print:hidden disabled:opacity-50"
        title="Скачать все данные приложения в один JSON-файл"
      >
        <Icon name="Download" size={14} />
        Бэкап
      </button>
      <button
        onClick={onPickFile}
        disabled={busy}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors print:hidden disabled:opacity-50"
        title="Восстановить данные из JSON-файла (замена или слияние)"
      >
        <Icon name="Upload" size={14} />
        Восстановить
      </button>
      <button
        onClick={onRestoreAuto}
        disabled={busy}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-400 text-white rounded hover:bg-slate-500 transition-colors print:hidden disabled:opacity-50"
        title="Откатиться к последнему ежедневному автоснимку"
      >
        <Icon name="History" size={14} />
        Автоснимок
      </button>
    </>
  );
};

export default BackupButtons;