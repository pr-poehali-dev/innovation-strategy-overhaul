import { TEXT_COLS } from "../types";

const NaryadTableHeader = () => (
  <thead>
    <tr style={{ backgroundColor: "#1a3a6b" }}>
      <th className="border border-blue-900 px-1 py-2 text-white text-center" style={{ width: "28px" }}>№</th>
      {TEXT_COLS.map((col) => (
        <th key={col.key} className="border border-blue-900 px-2 py-2 text-white font-semibold text-left"
          style={{ width: col.width, minWidth: col.width }}>
          {col.label}
        </th>
      ))}
      <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-left" style={{ width: "180px" }}>ФИО водителя</th>
      <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-left" style={{ width: "180px" }}>ФИО кондуктора</th>
      <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "120px" }}>Статус</th>
      <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-left" style={{ width: "120px" }}>Терминал</th>
      <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-left" style={{ width: "110px" }}>Путевой лист</th>
      <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "75px" }}>Подработка</th>
      <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "75px" }}>Путевой</th>
      <th className="border border-blue-900 px-2 py-2 text-white font-semibold text-center" style={{ width: "55px" }}>ДТП</th>
      <th className="border border-blue-900 px-1 py-2" style={{ width: "28px" }}></th>
    </tr>
  </thead>
);

export default NaryadTableHeader;
