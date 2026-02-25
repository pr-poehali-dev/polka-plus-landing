import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { WB, WB_DARK, WB_LIGHT, WB_MID, FadeIn, Tag, Accent, AnimatedCounter, FaqList } from '@/components/shared/ui-helpers';
import Calculator from '@/components/sections/Calculator';

// ─── Types ────────────────────────────────────────────────────────────────────
type NavLink = readonly [string, string];

interface SectionProps {
  scrollTo: (id: string) => void;
  navLinks: readonly NavLink[];
}

// ─── SiteHeader ───────────────────────────────────────────────────────────────
export function SiteHeader({ scrollTo, navLinks, scrolled, menuOpen, setMenuOpen }: SectionProps & {
  scrolled: boolean; menuOpen: boolean; setMenuOpen: (v: boolean) => void;
}) {
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'py-2 shadow-lg' : 'py-4'} bg-white border-b border-gray-100`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <div className="cursor-pointer" onClick={() => scrollTo('hero')}>
          <img src="https://cdn.poehali.dev/projects/48d0f348-e369-40e0-b696-33913aa2ef26/bucket/5f2ba43f-9fb6-48a8-9b35-29ca379aebfb.jpg"
            alt="Полка+" className="h-14 w-auto object-contain drop-shadow-sm" />
        </div>

        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map(([label, id]) => (
            <button key={id} onClick={() => scrollTo(id)}
              className="px-4 py-2.5 rounded-xl text-base font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">
              {label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <a href="tel:+79171010163" className="flex items-center gap-2 text-base font-bold text-gray-700 hover:text-gray-900 transition-colors">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: WB_LIGHT }}>
              <Icon name="Phone" size={15} style={{ color: WB }} />
            </div>
            +7 (917) 101-01-63
          </a>
          <button onClick={() => scrollTo('contacts')}
            className="px-6 py-3 rounded-xl text-base font-bold text-white shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})`, boxShadow: `0 4px 20px rgba(203,17,171,0.3)` }}>
            Оставить заявку
          </button>
        </div>

        <button className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
          <Icon name={menuOpen ? 'X' : 'Menu'} size={22} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-1 shadow-xl">
          {navLinks.map(([label, id]) => (
            <button key={id} onClick={() => scrollTo(id)}
              className="text-left px-4 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors">
              {label}
            </button>
          ))}
          <button onClick={() => scrollTo('contacts')}
            className="mt-2 px-5 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})` }}>
            Оставить заявку
          </button>
        </div>
      )}
    </header>
  );
}

// ─── LiveDashboard ────────────────────────────────────────────────────────────
const ORDERS = [
  { id: '#WB-48291', goods: 'Товар × 3 шт',      mp: 'WB',   status: 'Принят',      color: '#4ade80' },
  { id: '#OZ-77103', goods: 'Товар × 1 шт',      mp: 'Ozon', status: 'Упакован',     color: '#60a5fa' },
  { id: '#YM-33410', goods: 'Товар × 7 шт',      mp: 'ЯМ',   status: 'Отгружен',    color: '#E878D0' },
  { id: '#WB-50022', goods: 'Товар × 2 шт',      mp: 'WB',   status: 'На хранении', color: '#facc15' },
  { id: '#OZ-81674', goods: 'Товар × 4 шт',      mp: 'Ozon', status: 'Принят',      color: '#4ade80' },
];

