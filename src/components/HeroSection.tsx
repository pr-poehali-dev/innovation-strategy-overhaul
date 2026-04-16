import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const SECTIONS = [
  { to: "/dispatch", label: "Наряд",   icon: "ClipboardList", desc: "Наряд на работу водителей" },
  { to: "/prodazhi", label: "Продажи", icon: "TrendingUp",    desc: "Выходы на линию, рейсы, ДТ" },
  { to: "/kassa",    label: "Касса",   icon: "Wallet",        desc: "Кассовый отчёт по маршрутам" },
];

const HeroSection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm text-blue-300 border border-blue-700 rounded-full bg-blue-950/60">
          <Icon name="Bus" size={14} />
          Муниципальные пассажирские перевозки
        </div>

        <h1 className="text-4xl font-bold text-white md:text-5xl leading-tight mb-2">
          Группа компаний
        </h1>
        <h2 className="text-4xl font-bold text-blue-400 md:text-5xl leading-tight mb-4">
          ООО «Дальавтотранс»
        </h2>

        <p className="text-gray-400 text-base mb-10">
          Регулярные маршруты общественного транспорта
        </p>

        {/* Section cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {SECTIONS.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="flex flex-col items-center gap-2 px-6 py-5 bg-white/5 border border-white/10 rounded-xl hover:bg-blue-700/30 hover:border-blue-500 transition-all group"
            >
              <Icon name={s.icon as "Home"} size={28} className="text-blue-400 group-hover:text-white transition-colors" />
              <span className="text-white font-semibold text-base">{s.label}</span>
              <span className="text-gray-400 text-xs">{s.desc}</span>
            </Link>
          ))}
        </div>

        <Link
          to="/dispatch"
          className="inline-flex items-center gap-3 px-10 py-4 text-lg font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/40"
        >
          Начать
          <Icon name="ArrowRight" size={20} />
        </Link>
      </div>
    </div>
  );
};

export default HeroSection;
