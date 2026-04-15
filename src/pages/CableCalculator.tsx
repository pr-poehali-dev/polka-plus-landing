import React,{useEffect,useMemo,useState}from"react";
import{Card,CardContent,CardHeader,CardTitle}from"@/components/ui/card";
import{Button}from"@/components/ui/button";
import{Input}from"@/components/ui/input";
import{Label}from"@/components/ui/label";
import{Tabs,TabsContent,TabsList,TabsTrigger}from"@/components/ui/tabs";
import{Table,TableBody,TableCell,TableHead,TableHeader,TableRow}from"@/components/ui/table";
import{Badge}from"@/components/ui/badge";
import{Select,SelectContent,SelectItem,SelectTrigger,SelectValue}from"@/components/ui/select";
import Icon from"@/components/ui/icon";

const KEY="cableAppData",ALL="ALL",EMPTY="EMPTY",PAINTS=["Краска желтая","Краска салатовая"];
const UNITS={"Вес меди":"кг","Пластикат ПВХ ИО 20-13":"кг","Краска синяя":"кг","Краска желтая":"кг","Краска салатовая":"кг","Пластикат ПВХ О-40":"кг","Этикетка":"шт","Тальк":"кг","Пленка":"кг","Разбавитель":"граммы","Чернила":"граммы","Лента":"пог. м","Стрейч":"рулон"};
const MATERIALS=["Вес меди","Пластикат ПВХ ИО 20-13","Краска синяя","Краска желтая","Краска салатовая","Пластикат ПВХ О-40","Этикетка","Тальк","Пленка","Разбавитель","Чернила","Лента","Стрейч"];
const GROUPS=["КАРАТ","ГЕРМЕС","КАБЕЛЬ-ПРОМ","MARC KAB","VOLT","АльфаКабель","Альянс","АРКАД","АРНА"];
const IGNORE=new Set(PAINTS);
const num=v=>Number.isFinite(+v)?+v:0,rnd=(v,d=4)=>Number.isFinite(v)?+v.toFixed(d):0;
const byGroup=(arr,g)=>g===ALL?arr:arr.filter(x=>x.group===g);
const emptyRecipe=ms=>Object.fromEntries(ms.map(m=>[m,0]));
const mkRecipe=([a,b,c,d,e,f])=>({"Вес меди":a,"Пластикат ПВХ ИО 20-13":b,"Краска синяя":c,"Краска желтая":d,"Краска салатовая":e,"Пластикат ПВХ О-40":f,"Этикетка":1,"Тальк":0.01,"Пленка":0.06,"Разбавитель":0.0006,"Чернила":0.4,"Лента":0.76,"Стрейч":0.003});
const defaults={materials:MATERIALS,my:[{id:"my-1",name:"Мой кабель 1",recipe:mkRecipe([3.8163,2.079,0.0074,0.0074,0.002,5])},{id:"my-2",name:"Мой кабель 2",recipe:mkRecipe([3.65,2.01,0.0072,0.0072,0.0018,5.2])}],foreign:[{id:"foreign-1",name:"Чужой кабель 1",group:"КАРАТ",recipe:mkRecipe([3.2268,1.9563,0.0071,0.0071,0.0019,6.7])},{id:"foreign-2",name:"Чужой кабель 2",group:"АРКАД",recipe:mkRecipe([3.4,2.02,0.007,0.007,0.0017,6.2])}],lines:[{id:"line-1",cableId:"foreign-1",qty:"1"}]};
const normalizeForeign=arr=>arr.map((x,i)=>({...x,group:x.group||GROUPS[i%GROUPS.length],recipe:x.recipe||{}}));
const pick=(arr,id)=>arr.find(x=>x.id===id)||arr[0];
const sumAvail=(materials,lines)=>{const r=Object.fromEntries(materials.map(m=>[m,0]));lines.forEach(l=>materials.forEach(m=>r[m]+=num(l.cable?.recipe?.[m])*l.qty));return r};
const rowsFor=(materials,av,target)=>materials.map(m=>{const need=num(target?.recipe?.[m]),available=num(av[m]),possible=need>0?available/need:Infinity;return{material:m,available:rnd(available,6),need:rnd(need,6),possible:Number.isFinite(possible)?rnd(possible,4):null}});
const limitRow=rows=>rows.filter(x=>x.possible!==null&&!IGNORE.has(x.material)).reduce((m,x)=>!m||x.possible<m.possible?x:m,null);
const maxRow=rows=>rows.filter(x=>x.possible!==null).reduce((m,x)=>!m||x.possible>m.possible?x:m,null);
const leftovers=(materials,av,target,whole)=>materials.map(m=>({material:m,leftover:rnd(num(av[m])-num(target?.recipe?.[m])*whole,6)})).filter(x=>x.leftover>0);
const needMore=(materials,av,target,whole)=>materials.map(m=>{const need=num(target?.recipe?.[m]);if(need<=0)return null;const add=need*(whole+1)-num(av[m]);return add>0?{material:m,add:rnd(add,6),unit:UNITS[m]||"—"}:null}).filter(Boolean).sort((a,b)=>a.add-b.add);
const paintDeficit=(av,target,whole)=>PAINTS.map(m=>{const d=+(num(target?.recipe?.[m])*whole-num(av[m])).toFixed(6);return d>1e-6?{material:m,deficit:d,unit:UNITS[m]||"—"}:null}).filter(Boolean);

