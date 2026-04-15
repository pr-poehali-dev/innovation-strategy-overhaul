import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const HeroSection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm text-blue-300 border border-blue-700 rounded-full bg-blue-950/60">
          <Icon name="Bus" size={14} />
          Муниципальные пассажирские перевозки
        </div>

        <h1 className="text-4xl font-bold text-white md:text-5xl leading-tight mb-2">
          Группа компаний
        </h1>
        <h2 className="text-4xl font-bold text-blue-400 md:text-5xl leading-tight mb-8">
          ООО «Дальавтотранс»
        </h2>

        <p className="text-gray-400 text-base mb-12">
          Регулярные маршруты общественного транспорта
        </p>

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
