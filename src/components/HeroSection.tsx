import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-black to-blue-950 flex flex-col">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(30,64,175,0.3),transparent_70%)]"></div>

      {/* Navigation */}
      <header className="relative z-10 px-6 py-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-white text-2xl font-bold">
              NexusAI
            </Link>
            <nav className="hidden ml-12 space-x-8 md:flex">
              {["Продукты", "Решения", "Бизнес", "Цены", "Клиенты", "Ресурсы"].map((item, index) => (
                <Link
                  key={item}
                  to={`/${["products", "solutions", "enterprise", "pricing", "customers", "resources"][index]}`}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="px-4 py-2 text-white hover:text-gray-200 transition-colors">
              Войти
            </Link>
            <Link to="/demo" className="px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-700 transition-colors">
              Запросить демо
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 flex flex-col flex-1 items-center justify-center px-6 py-12 mx-auto text-center max-w-7xl">
        <h1 className="max-w-4xl mx-auto text-4xl font-bold text-white md:text-5xl lg:text-6xl">
          AI-решения для бизнеса
        </h1>
        <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-300">
          Корпоративная платформа искусственного интеллекта,
          <br />
          которая помогает вашей команде создавать, развертывать и масштабировать AI-приложения.
        </p>
        <div className="flex flex-col mt-10 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Link
            to="/demo"
            className="flex items-center justify-center px-8 py-3 text-lg font-medium text-gray-900 bg-white rounded-md hover:bg-gray-100 transition-colors"
          >
            Попробовать бесплатно
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <Link
            to="/solutions"
            className="px-8 py-3 text-lg font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
          >
            Изучить решения
          </Link>
        </div>

        {/* Partners Section */}
        <div className="w-full mt-24">
          <p className="mb-8 text-gray-400">
            Нам доверяют <span className="text-white">крупнейшие компании</span>, государственные организации и
            ведущие предприятия
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {/* Partner logos */}
            <div className="h-8 text-white">
              <svg className="h-full" viewBox="0 0 36 36" fill="currentColor">
                <path d="M31.8,30.7c-2.2,2.4-5.1,3.7-8.3,3.7c-6.1,0-11.3-4.5-11.3-10.4c0-5.9,5.2-10.4,11.3-10.4c3.2,0,6.1,1.3,8.3,3.7c2.2-2.4,3.4-5.5,3.4-8.9C35.2,3.8,31.3,0,26.6,0h-18C3.8,0,0,3.8,0,8.4v19.1C0,32.2,3.8,36,8.4,36h18.1c4.7,0,8.6-3.8,8.6-8.4C35.2,36.2,34,33.1,31.8,30.7z M23.5,30.5c-3.6,0-6.5-2.9-6.5-6.5c0-3.6,2.9-6.5,6.5-6.5c3.6,0,6.5,2.9,6.5,6.5C30,27.6,27.1,30.5,23.5,30.5z" />
              </svg>
            </div>
            <div className="h-8 text-white">
              <svg className="h-full" viewBox="0 0 23 23" fill="currentColor">
                <path d="M0 0h10.7v10.7H0V0zm12.3 0H23v10.7H12.3V0zM0 12.3h10.7V23H0V12.3zm12.3 0H23V23H12.3V12.3z" />
              </svg>
            </div>
            <div className="h-6 text-white">
              <span className="text-xl font-bold">TechGiant</span>
            </div>
            <div className="h-6 text-white">
              <span className="text-xl font-bold">DataCore</span>
            </div>
            <div className="h-8 text-white">
              <svg className="h-full" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm0 28C9.373 28 4 22.627 4 16S9.373 4 16 4s12 5.373 12 12-5.373 12-12 12zm-4-16a4 4 0 108 0 4 4 0 00-8 0z" />
              </svg>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HeroSection;
