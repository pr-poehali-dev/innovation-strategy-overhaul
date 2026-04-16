import Icon from "@/components/ui/icon";
import { useAppStore, CompanySettings } from "@/store/appStore";

interface Props {
  setSaved: (v: boolean) => void;
}

const SettingsCompanyTab = ({ setSaved }: Props) => {
  const { companies, setCompanies, activeCompanyIdx, setActiveCompanyIdx } = useAppStore();
  const company = companies[activeCompanyIdx];

  const updateCompany = (key: keyof CompanySettings, value: string) => {
    setCompanies((prev) => prev.map((c, i) => i === activeCompanyIdx ? { ...c, [key]: value } : c));
    setSaved(false);
  };

  const GROUPS: Array<{
    title: string;
    icon: string;
    fields: { key: keyof CompanySettings; label: string; span: number }[];
  }> = [
    {
      title: "Основные реквизиты",
      icon: "Building2",
      fields: [
        { key: "nazvanie",        label: "Полное наименование",   span: 2 },
        { key: "kratkoeNazvanie", label: "Краткое наименование",  span: 1 },
        { key: "inn",             label: "ИНН",                   span: 1 },
        { key: "kpp",             label: "КПП",                   span: 1 },
        { key: "ogrn",            label: "ОГРН / ОГРНИП",         span: 1 },
        { key: "okpo",            label: "Код ОКПО",              span: 1 },
        { key: "okvad",           label: "Основной ОКВЭД",        span: 1 },
      ],
    },
    {
      title: "Руководство",
      icon: "UserCircle",
      fields: [
        { key: "direktor",     label: "ФИО руководителя",        span: 2 },
        { key: "dolzhnostDir", label: "Должность руководителя",  span: 1 },
        { key: "glavbuh",      label: "ФИО главного бухгалтера", span: 1 },
      ],
    },
    {
      title: "Адреса и контакты",
      icon: "MapPin",
      fields: [
        { key: "adresYur", label: "Юридический адрес",               span: 2 },
        { key: "adres",    label: "Фактический / почтовый адрес",     span: 2 },
        { key: "telefon",  label: "Телефон",                          span: 1 },
        { key: "email",    label: "E-mail",                           span: 1 },
      ],
    },
    {
      title: "Банковские реквизиты",
      icon: "Landmark",
      fields: [
        { key: "bank",           label: "Наименование банка",   span: 2 },
        { key: "bik",            label: "БИК",                  span: 1 },
        { key: "raschetnySchet", label: "Расчётный счёт (р/с)", span: 1 },
        { key: "korSchet",       label: "Корр. счёт (к/с)",     span: 1 },
      ],
    },
    {
      title: "Лицензирование и реестр перевозчиков",
      icon: "FileCheck",
      fields: [
        { key: "licenziya",      label: "Номер лицензии на перевозки (форма ЛСБ)", span: 1 },
        { key: "licenziyaData",  label: "Дата выдачи лицензии",                    span: 1 },
        { key: "licenziyaVydan", label: "Лицензия выдана (орган)",                 span: 2 },
        { key: "reestrNomer",    label: "Реестровый номер (реестр перевозчиков)",   span: 2 },
      ],
    },
    {
      title: "Муниципальные перевозки — разрешительные документы",
      icon: "ScrollText",
      fields: [
        { key: "svidetelstvo",     label: "№ Свидетельства об осуществлении перевозок",  span: 1 },
        { key: "svidetelstvoData", label: "Дата свидетельства",                          span: 1 },
        { key: "dogovorZakazchik", label: "№ Договора с заказчиком перевозок",           span: 1 },
        { key: "zakazchik",        label: "Наименование заказчика (мун. орган власти)",   span: 2 },
        { key: "zakazchikInn",     label: "ИНН заказчика",                               span: 1 },
      ],
    },
  ];

  return (
    <div className="px-6 py-6 max-w-4xl">
      {/* Переключатель организаций */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {companies.map((c, i) => (
          <button
            key={i}
            onClick={() => setActiveCompanyIdx(i)}
            className={`px-4 py-2 text-sm rounded-lg border-2 transition-colors font-semibold ${
              activeCompanyIdx === i
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600"
            }`}
          >
            <Icon name="Building2" size={13} className="inline mr-1.5" />
            {c.nazvanie || `Организация ${i + 1}`}
          </button>
        ))}
      </div>

      {/* Группы полей */}
      {GROUPS.map((group) => (
        <div key={group.title} className="mb-8">
          <div className="flex items-center gap-2 mb-3 pb-1 border-b border-gray-200">
            <Icon name={group.icon as "Home"} size={15} className="text-blue-600" />
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{group.title}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {group.fields.map((field) => (
              <div key={field.key} className={field.span === 2 ? "col-span-2" : "col-span-1"}>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  {field.label}
                </label>
                <input
                  type="text"
                  value={(company[field.key] as string) || ""}
                  onChange={(e) => updateCompany(field.key, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
                  placeholder="—"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SettingsCompanyTab;