function LiveDashboard() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [count, setCount] = useState(15247);
  const [visible, setVisible] = useState([0, 1, 2]);

  useEffect(() => {
    const t1 = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3 + 1));
    }, 1800);
    const t2 = setInterval(() => {
      setActiveIdx(i => (i + 1) % ORDERS.length);
      setVisible(v => {
        const next = (v[v.length - 1] + 1) % ORDERS.length;
        return [...v.slice(1), next];
      });
    }, 2200);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const metrics = [
    { label: 'Активных заказов', value: '1 248', icon: 'Package2', color: '#E878D0' },
    { label: 'Обработано сегодня', value: count.toLocaleString('ru'), icon: 'TrendingUp', color: '#4ade80' },
    { label: 'Складов онлайн', value: '2 / 2', icon: 'Warehouse', color: '#60a5fa' },
  ];

  return (
    <div className="hidden lg:block">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
        style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)' }}>

        {/* header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
            </div>
            <span className="text-xs text-white/40 font-mono ml-2">polkaplus.ru — панель управления</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            LIVE
          </div>
        </div>

        {/* metrics */}
        <div className="grid grid-cols-3 gap-px mx-5 mt-5 mb-4 rounded-xl overflow-hidden bg-white/5">
          {metrics.map(m => (
            <div key={m.label} className="py-3 px-3 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <Icon name={m.icon} size={16} className="mx-auto mb-1" style={{ color: m.color }} />
              <div className="font-oswald font-bold text-white text-lg leading-none">{m.value}</div>
              <div className="text-[10px] text-white/30 mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>

        {/* order feed */}
        <div className="px-5 pb-5 space-y-2 overflow-hidden" style={{ minHeight: 148 }}>
          <div className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-2">Последние поступления</div>
          {ORDERS.map((o, i) => (
            <div key={o.id}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-500"
              style={{
                background: visible.includes(i) ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: `1px solid ${visible.includes(i) ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
                opacity: visible.includes(i) ? 1 : 0,
                transform: visible.includes(i) ? 'translateY(0)' : 'translateY(8px)',
              }}>
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: o.color }} />
              <span className="text-xs font-mono text-white/50 shrink-0">{o.id}</span>
              <span className="text-xs text-white/60 flex-1 truncate">{o.goods}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0"
                style={{ background: 'rgba(203,17,171,0.2)', color: '#E878D0' }}>{o.mp}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0"
                style={{ background: `${o.color}22`, color: o.color }}>{o.status}</span>
            </div>
          ))}
        </div>

        {/* progress bar */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-white/30">Загрузка склада</span>
            <span className="text-[10px] font-bold text-white/50">78%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full animate-pulse"
              style={{ width: '78%', background: `linear-gradient(90deg, ${WB}, #E878D0)` }} />
          </div>
        </div>
      </div>

      {/* floating badges */}
      <div className="absolute -top-3 -right-3 bg-white rounded-2xl shadow-xl px-3 py-2.5 flex items-center gap-2 border border-gray-100">
        <Icon name="Clock" size={14} className="text-green-500" />
        <div><div className="font-bold text-gray-900 text-xs">24 часа</div><div className="text-[10px] text-gray-400">до отгрузки</div></div>
      </div>
      <div className="absolute -bottom-3 -left-3 bg-white rounded-2xl shadow-xl px-3 py-2.5 flex items-center gap-2 border border-gray-100">
        <Icon name="ShieldCheck" size={14} style={{ color: WB }} />
        <div><div className="font-bold text-gray-900 text-xs">99,5%</div><div className="text-[10px] text-gray-400">приёмка</div></div>
      </div>
    </div>
  );
}

// ─── HeroSection ──────────────────────────────────────────────────────────────
export function HeroSection({ scrollTo }: { scrollTo: (id: string) => void }) {
  return (
    <section id="hero" className="relative pt-24 pb-0 overflow-hidden" style={{ background: '#1A1228' }}>
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '36px 36px' }} />
      <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle at 60% 40%, rgba(203,17,171,0.25) 0%, transparent 65%)` }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(203,17,171,0.1) 0%, transparent 65%)` }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <FadeIn delay={0}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-7 border"
                style={{ background: 'rgba(203,17,171,0.15)', borderColor: 'rgba(203,17,171,0.35)', color: '#E878D0' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#E878D0] animate-pulse" />
                Выгодно · Честно · Под ключ
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="font-oswald text-5xl sm:text-6xl font-bold leading-[1.0] mb-6 text-white">
                ФУЛФИЛМЕНТ<br />
                <span style={{ background: `linear-gradient(90deg, ${WB}, #E878D0)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  ПОЛКА+
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="flex flex-col gap-2 mb-7">
                {[
                  'Выгодно — цены ниже рынка на 10–20%',
                  'Честно — фиксируем цены в договоре',
                  'Под ключ — от приёмки до доставки',
                ].map(text => (
                  <div key={text} className="flex items-center gap-2.5 text-white/80 text-base font-medium">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: WB }} />
                    {text}
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="rounded-2xl px-5 py-4 mb-8 border"
                style={{ background: 'rgba(203,17,171,0.12)', borderColor: 'rgba(203,17,171,0.3)' }}>
                <div className="flex items-start gap-3">
                  <Icon name="ShieldCheck" size={18} className="shrink-0 mt-0.5" style={{ color: '#E878D0' }} />
                  <p className="text-sm text-white/70 leading-relaxed">
                    <span className="font-bold text-white">Гарантируем приёмку 99,5% поставок</span> и фиксируем цены в договоре — никаких сюрпризов.
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex flex-wrap gap-3 mb-10">
                <button onClick={() => scrollTo('calculator')}
                  className="px-7 py-3.5 rounded-xl font-bold text-white shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-95 transition-all"
                  style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})`, boxShadow: `0 8px 30px rgba(203,17,171,0.45)` }}>
                  Рассчитать стоимость
                </button>
                <button onClick={() => scrollTo('contacts')}
                  className="px-7 py-3.5 rounded-xl font-bold border border-white/20 text-white/80 hover:bg-white/10 hover:text-white transition-all">
                  Оставить заявку
                </button>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs text-white/30 uppercase tracking-widest">Интеграции:</span>
                {['Wildberries', 'Ozon', 'Яндекс.Маркет'].map(mp => (
                  <span key={mp} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/15 text-white/60">{mp}</span>
                ))}
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border"
                  style={{ borderColor: 'rgba(203,17,171,0.4)', color: '#E878D0', background: 'rgba(203,17,171,0.1)' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#E878D0' }} />
                  API реального времени
                </span>
              </div>
            </FadeIn>
          </div>

          {/* Right — live dashboard */}
          <FadeIn delay={0.3} className="relative">
            <LiveDashboard />
          </FadeIn>
        </div>
      </div>

      <div className="relative h-16 overflow-hidden">
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full" fill="#F4F6FA">
          <path d="M0,64 C360,0 1080,64 1440,32 L1440,64 Z" />
        </svg>
      </div>
    </section>
  );
}

// ─── AdvantagesSection ────────────────────────────────────────────────────────
export function AdvantagesSection({ advantages }: { advantages: { icon: string; title: string; desc: string }[] }) {
  return (
    <section id="advantages" className="py-24" style={{ background: '#F4F6FA' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <Tag label="Преимущества" />
          <h2 className="font-oswald text-4xl md:text-5xl font-bold mb-2 text-gray-900">
            Почему выбирают <Accent>Полку+</Accent>
          </h2>
          <p className="text-gray-400 text-lg mb-12 max-w-xl">Специализируемся на том, что другие считают слишком сложным</p>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {advantages.map((a, i) => (
            <FadeIn key={a.title} delay={i * 0.07}>
              <div className="bg-white rounded-2xl p-7 border border-gray-200 hover:border-[#CB11AB]/30 hover:shadow-lg transition-all duration-300 group h-full">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                  style={{ background: WB_LIGHT }}>
                  <Icon name={a.icon} size={22} style={{ color: WB }} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{a.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{a.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HelpBlock ────────────────────────────────────────────────────────────────
export function HelpBlock({ scrollTo }: { scrollTo: (id: string) => void }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <div className="relative rounded-3xl overflow-hidden px-8 md:px-16 py-14 flex flex-col md:flex-row md:items-center gap-10"
            style={{ background: 'linear-gradient(135deg, #1A1228 0%, #2D1640 100%)' }}>
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(203,17,171,0.2) 0%, transparent 65%)', transform: 'translate(30%,-30%)' }} />
            <div className="relative flex-1">
              <div className="font-oswald text-4xl md:text-5xl font-bold text-white leading-tight mb-3">
                Мы поможем вам<br />
                <span style={{ background: `linear-gradient(90deg, ${WB}, #E878D0)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  повысить эффективность
                </span><br />
                вашего бизнеса
              </div>
              <p className="text-white/50 text-lg">Полная поддержка на каждом этапе — от приёмки до доставки на любой склад.</p>
            </div>
            <div className="relative shrink-0 flex flex-col gap-3">
              {[
                { icon: 'PackageCheck', text: 'Приёмка и хранение' },
                { icon: 'Tag',          text: 'Упаковка и маркировка' },
                { icon: 'Send',         text: 'Отгрузка на маркетплейс' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(203,17,171,0.3)' }}>
                    <Icon name={item.icon} size={15} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-white/80">{item.text}</span>
                </div>
              ))}
              <button onClick={() => scrollTo('contacts')}
                className="mt-2 w-full py-3.5 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})` }}>
                Начать работу
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── ServicesSection ──────────────────────────────────────────────────────────
export function ServicesSection({ services }: { services: { icon: string; title: string; desc: string; lego: string }[] }) {
  return (
    <section id="services" className="py-24" style={{ background: '#F4F6FA' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <Tag label="Услуги" />
          <h2 className="font-oswald text-4xl md:text-5xl font-bold mb-2 text-gray-900">
            Полный цикл <Accent>работ</Accent>
          </h2>
          <p className="text-gray-400 text-lg mb-12 max-w-xl">От приёмки до отгрузки — всё под одной крышей</p>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          {services.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.07}>
              <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#CB11AB]/30 hover:shadow-md transition-all duration-300 group h-full flex gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                  style={{ background: WB_LIGHT }}>
                  <Icon name={s.icon} size={20} style={{ color: WB }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.1}>
          <div className="rounded-2xl p-7 border flex flex-col md:flex-row md:items-center gap-5"
            style={{ background: 'linear-gradient(135deg, #1A1228 0%, #2D1640 100%)', borderColor: 'rgba(203,17,171,0.3)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(203,17,171,0.25)', border: '1px solid rgba(203,17,171,0.4)' }}>
              <Icon name="Wifi" size={26} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="font-bold text-white text-lg">API-синхронизация в реальном времени</h3>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-white" style={{ background: WB }}>LIVE</span>
              </div>
              <p className="text-sm text-white/55">Двусторонняя синхронизация остатков, заказов и статусов с Wildberries, Ozon и Яндекс.Маркет. Обновление каждые 60 секунд.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {['WB', 'Ozon', 'ЯМ'].map(mp => (
                <div key={mp} className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold border"
                  style={{ background: 'rgba(203,17,171,0.2)', borderColor: 'rgba(203,17,171,0.35)', color: '#E878D0' }}>
                  {mp}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── CalculatorSection ────────────────────────────────────────────────────────
export function CalculatorSection() {
  return (
    <section id="calculator" className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <Tag label="Калькулятор" />
          <h2 className="font-oswald text-4xl md:text-5xl font-bold mb-2 text-gray-900">
            Рассчитайте <Accent>стоимость</Accent>
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl">Укажите параметры — получите ориентировочную стоимость за месяц</p>
        </FadeIn>
        <Calculator />
      </div>
    </section>
  );
}

// ─── ProcessSection ───────────────────────────────────────────────────────────
export function ProcessSection({ steps }: { steps: { num: string; title: string; desc: string }[] }) {
  return (
    <section className="py-24" style={{ background: '#F4F6FA' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <Tag label="Как это работает" />
          <h2 className="font-oswald text-4xl md:text-5xl font-bold mb-2 text-gray-900">Процесс работы</h2>
          <p className="text-gray-400 text-lg mb-12 max-w-xl">Прозрачно на каждом шаге</p>
        </FadeIn>
        <div className="relative">
          <div className="absolute left-7 top-0 bottom-0 w-0.5 hidden sm:block"
            style={{ background: 'linear-gradient(to bottom, transparent, #E5E7EB 10%, #E5E7EB 90%, transparent)' }} />
          <div className="space-y-4">
            {steps.map((s, i) => (
              <FadeIn key={s.num} delay={i * 0.1}>
                <div className="flex gap-5 items-start bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#CB11AB]/25 hover:shadow-md transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center font-oswald font-bold text-white shrink-0 z-10"
                    style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})` }}>
                    {s.num}
                  </div>
                  <div className="pt-1 flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                    <p className="text-sm text-gray-500">{s.desc}</p>
                  </div>
                  {i === steps.length - 1 && (
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shrink-0"
                      style={{ background: '#DCFCE7', color: '#16A34A' }}>
                      <Icon name="TrendingUp" size={13} />Прибыль
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── StatsSection ─────────────────────────────────────────────────────────────
export function StatsSection({ stats }: { stats: { value: number; suffix: string; label: string }[] }) {
  return (
    <section className="py-0">
      <div className="py-20" style={{ background: 'linear-gradient(135deg, #1A1228 0%, #2D1640 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10">
            {stats.map((s) => (
              <div key={s.label} className="py-10 px-8 text-center">
                <div className="font-oswald text-5xl font-bold mb-2"
                  style={{ background: `linear-gradient(90deg, ${WB}, #E878D0)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm text-white/40 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── AboutSection ─────────────────────────────────────────────────────────────
export function AboutSection() {
  return (
    <section id="about" className="py-24" style={{ background: '#F4F6FA' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <FadeIn>
            <Tag label="О компании" />
            <h2 className="font-oswald text-4xl md:text-5xl font-bold mb-5 text-gray-900">
              Полка+ — <Accent>надёжный</Accent><br />партнёр для вашего бизнеса
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-4">
              Фулфилмент-оператор полного цикла для продавцов на WB, Ozon и Яндекс.Маркет.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8">
              Работаем без скрытых платежей — цены фиксируем в договоре. Каждый клиент получает личного менеджера и доступ к аналитике в реальном времени.
            </p>
            <div className="space-y-3">
              {[
                { city: 'Склад в Самаре', addr: 'ул. Братьев Корастелевых 3к2' },
                { city: 'Склад в Смоленске', addr: 'Краснинское шоссе 19а' },
              ].map(w => (
                <div key={w.city} className="flex items-start gap-3 p-4 rounded-2xl border border-gray-200 bg-white hover:border-[#CB11AB]/25 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: WB_LIGHT }}>
                    <Icon name="Warehouse" size={18} style={{ color: WB }} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-0.5">{w.city}</div>
                    <div className="text-sm text-gray-500">{w.addr}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0"
                    style={{ background: '#DCFCE7', color: '#16A34A' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Работает
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: 'TrendingUp', label: 'Рост 300%', sub: 'средний рост выручки клиентов за год' },
                { icon: 'Network',    label: '5 городов', sub: 'планируем открыть к 2027 году' },
                { icon: 'Clock',      label: '24/7',       sub: 'операции и поддержка клиентов' },
                { icon: 'Award',      label: 'ТОП-10',     sub: 'КГТ-фулфилмент по России' },
              ].map((item, i) => (
                <FadeIn key={item.label} delay={i * 0.08}>
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-[#CB11AB]/25 hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: WB_LIGHT }}>
                      <Icon name={item.icon} size={18} style={{ color: WB }} />
                    </div>
                    <div className="font-oswald text-2xl font-bold text-gray-900 mb-1">{item.label}</div>
                    <div className="text-xs text-gray-400 leading-relaxed">{item.sub}</div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── ReviewsSection ───────────────────────────────────────────────────────────
export function ReviewsSection() {
  const reviews = [
    { name: 'Александр К.', date: 'Январь 2026',  rating: 5, text: 'Работаем с Полка+ уже 8 месяцев. Цены честные, без сюрпризов. Всё прописано в договоре. Приёмка быстрая, потерь не было ни разу. Рекомендую.', platform: 'Яндекс Карты', lego: '50% 100%' },
    { name: 'Марина С.',    date: 'Февраль 2026', rating: 5, text: 'Перешли от другого фулфилмента — разница колоссальная. Здесь реально дешевле и работают аккуратно. Менеджер всегда на связи, вопросы решают быстро.', platform: 'Яндекс Карты', lego: '0% 50%' },
    { name: 'Дмитрий Л.',   date: 'Декабрь 2025', rating: 5, text: 'Занимаемся продажами на WB. Склад в Самаре очень удобен. Приёмка с фото, всё прозрачно. Отгрузки в срок. Работаем уже год — всем доволен.', platform: 'Яндекс Карты', lego: '100% 100%' },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <Tag label="Отзывы клиентов" />
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <h2 className="font-oswald text-4xl md:text-5xl font-bold mb-2 text-gray-900">
                Нам <Accent>доверяют</Accent>
              </h2>
              <p className="text-gray-400 text-lg">Реальные отзывы наших клиентов</p>
            </div>
            <a href="https://yandex.ru/maps/org/polka_plus/--/reviews/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border font-semibold text-sm hover:shadow-md transition-all shrink-0"
              style={{ borderColor: WB_MID, color: WB, background: WB_LIGHT }}>
              <Icon name="ExternalLink" size={14} />
              Посмотреть на Яндекс Картах
            </a>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <FadeIn key={r.name} delay={i * 0.1}>
              <div className="rounded-2xl border border-gray-200 flex flex-col h-full hover:border-[#CB11AB]/25 hover:shadow-md transition-all overflow-hidden group"
                style={{ background: '#F8F9FC' }}>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-0.5 mb-3">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Icon key={j} name="Star" size={14} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-5">«{r.text}»</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{r.name}</div>
                      <div className="text-xs text-gray-400">{r.date}</div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                      style={{ background: '#FFF7E6', color: '#F59E0B' }}>
                      <Icon name="MapPin" size={11} />
                      {r.platform}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.2}>
          <div className="mt-6 text-center">
            <a href="https://yandex.ru/maps/org/polka_plus/--/reviews/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold hover:underline transition-all" style={{ color: WB }}>
              Все отзывы на Яндекс Картах <Icon name="ArrowRight" size={14} />
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── FaqSection ───────────────────────────────────────────────────────────────
export function FaqSection({ faq }: { faq: { q: string; a: string }[] }) {
  return (
    <section className="py-24" style={{ background: '#F4F6FA' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <Tag label="Частые вопросы" />
          <h2 className="font-oswald text-4xl md:text-5xl font-bold mb-2 text-gray-900">
            Ответы на <Accent>вопросы</Accent>
          </h2>
          <p className="text-gray-400 text-lg mb-12">Всё, что вы хотели узнать о фулфилменте</p>
        </FadeIn>
        <FaqList faq={faq} />
      </div>
    </section>
  );
}

// ─── CtaSection ───────────────────────────────────────────────────────────────
export function CtaSection({ scrollTo }: { scrollTo: (id: string) => void }) {
  return (
    <section className="py-20" style={{ background: '#F4F6FA' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <div className="relative rounded-3xl overflow-hidden text-center px-10 py-16"
            style={{ background: 'linear-gradient(135deg, #1A1228 0%, #2D1640 100%)' }}>
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(203,17,171,0.2) 0%, transparent 65%)', transform: 'translate(30%,-30%)' }} />
            <div className="relative">
              <div className="text-center">
                <h2 className="font-oswald text-4xl sm:text-5xl font-bold text-white mb-4">
                  ГОТОВЫ МАСШТАБИРОВАТЬ<br />ВАШ БИЗНЕС?
                </h2>
                <p className="text-white/50 text-lg mb-9">Оставьте заявку — менеджер свяжется в течение 15 минут</p>
                <button onClick={() => scrollTo('contacts')}
                  className="px-10 py-4 rounded-xl font-bold text-base bg-white hover:scale-105 active:scale-95 transition-all shadow-2xl"
                  style={{ color: WB }}>
                  Оставить заявку
                </button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── ContactsSection ──────────────────────────────────────────────────────────
export function ContactsSection() {
  return (
    <section id="contacts" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <Tag label="Контакты" />
          <h2 className="font-oswald text-4xl md:text-5xl font-bold mb-2 text-gray-900">
            Свяжитесь <Accent>с нами</Accent>
          </h2>
          <p className="text-gray-400 text-lg mb-12">Работаем 24/7. Ответим быстро.</p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FadeIn>
            <div className="rounded-2xl p-8 border border-gray-200" style={{ background: '#F8F9FC' }}>
              <h3 className="font-oswald text-2xl font-bold mb-6 text-gray-900">Оставить заявку</h3>
              <div className="space-y-4">
                {[
                  { label: 'Ваше имя', type: 'text', placeholder: 'Иван Иванов' },
                  { label: 'Телефон',  type: 'tel',  placeholder: '+7 (900) 000-00-00' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-300 text-sm focus:outline-none transition-colors"
                      onFocus={e => e.target.style.borderColor = WB}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Тип товара</label>
                  <select className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm focus:outline-none transition-colors"
                    onFocus={e => e.target.style.borderColor = WB}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}>
                    <option>Любой товар</option>
                    <option>Стандартный габарит</option>
                    <option>Крупногабаритный товар</option>
                    <option>Хрупкий товар</option>
                    <option>Другое</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Комментарий</label>
                  <textarea rows={3} placeholder="Расскажите о вашем товаре и объёмах..."
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-300 text-sm focus:outline-none transition-colors resize-none"
                    onFocus={e => e.target.style.borderColor = WB}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>
                <button className="w-full py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.01] active:scale-95 shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})`, boxShadow: '0 8px 25px rgba(203,17,171,0.3)' }}>
                  Отправить заявку
                </button>
                <p className="text-xs text-gray-400 text-center">Нажимая, вы соглашаетесь с политикой конфиденциальности</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.12}>
            <div className="space-y-3">
              {[
                { icon: 'Phone',  label: 'Телефон', value: '+7 (917) 101-01-63',           sub: 'Пн–Вс, 09:00–21:00',        href: 'tel:+79171010163' },
                { icon: 'Send',   label: 'Telegram', value: '@polkaplus',                   sub: 'Ответим в течение 15 минут', href: 'https://t.me/polkaplus' },
                { icon: 'Mail',   label: 'Email',    value: 'info@polkaplus.ru',             sub: 'Для документов и КП',        href: 'mailto:info@polkaplus.ru' },
                { icon: 'MapPin', label: 'Самара',   value: 'ул. Братьев Корастелевых 3к2', sub: 'Основной склад',             href: '#' },
                { icon: 'MapPin', label: 'Смоленск', value: 'Краснинское шоссе 19а',        sub: 'Склад №2',                   href: '#' },
              ].map(c => (
                <a key={c.label} href={c.href}
                  className="flex items-center gap-4 p-5 rounded-2xl border border-gray-200 bg-white hover:border-[#CB11AB]/25 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    style={{ background: WB_LIGHT }}>
                    <Icon name={c.icon} size={20} style={{ color: WB }} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{c.label}</div>
                    <div className="font-semibold text-gray-900">{c.value}</div>
                    <div className="text-xs text-gray-400">{c.sub}</div>
                  </div>
                </a>
              ))}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden h-44 relative cursor-pointer hover:border-[#CB11AB]/25 hover:shadow-md transition-all group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center z-10">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 bg-white shadow-md"
                      style={{ border: `2px solid ${WB_MID}` }}>
                      <Icon name="MapPin" size={20} style={{ color: WB }} />
                    </div>
                    <p className="text-sm font-medium text-gray-400 group-hover:text-gray-600 transition-colors">Открыть на карте</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── SiteFooter ───────────────────────────────────────────────────────────────
export function SiteFooter({ scrollTo, navLinks }: SectionProps) {
  return (
    <footer className="border-t border-gray-200 py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <img src="https://cdn.poehali.dev/projects/48d0f348-e369-40e0-b696-33913aa2ef26/bucket/5f2ba43f-9fb6-48a8-9b35-29ca379aebfb.jpg"
          alt="Полка+" className="h-9 w-auto object-contain" />
        <div className="flex flex-wrap gap-6 justify-center">
          {navLinks.map(([label, id]) => (
            <button key={id} onClick={() => scrollTo(id)} className="text-sm text-gray-400 hover:text-gray-700 font-medium transition-colors">
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-300">© 2026 Полка+. Все права защищены.</p>
      </div>
    </footer>
  );
}