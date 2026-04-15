import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/7a89af77-23c5-4f77-86f7-dbc432908f1e";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Employee {
  id: number;
  name: string;
  position: string;
  briefing: boolean;
  ppe: boolean;
  medical: boolean;
  next_briefing: string;
  comment: string;
}

interface CheckItem {
  id: number;
  text: string;
  done: boolean;
  created_at: string;
}

interface PPERecord {
  id: number;
  name: string;
  type: string;
  issued: boolean;
  issued_at: string;
}

interface Document {
  id: number;
  title: string;
  url: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (v: string) => v ? new Date(v + "T00:00:00").toLocaleDateString("ru-RU") : "—";

type StatusType = "ok" | "warn" | "danger" | "none";
const briefingStatus = (date: string): StatusType => {
  if (!date) return "none";
  const diff = (new Date(date).getTime() - Date.now()) / 86400000;
  if (diff < 0) return "danger";
  if (diff < 14) return "warn";
  return "ok";
};
const STATUS_COLOR: Record<StatusType, string> = {
  ok: "bg-green-100 text-green-700",
  warn: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
  none: "bg-slate-100 text-slate-500",
};
const STATUS_LABEL: Record<StatusType, string> = {
  ok: "Ок", warn: "Скоро", danger: "Просрочен", none: "Не задан",
};

const SECTIONS = [
  { key: "employees", label: "Сотрудники", icon: "HardHat" },
  { key: "deadlines", label: "Сроки / Просрочки", icon: "AlertTriangle" },
  { key: "checklists", label: "Чек-листы", icon: "ClipboardList" },
  { key: "ppe", label: "СИЗ", icon: "Package" },
  { key: "docs", label: "Документы", icon: "Paperclip" },
] as const;
type Section = typeof SECTIONS[number]["key"];

const YesNo = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button type="button" onClick={() => onChange(!value)}
    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
    {value ? "Да" : "Нет"}
  </button>
);

