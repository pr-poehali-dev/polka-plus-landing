import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';

// ─── Hooks ───────────────────────────────────────────────────────────────────
const useInView = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
};

// ─── Animated counter ────────────────────────────────────────────────────────
const AnimatedCounter = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    const step = target / (2000 / 16);
    let cur = 0;
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString('ru')}{suffix}</span>;
};

// ─── FadeIn wrapper ───────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`
    }}>
      {children}
    </div>
  );
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const WB      = '#CB11AB';
const WB_DARK = '#9A0080';
const WB_LIGHT = '#F9ECF7';
const WB_MID   = '#F0D6EC';

// ─── Main component ───────────────────────────────────────────────────────────
export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const advantages = [
    { icon: 'Package2',   title: 'Работаем с крупногабаритом',  desc: 'Мебель, двери, кабели — любые нестандартные товары без ограничений по габаритам' },
    { icon: 'MapPin',     title: 'Адресное хранение',            desc: 'Цифровая карта склада — каждый товар на своём месте, ни одной потери' },
    { icon: 'ShieldCheck',title: 'Контроль качества',            desc: 'Фотофиксация при приёмке, проверка каждой единицы, отчёт онлайн' },
    { icon: 'Layers',     title: 'Усиленная упаковка',           desc: 'Специальные материалы для хрупких и крупных товаров' },
    { icon: 'Zap',        title: 'Быстрая отгрузка',             desc: 'Отправляем на маркетплейс в течение 24 часов с момента заказа' },
    { icon: 'BarChart3',  title: 'Прозрачная отчётность',        desc: 'Личный кабинет с аналитикой, остатками и историей операций' },
  ];

  const categories = [
    { icon: 'Armchair',  label: 'Мебель',              desc: 'Диваны, шкафы, кровати — любые габариты' },
    { icon: 'DoorOpen',  label: 'Двери',                desc: 'Межкомнатные и входные, спецупаковка' },
    { icon: 'Cable',     label: 'Кабельная продукция',  desc: 'Барабаны, бухты, кабель-каналы' },
    { icon: 'Dumbbell',  label: 'Спорттовары',          desc: 'Тренажёры, велосипеды, самокаты' },
    { icon: 'Hammer',    label: 'Металлоконструкции',   desc: 'Профили, уголки, нестандартные изделия' },
    { icon: 'Wrench',    label: 'Нестандартные грузы',  desc: 'Если отказали другие — мы возьмём' },
  ];

  const services = [
    { icon: 'Truck',        title: 'Приёмка товара',    desc: 'Разгрузка, проверка, фото, постановка на учёт' },
    { icon: 'Warehouse',    title: 'Хранение',           desc: 'Адресное хранение, климат-контроль для чувствительных товаров' },
    { icon: 'PackageOpen',  title: 'Упаковка',           desc: 'По требованиям WB, Ozon, ЯМ. Защита при транспортировке' },
    { icon: 'Tag',          title: 'Маркировка',         desc: 'Штрихкоды, честный знак, этикетки по всем стандартам' },
    { icon: 'ListChecks',   title: 'Комплектация',       desc: 'Сборка заказов, подарочная упаковка, вложения' },
    { icon: 'Send',         title: 'Отгрузка',           desc: 'Синхронизация с API маркетплейсов в реальном времени' },
  ];

  const steps = [
    { num: '01', title: 'Вы привозите товар',        desc: 'Или организуем доставку через партнёров' },
    { num: '02', title: 'Принимаем и размещаем',     desc: 'Цифровая приёмка, фото, адресное хранение' },
    { num: '03', title: 'Упаковываем и маркируем',   desc: 'По стандартам WB, Ozon, Яндекс.Маркет' },
    { num: '04', title: 'Отгружаем на маркетплейс',  desc: 'API-синхронизация, точные сроки' },
    { num: '05', title: 'Вы получаете прибыль',      desc: 'Отслеживайте всё в личном кабинете' },
  ];

  const stats = [
    { value: 12000, suffix: ' м²', label: 'площадь склада' },
    { value: 3500,  suffix: '+',   label: 'паллетомест' },
    { value: 200,   suffix: '+',   label: 'клиентов' },
    { value: 15000, suffix: '+',   label: 'отправок в месяц' },
  ];

  const blogPosts = [
    { tag: 'Маркетплейсы',  date: '18 фев 2026', title: 'Как выбрать фулфилмент для крупногабарита: 7 вопросов',        desc: 'Разбираем ошибки селлеров при выборе склада' },
    { tag: 'API интеграции', date: '10 фев 2026', title: 'API Wildberries 2026: новые требования',                       desc: 'Обновлённый протокол синхронизации остатков и маркировки' },
    { tag: 'Кейс',           date: '3 фев 2026',  title: 'Рост отгрузок 300% за 3 месяца — мебельный бизнес',           desc: 'Как производитель диванов масштабировал продажи на WB' },
  ];

  // ── nav links ──
  const navLinks = [['Услуги','services'],['Преимущества','advantages'],['Калькулятор','calculator'],['О компании','about'],['Контакты','contacts']] as const;

  return (
    <div className="min-h-screen font-golos text-gray-900 overflow-x-hidden" style={{ background: '#F4F6FA' }}>

      {/* ════════════════ HEADER ════════════════ */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300
        ${scrolled ? 'py-2 shadow-md' : 'py-3'}
        bg-white border-b border-gray-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => scrollTo('hero')}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})` }}>
              <Icon name="Package" size={18} className="text-white" />
            </div>
            <span className="font-oswald text-xl font-bold tracking-wide text-gray-900">
              ПОЛКА<span style={{ color: WB }}>+</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href="tel:+79001234567"
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
              <Icon name="Phone" size={14} style={{ color: WB }} />
              +7 (900) 123-45-67
            </a>
            <button onClick={() => scrollTo('contacts')}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
              style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})` }}>
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

      {/* ════════════════ HERO ════════════════ */}
      <section id="hero" className="relative pt-24 pb-0 overflow-hidden" style={{ background: '#1A1228' }}>
        {/* bg texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '36px 36px' }} />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle at 60% 40%, rgba(203,17,171,0.25) 0%, transparent 65%)` }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, rgba(203,17,171,0.1) 0%, transparent 65%)` }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Left */}
            <div>
              <FadeIn delay={0}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-7 border"
                  style={{ background: 'rgba(203,17,171,0.15)', borderColor: 'rgba(203,17,171,0.35)', color: '#E878D0' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E878D0] animate-pulse" />
                  Фулфилмент-центр для маркетплейсов
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <h1 className="font-oswald text-5xl sm:text-6xl font-bold leading-[1.0] mb-6 text-white">
                  РАБОТАЕМ<br />С ТЕМ, ОТ ЧЕГО<br />
                  <span style={{ background: `linear-gradient(90deg, ${WB}, #E878D0)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    ОТКАЗЫВАЮТ
                  </span><br />
                  <span className="text-white">ДРУГИЕ</span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p className="text-lg text-white/55 mb-9 max-w-lg leading-relaxed">
                  Полный цикл работы с маркетплейсами — приёмка, хранение, упаковка, отгрузка. Мебель, двери, кабели, металлоконструкции.
                </p>
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
                  {['Wildberries','Ozon','Яндекс.Маркет'].map(mp => (
                    <span key={mp} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/15 text-white/60">
                      {mp}
                    </span>
                  ))}
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border"
                    style={{ borderColor: 'rgba(203,17,171,0.4)', color: '#E878D0', background: 'rgba(203,17,171,0.1)' }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#E878D0' }} />
                    API реального времени
                  </span>
                </div>
              </FadeIn>
            </div>

            {/* Right — dashboard card */}
            <FadeIn delay={0.25} className="hidden lg:block">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                  style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
                  {/* card header */}
                  <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(203,17,171,0.3)' }}>
                        <Icon name="Warehouse" size={16} className="text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Склад Полка+</div>
                        <div className="text-xs text-white/40">Москва, Складской пр., 1</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Работаем
                    </div>
                  </div>
                  {/* metrics */}
                  <div className="grid grid-cols-3 gap-px bg-white/5 mx-6 my-5 rounded-xl overflow-hidden">
                    {[['Package2','247','Приёмка'],['Box','3.2к','Хранение'],['Send','189','Отгрузки']].map(([ic, val, lbl]) => (
                      <div key={lbl} className="py-4 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <Icon name={ic} size={18} className="mx-auto mb-1.5" style={{ color: '#E878D0' }} />
                        <div className="font-oswald font-bold text-white text-xl">{val}</div>
                        <div className="text-xs text-white/40">{lbl}</div>
                      </div>
                    ))}
                  </div>
                  {/* orders list */}
                  <div className="px-6 pb-5 space-y-2">
                    {[
                      ['Диван угловой 3-местный',     'WB',   'Принят',       'rgba(34,197,94,0.15)',        '#4ade80'],
                      ['Дверь межкомнатная 2000×900', 'Ozon', 'На хранении',  'rgba(234,179,8,0.15)',        '#facc15'],
                      ['Кабель ВВГ 2×2,5 100м',       'ЯМ',   'Отгружен',     'rgba(203,17,171,0.2)',        '#E878D0'],
                    ].map(([lbl,mp,st,bg,tc]) => (
                      <div key={lbl} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tc }} />
                        <span className="text-xs text-white/70 flex-1 truncate">{lbl}</span>
                        <span className="text-xs font-bold px-2 py-1 rounded-lg shrink-0"
                          style={{ background: 'rgba(203,17,171,0.2)', color: '#E878D0' }}>{mp}</span>
                        <span className="text-xs font-semibold px-2 py-1 rounded-lg shrink-0"
                          style={{ background: bg, color: tc }}>{st}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* floating badges */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2 border border-gray-100">
                  <Icon name="TrendingUp" size={16} style={{ color: WB }} />
                  <div><div className="font-bold text-gray-900 text-sm">+300%</div><div className="text-xs text-gray-400">рост за год</div></div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2 border border-gray-100">
                  <Icon name="Clock" size={16} className="text-green-500" />
                  <div><div className="font-bold text-gray-900 text-sm">24 часа</div><div className="text-xs text-gray-400">до отгрузки</div></div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative h-16 overflow-hidden">
          <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full" fill="#F4F6FA">
            <path d="M0,64 C360,0 1080,64 1440,32 L1440,64 Z" />
          </svg>
        </div>
      </section>

      {/* ════════════════ ADVANTAGES ════════════════ */}
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

      {/* ════════════════ CATEGORIES ════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <Tag label="Категории товаров" />
            <h2 className="font-oswald text-4xl md:text-5xl font-bold mb-2 text-gray-900">
              С чем мы <Accent>работаем</Accent>
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-xl">Специализация на нестандартных и крупногабаритных товарах</p>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((c, i) => (
              <FadeIn key={c.label} delay={i * 0.07}>
                <div className="rounded-2xl p-6 border border-gray-200 hover:border-[#CB11AB]/30 hover:shadow-md transition-all duration-300 group h-full"
                  style={{ background: '#F8F9FC' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: WB_MID }}>
                    <Icon name={c.icon} size={22} style={{ color: WB }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{c.label}</h3>
                  <p className="text-sm text-gray-500">{c.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ SERVICES ════════════════ */}
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

          {/* API strip */}
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
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                    style={{ background: WB }}>LIVE</span>
                </div>
                <p className="text-sm text-white/55">Двусторонняя синхронизация остатков, заказов и статусов с Wildberries, Ozon и Яндекс.Маркет. Обновление каждые 60 секунд.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {['WB','Ozon','ЯМ'].map(mp => (
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

      {/* ════════════════ CALCULATOR ════════════════ */}
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

      {/* ════════════════ PROCESS ════════════════ */}
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

      {/* ════════════════ STATS ════════════════ */}
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

      {/* ════════════════ ABOUT ════════════════ */}
      <section id="about" className="py-24" style={{ background: '#F4F6FA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <FadeIn>
              <Tag label="О компании" />
              <h2 className="font-oswald text-4xl md:text-5xl font-bold mb-5 text-gray-900">
                Полка+ — будущая<br /><Accent>федеральная сеть</Accent>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-4">
                Мы строим инфраструктуру нового поколения для российских продавцов на маркетплейсах.
              </p>
              <p className="text-gray-400 leading-relaxed mb-8">
                Каждый клиент получает технологического партнёра с полной цифровой интеграцией — от первых 100 до 100 000 отправок в месяц.
              </p>
              <div className="flex flex-wrap gap-2">
                {[['Москва',true],['Санкт-Петербург',false],['Казань',false],['Новосибирск',false],['Екатеринбург',false]].map(([city, active]) => (
                  <div key={city as string} className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium"
                    style={active ? { background: WB_LIGHT, borderColor: WB_MID, color: WB } : { background: 'white', borderColor: '#E5E7EB', color: '#9CA3AF' }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: active ? WB : '#D1D5DB' }} />
                    {city as string}
                    {!active && <span className="text-[10px] text-gray-300 uppercase tracking-wider">скоро</span>}
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: 'TrendingUp', label: 'Рост 300%',  sub: 'средний рост выручки клиентов за год' },
                  { icon: 'Network',    label: '5 городов',  sub: 'планируем открыть к 2027 году' },
                  { icon: 'Clock',      label: '24/7',        sub: 'операции и поддержка клиентов' },
                  { icon: 'Award',      label: 'ТОП-10',      sub: 'КГТ-фулфилмент по России' },
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

      {/* ════════════════ BLOG ════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <Tag label="Блог и новости" />
            <h2 className="font-oswald text-4xl md:text-5xl font-bold mb-2 text-gray-900">
              Экспертиза <Accent>в деталях</Accent>
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-xl">Актуальные материалы о фулфилменте и маркетплейсах</p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {blogPosts.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.1}>
                <div className="rounded-2xl p-7 border border-gray-200 hover:border-[#CB11AB]/30 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col h-full"
                  style={{ background: '#F8F9FC' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: WB_LIGHT, color: WB }}>{p.tag}</span>
                    <span className="text-xs text-gray-400">{p.date}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-3 leading-snug group-hover:text-[#CB11AB] transition-colors">{p.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">{p.desc}</p>
                  <div className="flex items-center gap-1.5 mt-5 text-xs font-bold group-hover:gap-2.5 transition-all" style={{ color: WB }}>
                    Читать далее <Icon name="ArrowRight" size={12} />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ CTA ════════════════ */}
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
          </FadeIn>
        </div>
      </section>

      {/* ════════════════ CONTACTS ════════════════ */}
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
            {/* Form */}
            <FadeIn>
              <div className="rounded-2xl p-8 border border-gray-200" style={{ background: '#F8F9FC' }}>
                <h3 className="font-oswald text-2xl font-bold mb-6 text-gray-900">Оставить заявку</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Ваше имя',  type: 'text', placeholder: 'Иван Иванов' },
                    { label: 'Телефон',   type: 'tel',  placeholder: '+7 (900) 000-00-00' },
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
                      <option>Мебель и КГТ</option>
                      <option>Двери</option>
                      <option>Кабельная продукция</option>
                      <option>Спорттовары</option>
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

            {/* Contacts */}
            <FadeIn delay={0.12}>
              <div className="space-y-3">
                {[
                  { icon: 'Phone',  label: 'Телефон', value: '+7 (900) 123-45-67',    sub: 'Пн–Вс, 09:00–21:00',          href: 'tel:+79001234567' },
                  { icon: 'Send',   label: 'Telegram', value: '@polkaplus',             sub: 'Ответим в течение 15 минут',   href: 'https://t.me/polkaplus' },
                  { icon: 'Mail',   label: 'Email',    value: 'info@polkaplus.ru',       sub: 'Для документов и КП',          href: 'mailto:info@polkaplus.ru' },
                  { icon: 'MapPin', label: 'Адрес',    value: 'г. Москва, Складской проезд, 1', sub: 'Схема проезда',       href: '#' },
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

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="border-t border-gray-200 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})` }}>
              <Icon name="Package" size={15} className="text-white" />
            </div>
            <span className="font-oswald text-lg font-bold text-gray-900">ПОЛКА<span style={{ color: WB }}>+</span></span>
          </div>
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
    </div>
  );
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
function Tag({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
      style={{ background: WB_LIGHT, color: WB }}>
      {label}
    </div>
  );
}

