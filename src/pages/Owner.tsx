import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/9e46b906-33c0-486a-bf86-efd5640d5104";
const CONTRACTORS_API = "https://functions.poehali.dev/9190b881-e41b-42df-ae0c-62bf6879782c";

interface ContractorOption { id: number; name: string; }

const FREQ_LABELS: Record<string, string> = {
  daily: "Ежедневно",
  weekly: "Еженедельно",
  monthly: "Ежемесячно",
  quarterly: "Ежеквартально",
  yearly: "Ежегодно",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Активна",
  paid: "Погашена",
  overdue: "Просрочена",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
};

function formatMoney(val: number | string) {
  return Number(val).toLocaleString("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });
}

function formatDate(val: string) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("ru-RU");
}

type Section = "receivables" | "payables" | "calendar" | "regular";

interface FinRecord {
  id: number;
  contractor?: string;
  name?: string;
  amount: number;
  due_date?: string;
  payment_date?: string;
  next_payment_date?: string;
  description?: string;
  status?: string;
  type?: string;
  is_paid?: boolean;
  is_active?: boolean;
  frequency?: string;
}

const emptyForms: Record<Section, object> = {
  receivables: { contractor: "", amount: "", due_date: "", description: "", status: "active" },
  payables: { contractor: "", amount: "", due_date: "", description: "", status: "active" },
  calendar: { contractor: "", amount: "", payment_date: "", description: "", type: "expense", is_paid: false, is_recurring: false, recurrence: "monthly" },
  regular: { name: "", contractor: "", amount: "", frequency: "monthly", next_payment_date: "", description: "", is_active: true },
};

const MONTHS_RU = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const DAYS_RU = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

