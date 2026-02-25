import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { WB, WB_DARK, WB_LIGHT, WB_MID } from '@/components/shared/ui-helpers';

// ─── CalcSection ──────────────────────────────────────────────────────────────
function CalcSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: WB_MID }}>
          <Icon name={icon} size={14} style={{ color: WB }} />
        </div>
        <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{title}</span>
      </div>
      <div className="space-y-2.5 pl-9">{children}</div>
    </div>
  );
}

// ─── CheckRow ─────────────────────────────────────────────────────────────────
function CheckRow({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left"
      style={checked ? { borderColor: WB_MID, background: WB_LIGHT } : { borderColor: '#E5E7EB', background: '#F8F9FC' }}>
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
          style={checked ? { borderColor: WB, background: WB } : { borderColor: '#D1D5DB', background: 'white' }}>
          {checked && <Icon name="Check" size={11} className="text-white" />}
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      {hint && <span className="text-xs font-bold shrink-0 ml-2" style={{ color: WB }}>{hint}</span>}
    </button>
  );
}

// ─── SliderRow ────────────────────────────────────────────────────────────────
function SliderRow({ label, value, min, max, step = 1, onChange, unit }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; unit: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-500">{label}</span>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onChange(Math.max(min, value - step))}
            className="w-6 h-6 rounded-md flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-100 text-sm leading-none transition-colors">−</button>
          <span className="font-bold text-gray-900 text-sm min-w-[2.5rem] text-center">{value}</span>
          <button onClick={() => onChange(Math.min(max, value + step))}
            className="w-6 h-6 rounded-md flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-100 text-sm leading-none transition-colors">+</button>
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: WB }} />
      <div className="text-right text-xs text-gray-300 mt-0.5">{unit}</div>
    </div>
  );
}