function Accent({ children }: { children: React.ReactNode }) {
  return <span style={{ color: WB }}>{children}</span>;
}

// ─── Calculator ───────────────────────────────────────────────────────────────
function Calculator() {
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
    lines.push({ label: 'Хранение паллет', amount: storagePallets * 45 * storageBillable, hint: `${storagePallets} × 45 ₽ × ${storageBillable} дн` });
    lines.push({ label: 'Хранение коробов', amount: storageBoxes * 15 * storageBillable,  hint: `${storageBoxes} × 15 ₽ × ${storageBillable} дн` });
  } else {
    lines.push({ label: 'Хранение', amount: 0, hint: '3 дня бесплатно' });
  }

  if (needAssembly) lines.push({ label: `Комплектация (${assemblyRate} ₽/шт)`, amount: orders * assemblyRate, hint: `${orders} × ${assemblyRate} ₽` });
  if (needPack)     lines.push({ label: `Упаковка: ${packNames[packType]}`,       amount: orders * packPrices[packType], hint: `${orders} × ${packPrices[packType]} ₽` });
  if (needLabel)    lines.push({ label: 'Печать + наклейка этикетки',              amount: orders * 8, hint: `${orders} × 8 ₽` });
  if (needSticker)  lines.push({ label: 'Стикеровка товара',                       amount: orders * 6, hint: `${orders} × 6 ₽` });
  if (needSupply) {
    lines.push({ label: 'Формирование поставки', amount: 250,                hint: '250 ₽' });
    lines.push({ label: 'Паллетирование',         amount: supplyPallets * 350, hint: `${supplyPallets} × 350 ₽` });
  }
  if (needLeaflet) lines.push({ label: 'Вложение листовки',    amount: orders * 3,    hint: `${orders} × 3 ₽` });
  if (needReturn)  lines.push({ label: 'Обработка возвратов',  amount: returnQty * 25, hint: `${returnQty} × 25 ₽` });

  const shipBase   = needSupply ? 500 : 150;
  const shipAmount = urgentShip ? Math.round(shipBase * 1.3) : shipBase;
  lines.push({ label: urgentShip ? 'Срочная отгрузка (+30%)' : 'Отгрузка', amount: shipAmount, hint: urgentShip ? `${shipBase} × 1.3` : '150–500 ₽' });

  const total = lines.reduce((s, l) => s + l.amount, 0);

  return (
    <div className="rounded-3xl border border-gray-200 overflow-hidden shadow-sm"
      style={{ background: '#F8F9FC' }}>
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
        <div className="lg:col-span-2 p-7 flex flex-col justify-between" style={{ background: 'linear-gradient(160deg, #1A1228 0%, #2D1640 100%)' }}>
          <div>
            <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-5">Ваш расчёт</div>

            <div className="space-y-2 mb-4 max-h-52 overflow-y-auto pr-1">
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

            <div className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(203,17,171,0.15)', border: '1px solid rgba(203,17,171,0.3)' }}>
              <div className="text-xs text-white/40 mb-1">Итого в месяц</div>
              <div className="font-oswald text-5xl font-bold"
                style={{ background: `linear-gradient(90deg, ${WB}, #E878D0)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {total.toLocaleString('ru')} <span className="text-3xl">₽</span>
              </div>
            </div>

            {orders >= 1000 && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4"
                style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Icon name="BadgeCheck" size={15} className="text-green-400 shrink-0" />
                <span className="text-xs font-semibold text-green-400">Тариф 30 ₽/заказ — максимальная скидка</span>
              </div>
            )}

            <p className="text-xs text-white/25 leading-relaxed mb-6">
              Расчёт ориентировочный. Точная стоимость согласовывается с менеджером.
            </p>
          </div>

          <button
            className="w-full py-4 rounded-xl font-bold text-base text-white transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
            style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})`, boxShadow: '0 8px 30px rgba(203,17,171,0.5)' }}
            onClick={() => document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' })}>
            Получить точный расчёт
          </button>
        </div>
      </div>
    </div>
  );
}

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