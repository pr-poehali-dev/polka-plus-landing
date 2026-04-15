import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/1d46ae7f-b4aa-418d-b915-9aab3068e325";
const CONTRACTORS_API = "https://functions.poehali.dev/9190b881-e41b-42df-ae0c-62bf6879782c";

interface SummaryRecord {
  id: number;
  category: "paid_not_shipped" | "not_paid_not_shipped";
  contractor: string;
  invoice_date?: string;
  amount: number;
  is_paid: boolean;
  is_shipped: boolean;
  subtotal?: number | null;
  notes?: string;
}

const fmtMoney = (v: number | string | null | undefined) => {
  if (!v) return "";
  return Number(v).toLocaleString("ru-RU", { maximumFractionDigits: 0 });
};

const fmtDate = (v?: string) => {
  if (!v) return "";
  const d = new Date(v);
  return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}`;
};

const emptyForm = (cat: string) => ({
  category: cat,
  contractor: "",
  invoice_date: "",
  amount: "",
  is_paid: false,
  is_shipped: false,
  subtotal: "",
  notes: "",
});

function SummaryTable({
  title,
  color,
  records,
  contractors,
  onToggle,
  onAdd,
  onDelete,
  onSubtotal,
}: {
  title: string;
  color: string;
  records: SummaryRecord[];
  contractors: string[];
  onToggle: (id: number, field: "is_paid" | "is_shipped", val: boolean) => void;
  onAdd: (row: Omit<SummaryRecord, "id">) => void;
  onDelete: (id: number) => void;
  onSubtotal: (id: number, val: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm(records[0]?.category || "paid_not_shipped"));
  const inputRef = useRef<HTMLInputElement>(null);

  const total = records.reduce((s, r) => s + Number(r.amount || 0), 0);

  const save = () => {
    if (!form.contractor || !form.amount) return;
    onAdd({
      category: form.category as SummaryRecord["category"],
      contractor: form.contractor,
      invoice_date: form.invoice_date || undefined,
      amount: Number(form.amount),
      is_paid: form.is_paid as boolean,
      is_shipped: form.is_shipped as boolean,
      subtotal: form.subtotal ? Number(form.subtotal) : null,
      notes: form.notes as string,
    });
    setForm(emptyForm(form.category));
    setAdding(false);
  };

  useEffect(() => { if (adding) inputRef.current?.focus(); }, [adding]);

  return (
    <div className="flex-1 min-w-0">
      {/* Header */}
      <div className="rounded-t-xl px-4 py-2.5 text-sm font-semibold text-white text-center" style={{ backgroundColor: color }}>
        {title}
      </div>

      {/* Table */}
      <div className="border border-t-0 border-slate-200 rounded-b-xl overflow-hidden bg-white">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-3 py-2 font-medium text-slate-500">Название</th>
              <th className="text-left px-2 py-2 font-medium text-slate-500">Дата</th>
              <th className="text-right px-2 py-2 font-medium text-slate-500">Сумма</th>
              <th className="text-center px-2 py-2 font-medium text-slate-500">Оплата</th>
              <th className="text-center px-2 py-2 font-medium text-slate-500">Отгрузка</th>
              <th className="text-right px-2 py-2 font-medium text-slate-500">Итого</th>
              <th className="px-1 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => {
              const isLastOfContractor = records[i + 1]?.contractor !== r.contractor;
              const contractorTotal = records
                .filter(x => x.contractor === r.contractor)
                .reduce((s, x) => s + Number(x.amount || 0), 0);
              return (
                <tr key={r.id} className={`border-b border-slate-100 hover:bg-yellow-50/50 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}>
                  <td className="px-3 py-1.5 font-medium text-slate-700 max-w-[120px] truncate">{r.contractor}</td>
                  <td className="px-2 py-1.5 text-slate-500 whitespace-nowrap">{fmtDate(r.invoice_date)}</td>
                  <td className="px-2 py-1.5 text-right text-slate-800 font-medium">{fmtMoney(r.amount)}</td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      onClick={() => onToggle(r.id, "is_paid", !r.is_paid)}
                      className={`w-6 h-6 rounded flex items-center justify-center mx-auto text-xs font-bold transition-colors ${r.is_paid ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                    >
                      {r.is_paid ? "+" : "—"}
                    </button>
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      onClick={() => onToggle(r.id, "is_shipped", !r.is_shipped)}
                      className={`w-6 h-6 rounded flex items-center justify-center mx-auto text-xs font-bold transition-colors ${r.is_shipped ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                    >
                      {r.is_shipped ? "✓" : "—"}
                    </button>
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    {isLastOfContractor ? (
                      <div className="flex flex-col items-end gap-0.5">
                        {r.subtotal ? (
                          <span className="font-semibold text-slate-800">{fmtMoney(r.subtotal)}</span>
                        ) : null}
                        <span className="text-[10px] font-bold uppercase tracking-wide whitespace-nowrap" style={{ color }}>
                          Итого: {fmtMoney(contractorTotal)}
                        </span>
                      </div>
                    ) : (
                      r.subtotal ? (
                        <span className="font-semibold text-slate-800">{fmtMoney(r.subtotal)}</span>
                      ) : null
                    )}
                  </td>
                  <td className="px-1 py-1.5">
                    <button onClick={() => onDelete(r.id)} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors">
                      <Icon name="X" size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {/* Add row form */}
            {adding && (
              <tr className="border-b border-orange-200 bg-orange-50/40">
                <td className="px-2 py-1.5">
                  <select
                    ref={inputRef as React.RefObject<HTMLSelectElement>}
                    className="w-full border border-slate-200 rounded px-2 py-1 text-xs"
                    value={form.contractor}
                    onChange={e => setForm(p => ({ ...p, contractor: e.target.value }))}
                  >
                    <option value="">— контрагент —</option>
                    {contractors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="date"
                    className="w-full border border-slate-200 rounded px-1 py-1 text-xs"
                    value={form.invoice_date as string}
                    onChange={e => setForm(p => ({ ...p, invoice_date: e.target.value }))}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    className="w-full border border-slate-200 rounded px-2 py-1 text-xs text-right"
                    placeholder="Сумма"
                    value={form.amount as string}
                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && save()}
                  />
                </td>
                <td className="px-2 py-1.5 text-center">
                  <input type="checkbox" checked={form.is_paid as boolean} onChange={e => setForm(p => ({ ...p, is_paid: e.target.checked }))} />
                </td>
                <td className="px-2 py-1.5 text-center">
                  <input type="checkbox" checked={form.is_shipped as boolean} onChange={e => setForm(p => ({ ...p, is_shipped: e.target.checked }))} />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    className="w-full border border-slate-200 rounded px-1 py-1 text-xs text-right"
                    placeholder="Итого"
                    value={form.subtotal as string}
                    onChange={e => setForm(p => ({ ...p, subtotal: e.target.value }))}
                  />
                </td>
                <td className="px-1 py-1.5">
                  <button onClick={save} className="p-1 rounded bg-green-100 text-green-600 hover:bg-green-200">
                    <Icon name="Check" size={12} />
                  </button>
                </td>
              </tr>
            )}
          </tbody>

          {/* Footer */}
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td colSpan={2} className="px-3 py-2 text-xs font-semibold text-slate-500">
                <button
                  onClick={() => { setAdding(!adding); setForm(emptyForm(records[0]?.category || "paid_not_shipped")); }}
                  className="flex items-center gap-1 text-xs font-medium hover:opacity-70 transition-opacity"
                  style={{ color }}
                >
                  <Icon name="Plus" size={13} /> Добавить строку
                </button>
              </td>
              <td className="px-2 py-2 text-right text-xs font-bold text-slate-700">{fmtMoney(total)}</td>
              <td colSpan={4}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default function Summary() {
  const [records, setRecords] = useState<SummaryRecord[]>([]);
  const [contractors, setContractors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const [r, c] = await Promise.all([fetch(API).then(r => r.json()), fetch(CONTRACTORS_API).then(r => r.json())]);
    setRecords(Array.isArray(r) ? r : []);
    setContractors(Array.isArray(c) ? c.map((x: { name: string }) => x.name) : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const paid = records.filter(r => r.category === "paid_not_shipped");
  const unpaid = records.filter(r => r.category === "not_paid_not_shipped");

  const toggle = async (id: number, field: "is_paid" | "is_shipped", val: boolean) => {
    const rec = records.find(r => r.id === id);
    if (!rec) return;
    const updated = { ...rec, [field]: val };
    setRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
    await fetch(`${API}?id=${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
  };

  const add = async (row: Omit<SummaryRecord, "id">) => {
    const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(row) });
    const data = await res.json();
    setRecords(prev => [...prev, data]);
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить строку?")) return;
    await fetch(`${API}?id=${id}`, { method: "DELETE" });
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const setSubtotal = async (id: number, val: string) => {
    const rec = records.find(r => r.id === id);
    if (!rec) return;
    const updated = { ...rec, subtotal: Number(val) };
    setRecords(prev => prev.map(r => r.id === id ? updated : r));
    await fetch(`${API}?id=${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
  };

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://cdn.poehali.dev/projects/48d0f348-e369-40e0-b696-33913aa2ef26/bucket/f74a2a3e-f940-47c8-9193-d9634773e26c.png" alt="ТКЗ" className="h-12 w-12 object-contain" />
            <div>
              <div className="font-bold text-slate-800 leading-tight">Сводка <span style={{ color: "#E8450A" }}>ТКЗ</span></div>
              <div className="text-xs text-slate-400">Краткая сводка</div>
            </div>
          </div>
          <button className="md:hidden p-1" onClick={() => setMobileOpen(false)}><Icon name="X" size={20} className="text-slate-500" /></button>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        <a href="/owner" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <Icon name="BarChart3" size={16} /> Финансы
        </a>
        <a href="/contractors" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <Icon name="Users" size={16} /> Контрагенты
        </a>
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#E8450A" }}>
          <Icon name="FileBarChart" size={16} /> Краткая сводка
        </div>
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button className="md:hidden p-2 rounded-lg bg-white border border-slate-200" onClick={() => setMobileOpen(true)}>
              <Icon name="Menu" size={18} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-slate-800">Краткая сводка</h1>
              <p className="text-sm text-slate-400 mt-0.5">Состояние отгрузок и оплат</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-slate-400 py-20">Загрузка...</div>
          ) : (
            <div className="flex flex-col xl:flex-row gap-6">
              <SummaryTable
                title="Оплачены, но не отгружены"
                color="#E8450A"
                records={paid}
                contractors={contractors}
                onToggle={toggle}
                onAdd={row => add({ ...row, category: "paid_not_shipped" })}
                onDelete={remove}
                onSubtotal={setSubtotal}
              />
              <SummaryTable
                title="Не оплачены, не отгружены"
                color="#64748b"
                records={unpaid}
                contractors={contractors}
                onToggle={toggle}
                onAdd={row => add({ ...row, category: "not_paid_not_shipped" })}
                onDelete={remove}
                onSubtotal={setSubtotal}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}