const SelectBox=({value,onChange,items,placeholder,all})=><Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue placeholder={placeholder}/></SelectTrigger><SelectContent>{all&&<SelectItem value={ALL}>Все группы</SelectItem>}{items.map(x=><SelectItem key={x.value||x.id} value={x.value||x.id}>{x.label||x.name||x.value}</SelectItem>)}</SelectContent></Select>;
const NumberField=({value,onChange,step="0.0001"})=><Input type="number" step={step} value={value} onChange={e=>onChange(e.target.value)} className="text-right"/>;
const RecipeTable=({materials,cable,onChange})=><div className="overflow-x-auto rounded-2xl border"><Table><TableHeader><TableRow><TableHead>Материал</TableHead><TableHead>Ед. изм.</TableHead><TableHead className="text-right">Расход</TableHead></TableRow></TableHeader><TableBody>{materials.map(m=><TableRow key={m}><TableCell className="font-medium">{m}</TableCell><TableCell className="text-slate-500">{UNITS[m]||"—"}</TableCell><TableCell><NumberField value={cable.recipe[m]??0} onChange={v=>onChange(m,v)}/></TableCell></TableRow>)}</TableBody></Table></div>;

export default function CableCalculator(){
  const [materials,setMaterials]=useState(defaults.materials),[my,setMy]=useState(defaults.my),[foreign,setForeign]=useState(defaults.foreign),[myId,setMyId]=useState("my-1"),[fId,setFId]=useState("foreign-1"),[gRec,setGRec]=useState(ALL),[gInv,setGInv]=useState(ALL),[newMat,setNewMat]=useState(""),[newMy,setNewMy]=useState(""),[newF,setNewF]=useState(""),[newFG,setNewFG]=useState(GROUPS[0]),[newMyBase,setNewMyBase]=useState(EMPTY),[newFBase,setNewFBase]=useState(EMPTY),[lines,setLines]=useState(defaults.lines),[ready,setReady]=useState(false);

  useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const p=JSON.parse(raw);setMaterials(p.materials||defaults.materials);setMy(p.my||defaults.my);setForeign(normalizeForeign(p.foreign||defaults.foreign));setLines(p.lines||defaults.lines)}}catch(e){console.error(e)}finally{setReady(true)}},[]);
  useEffect(()=>{if(ready)localStorage.setItem(KEY,JSON.stringify({materials,my,foreign,lines}))},[ready,materials,my,foreign,lines]);

  const fRec=useMemo(()=>byGroup(foreign,gRec),[foreign,gRec]),fInv=useMemo(()=>byGroup(foreign,gInv),[foreign,gInv]);
  const selM=pick(my,myId),selF=pick(foreign,fId);
  const sum=useMemo(()=>lines.map(l=>({...l,cable:foreign.find(x=>x.id===l.cableId),qty:Math.max(0,num(l.qty))})).filter(l=>l.cable&&l.qty>0),[lines,foreign]);
  const av=useMemo(()=>sumAvail(materials,sum),[materials,sum]);
  const rows=useMemo(()=>rowsFor(materials,av,selM),[materials,av,selM]);
  const lim=useMemo(()=>limitRow(rows),[rows]),fallback=useMemo(()=>maxRow(rows),[rows]);
  const whole=Math.floor((lim?.possible??fallback?.possible)??0);
  const left=useMemo(()=>leftovers(materials,av,selM,whole),[materials,av,selM,whole]);
  const more=useMemo(()=>needMore(materials,av,selM,whole),[materials,av,selM,whole]);
  const paintMinus=useMemo(()=>paintDeficit(av,selM,whole),[av,selM,whole]);

  useEffect(()=>{if(!fRec.some(x=>x.id===fId))setFId(fRec[0]?.id||foreign[0]?.id||"")},[fRec,fId,foreign]);

  const patch=(set,id,key,val)=>set(prev=>prev.map(c=>c.id===id?{...c,[key]:val}:c));
  const patchRecipe=(set,id,m,v)=>set(prev=>prev.map(c=>c.id===id?{...c,recipe:{...c.recipe,[m]:v===""?"":num(v)}}:c));
  const deleteCable=(kind,id)=>{if(kind==="my"){if(my.length<=1)return;const next=my.filter(x=>x.id!==id);setMy(next);if(myId===id)setMyId(next[0].id);return}if(foreign.length<=1)return;const next=foreign.filter(x=>x.id!==id);setForeign(next);if(fId===id)setFId(next[0]?.id||"");setLines(prev=>{const rest=prev.filter(x=>x.cableId!==id);return rest.length?rest:[{id:`line-${Date.now()}`,cableId:next[0]?.id||"",qty:"0"}]})};
  const addMaterial=()=>{const name=newMat.trim();if(!name||materials.includes(name))return;setMaterials(p=>[...p,name]);const enrich=arr=>arr.map(c=>({...c,recipe:{...c.recipe,[name]:0}}));setMy(enrich);setForeign(enrich);setNewMat("")};
  const delMaterial=name=>{setMaterials(p=>p.filter(x=>x!==name));const strip=arr=>arr.map(c=>{const recipe={...c.recipe};delete recipe[name];return{...c,recipe}});setMy(strip);setForeign(strip)};
  const addMyCable=()=>{const name=newMy.trim();if(!name)return;const id=`my-${Date.now()}`,base=my.find(c=>c.id===newMyBase);setMy(p=>[...p,{id,name,recipe:base?{...base.recipe}:emptyRecipe(materials)}]);setMyId(id);setNewMy("");setNewMyBase(EMPTY)};
  const addForeignCable=()=>{const name=newF.trim();if(!name)return;if(foreign.some(c=>c.group===newFG&&c.name.trim().toLowerCase()===name.toLowerCase()))return alert("Такой кабель уже есть в этой группе ❗");const id=`foreign-${Date.now()}`,base=foreign.find(c=>c.id===newFBase);setForeign(p=>[...p,{id,name,group:newFG,recipe:base?{...base.recipe}:emptyRecipe(materials)}]);setFId(id);setGRec(newFG);setNewF("");setNewFBase(EMPTY)};
  const addLine=()=>setLines(p=>[...p,{id:`line-${Date.now()}-${p.length}`,cableId:fInv[0]?.id||foreign[0]?.id||"",qty:"0"}]);
  const save=()=>{localStorage.setItem(KEY,JSON.stringify({materials,my,foreign,lines}));alert("Сохранено ✅")};
  const reset=()=>{setMaterials(defaults.materials);setMy(defaults.my);setForeign(defaults.foreign);setMyId("my-1");setFId("foreign-1");setGRec(ALL);setGInv(ALL);setNewMat("");setNewMy("");setNewF("");setNewFG(GROUPS[0]);setNewMyBase(EMPTY);setNewFBase(EMPTY);setLines(defaults.lines)};

  if(!ready)return <div className="p-6 text-sm text-slate-600">Загрузка...</div>;

  return <div className="min-h-screen bg-slate-50 p-4 md:p-8"><div className="mx-auto max-w-7xl space-y-6">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Конвертер кабеля</h1>
        <p className="mt-1 text-sm text-slate-600">Выбираешь свой кабель, а приложение переводит в него материалы из строк, заполненных в окне «Счет».</p>
      </div>
      <Button variant="outline" onClick={reset}>Сбросить к примеру</Button>
    </div>

    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="rounded-2xl shadow-sm lg:col-span-1"><CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Icon name="Calculator" className="h-5 w-5"/> Расчет перевода</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="space-y-2"><Label>Выбери наш кабель</Label><SelectBox value={myId} onChange={setMyId} items={my} placeholder="Выбери наш кабель"/></div>
        <div className="rounded-2xl border bg-white p-4 space-y-3">
          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">Расчет идет по счету: {sum.length} строк с чужими кабелями.</div>
          <div className="flex items-center gap-2 text-sm text-slate-500"><Icon name="ArrowRightLeft" className="h-4 w-4"/> Результат конвертации</div>
          <div><div className="text-3xl font-bold">{whole}</div><div className="text-sm text-slate-600">целых единиц можно получить {selM?.name}</div><div className="mt-1 text-xs text-slate-500">Точный расчет: {rnd(lim?.possible??fallback?.possible??0,4)}</div><div className="mt-1 text-xs text-slate-500">Источник данных: строки из окна «Счет»</div></div>
          {lim&&<div className="text-sm">Ограничивающий материал (без учета желтой и салатовой краски): <Badge variant="secondary">{lim.material||"нет"}</Badge></div>}
          {more.length>0&&<div className="rounded-xl bg-amber-50 p-3"><div className="mb-1 text-xs text-slate-600">Чтобы получить еще +1 ед. {selM?.name}, нужно докупить:</div>{more.map(x=><div key={x.material} className="flex justify-between gap-3 text-xs"><span>{x.material}</span><span>{x.add} {x.unit}</span></div>)}</div>}
          {paintMinus.length>0&&<div className="mt-2 rounded-xl bg-rose-50 p-3"><div className="mb-1 text-xs text-slate-600">Недостача по желтой и салатовой краске:</div>{paintMinus.map(x=><div key={x.material} className="flex justify-between gap-3 text-xs"><span>{x.material}</span><span>-{x.deficit} {x.unit}</span></div>)}</div>}
          {left.length>0&&<div className="mt-2 rounded-xl bg-sky-50 p-3"><div className="mb-1 text-xs text-slate-600">Остатки из счета:</div>{left.map(x=><div key={x.material} className="flex justify-between gap-3 text-xs"><span>{x.material}</span><span>{x.leftover}</span></div>)}</div>}
        </div>
      </CardContent></Card>

      <Card className="rounded-2xl shadow-sm lg:col-span-2"><CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Icon name="Database" className="h-5 w-5"/> Кабели, техкарты и материалы</CardTitle></CardHeader><CardContent>
        <Tabs defaultValue="recipes" className="w-full"><TabsList className="grid w-full grid-cols-5"><TabsTrigger value="recipes">Техкарты</TabsTrigger><TabsTrigger value="invoice">Счет</TabsTrigger><TabsTrigger value="conversion">Перевод</TabsTrigger><TabsTrigger value="cables">Кабели</TabsTrigger><TabsTrigger value="materials">Материалы</TabsTrigger></TabsList>

          <TabsContent value="recipes" className="mt-4 space-y-6"><div className="grid gap-6 xl:grid-cols-2">
            <Card className="rounded-2xl"><CardHeader><CardTitle className="flex justify-between items-center">Техкарта нашего кабеля <Button size="sm" onClick={save}>Сохранить</Button></CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label>Выбери наш кабель</Label><SelectBox value={myId} onChange={setMyId} items={my} placeholder="Выбери наш кабель"/></div>{selM&&<><div className="flex items-center gap-2"><Input value={selM.name} onChange={e=>patch(setMy,selM.id,"name",e.target.value)}/><Button variant="ghost" size="icon" onClick={()=>deleteCable("my",selM.id)}><Icon name="Trash2" className="h-4 w-4"/></Button></div><RecipeTable materials={materials} cable={selM} onChange={(m,v)=>patchRecipe(setMy,selM.id,m,v)}/></>}</CardContent></Card>
            <Card className="rounded-2xl"><CardHeader><CardTitle className="flex justify-between items-center">Техкарта чужого кабеля <Button size="sm" onClick={save}>Сохранить</Button></CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label>Группа чужого кабеля</Label><SelectBox value={gRec} onChange={setGRec} items={GROUPS.map(value=>({value}))} placeholder="Выбери группу" all/></div><div className="space-y-2"><Label>Выбери чужой кабель</Label><SelectBox value={fId} onChange={setFId} items={fRec} placeholder="Выбери чужой кабель"/></div>{selF&&<><div className="flex items-center gap-2"><Input value={selF.name} onChange={e=>patch(setForeign,selF.id,"name",e.target.value)}/><Button variant="ghost" size="icon" onClick={()=>deleteCable("foreign",selF.id)}><Icon name="Trash2" className="h-4 w-4"/></Button></div><div className="text-xs text-slate-500">Группа: {selF.group}</div><RecipeTable materials={materials} cable={selF} onChange={(m,v)=>patchRecipe(setForeign,selF.id,m,v)}/></>}</CardContent></Card>
          </div></TabsContent>

          <TabsContent value="invoice" className="mt-4 space-y-4"><Card className="rounded-2xl"><CardHeader><CardTitle className="flex items-center justify-between"><span>Строки счета с чужими кабелями</span><Button onClick={addLine} className="gap-2"><Icon name="Plus" className="h-4 w-4"/> Добавить строку</Button></CardTitle></CardHeader><CardContent className="space-y-3"><div className="space-y-2"><Label>Фильтр по группе</Label><SelectBox value={gInv} onChange={setGInv} items={GROUPS.map(value=>({value}))} placeholder="Выбери группу" all/></div>{lines.map((line,i)=><div key={line.id} className="grid gap-3 rounded-2xl border p-3 md:grid-cols-[1fr_180px_48px]"><div className="space-y-2"><Label>Чужой кабель #{i+1}</Label><SelectBox value={line.cableId} onChange={v=>setLines(p=>p.map(l=>l.id===line.id?{...l,cableId:v}:l))} items={fInv} placeholder="Выбери чужой кабель"/></div><div className="space-y-2"><Label>Количество</Label><NumberField value={line.qty} onChange={v=>setLines(p=>p.map(l=>l.id===line.id?{...l,qty:v}:l))} step="0.001"/></div><div className="flex items-end"><Button variant="ghost" size="icon" onClick={()=>setLines(p=>p.length<=1?p:p.filter(l=>l.id!==line.id))}><Icon name="Trash2" className="h-4 w-4"/></Button></div></div>)}<div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Здесь собирается весь счет. Сначала выбираешь группу, потом видишь только кабели этой группы.</div></CardContent></Card></TabsContent>

          <TabsContent value="conversion" className="mt-4 space-y-4"><div className="overflow-x-auto rounded-2xl border"><Table><TableHeader><TableRow><TableHead>Материал</TableHead><TableHead className="text-right">Доступно из счета</TableHead><TableHead className="text-right">Нужно на 1 ед. {selM?.name}</TableHead><TableHead className="text-right">Хватит на</TableHead></TableRow></TableHeader><TableBody>{rows.map(x=><TableRow key={x.material}><TableCell className="font-medium">{x.material}</TableCell><TableCell className="text-right">{x.available}</TableCell><TableCell className="text-right">{x.need}</TableCell><TableCell className="text-right">{x.possible===null?"—":x.possible}</TableCell></TableRow>)}</TableBody></Table></div></TabsContent>

          <TabsContent value="cables" className="mt-4 space-y-6"><div className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">Все добавленные и измененные кабели сохраняются автоматически и сразу появляются в разделе «Техкарты».</div><div className="grid gap-6 xl:grid-cols-2">
            <Card className="rounded-2xl"><CardHeader><CardTitle>Наши кабели</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-3"><Input placeholder="Например, Мой кабель 3" value={newMy} onChange={e=>setNewMy(e.target.value)}/><div className="space-y-1"><Label>Создать на основе техкарты</Label><SelectBox value={newMyBase} onChange={setNewMyBase} items={[{value:EMPTY,label:"Пустая техкарта"},...my.map(x=>({id:x.id,name:x.name}))]} placeholder="Выбери готовую техкарту"/></div><Button onClick={addMyCable} className="gap-2"><Icon name="Plus" className="h-4 w-4"/> Добавить</Button><div className="text-sm text-slate-600">Сейчас наших кабелей: {my.length}</div></div><div className="space-y-3 border-t pt-4"><div className="text-sm font-medium text-slate-700">Переименовать наши кабели</div>{my.map(c=><div key={c.id} className="flex items-center gap-2 rounded-xl border p-2"><Input value={c.name} onChange={e=>patch(setMy,c.id,"name",e.target.value)} placeholder="Название кабеля"/><Button variant="ghost" size="icon" onClick={()=>deleteCable("my",c.id)}><Icon name="Trash2" className="h-4 w-4"/></Button></div>)}</div></CardContent></Card>
            <Card className="rounded-2xl"><CardHeader><CardTitle>Чужие кабели</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-3"><Input placeholder="Например, Чужой кабель 72" value={newF} onChange={e=>setNewF(e.target.value)}/><SelectBox value={newFG} onChange={setNewFG} items={GROUPS.map(value=>({value}))} placeholder="Выбери группу"/><div className="space-y-1"><Label>Создать на основе техкарты</Label><SelectBox value={newFBase} onChange={setNewFBase} items={[{value:EMPTY,label:"Пустая техкарта"},...byGroup(foreign,newFG).map(x=>({id:x.id,name:x.name}))]} placeholder="Выбери готовую техкарту"/></div><Button onClick={addForeignCable} className="gap-2"><Icon name="Plus" className="h-4 w-4"/> Добавить</Button><div className="text-sm text-slate-600">Сейчас чужих кабелей: {foreign.length}</div><div className="text-xs text-slate-500">После добавления кабель сразу попадет в список выбора в «Техкартах».</div></div><div className="space-y-3 border-t pt-4"><div className="text-sm font-medium text-slate-700">Переименовать и группировать чужие кабели</div>{foreign.map(c=><div key={c.id} className="space-y-2 rounded-xl border p-2"><div className="flex items-center gap-2"><Input value={c.name} onChange={e=>patch(setForeign,c.id,"name",e.target.value)} placeholder="Название кабеля"/><Button variant="ghost" size="icon" onClick={()=>deleteCable("foreign",c.id)}><Icon name="Trash2" className="h-4 w-4"/></Button></div><SelectBox value={c.group||GROUPS[0]} onChange={v=>patch(setForeign,c.id,"group",v)} items={GROUPS.map(value=>({value}))} placeholder="Выбери группу"/></div>)}</div></CardContent></Card>
          </div></TabsContent>

          <TabsContent value="materials" className="mt-4 space-y-4"><div className="flex gap-2"><Input placeholder="Новый материал" value={newMat} onChange={e=>setNewMat(e.target.value)}/><Button onClick={addMaterial} className="gap-2"><Icon name="Plus" className="h-4 w-4"/> Добавить</Button></div><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{materials.map(m=><div key={m} className="flex items-center justify-between rounded-2xl border bg-white p-3 gap-3"><div><div className="text-sm font-medium">{m}</div><div className="text-xs text-slate-500">{UNITS[m]||"—"}</div></div><Button variant="ghost" size="icon" onClick={()=>delMaterial(m)}><Icon name="Trash2" className="h-4 w-4"/></Button></div>)}</div></TabsContent>
        </Tabs>
      </CardContent></Card>
    </div>
  </div></div>;
}