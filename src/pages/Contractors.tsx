import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/9190b881-e41b-42df-ae0c-62bf6879782c";

interface Contractor {
  id: number;
  name: string;
  inn?: string;
  ogrn?: string;
  kpp?: string;
  legal_address?: string;
  actual_address?: string;
  bank_name?: string;
  bank_corr_account?: string;
  bank_bik?: string;
  bank_account?: string;
  bank_inn?: string;
  bank_kpp?: string;
  director?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
}

const empty: Omit<Contractor, "id"> = {
  name: "", inn: "", ogrn: "", kpp: "", legal_address: "", actual_address: "",
  bank_name: "", bank_corr_account: "", bank_bik: "", bank_account: "", bank_inn: "", bank_kpp: "",
  director: "", contact_person: "", email: "", phone: "", website: "", notes: "",
};

function Field({ label, value, onChange, placeholder, span2 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; span2?: boolean }) {
  return (
    <div className={span2 ? "col-span-2" : ""}>
      <label className="text-xs text-slate-500 mb-1 block">{label}</label>
      <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="col-span-2">
      <div className="flex items-center gap-2 mb-3 mt-2">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

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

  const openAdd = () => { setEditId(null); setForm({ ...empty }); setShowForm(true); setExpanded(null); window.scrollTo(0, 0); };
  const openEdit = (c: Contractor) => {
    setEditId(c.id);
    const f: Omit<Contractor, "id"> = { ...empty };
    (Object.keys(empty) as (keyof typeof empty)[]).forEach(k => { (f as Record<string, unknown>)[k] = (c as Record<string, unknown>)[k] || ""; });
    setForm(f);
    setShowForm(true);
    setExpanded(null);
    window.scrollTo(0, 0);
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

  const f = (k: keyof typeof empty) => (form[k] as string) || "";
  const sf = (k: keyof typeof empty) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const filtered = list.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.inn || "").includes(search) ||
    (c.ogrn || "").includes(search)
  );

  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://cdn.poehali.dev/projects/48d0f348-e369-40e0-b696-33913aa2ef26/bucket/f74a2a3e-f940-47c8-9193-d9634773e26c.png" alt="ТКЗ" className="h-12 w-12 object-contain" />
            <div>
              <div className="font-bold text-slate-800 leading-tight">Контрагенты <span style={{ color: "#E8450A" }}>ТКЗ</span></div>
              <div className="text-xs text-slate-400">Справочник</div>
            </div>
          </div>
          <button className="md:hidden p-1" onClick={() => setMobileOpen(false)}><Icon name="X" size={20} className="text-slate-500" /></button>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        <a href="/owner" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <Icon name="BarChart3" size={16} /> Финансы
        </a>
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#E8450A" }}>
          <Icon name="Users" size={16} /> Контрагенты
        </div>
        <a href="/contracts" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <Icon name="FolderOpen" size={16} /> Договоры
        </a>
        <a href="/summary" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <Icon name="FileBarChart" size={16} /> Краткая сводка
        </a>
        <a href="/safety" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <Icon name="ShieldCheck" size={16} /> Охрана труда
        </a>
      </nav>
      <div className="p-4 border-t border-slate-100">
        <a href="/tkz" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "#E8450A" }}>
          <Icon name="ArrowLeft" size={15} /> К калькулятору
        </a>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-72 bg-white flex flex-col shadow-xl h-full overflow-y-auto">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main */}
      <main className="flex-1 p-4 md:p-8 overflow-auto min-w-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button className="md:hidden p-2 rounded-lg bg-white border border-slate-200" onClick={() => setMobileOpen(true)}>
                <Icon name="Menu" size={18} className="text-slate-600" />
              </button>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-slate-800">Справочник контрагентов</h1>
                <p className="text-sm text-slate-400 mt-1">{list.length} контрагент{list.length === 1 ? "" : list.length < 5 ? "а" : "ов"}</p>
              </div>
            </div>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "#E8450A" }}>
              <Icon name="Plus" size={16} /> Добавить
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm bg-white focus:outline-none focus:border-orange-400 transition-colors" placeholder="Поиск по названию, ИНН или ОГРН..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
              <h2 className="font-semibold text-slate-700 mb-5">{editId ? "Редактировать контрагента" : "Новый контрагент"}</h2>
              <div className="grid grid-cols-2 gap-4">

                <Field label="Название организации *" value={f("name")} onChange={sf("name")} placeholder="ООО Ромашка" span2 />

                <Section title="Реквизиты организации">
                  <Field label="ИНН организации" value={f("inn")} onChange={sf("inn")} placeholder="7700000000" />
                  <Field label="ОГРН" value={f("ogrn")} onChange={sf("ogrn")} placeholder="1027700000000" />
                  <Field label="КПП" value={f("kpp")} onChange={sf("kpp")} placeholder="770001001" />
                  <div />
                  <Field label="Юридический адрес" value={f("legal_address")} onChange={sf("legal_address")} span2 />
                  <Field label="Фактический адрес" value={f("actual_address")} onChange={sf("actual_address")} span2 />
                </Section>

                <Section title="Банковские реквизиты">
                  <Field label="Наименование банка" value={f("bank_name")} onChange={sf("bank_name")} placeholder="ПАО Сбербанк" span2 />
                  <Field label="Расчётный счёт" value={f("bank_account")} onChange={sf("bank_account")} placeholder="40702810000000000000" />
                  <Field label="Корр. счёт" value={f("bank_corr_account")} onChange={sf("bank_corr_account")} placeholder="30101810400000000225" />
                  <Field label="БИК" value={f("bank_bik")} onChange={sf("bank_bik")} placeholder="044525225" />
                  <Field label="ИНН банка" value={f("bank_inn")} onChange={sf("bank_inn")} />
                  <Field label="КПП банка" value={f("bank_kpp")} onChange={sf("bank_kpp")} />
                </Section>

                <Section title="Контакты">
                  <Field label="Руководитель" value={f("director")} onChange={sf("director")} placeholder="Иванов Иван Иванович" span2 />
                  <Field label="Контактное лицо" value={f("contact_person")} onChange={sf("contact_person")} placeholder="Петров Пётр" />
                  <Field label="Телефон" value={f("phone")} onChange={sf("phone")} placeholder="+7 (900) 000-00-00" />
                  <Field label="Электронная почта" value={f("email")} onChange={sf("email")} placeholder="info@company.ru" />
                  <Field label="Веб-сайт" value={f("website")} onChange={sf("website")} placeholder="https://company.ru" />
                  <div />
                </Section>

                <div className="col-span-2">
                  <label className="text-xs text-slate-500 mb-1 block">Примечания</label>
                  <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-400 transition-colors" rows={2} value={f("notes")} onChange={e => sf("notes")(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
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
                  {/* Card header */}
                  <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: "#E8450A" }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{c.name}</div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {c.inn && <span className="text-xs text-slate-400">ИНН {c.inn}</span>}
                          {c.ogrn && <span className="text-xs text-slate-300">· ОГРН {c.ogrn}</span>}
                          {c.phone && <span className="text-xs text-slate-300">· {c.phone}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={e => { e.stopPropagation(); openEdit(c); }} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Icon name="Pencil" size={14} /></button>
                      <button onClick={e => { e.stopPropagation(); remove(c.id); }} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"><Icon name="Trash2" size={14} /></button>
                      <Icon name={expanded === c.id ? "ChevronUp" : "ChevronDown"} size={16} className="text-slate-300 ml-1" />
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expanded === c.id && (
                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 space-y-4">
                      {/* Реквизиты */}
                      {(c.kpp || c.legal_address || c.actual_address) && (
                        <div>
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Реквизиты</div>
                          <div className="grid grid-cols-2 gap-2">
                            {c.kpp && <div><span className="text-xs text-slate-400">КПП</span><div className="text-sm text-slate-700">{c.kpp}</div></div>}
                            {c.legal_address && <div className="col-span-2"><span className="text-xs text-slate-400">Юридический адрес</span><div className="text-sm text-slate-700">{c.legal_address}</div></div>}
                            {c.actual_address && <div className="col-span-2"><span className="text-xs text-slate-400">Фактический адрес</span><div className="text-sm text-slate-700">{c.actual_address}</div></div>}
                          </div>
                        </div>
                      )}
                      {/* Банк */}
                      {(c.bank_name || c.bank_account || c.bank_bik) && (
                        <div>
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Банковские реквизиты</div>
                          <div className="grid grid-cols-2 gap-2">
                            {c.bank_name && <div className="col-span-2"><span className="text-xs text-slate-400">Банк</span><div className="text-sm text-slate-700">{c.bank_name}</div></div>}
                            {c.bank_account && <div><span className="text-xs text-slate-400">Расчётный счёт</span><div className="text-sm text-slate-700 font-mono">{c.bank_account}</div></div>}
                            {c.bank_corr_account && <div><span className="text-xs text-slate-400">Корр. счёт</span><div className="text-sm text-slate-700 font-mono">{c.bank_corr_account}</div></div>}
                            {c.bank_bik && <div><span className="text-xs text-slate-400">БИК</span><div className="text-sm text-slate-700 font-mono">{c.bank_bik}</div></div>}
                            {c.bank_inn && <div><span className="text-xs text-slate-400">ИНН банка</span><div className="text-sm text-slate-700">{c.bank_inn}</div></div>}
                            {c.bank_kpp && <div><span className="text-xs text-slate-400">КПП банка</span><div className="text-sm text-slate-700">{c.bank_kpp}</div></div>}
                          </div>
                        </div>
                      )}
                      {/* Контакты */}
                      {(c.director || c.contact_person || c.email || c.website) && (
                        <div>
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Контакты</div>
                          <div className="grid grid-cols-2 gap-2">
                            {c.director && <div className="col-span-2"><span className="text-xs text-slate-400">Руководитель</span><div className="text-sm text-slate-700">{c.director}</div></div>}
                            {c.contact_person && <div><span className="text-xs text-slate-400">Контактное лицо</span><div className="text-sm text-slate-700">{c.contact_person}</div></div>}
                            {c.email && <div><span className="text-xs text-slate-400">Email</span><div className="text-sm text-slate-700">{c.email}</div></div>}
                            {c.website && <div><span className="text-xs text-slate-400">Сайт</span><a href={c.website} target="_blank" rel="noreferrer" className="text-sm text-orange-500 hover:underline">{c.website}</a></div>}
                          </div>
                        </div>
                      )}
                      {c.notes && (
                        <div>
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Примечания</div>
                          <div className="text-sm text-slate-600">{c.notes}</div>
                        </div>
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