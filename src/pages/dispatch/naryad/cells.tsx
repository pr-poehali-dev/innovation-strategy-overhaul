// Выпадающая ячейка с <select> — исключает уже занятые значения
export const ExclSelect = ({
  value,
  options,
  placeholder,
  onChange,
  width,
  bold,
}: {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (v: string) => void;
  width: string;
  bold?: boolean;
}) => (
  <td className="border border-gray-300 p-0" style={{ width }}>
    <div className="flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`flex-1 h-7 px-1 text-xs bg-transparent outline-none border-0 cursor-pointer appearance-none min-w-0
          ${bold ? "font-semibold text-gray-900" : "text-gray-800"}`}
        style={{ WebkitAppearance: "none" }}
      >
        <option value="">{placeholder}</option>
        {value && !options.includes(value) && (
          <option value={value}>{value}</option>
        )}
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {value && (
        <button
          onClick={() => onChange("")}
          className="px-1 text-gray-300 hover:text-red-400 flex-shrink-0"
          tabIndex={-1}
          title="Очистить"
        >×</button>
      )}
    </div>
  </td>
);

// Обычная ячейка ввода
export const TextCell = ({
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  isActive,
  width,
  listId,
}: {
  value: string;
  onChange: (v: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isActive: boolean;
  width: string;
  listId?: string;
}) => (
  <td className="border border-gray-300 p-0" style={{ width }}>
    <input
      type="text"
      list={listId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      autoFocus={isActive}
      className={`w-full h-7 px-2 text-xs text-gray-800 bg-transparent outline-none border-2 transition-colors ${
        isActive ? "border-blue-500 bg-blue-50" : "border-transparent"
      }`}
      placeholder=""
    />
  </td>
);
