import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useAppStore, DtpRecord, CompanySettings } from "@/store/appStore";
import JurnalBdd from "./bdd/JurnalBdd";

const EMPTY_COMPANY: CompanySettings = {
  nazvanie: "—", kratkoeNazvanie: "", inn: "", kpp: "", ogrn: "", okpo: "", okvad: "",
  direktor: "", dolzhnostDir: "Директор", glavbuh: "",
  adresYur: "", adres: "", telefon: "", email: "",
  bank: "", bik: "", raschetnySchet: "", korSchet: "",
  licenziya: "", licenziyaData: "", licenziyaVydan: "", reestrNomer: "",
  svidetelstvo: "", svidetelstvoData: "", dogovorZakazchik: "", zakazchik: "", zakazchikInn: "",
};

const STATUS_LABELS: Record<DtpRecord["status"], string> = {
  new:          "Новое",
  investigating: "Расследование",
  closed:       "Закрыто",
};

const STATUS_COLORS: Record<DtpRecord["status"], string> = {
  new:          "bg-red-100 text-red-700 border-red-200",
  investigating: "bg-amber-100 text-amber-700 border-amber-200",
  closed:       "bg-green-100 text-green-700 border-green-200",
};

const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

// ─── Печать документа ДТП ──────────────────────────────────────────────────
const DtpDocPrint = ({ rec, onClose }: { rec: DtpRecord; onClose: () => void }) => {
  const { companies, routes, employees, vehicles } = useAppStore();
  // Компания определяется по маршруту из записи ДТП, а не по activeCompanyIdx
  const routeNum = rec.marshrut?.split("/")[0]?.trim();
  const matchedRoute = routes.find((r) => r.nomer === routeNum);
  const company = (matchedRoute ? companies[matchedRoute.companyIdx] : companies[0]) ?? EMPTY_COMPANY;
  const direktor = employees.find((e) => e.dolzhnost === "Директор" && e.status === "active")?.fio ?? "_______________";
  const veh = vehicles.find((v) => v.bortovoy === rec.bortovoy);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl shadow-2xl">
        {/* Управление */}
        <div className="flex items-center justify-between px-5 py-3 bg-gray-100 border-b print:hidden">
          <span className="font-semibold text-gray-700">Документы по ДТП — {rec.bortovoy} от {rec.date}</span>
          <div className="flex gap-2">
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              <Icon name="Printer" size={14} /> Печать
            </button>
            <button onClick={onClose} className="px-3 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300">
              Закрыть
            </button>
          </div>
        </div>

        {/* Документ */}
        <div className="p-10 font-serif text-sm leading-relaxed" style={{ minHeight: "297mm" }}>
          <div className="text-center mb-6">
            <div className="font-bold text-base uppercase">{company.nazvanie || "ООО «Организация»"}</div>
            <div className="text-xs text-gray-600 mt-1">{company.adres} · ИНН: {company.inn}</div>
          </div>

          <div className="text-center font-bold text-lg uppercase mb-2">СЛУЖЕБНАЯ ЗАПИСКА</div>
          <div className="text-center text-sm mb-6">о дорожно-транспортном происшествии</div>

          <div className="flex justify-between text-sm mb-4">
            <span>Дата составления: <b>{today}</b></span>
            <span>Дата ДТП: <b>{rec.date}</b></span>
          </div>

          <div className="border border-gray-400 p-4 mb-4 text-sm space-y-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div><b>Транспортное средство:</b> борт № {rec.bortovoy || "—"}{veh?.marka ? `, ${veh.marka}` : ""}</div>
              <div><b>Гос. знак:</b> {veh?.gos || "—"}</div>
              <div><b>Маршрут:</b> {rec.marshrut || "—"}</div>
              <div><b>Путевой лист №:</b> {rec.putevoy || "—"}</div>
              <div><b>Водитель:</b> {rec.fioVod || "—"}</div>
              <div><b>Кондуктор:</b> {rec.fioKond || "—"}</div>
              <div><b>Время ДТП:</b> {rec.vremya || "___:___"}</div>
              <div><b>Дата ДТП:</b> {rec.date}</div>
              <div className="col-span-2"><b>Место ДТП:</b> {rec.mesto || "____________________________________________"}</div>
            </div>
          </div>

          <div className="mb-3">
            <div className="font-bold mb-1">Описание обстоятельств:</div>
            <div className="border-b border-gray-400 min-h-[24px] mb-1">{rec.opisanie}</div>
            <div className="border-b border-gray-400 min-h-[24px] mb-1"> </div>
            <div className="border-b border-gray-400 min-h-[24px]"> </div>
          </div>

          <div className="mb-3">
            <div className="font-bold mb-1">Пострадавшие / ущерб:</div>
            <div className="border-b border-gray-400 min-h-[24px] mb-1">{rec.postradavshie || "нет"}</div>
            <div>Материальный ущерб: <b>{rec.ushcherb && rec.ushcherb !== "0" ? rec.ushcherb + " ₽" : "устанавливается"}</b></div>
          </div>

          <div className="mb-6">
            <div className="font-bold mb-2">Принятые меры:</div>
            <div className="border-b border-gray-400 min-h-[24px] mb-1"> </div>
            <div className="border-b border-gray-400 min-h-[24px]"> </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-8">
            <div>
              <div className="border-b border-black min-h-[20px]">{direktor}</div>
              <div className="text-xs text-gray-500 text-center mt-1">Директор</div>
            </div>
            <div>
              <div className="border-b border-black min-h-[20px]"></div>
              <div className="text-xs text-gray-500 text-center mt-1">Подпись / дата</div>
            </div>
          </div>

          {/* Уведомление в ГИБДД */}
          <div className="mt-10 border-t-2 border-dashed border-gray-400 pt-6">
            <div className="text-center font-bold uppercase mb-2">Уведомление о ДТП</div>
            <div className="text-xs text-center text-gray-500 mb-4">(отрезная часть)</div>
            <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-1">
              <div>Организация: <b>{company.nazvanie || "—"}</b></div>
              <div>ИНН: <b>{company.inn || "—"}</b></div>
              <div>Борт №: <b>{rec.bortovoy || "—"}</b></div>
              <div>Гос. знак: <b>{veh?.gos || "—"}</b></div>
              <div>Марка: <b>{veh?.marka || "—"}</b></div>
              <div>Дата/время: <b>{rec.date} {rec.vremya}</b></div>
              <div className="col-span-2">Место: <b>{rec.mesto || "—"}</b></div>
              <div className="col-span-2">Водитель: <b>{rec.fioVod || "—"}</b></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Карточка ДТП ─────────────────────────────────────────────────────────
const DtpCard = ({
  rec,
  onUpdate,
  onOpenDoc,
}: {
  rec: DtpRecord;
  onUpdate: (id: number, partial: Partial<DtpRecord>) => void;
  onOpenDoc: (rec: DtpRecord) => void;
}) => {
  const { vehicles } = useAppStore();
  const veh = vehicles.find((v) => v.bortovoy === rec.bortovoy);
  const [open, setOpen] = useState(rec.status === "new");

  const F = ({ label, field, placeholder }: { label: string; field: keyof DtpRecord; placeholder?: string }) => (
    <div className="flex flex-col gap-0.5">
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type="text"
        value={(rec[field] as string) ?? ""}
        onChange={(e) => onUpdate(rec.id, { [field]: e.target.value })}
        placeholder={placeholder}
        className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
      />
    </div>
  );

  return (
    <div className={`border rounded-lg overflow-hidden ${rec.status === "new" ? "border-red-300" : rec.status === "investigating" ? "border-amber-300" : "border-gray-200"}`}>
      {/* Шапка карточки */}
      <div
        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer select-none ${
          rec.status === "new" ? "bg-red-50" : rec.status === "investigating" ? "bg-amber-50" : "bg-gray-50"
        }`}
        onClick={() => setOpen(!open)}
      >
        <Icon name="AlertTriangle" size={16} className="text-red-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-800">
            Борт {rec.bortovoy || "—"} · {rec.marshrut || "—"} · {rec.date}
          </div>
          <div className="text-xs text-gray-500 truncate">
            Водитель: {rec.fioVod || "—"} · {rec.mesto || "место не указано"}
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${STATUS_COLORS[rec.status]}`}>
          {STATUS_LABELS[rec.status]}
        </span>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={14} className="text-gray-400" />
      </div>

      {/* Тело карточки */}
      {open && (
        <div className="px-4 py-4 space-y-3 border-t">
          {/* Данные из наряда (только чтение) */}
          <div className="grid grid-cols-4 gap-2 bg-blue-50 rounded px-3 py-2 text-xs">
            <div><span className="text-gray-500">Водитель:</span> <span className="font-medium">{rec.fioVod || "—"}</span></div>
            <div><span className="text-gray-500">Кондуктор:</span> <span className="font-medium">{rec.fioKond || "—"}</span></div>
            <div><span className="text-gray-500">Путевой №:</span> <span className="font-semibold text-blue-700">{rec.putevoy || "—"}</span></div>
            <div><span className="text-gray-500">Маршрут:</span> <span className="font-medium">{rec.marshrut || "—"}</span></div>
            <div><span className="text-gray-500">Гос.знак:</span> <span className="font-medium">{veh?.gos || "—"}</span></div>
            <div className="col-span-2"><span className="text-gray-500">Марка:</span> <span className="font-medium">{veh?.marka || "—"}</span></div>
            <div><span className="text-gray-500">Дата:</span> <span className="font-medium">{rec.date}</span></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <F label="Время ДТП" field="vremya" placeholder="09:35" />
            <F label="Место ДТП" field="mesto" placeholder="ул. Ленина, 10" />
            <F label="Ущерб, ₽" field="ushcherb" placeholder="0" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Описание обстоятельств</label>
            <textarea
              value={rec.opisanie}
              onChange={(e) => onUpdate(rec.id, { opisanie: e.target.value })}
              rows={3}
              placeholder="Опишите обстоятельства ДТП..."
              className="w-full mt-0.5 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <F label="Пострадавшие" field="postradavshie" placeholder="нет / ФИО пострадавших" />

          <div className="flex items-center gap-2 pt-1">
            <div className="text-xs text-gray-500 mr-1">Статус:</div>
            {(["new", "investigating", "closed"] as DtpRecord["status"][]).map((s) => (
              <button
                key={s}
                onClick={() => onUpdate(rec.id, { status: s })}
                className={`px-2 py-0.5 rounded border text-xs font-semibold transition-colors ${
                  rec.status === s ? STATUS_COLORS[s] : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
            <div className="ml-auto">
              <button
                onClick={() => onOpenDoc(rec)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Icon name="FileText" size={12} />
                Сформировать документы
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Страница БДД ──────────────────────────────────────────────────────────
const Bdd = () => {
  const { dtpRecords, setDtpRecords } = useAppStore();
  const [docRec, setDocRec] = useState<DtpRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<DtpRecord["status"] | "all">("all");
  const [tab, setTab] = useState<"cards" | "journal">("cards");
  const [journalMonth, setJournalMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const updateDtp = (id: number, partial: Partial<DtpRecord>) =>
    setDtpRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...partial } : r)));

  const addManual = () =>
    setDtpRecords((prev) => [...prev, {
      id: Date.now() + Math.random(),
      date: today,
      bortovoy: "", marshrut: "", fioVod: "", fioKond: "", putevoy: "",
      vremya: "", mesto: "", opisanie: "", postradavshie: "", ushcherb: "",
      status: "new",
    }]);

  const filtered = dtpRecords.filter((r) => filterStatus === "all" || r.status === filterStatus);

  const counts = {
    all:          dtpRecords.length,
    new:          dtpRecords.filter((r) => r.status === "new").length,
    investigating: dtpRecords.filter((r) => r.status === "investigating").length,
    closed:       dtpRecords.filter((r) => r.status === "closed").length,
  };

  // Отфильтрованные для журнала по выбранному месяцу
  const journalRecords = useMemo(() => {
    if (!journalMonth) return dtpRecords;
    const [y, m] = journalMonth.split("-");
    return dtpRecords.filter((r) => {
      const parts = r.date.split(".");
      return parts[1] === m && parts[2] === y;
    });
  }, [dtpRecords, journalMonth]);

  const journalMonthYear = useMemo(() => {
    if (!journalMonth) return "";
    const [y, m] = journalMonth.split("-");
    const name = new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
    return name;
  }, [journalMonth]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="БДД" />

      {docRec && <DtpDocPrint rec={docRec} onClose={() => setDocRec(null)} />}

      <div className={`px-4 py-5 ${tab === "journal" ? "max-w-7xl" : "max-w-4xl"} mx-auto`}>
        <div className="bg-white border border-gray-300 shadow-sm">

          {/* Шапка */}
          <div className="border-b border-gray-300 px-5 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Безопасность дорожного движения</h1>
              <p className="text-xs text-gray-500 mt-0.5">Учёт ДТП и аварийных ситуаций · {today}</p>
            </div>
            <button
              onClick={addManual}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              <Icon name="Plus" size={14} />
              Добавить ДТП
            </button>
          </div>

          {/* Вкладки */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setTab("cards")}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === "cards"
                  ? "border-red-600 text-red-700 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon name="LayoutGrid" size={14} className="inline mr-1.5 -mt-0.5" />
              Карточки ДТП
            </button>
            <button
              onClick={() => setTab("journal")}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === "journal"
                  ? "border-red-600 text-red-700 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon name="BookText" size={14} className="inline mr-1.5 -mt-0.5" />
              Журнал ДТП
            </button>
          </div>

          {tab === "cards" && (
            <>
              {/* Статистика */}
              <div className="px-5 py-3 border-b border-gray-200 flex gap-4">
                {([
                  ["all", "Всего", "bg-gray-100 text-gray-700"],
                  ["new", "Новые", "bg-red-100 text-red-700"],
                  ["investigating", "Расследуются", "bg-amber-100 text-amber-700"],
                  ["closed", "Закрытые", "bg-green-100 text-green-700"],
                ] as [DtpRecord["status"] | "all", string, string][]).map(([key, label, cls]) => (
                  <button
                    key={key}
                    onClick={() => setFilterStatus(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
                      filterStatus === key ? cls + " border-current" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${cls}`}>{counts[key]}</span>
                  </button>
                ))}
              </div>

              {/* Список ДТП */}
              <div className="px-5 py-4 space-y-3">
                {filtered.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Icon name="ShieldCheck" size={48} className="mx-auto mb-3 opacity-30" />
                    <div className="text-sm">
                      {dtpRecords.length === 0
                        ? "ДТП не зафиксировано. Отметки появятся автоматически из Наряда."
                        : "Нет ДТП с выбранным статусом."}
                    </div>
                  </div>
                ) : (
                  filtered.map((rec, i) => (
                    <DtpCard
                      key={`dtp-${i}-${rec.id}`}
                      rec={rec}
                      onUpdate={updateDtp}
                      onOpenDoc={setDocRec}
                    />
                  ))
                )}
              </div>
            </>
          )}

          {tab === "journal" && (
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-600">Месяц:</label>
                <input
                  type="month"
                  value={journalMonth}
                  onChange={(e) => setJournalMonth(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => setJournalMonth("")}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Показать все
                </button>
                <div className="ml-auto">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Icon name="Printer" size={14} />
                    Печать
                  </button>
                </div>
              </div>
              <JurnalBdd records={journalRecords} monthYear={journalMonthYear} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Bdd;