import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const HeroSection = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-black to-blue-950 flex flex-col">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(30,64,175,0.3),transparent_70%)]"></div>

      {/* Navigation */}
      <header className="relative z-10 px-6 py-4 mx-auto w-full max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-white text-2xl font-bold tracking-tight">
              Дальавтотранс
            </Link>
            <nav className="hidden ml-12 space-x-8 md:flex">
              {["Услуги", "Маршруты", "Грузоперевозки", "О компании", "Клиенты", "Контакты"].map((item, index) => (
                <Link
                  key={item}
                  to={`/${["services", "routes", "cargo", "about", "clients", "contacts"][index]}`}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <a href="tel:+78001234567" className="px-4 py-2 text-white hover:text-gray-200 transition-colors flex items-center gap-2">
              <Icon name="Phone" size={16} />
              8 800 123-45-67
            </a>
            <Link to="/request" className="px-4 py-2 text-white bg-blue-700 rounded hover:bg-blue-600 transition-colors">
              Заказать перевозку
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 flex flex-col flex-1 items-center justify-center px-6 py-12 mx-auto text-center max-w-7xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm text-blue-300 border border-blue-800 rounded-full bg-blue-950/50">
          <Icon name="Truck" size={14} />
          Работаем по всему Дальневосточному региону
        </div>
        <h1 className="max-w-4xl mx-auto text-4xl font-bold text-white md:text-5xl lg:text-6xl leading-tight">
          Надёжные грузоперевозки <br />
          <span className="text-blue-400">по Дальнему Востоку</span>
        </h1>
        <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-300">
          Доставляем грузы точно в срок из любой точки региона. <br />
          Более 15 лет опыта, собственный автопарк и ответственность за каждый рейс.
        </p>
        <div className="flex flex-col mt-10 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Link
            to="/request"
            className="flex items-center justify-center px-8 py-3 text-lg font-medium text-gray-900 bg-white rounded-md hover:bg-gray-100 transition-colors"
          >
            Рассчитать стоимость
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <Link
            to="/services"
            className="px-8 py-3 text-lg font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
          >
            Наши услуги
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-12 mt-16 mb-12">
          {[
            { value: "15+", label: "лет на рынке" },
            { value: "200+", label: "единиц техники" },
            { value: "5000+", label: "рейсов в год" },
            { value: "98%", label: "доставка в срок" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Partners Section */}
        <div className="w-full mt-8 pt-8 border-t border-gray-800">
          <p className="mb-8 text-gray-400">
            Нам доверяют <span className="text-white">крупнейшие компании</span> региона и федеральные заказчики
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {["РЖД Логистика", "Роснефть", "Газпром", "СУЭК", "Полюс Золото"].map((name) => (
              <div key={name} className="text-gray-400 hover:text-white transition-colors text-base font-semibold tracking-wide">
                {name}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HeroSection;