// ─── Calculator ───────────────────────────────────────────────────────────────
export default function Calculator() {
  const [boxes, setBoxes] = useState(50);
  const [acceptCount, setAcceptCount] = useState(false);
  const [acceptDefect, setAcceptDefect] = useState(false);
  const [acceptPhoto, setAcceptPhoto] = useState(false);
  const [photoQty, setPhotoQty] = useState(10);
  const [storageDays, setStorageDays] = useState(30);
  const [storagePallets, setStoragePallets] = useState(5);
  const [storageBoxes, setStorageBoxes] = useState(20);
  const [orders, setOrders] = useState(150);
  const [needAssembly, setNeedAssembly] = useState(true);
  const [packType, setPackType] = useState<'bag'|'small'|'medium'|'large'|'bubble'>('small');
  const [needPack, setNeedPack] = useState(true);
  const [needLabel, setNeedLabel] = useState(true);
  const [needSticker, setNeedSticker] = useState(false);
  const [needSupply, setNeedSupply] = useState(true);
  const [supplyPallets, setSupplyPallets] = useState(2);
  const [needReturn, setNeedReturn] = useState(false);
  const [returnQty, setReturnQty] = useState(10);
  const [needLeaflet, setNeedLeaflet] = useState(false);
  const [urgentShip, setUrgentShip] = useState(false);

  const packPrices = { bag: 8, small: 18, medium: 25, large: 35, bubble: 10 };
  const packNames  = { bag: 'Пакет', small: 'Короб малый', medium: 'Короб средний', large: 'Короб крупный', bubble: 'Пупырка' };
  const assemblyRate = orders <= 100 ? 45 : orders <= 500 ? 40 : orders <= 1000 ? 35 : 30;
  const storageBillable = Math.max(0, storageDays - 3);

  const lines: { label: string; amount: number; hint: string }[] = [];
  lines.push({ label: 'Приёмка коробов', amount: boxes * 25, hint: `${boxes} × 25 ₽` });
  if (acceptCount)  lines.push({ label: 'Пересчёт единиц',  amount: boxes * 4,      hint: `${boxes} ед × 4 ₽` });
  if (acceptDefect) lines.push({ label: 'Проверка на брак', amount: boxes * 5,      hint: `${boxes} ед × 5 ₽` });
  if (acceptPhoto)  lines.push({ label: 'Фотофиксация',     amount: photoQty * 10,  hint: `${photoQty} фото × 10 ₽` });

  if (storageBillable > 0) {
    lines.push({ label: 'Хранение паллет',  amount: storagePallets * 45 * storageBillable, hint: `${storagePallets} × 45 ₽ × ${storageBillable} дн` });
    lines.push({ label: 'Хранение коробов', amount: storageBoxes * 15 * storageBillable,   hint: `${storageBoxes} × 15 ₽ × ${storageBillable} дн` });
  } else {
    lines.push({ label: 'Хранение', amount: 0, hint: '3 дня бесплатно' });
  }

  if (needAssembly) lines.push({ label: `Комплектация (${assemblyRate} ₽/шт)`, amount: orders * assemblyRate,         hint: `${orders} × ${assemblyRate} ₽` });
  if (needPack)     lines.push({ label: `Упаковка: ${packNames[packType]}`,      amount: orders * packPrices[packType], hint: `${orders} × ${packPrices[packType]} ₽` });
  if (needLabel)    lines.push({ label: 'Печать + наклейка этикетки',             amount: orders * 8,                    hint: `${orders} × 8 ₽` });
  if (needSticker)  lines.push({ label: 'Стикеровка товара',                      amount: orders * 6,                    hint: `${orders} × 6 ₽` });
  if (needSupply) {
    lines.push({ label: 'Формирование поставки', amount: 250,                 hint: '250 ₽' });
    lines.push({ label: 'Паллетирование',         amount: supplyPallets * 350, hint: `${supplyPallets} × 350 ₽` });
  }
  if (needLeaflet) lines.push({ label: 'Вложение листовки',   amount: orders * 3,     hint: `${orders} × 3 ₽` });
  if (needReturn)  lines.push({ label: 'Обработка возвратов', amount: returnQty * 25,  hint: `${returnQty} × 25 ₽` });

  const shipBase   = needSupply ? 500 : 150;
  const shipAmount = urgentShip ? Math.round(shipBase * 1.3) : shipBase;
  lines.push({ label: urgentShip ? 'Срочная отгрузка (+30%)' : 'Отгрузка', amount: shipAmount, hint: urgentShip ? `${shipBase} × 1.3` : '150–500 ₽' });

  const total = lines.reduce((s, l) => s + l.amount, 0);

  return (
    <div className="rounded-3xl border border-gray-200 overflow-hidden shadow-sm" style={{ background: '#F8F9FC' }}>
      <div className="grid grid-cols-1 lg:grid-cols-5">

        {/* LEFT */}
        <div className="lg:col-span-3 p-7 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white space-y-6 overflow-y-auto">
          <CalcSection icon="PackageCheck" title="Приёмка товара">
            <SliderRow label="Количество коробов" value={boxes} min={1} max={500} onChange={setBoxes} unit="кор" />
            <CheckRow label="Пересчёт единиц" hint="4 ₽/ед" checked={acceptCount} onChange={setAcceptCount} />
            <CheckRow label="Проверка на брак" hint="5 ₽/ед" checked={acceptDefect} onChange={setAcceptDefect} />
            <CheckRow label="Фотофиксация" hint="10 ₽/фото" checked={acceptPhoto} onChange={setAcceptPhoto} />
            {acceptPhoto && <SliderRow label="Количество фото" value={photoQty} min={1} max={200} onChange={setPhotoQty} unit="фото" />}
          </CalcSection>

          <CalcSection icon="Warehouse" title="Хранение">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold"
              style={{ background: '#DCFCE7', color: '#16A34A' }}>
              <Icon name="Gift" size={13} /> Первые 3 дня бесплатно
            </div>
            <SliderRow label="Дней хранения в месяц" value={storageDays} min={1} max={31} onChange={setStorageDays} unit="дн" />
            <SliderRow label="Паллетомест" value={storagePallets} min={0} max={100} onChange={setStoragePallets} unit="пал × 45 ₽/сут" />
            <SliderRow label="Коробов" value={storageBoxes} min={0} max={500} onChange={setStorageBoxes} unit="кор × 15 ₽/сут" />
          </CalcSection>

          <CalcSection icon="ListChecks" title="Комплектация заказов">
            <CheckRow label="Нужна комплектация" hint={`${assemblyRate} ₽/заказ`} checked={needAssembly} onChange={setNeedAssembly} />
            {needAssembly && (
              <>
                <SliderRow label="Заказов в месяц" value={orders} min={10} max={5000} step={10} onChange={setOrders} unit="шт" />
                <p className="text-xs text-gray-400 px-1">до 100 — 45₽ · 100–500 — 40₽ · 500–1000 — 35₽ · 1000+ — 30₽</p>
              </>
            )}
          </CalcSection>

          <CalcSection icon="Box" title="Упаковка">
            <CheckRow label="Нужна упаковка" hint="" checked={needPack} onChange={setNeedPack} />
            {needPack && (
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(Object.entries(packNames) as [keyof typeof packNames, string][]).map(([k, name]) => (
                  <button key={k} onClick={() => setPackType(k)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl border-2 text-left transition-all"
                    style={packType === k ? { borderColor: WB, background: WB_LIGHT } : { borderColor: '#E5E7EB', background: '#F8F9FC' }}>
                    <span className="text-sm font-medium text-gray-800">{name}</span>
                    <span className="text-xs font-bold" style={{ color: WB }}>{packPrices[k]} ₽</span>
                  </button>
                ))}
              </div>
            )}
          </CalcSection>

          <CalcSection icon="Tag" title="Маркетплейсы">
            <CheckRow label="Печать + наклейка этикетки" hint="8 ₽/шт" checked={needLabel} onChange={setNeedLabel} />
            <CheckRow label="Стикеровка товара" hint="6 ₽/шт" checked={needSticker} onChange={setNeedSticker} />
            <CheckRow label="Формирование поставки + паллетирование" hint="250 + 350 ₽/пал" checked={needSupply} onChange={setNeedSupply} />
            {needSupply && <SliderRow label="Паллет в поставке" value={supplyPallets} min={1} max={50} onChange={setSupplyPallets} unit="пал × 350 ₽" />}
          </CalcSection>

          <CalcSection icon="Plus" title="Дополнительно">
            <CheckRow label="Вложение листовки" hint="3 ₽/шт" checked={needLeaflet} onChange={setNeedLeaflet} />
            <CheckRow label="Обработка возвратов" hint="25 ₽/шт" checked={needReturn} onChange={setNeedReturn} />
            {needReturn && <SliderRow label="Кол-во возвратов" value={returnQty} min={1} max={500} onChange={setReturnQty} unit="шт" />}
            <CheckRow label="Срочная отгрузка (+30%)" hint="" checked={urgentShip} onChange={setUrgentShip} />
          </CalcSection>
        </div>

        {/* RIGHT — результат */}
        <div className="lg:col-span-2 p-7" style={{ background: 'linear-gradient(160deg, #1A1228 0%, #2D1640 100%)' }}>
          <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Ваш расчёт</div>

          <div className="space-y-2 mb-4">
            {lines.map((line, i) => (
              <div key={i} className="flex items-start justify-between gap-2 py-1.5 border-b border-white/5">
                <div className="text-xs text-white/60 flex-1 leading-snug">{line.label}</div>
                <div className="text-right shrink-0">
                  {line.amount === 0
                    ? <span className="text-xs font-bold text-green-400">бесплатно</span>
                    : <span className="text-sm font-bold text-white">{line.amount.toLocaleString('ru')} ₽</span>
                  }
                  <div className="text-[10px] text-white/30">{line.hint}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-5 mb-3" style={{ background: 'rgba(203,17,171,0.15)', border: '1px solid rgba(203,17,171,0.3)' }}>
            <div className="text-xs text-white/40 mb-1">Итого в месяц</div>
            <div className="font-oswald text-5xl font-bold"
              style={{ background: `linear-gradient(90deg, ${WB}, #E878D0)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {total.toLocaleString('ru')} <span className="text-3xl">₽</span>
            </div>
          </div>

          <button
            className="w-full py-4 rounded-xl font-bold text-base text-white transition-all hover:scale-[1.02] active:scale-95 shadow-xl mb-3"
            style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})`, boxShadow: '0 8px 30px rgba(203,17,171,0.5)' }}
            onClick={() => document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' })}>
            Получить точный расчёт
          </button>

          {orders >= 1000 && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <Icon name="BadgeCheck" size={15} className="text-green-400 shrink-0" />
              <span className="text-xs font-semibold text-green-400">Тариф 30 ₽/заказ — максимальная скидка</span>
            </div>
          )}

          <p className="text-xs text-white/25 leading-relaxed">
            Расчёт ориентировочный. Точная стоимость согласовывается с менеджером.
          </p>
        </div>
      </div>
    </div>
  );
}