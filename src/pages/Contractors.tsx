import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/9190b881-e41b-42df-ae0c-62bf6879782c";

const TYPE_LABELS: Record<string, string> = {
  debtor: "Дебитор",
  creditor: "Кредитор",
  both: "Дебитор и кредитор",
};

interface Contractor {
  id: number;
  name: string;
  type: string;
  inn?: string;
  phone?: string;
  email?: string;
  contact_person?: string;
  address?: string;
  notes?: string;
}

const empty: Omit<Contractor, "id"> = {
  name: "", type: "both", inn: "", phone: "", email: "", contact_person: "", address: "", notes: "",
};

export default function Contractors() {
  const [list, setList] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Contractor, "id">>({ ...empty });
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch(API);
    const data = await res.json();
    setList(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditId(null); setForm({ ...empty }); setShowForm(true); setExpanded(null); };
  const openEdit = (c: Contractor) => {
    setEditId(c.id);
    setForm({ name: c.name, type: c.type, inn: c.inn || "", phone: c.phone || "", email: c.email || "", contact_person: c.contact_person || "", address: c.address || "", notes: c.notes || "" });
    setShowForm(true);
    setExpanded(null);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${API}?id=${editId}` : API;
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить контрагента?")) return;
    await fetch(`${API}?id=${id}`, { method: "DELETE" });
    load();
  };

  const f = (k: keyof typeof form) => form[k] || "";
  const sf = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const filtered = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.inn || "").includes(search));

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img src="https://cdn.poehali.dev/projects/48d0f348-e369-40e0-b696-33913aa2ef26/bucket/f74a2a3e-f940-47c8-9193-d9634773e26c.png" alt="ТКЗ" className="h-12 w-12 object-contain" />
            <div>
              <div className="font-bold text-slate-800 leading-tight">Контрагенты <span style={{ color: "#E8450A" }}>ТКЗ</span></div>
              <div className="text-xs text-slate-400">Справочник</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <a href="/owner" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Icon name="BarChart3" size={16} /> Финансы
          </a>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#E8450A" }}>
            <Icon name="Users" size={16} /> Контрагенты
          </div>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <a href="/tkz" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "#E8450A" }}>
            <Icon name="ArrowLeft" size={15} /> К калькулятору
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Справочник контрагентов</h1>
              <p className="text-sm text-slate-400 mt-1">{list.length} контрагент{list.length === 1 ? "" : list.length < 5 ? "а" : "ов"}</p>
            </div>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "#E8450A" }}>
              <Icon name="Plus" size={16} /> Добавить
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm bg-white" placeholder="Поиск по названию или ИНН..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
              <h2 className="font-semibold text-slate-700 mb-4">{editId ? "Редактировать контрагента" : "Новый контрагент"}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-slate-500 mb-1 block">Название *</label>
                  <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("name")} onChange={e => sf("name", e.target.value)} placeholder="ООО Ромашка" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Тип</label>
                  <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("type")} onChange={e => sf("type", e.target.value)}>
                    <option value="both">Дебитор и кредитор</option>
                    <option value="debtor">Дебитор (нам должен)</option>
                    <option value="creditor">Кредитор (мы должны)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">ИНН</label>
                  <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("inn")} onChange={e => sf("inn", e.target.value)} placeholder="7700000000" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Телефон</label>
                  <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("phone")} onChange={e => sf("phone", e.target.value)} placeholder="+7 (900) 000-00-00" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Email</label>
                  <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("email")} onChange={e => sf("email", e.target.value)} placeholder="info@company.ru" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Контактное лицо</label>
                  <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("contact_person")} onChange={e => sf("contact_person", e.target.value)} placeholder="Иванов Иван" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Адрес</label>
                  <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("address")} onChange={e => sf("address", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-500 mb-1 block">Примечания</label>
                  <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" rows={2} value={f("notes")} onChange={e => sf("notes", e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={save} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#E8450A" }}>Сохранить</button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200">Отмена</button>
              </div>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="text-center text-slate-400 py-16">Загрузка...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-slate-400 py-16 bg-white rounded-xl border border-slate-200">
              <Icon name="Users" size={40} className="mx-auto mb-3 opacity-20" />
              <p>{search ? "Ничего не найдено" : "Нет контрагентов. Нажмите «Добавить»"}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(c => (
                <div key={c.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: "#E8450A" }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{c.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-400">{TYPE_LABELS[c.type] || c.type}</span>
                          {c.inn && <span className="text-xs text-slate-300">· ИНН {c.inn}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={e => { e.stopPropagation(); openEdit(c); }} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Icon name="Pencil" size={14} /></button>
                      <button onClick={e => { e.stopPropagation(); remove(c.id); }} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"><Icon name="Trash2" size={14} /></button>
                      <Icon name={expanded === c.id ? "ChevronUp" : "ChevronDown"} size={16} className="text-slate-300 ml-1" />
                    </div>
                  </div>
                  {expanded === c.id && (
                    <div className="border-t border-slate-100 px-4 py-3 grid grid-cols-2 gap-3 bg-slate-50">
                      {c.phone && <div><span className="text-xs text-slate-400">Телефон</span><div className="text-sm text-slate-700">{c.phone}</div></div>}
                      {c.email && <div><span className="text-xs text-slate-400">Email</span><div className="text-sm text-slate-700">{c.email}</div></div>}
                      {c.contact_person && <div><span className="text-xs text-slate-400">Контактное лицо</span><div className="text-sm text-slate-700">{c.contact_person}</div></div>}
                      {c.address && <div className="col-span-2"><span className="text-xs text-slate-400">Адрес</span><div className="text-sm text-slate-700">{c.address}</div></div>}
                      {c.notes && <div className="col-span-2"><span className="text-xs text-slate-400">Примечания</span><div className="text-sm text-slate-700">{c.notes}</div></div>}
                      {!c.phone && !c.email && !c.contact_person && !c.address && !c.notes && (
                        <div className="col-span-2 text-xs text-slate-400">Дополнительные данные не заполнены</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