// ═══════════════════════════════════════════════════════════════════════════════
export default function Safety() {
  const [section, setSection] = useState<Section>("employees");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empLoading, setEmpLoading] = useState(true);
  const [empForm, setEmpForm] = useState<Partial<Employee>>({});
  const [empEditing, setEmpEditing] = useState<number | null>(null);
  const [showEmpForm, setShowEmpForm] = useState(false);

  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [checksLoading, setChecksLoading] = useState(true);
  const [checkText, setCheckText] = useState("");

  const [ppeList, setPpeList] = useState<PPERecord[]>([]);
  const [ppeLoading, setPpeLoading] = useState(true);
  const [ppeForm, setPpeForm] = useState<Partial<PPERecord>>({});
  const [ppeEditing, setPpeEditing] = useState<number | null>(null);
  const [showPpeForm, setShowPpeForm] = useState(false);

  const [docs, setDocs] = useState<Document[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [docForm, setDocForm] = useState<Partial<Document>>({});
  const [showDocForm, setShowDocForm] = useState(false);

  const loadSection = useCallback(async (sec: string, setter: (d: unknown[]) => void, loadSetter: (v: boolean) => void) => {
    loadSetter(true);
    const r = await fetch(`${API}?section=${sec}`);
    const data = await r.json();
    setter(Array.isArray(data) ? data : []);
    loadSetter(false);
  }, []);

  useEffect(() => { loadSection('employees', setEmployees as (d: unknown[]) => void, setEmpLoading); }, [loadSection]);
  useEffect(() => { loadSection('checks', setChecks as (d: unknown[]) => void, setChecksLoading); }, [loadSection]);
  useEffect(() => { loadSection('ppe', setPpeList as (d: unknown[]) => void, setPpeLoading); }, [loadSection]);
  useEffect(() => { loadSection('docs', setDocs as (d: unknown[]) => void, setDocsLoading); }, [loadSection]);

  // ─ Employee CRUD ─
  const saveEmp = async () => {
    if (!empForm.name) return;
    const payload = {
      name: empForm.name || '', position: empForm.position || '',
      briefing: empForm.briefing ?? false, ppe: empForm.ppe ?? false, medical: empForm.medical ?? false,
      next_briefing: empForm.next_briefing || null, comment: empForm.comment || '',
    };
    if (empEditing) {
      const r = await fetch(`${API}?section=employees&id=${empEditing}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const updated = await r.json();
      setEmployees(p => p.map(e => e.id === empEditing ? updated : e));
    } else {
      const r = await fetch(`${API}?section=employees`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const created = await r.json();
      setEmployees(p => [...p, created]);
    }
    setShowEmpForm(false); setEmpEditing(null); setEmpForm({});
  };
  const editEmp = (e: Employee) => { setEmpEditing(e.id); setEmpForm({ ...e }); setShowEmpForm(true); };
  const delEmp = async (id: number) => {
    if (!confirm("Удалить сотрудника?")) return;
    await fetch(`${API}?section=employees&id=${id}`, { method: 'DELETE' });
    setEmployees(p => p.filter(e => e.id !== id));
  };

  // ─ Checks CRUD ─
  const addCheck = async () => {
    if (!checkText.trim()) return;
    const r = await fetch(`${API}?section=checks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: checkText.trim(), done: false }) });
    const created = await r.json();
    setChecks(p => [...p, created]);
    setCheckText("");
  };
  const toggleCheck = async (c: CheckItem) => {
    const r = await fetch(`${API}?section=checks&id=${c.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: c.text, done: !c.done }) });
    const updated = await r.json();
    setChecks(p => p.map(x => x.id === c.id ? updated : x));
  };
  const delCheck = async (id: number) => {
    await fetch(`${API}?section=checks&id=${id}`, { method: 'DELETE' });
    setChecks(p => p.filter(x => x.id !== id));
  };

  // ─ PPE CRUD ─
  const savePpe = async () => {
    if (!ppeForm.name || !ppeForm.type) return;
    const payload = { name: ppeForm.name, type: ppeForm.type, issued: ppeForm.issued ?? false, issued_at: ppeForm.issued_at || null };
    if (ppeEditing) {
      const r = await fetch(`${API}?section=ppe&id=${ppeEditing}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const updated = await r.json();
      setPpeList(p => p.map(x => x.id === ppeEditing ? updated : x));
    } else {
      const r = await fetch(`${API}?section=ppe`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const created = await r.json();
      setPpeList(p => [...p, created]);
    }
    setShowPpeForm(false); setPpeEditing(null); setPpeForm({});
  };
  const editPpe = (r: PPERecord) => { setPpeEditing(r.id); setPpeForm({ ...r }); setShowPpeForm(true); };
  const delPpe = async (id: number) => {
    if (!confirm("Удалить запись?")) return;
    await fetch(`${API}?section=ppe&id=${id}`, { method: 'DELETE' });
    setPpeList(p => p.filter(x => x.id !== id));
  };

  // ─ Docs CRUD ─
  const saveDoc = async () => {
    if (!docForm.title || !docForm.url) return;
    const r = await fetch(`${API}?section=docs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: docForm.title, url: docForm.url }) });
    const created = await r.json();
    setDocs(p => [...p, created]);
    setDocForm({}); setShowDocForm(false);
  };
  const delDoc = async (id: number) => {
    if (!confirm("Удалить документ?")) return;
    await fetch(`${API}?section=docs&id=${id}`, { method: 'DELETE' });
    setDocs(p => p.filter(x => x.id !== id));
  };

  const overdue = employees.filter(e => briefingStatus(e.next_briefing) === "danger");
  const warn = employees.filter(e => briefingStatus(e.next_briefing) === "warn");
  const noPpe = employees.filter(e => !e.ppe);
  const noMedical = employees.filter(e => !e.medical);

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400";

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-slate-800 leading-tight">Охрана <span style={{ color: "#E8450A" }}>труда</span></div>
            <div className="text-xs text-slate-400">ТКЗ</div>
          </div>
          <button className="md:hidden p-1" onClick={() => setMobileOpen(false)}>
            <Icon name="X" size={20} className="text-slate-500" />
          </button>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {SECTIONS.map(s => (
          <button key={s.key} onClick={() => { setSection(s.key); setMobileOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${section === s.key ? "text-white" : "text-slate-600 hover:bg-slate-50"}`}
            style={section === s.key ? { backgroundColor: "#E8450A" } : {}}>
            <Icon name={s.icon} size={16} /> {s.label}
          </button>
        ))}
        <div className="pt-3 border-t border-slate-100 mt-2 space-y-0.5">
          <a href="/owner" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"><Icon name="BarChart3" size={15} /> Финансы</a>
          <a href="/contractors" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"><Icon name="Users" size={15} /> Контрагенты</a>
          <a href="/contracts" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"><Icon name="FolderOpen" size={15} /> Договоры</a>
          <a href="/summary" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"><Icon name="FileBarChart" size={15} /> Краткая сводка</a>
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
      <aside className="hidden md:flex w-60 bg-white border-r border-slate-200 flex-col shrink-0">
        <SidebarContent />
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-72 bg-white flex flex-col shadow-xl h-full overflow-y-auto"><SidebarContent /></div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex md:hidden items-center gap-3 mb-5">
          <button className="p-2 rounded-lg bg-white border border-slate-200" onClick={() => setMobileOpen(true)}>
            <Icon name="Menu" size={18} className="text-slate-600" />
          </button>
          <h1 className="font-bold text-slate-800">{SECTIONS.find(s => s.key === section)?.label}</h1>
        </div>

        {/* ── 1. СОТРУДНИКИ ─────────────────────────────────────────── */}
        {section === "employees" && (
          <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">👷 Сотрудники</h2>
                <p className="text-sm text-slate-400 mt-0.5">{employees.length} чел.</p>
              </div>
              <button onClick={() => { setEmpEditing(null); setEmpForm({}); setShowEmpForm(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#E8450A" }}>
                <Icon name="Plus" size={15} /> Добавить
              </button>
            </div>

            {showEmpForm && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5 shadow-sm">
                <h3 className="font-semibold text-slate-700 mb-4">{empEditing ? "Редактировать" : "Новый сотрудник"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><label className="text-xs text-slate-500 mb-1 block">ФИО *</label>
                    <input className={inp} value={empForm.name || ""} onChange={e => setEmpForm(p => ({ ...p, name: e.target.value }))} placeholder="Иванов Иван Иванович" /></div>
                  <div><label className="text-xs text-slate-500 mb-1 block">Должность</label>
                    <input className={inp} value={empForm.position || ""} onChange={e => setEmpForm(p => ({ ...p, position: e.target.value }))} placeholder="Электромонтажник" /></div>
                  <div><label className="text-xs text-slate-500 mb-1 block">Дата следующего инструктажа</label>
                    <input type="date" className={inp} value={empForm.next_briefing || ""} onChange={e => setEmpForm(p => ({ ...p, next_briefing: e.target.value }))} /></div>
                  <div><label className="text-xs text-slate-500 mb-1 block">Комментарий</label>
                    <input className={inp} value={empForm.comment || ""} onChange={e => setEmpForm(p => ({ ...p, comment: e.target.value }))} placeholder="Необязательно" /></div>
                  <div className="flex items-center gap-6 md:col-span-2">
                    <div className="flex items-center gap-2"><span className="text-xs text-slate-500">Инструктаж</span><YesNo value={!!empForm.briefing} onChange={v => setEmpForm(p => ({ ...p, briefing: v }))} /></div>
                    <div className="flex items-center gap-2"><span className="text-xs text-slate-500">СИЗ выдан</span><YesNo value={!!empForm.ppe} onChange={v => setEmpForm(p => ({ ...p, ppe: v }))} /></div>
                    <div className="flex items-center gap-2"><span className="text-xs text-slate-500">Медосмотр</span><YesNo value={!!empForm.medical} onChange={v => setEmpForm(p => ({ ...p, medical: v }))} /></div>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={saveEmp} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#E8450A" }}>Сохранить</button>
                  <button onClick={() => { setShowEmpForm(false); setEmpEditing(null); setEmpForm({}); }} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200">Отмена</button>
                </div>
              </div>
            )}

            {empLoading ? (
              <div className="text-center text-slate-400 py-12">Загрузка...</div>
            ) : employees.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                <Icon name="Users" size={36} className="mx-auto mb-3 opacity-20" />Нет сотрудников. Нажмите «Добавить»
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-100">
                      <tr className="text-left">
                        <th className="px-4 py-3 font-semibold text-slate-600">ФИО</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Должность</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 text-center">Инструктаж</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 text-center">СИЗ</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 text-center">Медосмотр</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">След. инструктаж</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Комментарий</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map(e => {
                        const st = briefingStatus(e.next_briefing);
                        return (
                          <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-800">{e.name}</td>
                            <td className="px-4 py-3 text-slate-500">{e.position || "—"}</td>
                            <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${e.briefing ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{e.briefing ? "Да" : "Нет"}</span></td>
                            <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${e.ppe ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{e.ppe ? "Да" : "Нет"}</span></td>
                            <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${e.medical ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{e.medical ? "Да" : "Нет"}</span></td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-600">{fmtDate(e.next_briefing)}</span>
                                {e.next_briefing && <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[st]}`}>{STATUS_LABEL[st]}</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-xs max-w-[120px] truncate">{e.comment || "—"}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                <button onClick={() => editEmp(e)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Icon name="Pencil" size={14} /></button>
                                <button onClick={() => delEmp(e.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-500"><Icon name="Trash2" size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 2. СРОКИ / ПРОСРОЧКИ ─────────────────────────────────── */}
        {section === "deadlines" && (
          <div className="max-w-3xl space-y-5">
            <h2 className="text-xl font-bold text-slate-800">⚠️ Сроки / Просрочки</h2>
            {[{
              title: "🔴 Просроченный инструктаж", items: overdue,
              color: "border-red-200 bg-red-50", badge: "bg-red-100 text-red-700", empty: "Нет просроченных",
            }, {
              title: "🟡 Инструктаж скоро истекает (менее 14 дней)", items: warn,
              color: "border-yellow-200 bg-yellow-50", badge: "bg-yellow-100 text-yellow-700", empty: "Всё в порядке",
            }, {
              title: "🔴 Нет СИЗ", items: noPpe,
              color: "border-red-200 bg-red-50", badge: "bg-red-100 text-red-700", empty: "У всех есть СИЗ",
            }, {
              title: "🔴 Нет медосмотра", items: noMedical,
              color: "border-red-200 bg-red-50", badge: "bg-red-100 text-red-700", empty: "Все прошли медосмотр",
            }].map(block => (
              <div key={block.title} className={`rounded-xl border p-4 ${block.color}`}>
                <div className="font-semibold text-slate-700 mb-3">{block.title}</div>
                {block.items.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500"><Icon name="CheckCircle2" size={16} className="text-green-500" /> {block.empty}</div>
                ) : (
                  <div className="space-y-1.5">
                    {block.items.map(e => (
                      <div key={e.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-white/80">
                        <span className="font-medium text-slate-800 text-sm">{e.name}</span>
                        {e.position && <span className="text-xs text-slate-400">{e.position}</span>}
                        {e.next_briefing && <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${block.badge}`}>{fmtDate(e.next_briefing)}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {overdue.length === 0 && warn.length === 0 && noPpe.length === 0 && noMedical.length === 0 && (
              <div className="text-center py-8 text-green-600 font-medium">
                <Icon name="ShieldCheck" size={40} className="mx-auto mb-2 text-green-400" /> Всё в порядке!
              </div>
            )}
          </div>
        )}

        {/* ── 3. ЧЕК-ЛИСТЫ ─────────────────────────────────────────── */}
        {section === "checklists" && (
          <div className="max-w-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-5">📋 Чек-листы</h2>
            <div className="flex gap-2 mb-5">
              <input className={inp + " flex-1"} value={checkText} onChange={e => setCheckText(e.target.value)}
                placeholder="Новая задача..." onKeyDown={e => { if (e.key === "Enter") addCheck(); }} />
              <button onClick={addCheck} className="px-4 py-2 rounded-lg text-sm font-medium text-white shrink-0" style={{ backgroundColor: "#E8450A" }}>
                <Icon name="Plus" size={16} />
              </button>
            </div>
            {checksLoading ? (
              <div className="text-center text-slate-400 py-8">Загрузка...</div>
            ) : checks.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
                <Icon name="ClipboardList" size={36} className="mx-auto mb-2 opacity-20" /> Нет задач
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-50">
                {checks.map(c => (
                  <div key={c.id} className={`flex items-center gap-3 px-4 py-3 ${c.done ? "opacity-50" : ""}`}>
                    <button onClick={() => toggleCheck(c)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${c.done ? "border-green-500 bg-green-500" : "border-slate-300"}`}>
                      {c.done && <Icon name="Check" size={12} className="text-white" />}
                    </button>
                    <span className={`flex-1 text-sm ${c.done ? "line-through text-slate-400" : "text-slate-700"}`}>{c.text}</span>
                    <button onClick={() => delCheck(c.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors"><Icon name="Trash2" size={14} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 text-xs text-slate-400 text-right">
              {checks.filter(c => c.done).length} / {checks.length} выполнено
            </div>
          </div>
        )}

        {/* ── 4. СИЗ ───────────────────────────────────────────────── */}
        {section === "ppe" && (
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">📦 СИЗ</h2>
                <p className="text-sm text-slate-400 mt-0.5">{ppeList.length} записей</p>
              </div>
              <button onClick={() => { setPpeEditing(null); setPpeForm({}); setShowPpeForm(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#E8450A" }}>
                <Icon name="Plus" size={15} /> Добавить
              </button>
            </div>
            {showPpeForm && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5 shadow-sm">
                <h3 className="font-semibold text-slate-700 mb-4">{ppeEditing ? "Редактировать" : "Новая запись СИЗ"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><label className="text-xs text-slate-500 mb-1 block">ФИО *</label><input className={inp} value={ppeForm.name || ""} onChange={e => setPpeForm(p => ({ ...p, name: e.target.value }))} placeholder="Иванов Иван Иванович" /></div>
                  <div><label className="text-xs text-slate-500 mb-1 block">Тип СИЗ *</label><input className={inp} value={ppeForm.type || ""} onChange={e => setPpeForm(p => ({ ...p, type: e.target.value }))} placeholder="Перчатки, обувь, каска..." /></div>
                  <div><label className="text-xs text-slate-500 mb-1 block">Дата выдачи</label><input type="date" className={inp} value={ppeForm.issued_at || ""} onChange={e => setPpeForm(p => ({ ...p, issued_at: e.target.value }))} /></div>
                  <div className="flex items-center gap-3 pt-5"><span className="text-xs text-slate-500">Выдано</span><YesNo value={!!ppeForm.issued} onChange={v => setPpeForm(p => ({ ...p, issued: v }))} /></div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={savePpe} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#E8450A" }}>Сохранить</button>
                  <button onClick={() => { setShowPpeForm(false); setPpeEditing(null); setPpeForm({}); }} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200">Отмена</button>
                </div>
              </div>
            )}
            {ppeLoading ? (
              <div className="text-center text-slate-400 py-12">Загрузка...</div>
            ) : ppeList.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                <Icon name="Package" size={36} className="mx-auto mb-3 opacity-20" /> Нет записей. Нажмите «Добавить»
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-semibold text-slate-600">ФИО</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Тип СИЗ</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 text-center">Выдано</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Дата выдачи</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {ppeList.map(r => (
                      <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                        <td className="px-4 py-3 text-slate-600">{r.type}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.issued ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{r.issued ? "Да" : "Нет"}</span></td>
                        <td className="px-4 py-3 text-slate-500">{fmtDate(r.issued_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => editPpe(r)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Icon name="Pencil" size={14} /></button>
                            <button onClick={() => delPpe(r.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-500"><Icon name="Trash2" size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 5. ДОКУМЕНТЫ ─────────────────────────────────────────── */}
        {section === "docs" && (
          <div className="max-w-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-800">📎 Документы</h2>
              <button onClick={() => setShowDocForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#E8450A" }}>
                <Icon name="Plus" size={15} /> Добавить
              </button>
            </div>
            {showDocForm && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5 shadow-sm">
                <h3 className="font-semibold text-slate-700 mb-4">Новый документ</h3>
                <div className="space-y-3">
                  <div><label className="text-xs text-slate-500 mb-1 block">Название *</label><input className={inp} value={docForm.title || ""} onChange={e => setDocForm(p => ({ ...p, title: e.target.value }))} placeholder="Инструкция по пожарной безопасности" /></div>
                  <div><label className="text-xs text-slate-500 mb-1 block">Ссылка *</label><input className={inp} value={docForm.url || ""} onChange={e => setDocForm(p => ({ ...p, url: e.target.value }))} placeholder="https://..." /></div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={saveDoc} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#E8450A" }}>Сохранить</button>
                  <button onClick={() => { setShowDocForm(false); setDocForm({}); }} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200">Отмена</button>
                </div>
              </div>
            )}
            {docsLoading ? (
              <div className="text-center text-slate-400 py-8">Загрузка...</div>
            ) : docs.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                <Icon name="Paperclip" size={36} className="mx-auto mb-3 opacity-20" /> Нет документов. Нажмите «Добавить»
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-50">
                {docs.map(d => (
                  <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                    <Icon name="FileText" size={18} className="text-slate-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700 truncate">{d.title}</div>
                      <a href={d.url} target="_blank" rel="noreferrer" className="text-xs text-orange-500 hover:underline truncate block">{d.url}</a>
                    </div>
                    <a href={d.url} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 shrink-0"><Icon name="ExternalLink" size={14} /></a>
                    <button onClick={() => delDoc(d.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 shrink-0"><Icon name="Trash2" size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
