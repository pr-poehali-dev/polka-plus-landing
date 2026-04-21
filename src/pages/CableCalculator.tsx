import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, Plus, Trash2, Calculator, Database, TrendingUp, TrendingDown, CalendarDays, RefreshCw, Pencil } from "lucide-react";

const FINANCE_API = "https://functions.poehali.dev/9e46b906-33c0-486a-bf86-efd5640d5104";

type FinSection = "receivables" | "payables" | "calendar" | "regular";
interface FinRecord { id: number; contractor?: string; name?: string; amount: number; due_date?: string; payment_date?: string; next_payment_date?: string; description?: string; status?: string; type?: string; is_paid?: boolean; is_active?: boolean; frequency?: string; by_meter?: boolean; }
const FREQ_LABELS: Record<string, string> = { daily: "Ежедневно", weekly: "Еженедельно", monthly: "Ежемесячно", quarterly: "Ежеквартально", yearly: "Ежегодно" };
const STATUS_COLORS: Record<string, string> = { active: "bg-blue-100 text-blue-700", paid: "bg-green-100 text-green-700", overdue: "bg-red-100 text-red-700" };
const STATUS_LABELS: Record<string, string> = { active: "Активна", paid: "Погашена", overdue: "Просрочена" };
const fmtMoney = (v: number | string) => Number(v).toLocaleString("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });
const fmtDate = (v?: string) => { if (!v) return "—"; return new Date(v).toLocaleDateString("ru-RU"); };
const FIN_EMPTY: Record<FinSection, Record<string, unknown>> = {
  receivables: { contractor: "", amount: "", due_date: "", description: "", status: "active" },
  payables: { contractor: "", amount: "", due_date: "", description: "", status: "active" },
  calendar: { contractor: "", amount: "", payment_date: "", description: "", type: "expense", is_paid: false, by_meter: false },
  regular: { name: "", contractor: "", amount: "", frequency: "monthly", next_payment_date: "", description: "", is_active: true },
};

function FinanceBlock() {
  const [section, setSection] = useState<FinSection>("receivables");
  const [records, setRecords] = useState<FinRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({ ...FIN_EMPTY.receivables });

  const load = async (sec: FinSection) => {
    setLoading(true);
    const res = await fetch(`${FINANCE_API}?section=${sec}`);
    const data = await res.json();
    setRecords(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(section); setShowForm(false); setEditId(null); setForm({ ...FIN_EMPTY[section] }); }, [section]);

  const openAdd = () => { setEditId(null); setForm({ ...FIN_EMPTY[section] }); setShowForm(true); };
  const openEdit = (rec: FinRecord) => { setEditId(rec.id); setForm({ ...rec }); setShowForm(true); };
  const save = async () => {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${FINANCE_API}?section=${section}&id=${editId}` : `${FINANCE_API}?section=${section}`;
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    load(section);
  };
  const remove = async (id: number) => {
    if (!confirm("Удалить запись?")) return;
    await fetch(`${FINANCE_API}?section=${section}&id=${id}`, { method: "DELETE" });
    load(section);
  };

  const total = records.reduce((s, r) => s + Number(r.amount || 0), 0);
  const navItems = [
    { key: "receivables" as FinSection, label: "Дебиторка", icon: <TrendingUp size={15} /> },
    { key: "payables" as FinSection, label: "Кредиторка", icon: <TrendingDown size={15} /> },
    { key: "calendar" as FinSection, label: "Календарь платежей", icon: <CalendarDays size={15} /> },
    { key: "regular" as FinSection, label: "Регулярные платежи", icon: <RefreshCw size={15} /> },
  ];

  const f = (k: string) => (form[k] ?? "") as string;
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      <div className="flex" style={{ borderTop: "2px solid #E8450A" }}>
        {/* Sidebar */}
        <aside className="w-48 shrink-0 border-r bg-slate-50 p-2 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Финансы</div>
          {navItems.map(item => (
            <button key={item.key} onClick={() => setSection(item.key)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${section === item.key ? "text-white" : "text-slate-600 hover:bg-slate-100"}`}
              style={section === item.key ? { backgroundColor: "#E8450A" } : {}}>
              {item.icon}{item.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className="flex-1 p-5 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold text-slate-700">{navItems.find(n => n.key === section)?.label}</div>
              {records.length > 0 && <div className="text-xs text-slate-400 mt-0.5">Итого: <span className="font-medium text-slate-600">{fmtMoney(total)}</span></div>}
            </div>
            <Button size="sm" onClick={openAdd} className="gap-1 text-white text-xs" style={{ background: "#E8450A" }}>
              <Plus size={13} /> Добавить
            </Button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-slate-50 rounded-xl border p-4 mb-4">
              <div className="text-sm font-medium text-slate-600 mb-3">{editId ? "Редактировать" : "Новая запись"}</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {(section === "receivables" || section === "payables") && <>
                  <div className="col-span-2"><Label className="text-xs">Контрагент</Label><Input value={f("contractor")} onChange={e => sf("contractor", e.target.value)} /></div>
                  <div><Label className="text-xs">Сумма, ₽</Label><Input type="number" value={f("amount")} onChange={e => sf("amount", e.target.value)} /></div>
                  <div><Label className="text-xs">Срок оплаты</Label><Input type="date" value={f("due_date")} onChange={e => sf("due_date", e.target.value)} /></div>
                  <div><Label className="text-xs">Статус</Label>
                    <Select value={f("status")} onValueChange={v => sf("status", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="active">Активна</SelectItem><SelectItem value="paid">Погашена</SelectItem><SelectItem value="overdue">Просрочена</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Комментарий</Label><Input value={f("description")} onChange={e => sf("description", e.target.value)} /></div>
                </>}
                {section === "calendar" && <>
                  <div className="col-span-2"><Label className="text-xs">Контрагент</Label><Input value={f("contractor")} onChange={e => sf("contractor", e.target.value)} /></div>
                  <div className="col-span-2 flex items-center gap-2 py-1">
                    <input type="checkbox" id="by_meter" checked={!!form.by_meter} onChange={e => sf("by_meter", e.target.checked)} className="w-4 h-4 accent-orange-500" />
                    <label htmlFor="by_meter" className="text-xs text-slate-600 cursor-pointer">Оплата по счётчику (без фиксированной суммы)</label>
                  </div>
                  {!form.by_meter && <div><Label className="text-xs">Сумма, ₽</Label><Input type="number" value={f("amount")} onChange={e => sf("amount", e.target.value)} /></div>}
                  <div><Label className="text-xs">Дата платежа</Label><Input type="date" value={f("payment_date")} onChange={e => sf("payment_date", e.target.value)} /></div>
                  <div><Label className="text-xs">Тип</Label>
                    <Select value={f("type")} onValueChange={v => sf("type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="expense">Расход</SelectItem><SelectItem value="income">Приход</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Комментарий</Label><Input value={f("description")} onChange={e => sf("description", e.target.value)} /></div>
                  <div className="flex items-center gap-2 col-span-2"><input type="checkbox" checked={!!form.is_paid} onChange={e => sf("is_paid", e.target.checked)} /><span className="text-xs text-slate-600">Оплачено</span></div>
                </>}
                {section === "regular" && <>
                  <div className="col-span-2"><Label className="text-xs">Название</Label><Input value={f("name")} onChange={e => sf("name", e.target.value)} /></div>
                  <div><Label className="text-xs">Контрагент</Label><Input value={f("contractor")} onChange={e => sf("contractor", e.target.value)} /></div>
                  <div><Label className="text-xs">Сумма, ₽</Label><Input type="number" value={f("amount")} onChange={e => sf("amount", e.target.value)} /></div>
                  <div><Label className="text-xs">Периодичность</Label>
                    <Select value={f("frequency")} onValueChange={v => sf("frequency", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="monthly">Ежемесячно</SelectItem><SelectItem value="weekly">Еженедельно</SelectItem><SelectItem value="quarterly">Ежеквартально</SelectItem><SelectItem value="yearly">Ежегодно</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Следующая дата</Label><Input type="date" value={f("next_payment_date")} onChange={e => sf("next_payment_date", e.target.value)} /></div>
                  <div className="col-span-2"><Label className="text-xs">Комментарий</Label><Input value={f("description")} onChange={e => sf("description", e.target.value)} /></div>
                </>}
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={save} className="text-white text-xs" style={{ background: "#E8450A" }}>Сохранить</Button>
                <Button size="sm" variant="outline" onClick={() => setShowForm(false)} className="text-xs">Отмена</Button>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? <div className="text-center text-slate-400 py-8 text-sm">Загрузка...</div> :
            records.length === 0 ? <div className="text-center text-slate-400 py-8 text-sm">Нет записей</div> : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    {(section === "receivables" || section === "payables") && <><th className="text-left px-3 py-2 text-slate-500 font-medium">Контрагент</th><th className="text-right px-3 py-2 text-slate-500 font-medium">Сумма</th><th className="text-left px-3 py-2 text-slate-500 font-medium">Срок</th><th className="text-left px-3 py-2 text-slate-500 font-medium">Статус</th><th className="px-3 py-2"></th></>}
                    {section === "calendar" && <><th className="text-left px-3 py-2 text-slate-500 font-medium">Контрагент</th><th className="text-right px-3 py-2 text-slate-500 font-medium">Сумма</th><th className="text-left px-3 py-2 text-slate-500 font-medium">Дата</th><th className="text-left px-3 py-2 text-slate-500 font-medium">Статус</th><th className="px-3 py-2"></th></>}
                    {section === "regular" && <><th className="text-left px-3 py-2 text-slate-500 font-medium">Название</th><th className="text-right px-3 py-2 text-slate-500 font-medium">Сумма</th><th className="text-left px-3 py-2 text-slate-500 font-medium">Периодичность</th><th className="text-left px-3 py-2 text-slate-500 font-medium">Следующий</th><th className="px-3 py-2"></th></>}
                  </tr>
                </thead>
                <tbody>
                  {records.map(rec => (
                    <tr key={rec.id} className="border-b last:border-0 hover:bg-slate-50">
                      {(section === "receivables" || section === "payables") && <>
                        <td className="px-3 py-2 font-medium text-slate-700">{rec.contractor}</td>
                        <td className="px-3 py-2 text-right font-semibold">{fmtMoney(rec.amount)}</td>
                        <td className="px-3 py-2 text-slate-500">{fmtDate(rec.due_date)}</td>
                        <td className="px-3 py-2"><span className={`inline-flex px-1.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[rec.status || "active"]}`}>{STATUS_LABELS[rec.status || "active"]}</span></td>
                      </>}
                      {section === "calendar" && <>
                        <td className="px-3 py-2 font-medium text-slate-700">{rec.contractor}</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          {rec.by_meter
                            ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">По счётчику</span>
                            : fmtMoney(rec.amount)}
                        </td>
                        <td className="px-3 py-2 text-slate-500">{fmtDate(rec.payment_date)}</td>
                        <td className="px-3 py-2"><span className={`inline-flex px-1.5 py-0.5 rounded-full text-xs font-medium ${rec.is_paid ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{rec.is_paid ? "Оплачено" : "Ожидает"}</span></td>
                      </>}
                      {section === "regular" && <>
                        <td className="px-3 py-2 font-medium text-slate-700">{rec.name}</td>
                        <td className="px-3 py-2 text-right font-semibold">{fmtMoney(rec.amount)}</td>
                        <td className="px-3 py-2 text-slate-500">{FREQ_LABELS[rec.frequency || ""] || rec.frequency}</td>
                        <td className="px-3 py-2 text-slate-500">{fmtDate(rec.next_payment_date)}</td>
                      </>}
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(rec)} className="p-1 rounded hover:bg-slate-100 text-slate-400"><Pencil size={12} /></button>
                          <button onClick={() => remove(rec.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {records.length > 1 && (
                  <tfoot><tr className="bg-slate-50 border-t-2">
                    <td className="px-3 py-2 text-xs font-semibold text-slate-500">Итого</td>
                    <td className="px-3 py-2 text-right text-xs font-bold text-slate-700">{fmtMoney(total)}</td>
                    <td colSpan={10}></td>
                  </tr></tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const API_URL = "https://functions.poehali.dev/184ab8d3-3443-46d0-b473-5501b563a2e1";
const ALL = "ALL", EMPTY = "EMPTY", PAINTS = ["Краска желтая", "Краска салатовая"];
const UNITS: Record<string, string> = { "Вес меди": "кг", "Пластикат ПВХ ИО 20-13": "кг", "Краска синяя": "кг", "Краска желтая": "кг", "Краска салатовая": "кг", "Пластикат ПВХ О-40": "кг", "Этикетка": "шт", "Тальк": "кг", "Пленка": "кг", "Разбавитель": "граммы", "Чернила": "граммы", "Лента": "пог. м", "Стрейч": "рулон" };
const MATERIALS = ["Вес меди", "Пластикат ПВХ ИО 20-13", "Краска синяя", "Краска желтая", "Краска салатовая", "Пластикат ПВХ О-40", "Этикетка", "Тальк", "Пленка", "Разбавитель", "Чернила", "Лента", "Стрейч"];
const GROUPS = ["КАРАТ", "ГЕРМЕС", "КАБЕЛЬ-ПРОМ", "MARC KAB", "VOLT", "АльфаКабель", "Альянс", "АРКАД", "АРНА"];
const IGNORE = new Set(PAINTS);

const num = (v: unknown) => Number.isFinite(+v!) ? +(v as number) : 0;
const rnd = (v: number, d = 4) => Number.isFinite(v) ? +v.toFixed(d) : 0;
const byGroup = (arr: Cable[], g: string) => g === ALL ? arr : arr.filter(x => x.group === g);
const emptyRecipe = (ms: string[]) => Object.fromEntries(ms.map(m => [m, 0]));
const mkRecipe = ([a, b, c, d, e, f]: number[]): Record<string, number> => ({ "Вес меди": a, "Пластикат ПВХ ИО 20-13": b, "Краска синяя": c, "Краска желтая": d, "Краска салатовая": e, "Пластикат ПВХ О-40": f, "Этикетка": 1, "Тальк": 0.01, "Пленка": 0.06, "Разбавитель": 0.0006, "Чернила": 0.4, "Лента": 0.76, "Стрейч": 0.003 });

interface Cable { id: string; name: string; group?: string; recipe: Record<string, number> }
interface Line { id: string; cableId: string; qty: string }

const defaults = {
  materials: MATERIALS,
  my: [
    { id: "my-1", name: "Мой кабель 1", recipe: mkRecipe([3.8163, 2.079, 0.0074, 0.0074, 0.002, 5]) },
    { id: "my-2", name: "Мой кабель 2", recipe: mkRecipe([3.65, 2.01, 0.0072, 0.0072, 0.0018, 5.2]) },
  ],
  foreign: [
    { id: "foreign-1", name: "Чужой кабель 1", group: "КАРАТ", recipe: mkRecipe([3.2268, 1.9563, 0.0071, 0.0071, 0.0019, 6.7]) },
    { id: "foreign-2", name: "Чужой кабель 2", group: "АРКАД", recipe: mkRecipe([3.4, 2.02, 0.007, 0.007, 0.0017, 6.2]) },
  ],
};

const normalizeForeign = (arr: Cable[]) => arr.map((x, i) => ({ ...x, group: x.group || GROUPS[i % GROUPS.length], recipe: x.recipe || {} }));
const pick = (arr: Cable[], id: string) => arr.find(x => x.id === id) || arr[0];

const sumAvail = (materials: string[], lines: { cable?: Cable; qty: number }[]) => {
  const r: Record<string, number> = Object.fromEntries(materials.map(m => [m, 0]));
  lines.forEach(l => materials.forEach(m => r[m] += num(l.cable?.recipe?.[m]) * l.qty));
  return r;
};
const rowsFor = (materials: string[], av: Record<string, number>, target?: Cable) => materials.map(m => {
  const need = num(target?.recipe?.[m]), available = num(av[m]), possible = need > 0 ? available / need : Infinity;
  return { material: m, available: rnd(available, 6), need: rnd(need, 6), possible: Number.isFinite(possible) ? rnd(possible, 4) : null };
});
const limitRow = (rows: ReturnType<typeof rowsFor>) => rows.filter(x => x.possible !== null && !IGNORE.has(x.material)).reduce((m, x) => !m || x.possible! < m.possible! ? x : m, null as typeof rows[0] | null);
const maxRow = (rows: ReturnType<typeof rowsFor>) => rows.filter(x => x.possible !== null).reduce((m, x) => !m || x.possible! > m.possible! ? x : m, null as typeof rows[0] | null);
const leftovers = (materials: string[], av: Record<string, number>, target: Cable | undefined, whole: number) =>
  materials.map(m => ({ material: m, leftover: rnd(num(av[m]) - num(target?.recipe?.[m]) * whole, 6) })).filter(x => x.leftover > 0);
const needMore = (materials: string[], av: Record<string, number>, target: Cable | undefined, whole: number) =>
  materials.map(m => { const need = num(target?.recipe?.[m]); if (need <= 0) return null; const add = need * (whole + 1) - num(av[m]); return add > 0 ? { material: m, add: rnd(add, 6), unit: UNITS[m] || "—" } : null; }).filter(Boolean).sort((a, b) => a!.add - b!.add);
const paintDeficit = (av: Record<string, number>, target: Cable | undefined, whole: number) =>
  PAINTS.map(m => { const d = +(num(target?.recipe?.[m]) * whole - num(av[m])).toFixed(6); return d > 1e-6 ? { material: m, deficit: d, unit: UNITS[m] || "—" } : null; }).filter(Boolean);

const SelectBox = ({ value, onChange, items, placeholder, all }: { value: string; onChange: (v: string) => void; items: { value?: string; id?: string; name?: string; label?: string }[]; placeholder?: string; all?: boolean }) =>
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
    <SelectContent>
      {all && <SelectItem value={ALL}>Все группы</SelectItem>}
      {items.map(x => <SelectItem key={x.value || x.id} value={(x.value || x.id)!}>{x.label || x.name || x.value}</SelectItem>)}
    </SelectContent>
  </Select>;

const NumberField = ({ value, onChange, step = "0.0001" }: { value: string | number; onChange: (v: string) => void; step?: string }) =>
  <Input type="number" step={step} value={value} onChange={e => onChange(e.target.value)} className="text-right" />;

const RecipeTable = ({ materials, cable, onChange }: { materials: string[]; cable: Cable; onChange: (m: string, v: string) => void }) =>
  <div className="overflow-x-auto rounded-2xl border">
    <Table><TableHeader><TableRow><TableHead>Материал</TableHead><TableHead>Ед. изм.</TableHead><TableHead className="text-right">Расход</TableHead></TableRow></TableHeader>
      <TableBody>{materials.map(m => <TableRow key={m}><TableCell className="font-medium">{m}</TableCell><TableCell className="text-slate-500">{UNITS[m] || "—"}</TableCell><TableCell><NumberField value={cable.recipe[m] ?? 0} onChange={v => onChange(m, v)} /></TableCell></TableRow>)}</TableBody>
    </Table>
  </div>;

const SECRET_PASSWORD = '1010';
const SESSION_KEY = 'tkz_auth';

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = () => {
    if (password === SECRET_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      onAuth();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm mx-4 space-y-5">
        <div className="flex flex-col items-center gap-3">
          <img src="https://cdn.poehali.dev/projects/48d0f348-e369-40e0-b696-33913aa2ef26/bucket/f74a2a3e-f940-47c8-9193-d9634773e26c.png" alt="ТКЗ" className="h-16 w-16 object-contain" />
          <div className="text-xl font-bold text-gray-900">Конвертер кабеля</div>
          <div className="text-sm text-slate-500">Введите пароль для доступа</div>
        </div>
        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(false); }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-gray-500'}`}
          placeholder="Пароль"
        />
        {error && <div className="text-red-500 text-xs text-center">Неверный пароль</div>}
        <button
          onClick={submit}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-colors"
          style={{ background: 'linear-gradient(135deg, #1A1228, #2D1640)' }}
        >
          Войти
        </button>
      </div>
    </div>
  );
}

export default function CableConverterApp() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [materials, setMaterials] = useState(defaults.materials);
  const [my, setMy] = useState<Cable[]>(defaults.my);
  const [foreign, setForeign] = useState<Cable[]>(defaults.foreign);
  const [myId, setMyId] = useState("my-1");
  const [fId, setFId] = useState("foreign-1");
  const [gRec, setGRec] = useState(ALL);
  const [gInv, setGInv] = useState(ALL);
  const [newMat, setNewMat] = useState("");
  const [newMy, setNewMy] = useState("");
  const [newF, setNewF] = useState("");
  const [newFG, setNewFG] = useState(GROUPS[0]);
  const [newMyBase, setNewMyBase] = useState(EMPTY);
  const [newFBase, setNewFBase] = useState(EMPTY);
  // Строки счёта — только локально (временные, не нужно синхронизировать)
  const [lines, setLines] = useState<Line[]>([{ id: "line-1", cableId: "foreign-1", qty: "1" }]);
  // Расчёт цены
  const [pricingRows, setPricingRows] = useState<{ id: string; cableId: string; normHours: string; hourRate: string; costPrice: string }[]>([]);
  const [globalHourRate, setGlobalHourRate] = useState<string>(() => localStorage.getItem("globalHourRate") || "");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Загрузка техкарт из БД при старте
  useEffect(() => {
    fetch(API_URL)
      .then(r => r.json())
      .then(({ data }) => {
        if (data && Object.keys(data).length > 0) {
          const myData: Cable[] = (data.my && data.my.length > 0) ? data.my : defaults.my;
          const foreignData: Cable[] = normalizeForeign((data.foreign && data.foreign.length > 0) ? data.foreign : defaults.foreign);
          const mats: string[] = (data.materials && data.materials.length > 0) ? data.materials : defaults.materials;
          setMaterials(mats);
          setMy(myData);
          setForeign(foreignData);
          if (myData.length > 0) setMyId(myData[0].id);
          if (foreignData.length > 0) {
            setFId(foreignData[0].id);
            setLines([{ id: "line-1", cableId: foreignData[0].id, qty: "1" }]);
          }
        }
      })
      .catch(console.error)
      .finally(() => setReady(true));
  }, []);

  // Загрузка расчётов цены из БД при старте
  useEffect(() => {
    fetch(`${API_URL}?section=pricing`)
      .then(r => r.json())
      .then(({ rows, globalHourRate: ghr }) => {
        if (ghr) { setGlobalHourRate(ghr); localStorage.setItem("globalHourRate", ghr); }
        if (rows && rows.length > 0) {
          setPricingRows(rows.map((r: Record<string, string>) => ({
            id: r.id,
            cableId: r.cable_id,
            normHours: r.norm_hours != null ? String(r.norm_hours) : "",
            hourRate: r.hour_rate != null ? String(r.hour_rate) : "",
            costPrice: r.cost_price != null ? String(r.cost_price) : "",
          })));
        }
      })
      .catch(console.error);
  }, []);

  // Автосохранение строк расчёта цены (дебаунс 1.5с)
  const pricingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (pricingTimer.current) clearTimeout(pricingTimer.current);
    pricingTimer.current = setTimeout(() => {
      fetch(`${API_URL}?section=pricing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "pricing", action: "save_rows", rows: pricingRows }),
      }).catch(console.error);
    }, 1500);
  }, [pricingRows]);

  // Автосохранение техкарт в БД (с дебаунсом 1.5с)
  const pushToServer = useCallback((payload: { materials: string[]; my: Cable[]; foreign: Cable[] }) => {
    setSaving(true);
    setSaveOk(false);
    fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: payload }) })
      .then(() => setSaveOk(true))
      .catch(console.error)
      .finally(() => setSaving(false));
  }, []);

  useEffect(() => {
    if (!ready) return;
    // Защита: не сохранять если кабели не загружены
    if (my.length === 0 || foreign.length === 0) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => pushToServer({ materials, my, foreign }), 1500);
  }, [ready, materials, my, foreign, pushToServer]);

  const fRec = useMemo(() => byGroup(foreign, gRec), [foreign, gRec]);
  const fInv = useMemo(() => byGroup(foreign, gInv), [foreign, gInv]);
  const selM = pick(my, myId);
  const selF = pick(foreign, fId);
  const sum = useMemo(() => lines.map(l => ({ ...l, cable: foreign.find(x => x.id === l.cableId), qty: Math.max(0, num(l.qty)) })).filter(l => l.cable && l.qty > 0), [lines, foreign]);
  const av = useMemo(() => sumAvail(materials, sum), [materials, sum]);
  const rows = useMemo(() => rowsFor(materials, av, selM), [materials, av, selM]);
  const lim = useMemo(() => limitRow(rows), [rows]);
  const fallback = useMemo(() => maxRow(rows), [rows]);
  const whole = Math.floor((lim?.possible ?? fallback?.possible) ?? 0);
  const left = useMemo(() => leftovers(materials, av, selM, whole), [materials, av, selM, whole]);
  const more = useMemo(() => needMore(materials, av, selM, whole), [materials, av, selM, whole]);
  const paintMinus = useMemo(() => paintDeficit(av, selM, whole), [av, selM, whole]);

  useEffect(() => { if (!fRec.some(x => x.id === fId)) setFId(fRec[0]?.id || foreign[0]?.id || ""); }, [fRec, fId, foreign]);

  const patch = (set: React.Dispatch<React.SetStateAction<Cable[]>>, id: string, key: string, val: string) =>
    set(prev => prev.map(c => c.id === id ? { ...c, [key]: val } : c));
  const patchRecipe = (set: React.Dispatch<React.SetStateAction<Cable[]>>, id: string, m: string, v: string) =>
    set(prev => prev.map(c => c.id === id ? { ...c, recipe: { ...c.recipe, [m]: v === "" ? 0 : num(v) } } : c));
  const deleteCable = (kind: "my" | "foreign", id: string) => {
    if (kind === "my") {
      if (my.length <= 1) return;
      const next = my.filter(x => x.id !== id);
      setMy(next);
      if (myId === id) setMyId(next[0].id);
      return;
    }
    if (foreign.length <= 1) return;
    const next = foreign.filter(x => x.id !== id);
    setForeign(next);
    if (fId === id) setFId(next[0]?.id || "");
    setLines(prev => { const rest = prev.filter(x => x.cableId !== id); return rest.length ? rest : [{ id: `line-${Date.now()}`, cableId: next[0]?.id || "", qty: "0" }]; });
  };
  const addMaterial = () => {
    const name = newMat.trim();
    if (!name) return;
    if (materials.includes(name)) { alert(`Материал "${name}" уже есть`); return; }
    setMaterials(p => [...p, name]);
    setMy(arr => arr.map(c => ({ ...c, recipe: { ...c.recipe, [name]: 0 } })));
    setForeign(arr => arr.map(c => ({ ...c, recipe: { ...c.recipe, [name]: 0 } })));
    setNewMat("");
  };
  const delMaterial = (name: string) => {
    setMaterials(p => p.filter(x => x !== name));
    const strip = (arr: Cable[]) => arr.map(c => { const recipe = { ...c.recipe }; delete recipe[name]; return { ...c, recipe }; });
    setMy(strip);
    setForeign(strip);
  };
  const addMyCable = () => {
    const name = newMy.trim();
    if (!name) return;
    const id = `my-${Date.now()}`;
    const base = my.find(c => c.id === newMyBase);
    setMy(p => [...p, { id, name, recipe: base ? { ...base.recipe } : emptyRecipe(materials) }]);
    setMyId(id);
    setNewMy("");
    setNewMyBase(EMPTY);
  };
  const addForeignCable = () => {
    const name = newF.trim();
    if (!name) return;
    if (foreign.some(c => c.group === newFG && c.name.trim().toLowerCase() === name.toLowerCase())) return alert("Такой кабель уже есть в этой группе ❗");
    const id = `foreign-${Date.now()}`;
    const base = foreign.find(c => c.id === newFBase);
    setForeign(p => [...p, { id, name, group: newFG, recipe: base ? { ...base.recipe } : emptyRecipe(materials) }]);
    setFId(id);
    setGRec(newFG);
    setNewF("");
    setNewFBase(EMPTY);
  };
  const addLine = () => setLines(p => [...p, { id: `line-${Date.now()}-${p.length}`, cableId: fInv[0]?.id || foreign[0]?.id || "", qty: "0" }]);
  const reset = () => {
    setMaterials(defaults.materials);
    setMy(defaults.my);
    setForeign(defaults.foreign);
    setMyId("my-1");
    setFId("foreign-1");
    setGRec(ALL);
    setGInv(ALL);
    setNewMat("");
    setNewMy("");
    setNewF("");
    setNewFG(GROUPS[0]);
    setNewMyBase(EMPTY);
    setNewFBase(EMPTY);
    setLines([{ id: "line-1", cableId: "foreign-1", qty: "1" }]);
  };

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;
  if (!ready) return <div className="p-6 text-sm text-slate-600">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img src="https://cdn.poehali.dev/projects/48d0f348-e369-40e0-b696-33913aa2ef26/bucket/f74a2a3e-f940-47c8-9193-d9634773e26c.png" alt="ТКЗ" className="h-14 w-14 object-contain" />
            <div>
              <div className="flex items-baseline gap-3">
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#1a1a1a' }}>
                  Конвертер <span style={{ color: '#E8450A' }}>кабеля</span>
                </h1>
                <span className="text-sm text-slate-400 font-normal">by Давыдовы</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">Тульский Кабельный Завод — производственный расчёт</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saving && <span className="text-xs text-slate-400">Сохранение...</span>}
            {!saving && saveOk && <span className="text-xs text-emerald-500">Техкарты сохранены ✓</span>}
            <a href="/owner" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: '#E8450A' }}>
              <Database className="h-4 w-4" /> Финансы
            </a>
            <a href="/contractors" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors bg-white">
              <Database className="h-4 w-4" /> Контрагенты
            </a>
            <a href="/summary" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors bg-white">
              <Database className="h-4 w-4" /> Краткая сводка
            </a>
            <a href="/safety" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors bg-white">
              <Database className="h-4 w-4" /> Охрана труда
            </a>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Левая колонка — расчёт */}
          <Card className="rounded-2xl shadow-sm lg:col-span-1">
            <CardHeader style={{ borderBottom: '2px solid #E8450A' }}>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calculator className="h-5 w-5" style={{ color: '#E8450A' }} /> Расчет перевода
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Выбери наш кабель</Label>
                <SelectBox value={myId} onChange={setMyId} items={my} placeholder="Выбери наш кабель" />
              </div>
              <div className="rounded-2xl border bg-white p-4 space-y-3">
                <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">Расчет идет по счету: {sum.length} строк с чужими кабелями.</div>
                <div className="flex items-center gap-2 text-sm text-slate-500"><ArrowRightLeft className="h-4 w-4" /> Результат конвертации</div>
                {/* Главный результат */}
                <div className="rounded-xl p-4 text-white" style={{ background: 'linear-gradient(135deg, #E8450A, #c73a08)' }}>
                  <div className="text-5xl font-black tracking-tight">{whole}</div>
                  <div className="mt-1 text-sm font-medium opacity-90">целых единиц {selM?.name}</div>
                  <div className="mt-2 text-xs opacity-70">Точный расчет: {rnd(lim?.possible ?? fallback?.possible ?? 0, 4)}</div>
                </div>
                {lim && <div className="text-sm text-slate-600">Ограничивающий материал: <Badge variant="secondary">{lim.material || "нет"}</Badge></div>}
                {more.length > 0 && <div className="rounded-xl bg-amber-50 p-3"><div className="mb-1 text-xs text-slate-600">Чтобы получить еще +1 ед. {selM?.name}, нужно докупить:</div>{more.map(x => <div key={x!.material} className="flex justify-between gap-3 text-xs"><span>{x!.material}</span><span>{x!.add} {x!.unit}</span></div>)}</div>}
                {paintMinus.length > 0 && <div className="mt-2 rounded-xl bg-rose-50 p-3"><div className="mb-1 text-xs text-slate-600">Недостача по желтой и салатовой краске:</div>{paintMinus.map(x => <div key={x!.material} className="flex justify-between gap-3 text-xs"><span>{x!.material}</span><span>-{x!.deficit} {x!.unit}</span></div>)}</div>}
                {left.length > 0 && <div className="mt-2 rounded-xl bg-sky-50 p-3"><div className="mb-1 text-xs text-slate-600">Остатки из счета:</div>{left.map(x => <div key={x.material} className="flex justify-between gap-3 text-xs"><span>{x.material}</span><span>{x.leftover}</span></div>)}</div>}
              </div>
            </CardContent>
          </Card>

          {/* Правая колонка — вкладки */}
          <Card className="rounded-2xl shadow-sm lg:col-span-2">
            <CardHeader style={{ borderBottom: '2px solid #E8450A' }}>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Database className="h-5 w-5" style={{ color: '#E8450A' }} /> Кабели, техкарты и материалы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="recipes" className="w-full">
                <TabsList className="flex flex-wrap h-auto gap-1 w-full justify-start">
                  <TabsTrigger value="recipes">Техкарты</TabsTrigger>
                  <TabsTrigger value="invoice">Счет</TabsTrigger>
                  <TabsTrigger value="conversion">Перевод</TabsTrigger>
                  <TabsTrigger value="cables">Кабели</TabsTrigger>
                  <TabsTrigger value="materials">Материалы</TabsTrigger>
                  <TabsTrigger value="pricing">Расчёт цены</TabsTrigger>
                </TabsList>

                {/* Техкарты */}
                <TabsContent value="recipes" className="mt-4 space-y-6">
                  <div className="grid gap-6 xl:grid-cols-2">
                    <Card className="rounded-2xl">
                      <CardHeader><CardTitle>Техкарта нашего кабеля</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2"><Label>Выбери наш кабель</Label><SelectBox value={myId} onChange={setMyId} items={my} placeholder="Выбери наш кабель" /></div>
                        {selM && <>
                          <div className="flex items-center gap-2">
                            <Input value={selM.name} onChange={e => patch(setMy, selM.id, "name", e.target.value)} />
                            <Button variant="ghost" size="icon" onClick={() => deleteCable("my", selM.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                          <RecipeTable materials={materials} cable={selM} onChange={(m, v) => patchRecipe(setMy, selM.id, m, v)} />
                        </>}
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl">
                      <CardHeader><CardTitle>Техкарта чужого кабеля</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2"><Label>Группа чужого кабеля</Label><SelectBox value={gRec} onChange={setGRec} items={GROUPS.map(value => ({ value }))} placeholder="Выбери группу" all /></div>
                        <div className="space-y-2"><Label>Выбери чужой кабель</Label><SelectBox value={fId} onChange={setFId} items={fRec} placeholder="Выбери чужой кабель" /></div>
                        {selF && <>
                          <div className="flex items-center gap-2">
                            <Input value={selF.name} onChange={e => patch(setForeign, selF.id, "name", e.target.value)} />
                            <Button variant="ghost" size="icon" onClick={() => deleteCable("foreign", selF.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                          <div className="text-xs text-slate-500">Группа: {selF.group}</div>
                          <RecipeTable materials={materials} cable={selF} onChange={(m, v) => patchRecipe(setForeign, selF.id, m, v)} />
                        </>}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Счёт */}
                <TabsContent value="invoice" className="mt-4 space-y-4">
                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Строки счета с чужими кабелями</span>
                        <Button type="button" onClick={addLine} className="gap-2 text-white" style={{ background: '#E8450A' }}><Plus className="h-4 w-4" /> Добавить строку</Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2"><Label>Фильтр по группе</Label><SelectBox value={gInv} onChange={setGInv} items={GROUPS.map(value => ({ value }))} placeholder="Выбери группу" all /></div>
                      {lines.map((line, i) => (
                        <div key={line.id} className="grid gap-3 rounded-2xl border p-3 md:grid-cols-[1fr_180px_48px]">
                          <div className="space-y-2"><Label>Чужой кабель #{i + 1}</Label><SelectBox value={line.cableId} onChange={v => setLines(p => p.map(l => l.id === line.id ? { ...l, cableId: v } : l))} items={fInv} placeholder="Выбери чужой кабель" /></div>
                          <div className="space-y-2"><Label>Количество</Label><NumberField value={line.qty} onChange={v => setLines(p => p.map(l => l.id === line.id ? { ...l, qty: v } : l))} step="0.001" /></div>
                          <div className="flex items-end"><Button variant="ghost" size="icon" onClick={() => setLines(p => p.length <= 1 ? p : p.filter(l => l.id !== line.id))}><Trash2 className="h-4 w-4" /></Button></div>
                        </div>
                      ))}
                      <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Строки счёта не сохраняются — это рабочая область для текущего расчёта.</div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Перевод */}
                <TabsContent value="conversion" className="mt-4 space-y-4">
                  <div className="overflow-x-auto rounded-2xl border">
                    <Table>
                      <TableHeader><TableRow><TableHead>Материал</TableHead><TableHead className="text-right">Доступно из счета</TableHead><TableHead className="text-right">Нужно на 1 ед. {selM?.name}</TableHead><TableHead className="text-right">Хватит на</TableHead></TableRow></TableHeader>
                      <TableBody>{rows.map(x => {
                        const lacking = x.possible !== null && x.need > 0 && x.possible < whole + 1 && !IGNORE.has(x.material);
                        const surplus = x.possible !== null && x.need > 0 && x.possible >= whole + 2;
                        const rowStyle = lacking ? { background: '#fff5f5' } : surplus ? { background: '#f0fdf4' } : {};
                        return <TableRow key={x.material} style={rowStyle}>
                          <TableCell className="font-medium">{x.material}</TableCell>
                          <TableCell className="text-right">{x.available}</TableCell>
                          <TableCell className="text-right">{x.need}</TableCell>
                          <TableCell className="text-right font-semibold" style={{ color: lacking ? '#dc2626' : surplus ? '#16a34a' : undefined }}>{x.possible === null ? "—" : x.possible}</TableCell>
                        </TableRow>;
                      })}</TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* Кабели */}
                <TabsContent value="cables" className="mt-4 space-y-6">
                  <div className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">Все добавленные и изменённые кабели сохраняются автоматически в базе данных.</div>
                  <div className="grid gap-6 xl:grid-cols-2">
                    <Card className="rounded-2xl">
                      <CardHeader><CardTitle>Наши кабели</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <Input placeholder="Например, Мой кабель 3" value={newMy} onChange={e => setNewMy(e.target.value)} onKeyDown={e => e.key === "Enter" && addMyCable()} />
                          <div className="space-y-1"><Label>Создать на основе техкарты</Label><SelectBox value={newMyBase} onChange={setNewMyBase} items={[{ value: EMPTY, label: "Пустая техкарта" }, ...my.map(x => ({ id: x.id, name: x.name }))]} placeholder="Выбери готовую техкарту" /></div>
                          <Button type="button" onClick={addMyCable} className="gap-2 text-white" style={{ background: '#E8450A' }}><Plus className="h-4 w-4" /> Добавить</Button>
                          <div className="text-sm text-slate-600">Сейчас наших кабелей: {my.length}</div>
                        </div>
                        <div className="space-y-3 border-t pt-4">
                          <div className="text-sm font-medium text-slate-700">Переименовать наши кабели</div>
                          {my.map(c => <div key={c.id} className="flex items-center gap-2 rounded-xl border p-2"><Input value={c.name} onChange={e => patch(setMy, c.id, "name", e.target.value)} placeholder="Название кабеля" /><Button variant="ghost" size="icon" onClick={() => deleteCable("my", c.id)}><Trash2 className="h-4 w-4" /></Button></div>)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl">
                      <CardHeader><CardTitle>Чужие кабели</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <Input placeholder="Например, Чужой кабель 72" value={newF} onChange={e => setNewF(e.target.value)} onKeyDown={e => e.key === "Enter" && addForeignCable()} />
                          <SelectBox value={newFG} onChange={setNewFG} items={GROUPS.map(value => ({ value }))} placeholder="Выбери группу" />
                          <div className="space-y-1"><Label>Создать на основе техкарты</Label><SelectBox value={newFBase} onChange={setNewFBase} items={[{ value: EMPTY, label: "Пустая техкарта" }, ...byGroup(foreign, newFG).map(x => ({ id: x.id, name: x.name }))]} placeholder="Выбери готовую техкарту" /></div>
                          <Button type="button" onClick={addForeignCable} className="gap-2 text-white" style={{ background: '#E8450A' }}><Plus className="h-4 w-4" /> Добавить</Button>
                          <div className="text-sm text-slate-600">Сейчас чужих кабелей: {foreign.length}</div>
                          <div className="text-xs text-slate-500">После добавления кабель сразу попадет в список выбора в «Техкартах».</div>
                        </div>
                        <div className="space-y-3 border-t pt-4">
                          <div className="text-sm font-medium text-slate-700">Переименовать и группировать чужие кабели</div>
                          {foreign.map(c => <div key={c.id} className="space-y-2 rounded-xl border p-2">
                            <div className="flex items-center gap-2"><Input value={c.name} onChange={e => patch(setForeign, c.id, "name", e.target.value)} placeholder="Название кабеля" /><Button variant="ghost" size="icon" onClick={() => deleteCable("foreign", c.id)}><Trash2 className="h-4 w-4" /></Button></div>
                            <SelectBox value={c.group || GROUPS[0]} onChange={v => patch(setForeign, c.id, "group", v)} items={GROUPS.map(value => ({ value }))} placeholder="Выбери группу" />
                          </div>)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Материалы */}
                <TabsContent value="materials" className="mt-4 space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="Новый материал" value={newMat} onChange={e => setNewMat(e.target.value)} onKeyDown={e => e.key === "Enter" && addMaterial()} />
                    <Button type="button" onClick={addMaterial} className="gap-2 text-white" style={{ background: '#E8450A' }}><Plus className="h-4 w-4" /> Добавить</Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {materials.map(m => <div key={m} className="flex items-center justify-between rounded-2xl border bg-white p-3 gap-3">
                      <div><div className="text-sm font-medium">{m}</div><div className="text-xs text-slate-500">{UNITS[m] || "—"}</div></div>
                      <Button variant="ghost" size="icon" onClick={() => delMaterial(m)}><Trash2 className="h-4 w-4" /></Button>
                    </div>)}
                  </div>
                </TabsContent>

                {/* Расчёт цены */}
                <TabsContent value="pricing" className="mt-4 space-y-4">
                  <div className="flex flex-wrap gap-3 items-end p-3 rounded-xl bg-orange-50 border border-orange-100">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-orange-700 font-semibold">Стоимость нормо-часа (общая), ₽</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          className="h-8 text-sm w-44"
                          type="number" min="0" placeholder="Введите сумму"
                          value={globalHourRate}
                          onChange={e => setGlobalHourRate(e.target.value)}
                        />
                        <Button type="button" size="sm" className="text-white text-xs" style={{ background: '#E8450A' }}
                          onClick={() => {
                            localStorage.setItem("globalHourRate", globalHourRate);
                            setPricingRows(prev => prev.map(r => ({ ...r, hourRate: globalHourRate })));
                            fetch(`${API_URL}?section=pricing`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ section: "pricing", action: "save_hour_rate", globalHourRate }),
                            }).catch(console.error);
                          }}>
                          Применить ко всем
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-orange-600/80 self-end pb-1">Устанавливается один раз, сохраняется автоматически</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-500">Добавьте кабели для расчёта стоимости производства и итоговой цены.</p>
                    <Button type="button" className="gap-2 text-white" style={{ background: '#E8450A' }}
                      onClick={() => setPricingRows(prev => [...prev, { id: Date.now().toString(), cableId: foreign[0]?.id ?? "", normHours: "", hourRate: globalHourRate, costPrice: "" }])}>
                      <Plus className="h-4 w-4" /> Добавить кабель
                    </Button>
                  </div>
                  {pricingRows.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-sm">Нажмите «Добавить кабель» чтобы начать расчёт</div>
                  )}
                  {pricingRows.length > 0 && (
                    <div className="w-full overflow-x-auto overflow-y-visible">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-slate-50">
                            <th className="text-left px-3 py-2 text-slate-500 font-medium">Кабель</th>
                            <th className="text-right px-3 py-2 text-slate-500 font-medium">Норма часов</th>
                            <th className="text-right px-3 py-2 text-slate-500 font-medium">Стоимость н/ч, ₽</th>
                            <th className="text-right px-3 py-2 text-slate-500 font-medium">Стоимость производства</th>
                            <th className="text-right px-3 py-2 text-slate-500 font-medium">Себестоимость, ₽</th>
                            <th className="text-right px-3 py-2 text-slate-500 font-medium">Итого (×1,03)</th>
                            <th className="px-3 py-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {pricingRows.map(row => {
                            const resolvedCableId = foreign.some(c => c.id === row.cableId) ? row.cableId : (foreign[0]?.id ?? "");
                            const prodCost = num(row.normHours) * num(row.hourRate);
                            const total = (num(row.costPrice) + prodCost) * 1.03;
                            const upd = (field: string, val: string) =>
                              setPricingRows(prev => prev.map(r => r.id === row.id ? { ...r, [field]: val } : r));
                            return (
                              <tr key={row.id} className="border-b hover:bg-slate-50/50">
                                <td className="px-3 py-2 min-w-[180px]">
                                  <Select value={resolvedCableId} onValueChange={v => upd("cableId", v)}>
                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Выбери кабель" /></SelectTrigger>
                                    <SelectContent position="popper" className="z-50">
                                      {foreign.map(c => <SelectItem key={c.id} value={c.id}>{c.name}{c.group ? ` (${c.group})` : ""}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="px-3 py-2 w-[120px]">
                                  <Input className="h-8 text-xs text-right" type="number" min="0" placeholder="0" value={row.normHours} onChange={e => upd("normHours", e.target.value)} />
                                </td>
                                <td className="px-3 py-2 w-[140px]">
                                  <Input className="h-8 text-xs text-right" type="number" min="0" placeholder="0" value={row.hourRate} onChange={e => upd("hourRate", e.target.value)} />
                                </td>
                                <td className="px-3 py-2 text-right font-semibold text-slate-700">
                                  {num(row.normHours) > 0 && num(row.hourRate) > 0 ? prodCost.toLocaleString("ru-RU", { maximumFractionDigits: 2 }) + " ₽" : "—"}
                                </td>
                                <td className="px-3 py-2 w-[140px]">
                                  <Input className="h-8 text-xs text-right" type="number" min="0" placeholder="0" value={row.costPrice} onChange={e => upd("costPrice", e.target.value)} />
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {(num(row.costPrice) > 0 || prodCost > 0)
                                    ? <span className="font-bold text-orange-600">{total.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽</span>
                                    : <span className="text-slate-400">—</span>}
                                </td>
                                <td className="px-3 py-2">
                                  <Button variant="ghost" size="icon" onClick={() => setPricingRows(prev => prev.filter(r => r.id !== row.id))}>
                                    <Trash2 className="h-4 w-4 text-slate-400" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}