import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/9e46b906-33c0-486a-bf86-efd5640d5104";

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

function formatMoney(val: number | string) {
  return Number(val).toLocaleString("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });
}

function formatDate(val: string) {
  if (!val) return "—";
  const d = new Date(val);
  return d.toLocaleDateString("ru-RU");
}

type Section = "receivables" | "payables" | "calendar" | "regular";

interface Record {
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
  calendar: { contractor: "", amount: "", payment_date: "", description: "", type: "expense", is_paid: false },
  regular: { name: "", contractor: "", amount: "", frequency: "monthly", next_payment_date: "", description: "", is_active: true },
};

export default function Owner() {
  const [section, setSection] = useState<Section>("receivables");
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({ ...emptyForms.receivables });

  const load = async (sec: Section) => {
    setLoading(true);
    const res = await fetch(`${API}?section=${sec}`);
    const data = await res.json();
    setRecords(data);
    setLoading(false);
  };

  useEffect(() => {
    load(section);
    setShowForm(false);
    setEditId(null);
    setForm({ ...emptyForms[section] });
  }, [section]);

  const openAdd = () => {
    setEditId(null);
    setForm({ ...emptyForms[section] });
    setShowForm(true);
  };

  const openEdit = (rec: Record) => {
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
    { key: "receivables", label: "Дебиторка", icon: "TrendingUp" },
    { key: "payables", label: "Кредиторка", icon: "TrendingDown" },
    { key: "calendar", label: "Календарь платежей", icon: "CalendarDays" },
    { key: "regular", label: "Регулярные платежи", icon: "RefreshCw" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img src="https://cdn.poehali.dev/projects/48d0f348-e369-40e0-b696-33913aa2ef26/bucket/f74a2a3e-f940-47c8-9193-d9634773e26c.png" alt="ТКЗ" className="h-12 w-12 object-contain" />
            <div>
              <div className="font-bold text-slate-800 leading-tight">Финансы <span style={{ color: "#E8450A" }}>ТКЗ</span></div>
              <div className="text-xs text-slate-400">Кабинет собственника</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setSection(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium mb-1 transition-colors ${
                section === item.key
                  ? "text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
              style={section === item.key ? { backgroundColor: "#E8450A" } : {}}
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <a href="/tkz" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "#E8450A" }}>
            <Icon name="ArrowLeft" size={15} />
            К калькулятору
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {navItems.find((n) => n.key === section)?.label}
              </h1>
              {records.length > 0 && (
                <p className="text-sm text-slate-400 mt-1">
                  Итого: <span className="font-semibold text-slate-600">{formatMoney(total)}</span>
                </p>
              )}
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#E8450A" }}
            >
              <Icon name="Plus" size={16} />
              Добавить
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
              <h2 className="font-semibold text-slate-700 mb-4">{editId ? "Редактировать" : "Новая запись"}</h2>
              <div className="grid grid-cols-2 gap-4">
                {(section === "receivables" || section === "payables") && (
                  <>
                    <div className="col-span-2">
                      <label className="text-xs text-slate-500 mb-1 block">Контрагент</label>
                      <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.contractor || ""} onChange={(e) => setForm({ ...form, contractor: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Сумма, ₽</label>
                      <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Срок оплаты</label>
                      <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.due_date || ""} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Статус</label>
                      <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.status || "active"} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option value="active">Активна</option>
                        <option value="paid">Погашена</option>
                        <option value="overdue">Просрочена</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Комментарий</label>
                      <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>
                  </>
                )}
                {section === "calendar" && (
                  <>
                    <div className="col-span-2">
                      <label className="text-xs text-slate-500 mb-1 block">Контрагент / получатель</label>
                      <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.contractor || ""} onChange={(e) => setForm({ ...form, contractor: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Сумма, ₽</label>
                      <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Дата платежа</label>
                      <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.payment_date || ""} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Тип</label>
                      <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.type || "expense"} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                        <option value="expense">Расход</option>
                        <option value="income">Приход</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Комментарий</label>
                      <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="is_paid" checked={form.is_paid || false} onChange={(e) => setForm({ ...form, is_paid: e.target.checked })} />
                      <label htmlFor="is_paid" className="text-sm text-slate-600">Оплачено</label>
                    </div>
                  </>
                )}
                {section === "regular" && (
                  <>
                    <div className="col-span-2">
                      <label className="text-xs text-slate-500 mb-1 block">Название</label>
                      <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Контрагент</label>
                      <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.contractor || ""} onChange={(e) => setForm({ ...form, contractor: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Сумма, ₽</label>
                      <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Периодичность</label>
                      <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.frequency || "monthly"} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
                        <option value="daily">Ежедневно</option>
                        <option value="weekly">Еженедельно</option>
                        <option value="monthly">Ежемесячно</option>
                        <option value="quarterly">Ежеквартально</option>
                        <option value="yearly">Ежегодно</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Следующая дата</label>
                      <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.next_payment_date || ""} onChange={(e) => setForm({ ...form, next_payment_date: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-slate-500 mb-1 block">Комментарий</label>
                      <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={save} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#E8450A" }}>
                  Сохранить
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200">
                  Отмена
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
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
                    {(section === "receivables" || section === "payables") && (
                      <>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium">Контрагент</th>
                        <th className="text-right px-4 py-3 text-slate-500 font-medium">Сумма</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium">Срок</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium">Статус</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium">Комментарий</th>
                        <th className="px-4 py-3"></th>
                      </>
                    )}
                    {section === "calendar" && (
                      <>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium">Контрагент</th>
                        <th className="text-right px-4 py-3 text-slate-500 font-medium">Сумма</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium">Дата</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium">Тип</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium">Статус</th>
                        <th className="px-4 py-3"></th>
                      </>
                    )}
                    {section === "regular" && (
                      <>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium">Название</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium">Контрагент</th>
                        <th className="text-right px-4 py-3 text-slate-500 font-medium">Сумма</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium">Периодичность</th>
                        <th className="text-left px-4 py-3 text-slate-500 font-medium">Следующий платёж</th>
                        <th className="px-4 py-3"></th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec, i) => (
                    <tr key={rec.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/40"}`}>
                      {(section === "receivables" || section === "payables") && (
                        <>
                          <td className="px-4 py-3 font-medium text-slate-700">{rec.contractor}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatMoney(rec.amount)}</td>
                          <td className="px-4 py-3 text-slate-500">{formatDate(rec.due_date || "")}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${rec.status === "paid" ? "bg-green-100 text-green-700" : rec.status === "overdue" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                              {STATUS_LABELS[rec.status || "active"]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs">{rec.description || "—"}</td>
                        </>
                      )}
                      {section === "calendar" && (
                        <>
                          <td className="px-4 py-3 font-medium text-slate-700">{rec.contractor}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatMoney(rec.amount)}</td>
                          <td className="px-4 py-3 text-slate-500">{formatDate(rec.payment_date || "")}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${rec.type === "income" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                              {rec.type === "income" ? "Приход" : "Расход"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${rec.is_paid ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                              {rec.is_paid ? "Оплачено" : "Ожидает"}
                            </span>
                          </td>
                        </>
                      )}
                      {section === "regular" && (
                        <>
                          <td className="px-4 py-3 font-medium text-slate-700">{rec.name}</td>
                          <td className="px-4 py-3 text-slate-500">{rec.contractor || "—"}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatMoney(rec.amount)}</td>
                          <td className="px-4 py-3 text-slate-500">{FREQ_LABELS[rec.frequency || ""] || rec.frequency}</td>
                          <td className="px-4 py-3 text-slate-500">{formatDate(rec.next_payment_date || "")}</td>
                        </>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => openEdit(rec)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                            <Icon name="Pencil" size={14} />
                          </button>
                          <button onClick={() => remove(rec.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                            <Icon name="Trash2" size={14} />
                          </button>
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
          )}
        </div>
      </main>
    </div>
  );
}