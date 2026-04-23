import Icon from "@/components/ui/icon";
import { Employee } from "@/store/appStore";
import { TabType } from "./types";

type ExpStatus = "exp" | "warn";
export type ExpItem = {
  emp: Employee;
  doc: "ВУ" | "Мед. справка";
  date: string;
  days: number;
  status: ExpStatus;
  goTab: TabType;
};

export function buildExpiries(employees: Employee[]): ExpItem[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiries: ExpItem[] = [];
  const pushExp = (emp: Employee, doc: "ВУ" | "Мед. справка", date: string | undefined, goTab: TabType) => {
    if (!date) return;
    const d = new Date(date);
    if (isNaN(d.getTime())) return;
    const days = Math.ceil((d.getTime() - now.getTime()) / 86400000);
    if (days > 30) return;
    expiries.push({ emp, doc, date, days, status: days < 0 ? "exp" : "warn", goTab });
  };
  employees.filter((e) => e.status === "active").forEach((e) => {
    const goTab: TabType = e.kadryTab ?? (e.dolzhnost === "Кондуктор" ? "konduktery" : e.dolzhnost === "Водитель" ? "voditely" : "itr");
    if (e.dolzhnost === "Водитель") pushExp(e, "ВУ", e.udostoverenieDo, goTab);
    pushExp(e, "Мед. справка", e.medSpravkaDo, goTab);
  });
  expiries.sort((a, b) => a.days - b.days);
  return expiries;
}

interface Props {
  expiries: ExpItem[];
  setTab: (t: TabType) => void;
}

const KadryExpiries = ({ expiries, setTab }: Props) => {
  if (expiries.length === 0) return null;
  const expiredCount = expiries.filter((x) => x.status === "exp").length;
  const warnCount = expiries.filter((x) => x.status === "warn").length;

  return (
    <div className="border-b border-gray-300 px-5 py-3 bg-amber-50 print:hidden">
      <div className="flex items-center gap-3 mb-2">
        <Icon name="AlertTriangle" size={16} className="text-amber-700" />
        <span className="font-semibold text-sm text-gray-800">
          Скоро заканчиваются документы
        </span>
        {expiredCount > 0 && (
          <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-semibold">
            Просрочено: {expiredCount}
          </span>
        )}
        {warnCount > 0 && (
          <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-semibold">
            ≤ 30 дней: {warnCount}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 max-h-48 overflow-y-auto">
        {expiries.map((x, i) => (
          <button
            key={i}
            onClick={() => setTab(x.goTab)}
            className={`flex items-center justify-between gap-2 px-2 py-1 rounded text-xs border text-left transition-colors ${
              x.status === "exp"
                ? "bg-red-50 border-red-200 hover:bg-red-100 text-red-800"
                : "bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-900"
            }`}
            title={x.status === "exp" ? `Документ просрочен на ${Math.abs(x.days)} дн.` : `Осталось ${x.days} дн.`}
          >
            <span className="flex items-center gap-2 truncate">
              <span className="font-semibold truncate">{x.emp.fio || "(без ФИО)"}</span>
              <span className="text-gray-500">·</span>
              <span>{x.doc}</span>
            </span>
            <span className="flex items-center gap-2 shrink-0">
              <span className="text-gray-500">до {x.date}</span>
              {x.status === "exp"
                ? <span className="font-bold">просрочено {Math.abs(x.days)} дн.</span>
                : <span className="font-bold">{x.days} дн.</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default KadryExpiries;