function PaymentCalendar({ records, onAdd, onEdit, onRemove }: {
  records: FinRecord[];
  onAdd: (date: string) => void;
  onEdit: (rec: FinRecord) => void;
  onRemove: (id: number) => void;
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(null);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Mon=0
  const totalDays = lastDay.getDate();

  const byDate: Record<string, FinRecord[]> = {};
  records.forEach(r => {
    if (!r.payment_date) return;
    const orig = r.payment_date.slice(0, 10);
    const origDate = new Date(orig);

    if (r.is_recurring && r.recurrence) {
      // Показываем повторяющийся платёж в текущем месяце на то же число/день
      const day = origDate.getDate();
      const dow = origDate.getDay(); // для weekly
      const origMonth = origDate.getMonth();

      if (r.recurrence === "monthly") {
        const maxDay = new Date(year, month + 1, 0).getDate();
        const targetDay = Math.min(day, maxDay);
        const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;
        if (!byDate[key]) byDate[key] = [];
        byDate[key].push(r);
      } else if (r.recurrence === "weekly") {
        for (let d = 1; d <= new Date(year, month + 1, 0).getDate(); d++) {
          if (new Date(year, month, d).getDay() === dow) {
            const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            if (!byDate[key]) byDate[key] = [];
            byDate[key].push(r);
          }
        }
      } else if (r.recurrence === "quarterly") {
        if ((month - origMonth + 12) % 3 === 0) {
          const maxDay = new Date(year, month + 1, 0).getDate();
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(Math.min(day, maxDay)).padStart(2, "0")}`;
          if (!byDate[key]) byDate[key] = [];
          byDate[key].push(r);
        }
      } else if (r.recurrence === "yearly") {
        if (month === origMonth) {
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          if (!byDate[key]) byDate[key] = [];
          byDate[key].push(r);
        }
      }
      // Также показываем оригинальную дату если она в текущем месяце
      if (origDate.getMonth() === month && origDate.getFullYear() === year) {
        if (!byDate[orig]) byDate[orig] = [];
        if (!byDate[orig].find(x => x.id === r.id)) byDate[orig].push(r);
      }
    } else {
      if (!byDate[orig]) byDate[orig] = [];
      byDate[orig].push(r);
    }

  });

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelected(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); setSelected(null); };

  const cells: (number | null)[] = [...Array(startDow).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const selectedPayments = selected ? (byDate[selected] || []) : [];

  return (
    <div className="space-y-4">
      {/* Nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Icon name="ChevronLeft" size={18} />
        </button>
        <span className="text-lg font-semibold text-slate-700">{MONTHS_RU[month]} {year}</span>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Icon name="ChevronRight" size={18} />
        </button>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-100">
          {DAYS_RU.map(d => (
            <div key={d} className={`text-center text-xs font-medium py-2 ${d === "Сб" || d === "Вс" ? "text-slate-400" : "text-slate-500"}`}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) return <div key={i} className="border-r border-b border-slate-50 min-h-[72px]" />;
            const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const payments = byDate[key] || [];
            const isToday = key === todayKey;
            const isSelected = key === selected;
            const isWeekend = (i % 7 === 5 || i % 7 === 6);
            return (
              <div
                key={i}
                onClick={() => setSelected(isSelected ? null : key)}
                className={`border-r border-b border-slate-100 min-h-[72px] p-1.5 cursor-pointer transition-colors ${isSelected ? "bg-orange-50" : isWeekend ? "bg-slate-50/60 hover:bg-slate-100" : "hover:bg-slate-50"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "text-white" : isWeekend ? "text-slate-400" : "text-slate-600"}`}
                    style={isToday ? { backgroundColor: "#E8450A" } : {}}>
                    {day}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); onAdd(key); }}
                    className="opacity-0 hover:opacity-100 group-hover:opacity-100 w-4 h-4 flex items-center justify-center rounded text-slate-300 hover:text-slate-500 hover:bg-slate-200 transition-all"
                    title="Добавить платёж"
                  >
                    <Icon name="Plus" size={10} />
                  </button>
                </div>
                <div className="space-y-0.5">
                  {payments.slice(0, 2).map(p => (
                    <div key={p.id} className={`text-[10px] leading-tight px-1 py-0.5 rounded truncate font-medium flex items-center gap-0.5 ${p.is_paid ? "bg-green-100 text-green-700" : p.type === "income" ? "bg-blue-100 text-blue-700" : p.type === "salary" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}`}>
                      {p.is_recurring && <span title="Повторяется">↻</span>}
                      <span className="truncate">{p.contractor || p.description || "—"}</span>
                    </div>
                  ))}
                  {payments.length > 2 && <div className="text-[10px] text-slate-400 pl-1">+{payments.length - 2} ещё</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selected && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-slate-700">{formatDate(selected)}</span>
            <button onClick={() => onAdd(selected)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: "#E8450A" }}>
              <Icon name="Plus" size={12} /> Добавить
            </button>
          </div>
          {selectedPayments.length === 0 ? (
            <div className="text-sm text-slate-400 py-2">Нет платежей в этот день</div>
          ) : (
            <div className="space-y-2">
              {selectedPayments.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${p.is_paid ? "bg-green-500" : p.type === "income" ? "bg-blue-500" : p.type === "salary" ? "bg-purple-500" : "bg-orange-500"}`} />
                    <div>
                      <div className="text-sm font-medium text-slate-700">{p.contractor}</div>
                      {p.description && <div className="text-xs text-slate-400">{p.description}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-800">{formatMoney(p.amount)}</div>
                      <div className={`text-xs ${p.is_paid ? "text-green-600" : p.type === "income" ? "text-blue-600" : p.type === "salary" ? "text-purple-600" : "text-orange-600"}`}>
                        {p.is_paid ? "Оплачено" : p.type === "income" ? "Приход" : p.type === "salary" ? "Зарплата" : "Расход"}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => onEdit(p)} className="p-1.5 rounded hover:bg-slate-200 text-slate-400"><Icon name="Pencil" size={13} /></button>
                      <button onClick={() => onRemove(p.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"><Icon name="Trash2" size={13} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Owner() {
  const [section, setSection] = useState<Section>("receivables");
  const [records, setRecords] = useState<FinRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({ ...emptyForms.receivables });
  const [contractors, setContractors] = useState<ContractorOption[]>([]);

  const load = async (sec: Section) => {
    setLoading(true);
    const res = await fetch(`${API}?section=${sec}`);
    const data = await res.json();
    setRecords(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetch(CONTRACTORS_API).then(r => r.json()).then(d => setContractors(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    load(section);
    setShowForm(false);
    setEditId(null);
    setForm({ ...emptyForms[section] });
  }, [section]);

  const openAdd = (date?: string) => {
    setEditId(null);
    setForm({ ...emptyForms[section], ...(date ? { payment_date: date } : {}) });
    setShowForm(true);
  };

  const openEdit = (rec: FinRecord) => {
    setEditId(rec.id);
    setForm({ ...rec });
    setShowForm(true);
  };

  const save = async () => {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${API}?section=${section}&id=${editId}` : `${API}?section=${section}`;
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    load(section);
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить запись?")) return;
    await fetch(`${API}?section=${section}&id=${id}`, { method: "DELETE" });
    load(section);
  };

  const total = records.reduce((s, r) => s + Number(r.amount || 0), 0);

  const navItems: { key: Section; label: string; icon: string }[] = [
    { key: "receivables", label: "Кому мы должны товар", icon: "TrendingUp" },
    { key: "payables", label: "Кому мы должны деньги", icon: "TrendingDown" },
    { key: "calendar", label: "Календарь платежей", icon: "CalendarDays" },
    { key: "regular", label: "Регулярные платежи", icon: "RefreshCw" },
  ];

  const f = (k: string) => (form[k] ?? "") as string;
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://cdn.poehali.dev/projects/48d0f348-e369-40e0-b696-33913aa2ef26/bucket/f74a2a3e-f940-47c8-9193-d9634773e26c.png" alt="ТКЗ" className="h-12 w-12 object-contain" />
            <div>
              <div className="font-bold text-slate-800 leading-tight">Финансы <span style={{ color: "#E8450A" }}>ТКЗ</span></div>
              <div className="text-xs text-slate-400">Кабинет собственника</div>
            </div>
          </div>
          <button className="md:hidden p-1" onClick={() => setMobileOpen(false)}><Icon name="X" size={20} className="text-slate-500" /></button>
        </div>
      </div>
      <nav className="flex-1 p-3">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => { setSection(item.key); setMobileOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium mb-1 transition-colors ${section === item.key ? "text-white" : "text-slate-600 hover:bg-slate-50"}`}
            style={section === item.key ? { backgroundColor: "#E8450A" } : {}}
          >
            <Icon name={item.icon} size={16} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100 space-y-2">
        <a href="/contractors" className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
          <Icon name="Users" size={15} /> Контрагенты
        </a>
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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button className="md:hidden p-2 rounded-lg bg-white border border-slate-200" onClick={() => setMobileOpen(true)}>
                <Icon name="Menu" size={18} className="text-slate-600" />
              </button>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-slate-800">{navItems.find((n) => n.key === section)?.label}</h1>
                {section !== "calendar" && records.length > 0 && (
                  <p className="text-sm text-slate-400 mt-1">Итого: <span className="font-semibold text-slate-600">{formatMoney(total)}</span></p>
                )}
              </div>
            </div>
            {section !== "calendar" && (
              <button onClick={() => openAdd()} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "#E8450A" }}>
                <Icon name="Plus" size={16} /> Добавить
              </button>
            )}
            {section === "calendar" && (
              <button onClick={() => openAdd()} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "#E8450A" }}>
                <Icon name="Plus" size={16} /> Добавить платёж
              </button>
            )}
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
              <h2 className="font-semibold text-slate-700 mb-4">{editId ? "Редактировать" : "Новая запись"}</h2>
              <div className="grid grid-cols-2 gap-4">
                {(section === "receivables" || section === "payables") && (<>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500 mb-1 block">Контрагент</label>
                    <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("contractor")} onChange={e => sf("contractor", e.target.value)}>
                      <option value="">— выберите контрагента —</option>
                      {contractors.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    {contractors.length === 0 && <p className="text-xs text-slate-400 mt-1">Нет контрагентов. <a href="/contractors" className="underline" style={{color:"#E8450A"}}>Добавить в справочник</a></p>}
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Сумма, ₽</label>
                    <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("amount")} onChange={e => sf("amount", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Срок оплаты</label>
                    <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("due_date")} onChange={e => sf("due_date", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Статус</label>
                    <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("status")} onChange={e => sf("status", e.target.value)}>
                      <option value="active">Активна</option>
                      <option value="paid">Погашена</option>
                      <option value="overdue">Просрочена</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Комментарий</label>
                    <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("description")} onChange={e => sf("description", e.target.value)} />
                  </div>
                </>)}
                {section === "calendar" && (<>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500 mb-1 block">Контрагент / получатель</label>
                    <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("contractor")} onChange={e => sf("contractor", e.target.value)}>
                      <option value="">— выберите контрагента —</option>
                      {contractors.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Сумма, ₽</label>
                    <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("amount")} onChange={e => sf("amount", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Дата платежа</label>
                    <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("payment_date")} onChange={e => sf("payment_date", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Тип</label>
                    <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("type")} onChange={e => sf("type", e.target.value)}>
                      <option value="expense">Расход</option>
                      <option value="income">Приход</option>
                      <option value="salary">Зарплата</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Комментарий</label>
                    <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("description")} onChange={e => sf("description", e.target.value)} />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox" id="is_recurring" checked={!!form.is_recurring} onChange={e => sf("is_recurring", e.target.checked)} />
                    <label htmlFor="is_recurring" className="text-sm text-slate-600">Повторяющийся платёж</label>
                  </div>
                  {!!form.is_recurring && (
                    <div className="col-span-2">
                      <label className="text-xs text-slate-500 mb-1 block">Периодичность</label>
                      <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("recurrence")} onChange={e => sf("recurrence", e.target.value)}>
                        <option value="weekly">Еженедельно (каждую неделю в этот день)</option>
                        <option value="monthly">Ежемесячно (каждый месяц в это число)</option>
                        <option value="quarterly">Ежеквартально</option>
                        <option value="yearly">Ежегодно</option>
                      </select>
                    </div>
                  )}
                  <div className="flex items-center gap-2 col-span-2">
                    <input type="checkbox" id="is_paid" checked={!!form.is_paid} onChange={e => sf("is_paid", e.target.checked)} />
                    <label htmlFor="is_paid" className="text-sm text-slate-600">Оплачено</label>
                  </div>
                </>)}
                {section === "regular" && (<>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500 mb-1 block">Название</label>
                    <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("name")} onChange={e => sf("name", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Контрагент</label>
                    <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("contractor")} onChange={e => sf("contractor", e.target.value)}>
                      <option value="">— выберите контрагента —</option>
                      {contractors.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Сумма, ₽</label>
                    <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("amount")} onChange={e => sf("amount", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Периодичность</label>
                    <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("frequency")} onChange={e => sf("frequency", e.target.value)}>
                      <option value="daily">Ежедневно</option>
                      <option value="weekly">Еженедельно</option>
                      <option value="monthly">Ежемесячно</option>
                      <option value="quarterly">Ежеквартально</option>
                      <option value="yearly">Ежегодно</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Следующая дата</label>
                    <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("next_payment_date")} onChange={e => sf("next_payment_date", e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500 mb-1 block">Комментарий</label>
                    <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={f("description")} onChange={e => sf("description", e.target.value)} />
                  </div>
                </>)}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={save} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#E8450A" }}>Сохранить</button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200">Отмена</button>
              </div>
            </div>
          )}

          {/* Calendar section */}
          {section === "calendar" && !loading && (
            <PaymentCalendar records={records} onAdd={openAdd} onEdit={openEdit} onRemove={remove} />
          )}

          {/* Table for other sections */}
          {section !== "calendar" && (
            loading ? (
              <div className="text-center text-slate-400 py-16">Загрузка...</div>
            ) : records.length === 0 ? (
              <div className="text-center text-slate-400 py-16 bg-white rounded-xl border border-slate-200">
                <Icon name="FolderOpen" size={40} className="mx-auto mb-3 opacity-30" />
                <p>Нет записей. Нажмите «Добавить»</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {(section === "receivables" || section === "payables") && (<>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium">Контрагент</th>
                        <th className="text-right px-4 py-3 text-slate-500 font-medium">Сумма</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium">Срок</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium">Статус</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium">Комментарий</th>
                        <th className="px-4 py-3"></th>
                      </>)}
                      {section === "regular" && (<>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium">Название</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium">Контрагент</th>
                        <th className="text-right px-4 py-3 text-slate-500 font-medium">Сумма</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium">Периодичность</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium">Следующий платёж</th>
                        <th className="px-4 py-3"></th>
                      </>)}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((rec, i) => (
                      <tr key={rec.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/40"}`}>
                        {(section === "receivables" || section === "payables") && (<>
                          <td className="px-4 py-3 font-medium text-slate-700">{rec.contractor}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatMoney(rec.amount)}</td>
                          <td className="px-4 py-3 text-slate-500">{formatDate(rec.due_date || "")}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[rec.status || "active"]}`}>
                              {STATUS_LABELS[rec.status || "active"]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs">{rec.description || "—"}</td>
                        </>)}
                        {section === "regular" && (<>
                          <td className="px-4 py-3 font-medium text-slate-700">{rec.name}</td>
                          <td className="px-4 py-3 text-slate-500">{rec.contractor || "—"}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatMoney(rec.amount)}</td>
                          <td className="px-4 py-3 text-slate-500">{FREQ_LABELS[rec.frequency || ""] || rec.frequency}</td>
                          <td className="px-4 py-3 text-slate-500">{formatDate(rec.next_payment_date || "")}</td>
                        </>)}
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => openEdit(rec)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><Icon name="Pencil" size={14} /></button>
                            <button onClick={() => remove(rec.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Icon name="Trash2" size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {records.length > 1 && (
                    <tfoot>
                      <tr className="bg-slate-50 border-t-2 border-slate-200">
                        <td className="px-4 py-3 text-sm font-semibold text-slate-600" colSpan={2}>Итого</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">{formatMoney(total)}</td>
                        <td colSpan={10}></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}