import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/de5777c7-eed8-4126-9546-7f8cf1ea24e3";
const CONTRACTORS_API = "https://functions.poehali.dev/9190b881-e41b-42df-ae0c-62bf6879782c";

interface Contract {
  id: number;
  contractor: string;
  title: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  notes?: string;
  created_at: string;
}

const fmtSize = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
};

const fmtDate = (v: string) => new Date(v).toLocaleDateString("ru-RU");

const fileIcon = (type?: string, name?: string) => {
  const t = (type || name || "").toLowerCase();
  if (t.includes("pdf")) return "FileText";
  if (t.includes("word") || t.includes("doc")) return "FileType";
  if (t.includes("sheet") || t.includes("xls")) return "FileSpreadsheet";
  return "File";
};

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractors, setContractors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<string>("all");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [form, setForm] = useState({ contractor: "", title: "", notes: "" });
  const [showForm, setShowForm] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const [c, ct] = await Promise.all([
      fetch(API).then(r => r.json()),
      fetch(CONTRACTORS_API).then(r => r.json()),
    ]);
    setContracts(Array.isArray(c) ? c : []);
    setContractors(Array.isArray(ct) ? ct.map((x: { name: string }) => x.name) : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleFile = (file: File) => {
    setPendingFile(file);
    setForm(p => ({ ...p, title: file.name.replace(/\.[^.]+$/, "") }));
    setShowForm(true);
  };

  const upload = async () => {
    if (!pendingFile || !form.contractor || !form.title) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_data: base64,
          file_name: pendingFile.name,
          file_type: pendingFile.type || "application/octet-stream",
          contractor: form.contractor,
          title: form.title,
          notes: form.notes,
        }),
      });
      setPendingFile(null);
      setForm({ contractor: "", title: "", notes: "" });
      setShowForm(false);
      setUploading(false);
      load();
    };
    reader.readAsDataURL(pendingFile);
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить договор?")) return;
    await fetch(`${API}?id=${id}`, { method: "DELETE" });
    setContracts(p => p.filter(c => c.id !== id));
  };

  const filtered = selectedContractor === "all"
    ? contracts
    : contracts.filter(c => c.contractor === selectedContractor);

  // Group by contractor
  const grouped = filtered.reduce<Record<string, Contract[]>>((acc, c) => {
    if (!acc[c.contractor]) acc[c.contractor] = [];
    acc[c.contractor].push(c);
    return acc;
  }, {});

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://cdn.poehali.dev/projects/48d0f348-e369-40e0-b696-33913aa2ef26/bucket/f74a2a3e-f940-47c8-9193-d9634773e26c.png" alt="ТКЗ" className="h-12 w-12 object-contain" />
            <div>
              <div className="font-bold text-slate-800 leading-tight">Договоры <span style={{ color: "#E8450A" }}>ТКЗ</span></div>
              <div className="text-xs text-slate-400">Документы</div>
            </div>
          </div>
          <button className="md:hidden p-1" onClick={() => setMobileOpen(false)}><Icon name="X" size={20} className="text-slate-500" /></button>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <a href="/owner" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <Icon name="BarChart3" size={15} /> Финансы
        </a>
        <a href="/contractors" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <Icon name="Users" size={15} /> Контрагенты
        </a>
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#E8450A" }}>
          <Icon name="FolderOpen" size={15} /> Договоры
        </div>
        <a href="/summary" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <Icon name="FileBarChart" size={15} /> Краткая сводка
        </a>

        {/* Filter by contractor */}
        {contractors.length > 0 && (
          <div className="pt-3">
            <div className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Фильтр</div>
            <button
              onClick={() => setSelectedContractor("all")}
              className={`w-full text-left px-4 py-2 rounded-lg text-xs transition-colors ${selectedContractor === "all" ? "font-semibold text-slate-800 bg-slate-100" : "text-slate-500 hover:bg-slate-50"}`}
            >
              Все контрагенты
            </button>
            {contractors.map(c => (
              <button
                key={c}
                onClick={() => setSelectedContractor(c)}
                className={`w-full text-left px-4 py-2 rounded-lg text-xs transition-colors truncate ${selectedContractor === c ? "font-semibold text-slate-800 bg-slate-100" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
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
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-72 bg-white flex flex-col shadow-xl h-full overflow-y-auto">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 overflow-auto min-w-0">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button className="md:hidden p-2 rounded-lg bg-white border border-slate-200" onClick={() => setMobileOpen(true)}>
                <Icon name="Menu" size={18} className="text-slate-600" />
              </button>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-slate-800">Договоры</h1>
                <p className="text-sm text-slate-400 mt-0.5">{contracts.length} документ{contracts.length === 1 ? "" : contracts.length < 5 ? "а" : "ов"}</p>
              </div>
            </div>
            <button
              onClick={() => { setShowForm(true); setPendingFile(null); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#E8450A" }}
            >
              <Icon name="Upload" size={16} /> Загрузить
            </button>
          </div>

          {/* Upload form */}
          {showForm && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
              <h2 className="font-semibold text-slate-700 mb-4">Загрузить договор</h2>

              {/* Drop zone */}
              {!pendingFile ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-4 ${dragOver ? "border-orange-400 bg-orange-50" : "border-slate-200 hover:border-orange-300 hover:bg-slate-50"}`}
                >
                  <Icon name="UploadCloud" size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm text-slate-500">Перетащите файл или нажмите для выбора</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, Word, Excel — любые документы</p>
                  <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4 border border-slate-200">
                  <Icon name={fileIcon(pendingFile.type, pendingFile.name)} size={24} className="text-slate-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 truncate">{pendingFile.name}</div>
                    <div className="text-xs text-slate-400">{fmtSize(pendingFile.size)}</div>
                  </div>
                  <button onClick={() => setPendingFile(null)} className="text-slate-400 hover:text-slate-600"><Icon name="X" size={16} /></button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-slate-500 mb-1 block">Контрагент *</label>
                  <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.contractor} onChange={e => setForm(p => ({ ...p, contractor: e.target.value }))}>
                    <option value="">— выберите контрагента —</option>
                    {contractors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-500 mb-1 block">Название договора *</label>
                  <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Договор поставки №123" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-500 mb-1 block">Примечание</label>
                  <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Необязательно" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={upload} disabled={uploading || !pendingFile || !form.contractor || !form.title}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-opacity"
                  style={{ backgroundColor: "#E8450A" }}>
                  {uploading ? "Загружаю..." : "Сохранить"}
                </button>
                <button onClick={() => { setShowForm(false); setPendingFile(null); }} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200">Отмена</button>
              </div>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="text-center text-slate-400 py-16">Загрузка...</div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center text-slate-400 py-16 bg-white rounded-xl border border-slate-200">
              <Icon name="FolderOpen" size={40} className="mx-auto mb-3 opacity-20" />
              <p>Нет договоров. Нажмите «Загрузить»</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([contractor, docs]) => (
                <div key={contractor}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: "#E8450A" }}>
                      {contractor.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-slate-700 text-sm">{contractor}</span>
                    <span className="text-xs text-slate-400">{docs.length} файл{docs.length === 1 ? "" : docs.length < 5 ? "а" : "ов"}</span>
                  </div>
                  <div className="space-y-2 pl-9">
                    {docs.map(doc => (
                      <div key={doc.id} className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 hover:border-slate-300 transition-colors">
                        <Icon name={fileIcon(doc.file_type, doc.file_name)} size={20} className="text-slate-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-700 truncate">{doc.title}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-400 truncate">{doc.file_name}</span>
                            {doc.file_size && <span className="text-xs text-slate-300">· {fmtSize(doc.file_size)}</span>}
                            <span className="text-xs text-slate-300">· {fmtDate(doc.created_at)}</span>
                          </div>
                          {doc.notes && <div className="text-xs text-slate-400 mt-0.5">{doc.notes}</div>}
                        </div>
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                          title="Открыть"
                        >
                          <Icon name="Download" size={16} />
                        </a>
                        <button onClick={() => remove(doc.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors shrink-0">
                          <Icon name="Trash2" size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
