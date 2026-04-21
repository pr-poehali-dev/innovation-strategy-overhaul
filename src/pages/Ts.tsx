import { useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import NavBar from "@/components/NavBar";
import { useAppStore, TsVehicle, TsDoc } from "@/store/appStore";
import { uid } from "@/lib/uid";

const DOC_TYPES: { key: string; label: string; color: string }[] = [
  { key: "osago",  label: "ОСАГО",          color: "bg-blue-100 text-blue-800"   },
  { key: "osgop",  label: "ОСГОП",          color: "bg-purple-100 text-purple-800"},
  { key: "arenda", label: "Договор аренды", color: "bg-green-100 text-green-800" },
  { key: "lizing", label: "Договор лизинга",color: "bg-amber-100 text-amber-800" },
  { key: "other",  label: "Прочее",         color: "bg-gray-100 text-gray-700"   },
];

const docColor = (type: string) =>
  DOC_TYPES.find((d) => d.key === type)?.color ?? "bg-gray-100 text-gray-700";

const docLabel = (type: string) =>
  DOC_TYPES.find((d) => d.key === type)?.label ?? "Прочее";

const emptyVehicle = (): TsVehicle => ({
  id: uid(),
  bortovoy: "",
  gos: "",
  marka: "",
  god: "",
  garazhny: "",
  docs: [],
});

// ── Модал добавления документа ──────────────────────────────────────────────
const DocModal = ({
  onAdd,
  onClose,
}: {
  onAdd: (doc: Omit<TsDoc, "id">) => void;
  onClose: () => void;
}) => {
  const [type, setType] = useState("osago");
  const [expiry, setExpiry] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setUrl(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleAdd = () => {
    if (!file || !url) return;
    onAdd({ name: file.name, type, url, expiry });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50 rounded-t-lg">
          <span className="font-semibold text-gray-800 text-sm">Добавить документ</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <Icon name="X" size={16} />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Тип документа</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              {DOC_TYPES.map((d) => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Срок действия (если есть)</label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="31.12.2025"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Файл (PDF, изображение)</label>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" onChange={handleFile} />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full px-3 py-2 text-sm border border-dashed border-gray-300 rounded hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-500 text-center"
            >
              {file ? file.name : "Нажмите для выбора файла"}
            </button>
          </div>
        </div>
        <div className="px-5 py-3 border-t bg-gray-50 flex justify-end gap-2 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Отмена</button>
          <button
            onClick={handleAdd}
            disabled={!file}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Карточка ТС ─────────────────────────────────────────────────────────────
const VehicleCard = ({
  vehicle,
  onUpdate,
  onDelete,
  onAddDoc,
  onDeleteDoc,
}: {
  vehicle: TsVehicle;
  onUpdate: (id: number, field: keyof Omit<TsVehicle, "id" | "docs">, val: string) => void;
  onDelete: (id: number) => void;
  onAddDoc: (vehicleId: number) => void;
  onDeleteDoc: (vehicleId: number, docId: number) => void;
}) => {
  const [open, setOpen] = useState(true);

  const Field = ({
    label,
    field,
    placeholder,
  }: {
    label: string;
    field: keyof Omit<TsVehicle, "id" | "docs">;
    placeholder?: string;
  }) => (
    <div className="flex flex-col gap-0.5">
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type="text"
        value={vehicle[field]}
        onChange={(e) => onUpdate(vehicle.id, field, e.target.value)}
        placeholder={placeholder}
        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
      />
    </div>
  );

  // Предупреждения по срокам
  const today = new Date();
  const expiredDocs = vehicle.docs.filter((d) => {
    if (!d.expiry) return false;
    const parts = d.expiry.split(".");
    if (parts.length !== 3) return false;
    const exp = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    const diff = (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 30;
  });

  return (
    <div className="bg-white border border-gray-300 shadow-sm rounded">
      {/* Заголовок карточки */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none border-b border-gray-200"
        style={{ backgroundColor: "#1a3a6b" }}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <Icon name="Bus" size={16} className="text-white" />
          <span className="text-white font-semibold text-sm">
            {vehicle.marka || "Автобус"}{vehicle.bortovoy ? ` · Борт ${vehicle.bortovoy}` : ""}
            {vehicle.gos ? ` · ${vehicle.gos}` : ""}
          </span>
          {expiredDocs.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              ⚠ {expiredDocs.length} документ(а) истекает
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(vehicle.id); }}
            className="text-red-300 hover:text-red-100 transition-colors p-1"
          >
            <Icon name="Trash2" size={14} />
          </button>
          <Icon name={open ? "ChevronUp" : "ChevronDown"} size={16} className="text-white" />
        </div>
      </div>

      {open && (
        <div className="p-4 space-y-4">
          {/* Поля ТС */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Field label="Бортовой №"   field="bortovoy"    placeholder="502" />
            <Field label="Гаражный №"   field="garazhny"    placeholder="502" />
            <Field label="Гос. знак"    field="gos"         placeholder="А000АА27" />
            <Field label="Марка / Модель" field="marka"     placeholder="DAEWOO BS 106" />
            <Field label="Год выпуска"  field="god"         placeholder="2021" />
            <Field label="Собственник"  field="sobstvennik" placeholder="ДАТ" />
            <Field label="VIN"          field="vin"         placeholder="KL5UM52PD7P025174" />
            <Field label="Реестр РОСАВТОДОРА" field="reestr" placeholder="АТТ0202852" />
            <Field label="Эк. класс"    field="ekKlass"     placeholder="4" />
          </div>

          {/* Документы */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Документы</span>
              <button
                onClick={() => onAddDoc(vehicle.id)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Icon name="Plus" size={11} />
                Загрузить
              </button>
            </div>

            {vehicle.docs.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Документы не загружены</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {vehicle.docs.map((doc) => {
                  const parts = doc.expiry?.split(".");
                  let expWarning = false;
                  if (parts?.length === 3) {
                    const exp = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                    expWarning = (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 30;
                  }
                  return (
                    <div
                      key={doc.id}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded border text-xs ${
                        expWarning ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${docColor(doc.type)}`}>
                        {docLabel(doc.type)}
                      </span>
                      <a
                        href={doc.url}
                        download={doc.name}
                        className="text-blue-600 hover:underline max-w-[120px] truncate"
                        title={doc.name}
                      >
                        {doc.name}
                      </a>
                      {doc.expiry && (
                        <span className={`text-xs ${expWarning ? "text-red-600 font-semibold" : "text-gray-400"}`}>
                          до {doc.expiry}
                        </span>
                      )}
                      <button
                        onClick={() => onDeleteDoc(vehicle.id, doc.id)}
                        className="text-gray-300 hover:text-red-500 ml-1"
                      >
                        <Icon name="X" size={11} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Страница ТС ─────────────────────────────────────────────────────────────
const Ts = () => {
  const { vehicles, setVehicles } = useAppStore();
  const [docModal, setDocModal] = useState<number | null>(null); // vehicleId

  const addVehicle = () =>
    setVehicles((prev) => [...prev, emptyVehicle()]);

  const deleteVehicle = (id: number) =>
    setVehicles((prev) => prev.filter((v) => v.id !== id));

  const updateVehicle = (
    id: number,
    field: keyof Omit<TsVehicle, "id" | "docs">,
    val: string,
  ) =>
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: val } : v)),
    );

  const addDoc = (vehicleId: number, doc: Omit<TsDoc, "id">) =>
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? { ...v, docs: [...v.docs, { ...doc, id: Date.now() + Math.random() }] }
          : v,
      ),
    );

  const deleteDoc = (vehicleId: number, docId: number) =>
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? { ...v, docs: v.docs.filter((d) => d.id !== docId) }
          : v,
      ),
    );

  const today = new Date().toLocaleDateString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <NavBar title="Транспортные средства" />

      {docModal !== null && (
        <DocModal
          onAdd={(doc) => addDoc(docModal, doc)}
          onClose={() => setDocModal(null)}
        />
      )}

      <div className="px-4 py-5 max-w-5xl mx-auto space-y-4">
        {/* Шапка */}
        <div className="bg-white border border-gray-300 shadow-sm">
          <div className="border-b border-gray-300 px-5 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-800 uppercase tracking-wide">
                Транспортные средства
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Дальавтотранс · {today} · Всего: {vehicles.length}</p>
            </div>
            <button
              onClick={addVehicle}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <Icon name="Plus" size={14} />
              Добавить ТС
            </button>
          </div>

          {/* Сводная таблица */}
          {vehicles.length > 0 && (
            <div className="overflow-x-auto">
              <table className="border-collapse text-xs" style={{ minWidth: "1000px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#1a3a6b" }}>
                    {["Борт №", "Гос. знак", "Марка / Модель", "Год", "Собственник", "VIN", "Реестр", "Эк.кл", "ОСАГО", "ОСГОП", "Аренда/Лизинг"].map((h) => (
                      <th key={h} className="border border-blue-900 px-2 py-1.5 text-white font-semibold text-center whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v, i) => {
                    const getDocStatus = (type: string) => {
                      const doc = v.docs.find((d) => d.type === type);
                      if (!doc) return <span className="text-gray-300">—</span>;
                      if (!doc.expiry) return <span className="text-green-600">✓</span>;
                      const parts = doc.expiry.split(".");
                      if (parts.length !== 3) return <span className="text-green-600">✓</span>;
                      const exp = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                      const diff = (exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
                      if (diff <= 0) return <span className="text-red-600 font-bold">Истёк</span>;
                      if (diff <= 30) return <span className="text-amber-600 font-semibold">до {doc.expiry}</span>;
                      return <span className="text-green-600">до {doc.expiry}</span>;
                    };
                    const hasArenda = v.docs.some((d) => d.type === "arenda" || d.type === "lizing");
                    return (
                      <tr key={v.id} className={i % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                        <td className="border border-gray-300 px-2 py-1 text-center font-bold text-blue-800">{v.bortovoy || "—"}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">{v.gos || "—"}</td>
                        <td className="border border-gray-300 px-2 py-1">{v.marka || "—"}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">{v.god || "—"}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">{v.sobstvennik || "—"}</span>
                        </td>
                        <td className="border border-gray-300 px-2 py-1 font-mono text-gray-500 text-xs">{v.vin || "—"}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center text-gray-600">{v.reestr || "—"}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          {v.ekKlass ? (
                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                              v.ekKlass === "5" ? "bg-green-100 text-green-700" :
                              v.ekKlass === "4" ? "bg-blue-100 text-blue-700" :
                              v.ekKlass === "2" ? "bg-amber-100 text-amber-700" :
                              "bg-gray-100 text-gray-500"
                            }`}>{v.ekKlass}</span>
                          ) : "—"}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-center">{getDocStatus("osago")}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">{getDocStatus("osgop")}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          {hasArenda ? <span className="text-green-600">✓</span> : <span className="text-gray-300">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Карточки */}
        {vehicles.length === 0 ? (
          <div className="bg-white border border-gray-300 rounded px-6 py-12 text-center">
            <Icon name="Bus" size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Нет транспортных средств</p>
            <p className="text-gray-300 text-xs mt-1">Нажмите «Добавить ТС» чтобы начать</p>
          </div>
        ) : (
          vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              onUpdate={updateVehicle}
              onDelete={deleteVehicle}
              onAddDoc={(vid) => setDocModal(vid)}
              onDeleteDoc={deleteDoc}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Ts;