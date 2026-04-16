import { Link, useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";

const LINKS = [
  { to: "/",         label: "Главная",  icon: "Home"        },
  { to: "/dispatch", label: "Наряд",    icon: "ClipboardList" },
  { to: "/prodazhi", label: "Продажи",  icon: "TrendingUp"  },
  { to: "/kassa",    label: "Касса",    icon: "Wallet"      },
];

interface NavBarProps {
  title?: string;
}

const NavBar = ({ title }: NavBarProps) => {
  const { pathname } = useLocation();

  const today = new Date().toLocaleDateString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  return (
    <div className="bg-gray-800 text-white shadow print:hidden">
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-bold text-base tracking-tight whitespace-nowrap">Дальавтотранс</span>
          {title && (
            <>
              <span className="text-gray-500 text-sm">|</span>
              <span className="text-gray-300 text-sm">{title}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {LINKS.map((link) => {
            const isActive = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
                  isActive
                    ? "bg-blue-700 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <Icon name={link.icon as "Home"} size={14} />
                {link.label}
              </Link>
            );
          })}
          <span className="ml-3 text-xs text-gray-500 whitespace-nowrap flex items-center gap-1">
            <Icon name="Calendar" size={12} />
            {today}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
