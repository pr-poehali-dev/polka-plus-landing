import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';

const useInView = (threshold = 0.12) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
};

const AnimatedCounter = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    const step = target / (2000 / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString('ru')}{suffix}</span>;
};

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`
    }}>
      {children}
    </div>
  );
}

// WB palette
const WB = '#CB11AB';
const WB_DARK = '#9A0080';
const WB_LIGHT = '#F9ECF7';
const WB_MID = '#F0D6EC';

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const advantages = [
    { icon: 'Package2', title: 'Работаем с крупногабаритом', desc: 'Принимаем мебель, двери, кабели и любые нестандартные товары без ограничений по габаритам' },
    { icon: 'MapPin', title: 'Адресное хранение', desc: 'Цифровая карта склада — каждый товар на своём месте, ни одной потери' },
    { icon: 'ShieldCheck', title: 'Контроль качества', desc: 'Фотофиксация при приёмке, проверка каждой единицы, отчёт онлайн' },
    { icon: 'Layers', title: 'Усиленная упаковка', desc: 'Специальные материалы для хрупких и крупных товаров, защита при транспортировке' },
    { icon: 'Zap', title: 'Быстрая отгрузка', desc: 'Отправляем на маркетплейс в течение 24 часов с момента получения заказа' },
    { icon: 'BarChart3', title: 'Прозрачная отчётность', desc: 'Личный кабинет с историей операций, остатками и аналитикой в реальном времени' },
  ];

  const categories = [
    { icon: 'Armchair', label: 'Мебель', desc: 'Диваны, шкафы, кровати — любые габариты' },
    { icon: 'DoorOpen', label: 'Двери', desc: 'Межкомнатные и входные, спецупаковка' },
    { icon: 'Cable', label: 'Кабельная продукция', desc: 'Барабаны, бухты, кабель-каналы' },
    { icon: 'Dumbbell', label: 'Спорттовары', desc: 'Тренажёры, велосипеды, самокаты' },
    { icon: 'Hammer', label: 'Металлоконструкции', desc: 'Профили, уголки, нестандартные изделия' },
    { icon: 'Wrench', label: 'Нестандартные грузы', desc: 'Если отказали другие — мы возьмём' },
  ];

  const services = [
    { icon: 'Truck', title: 'Приёмка товара', desc: 'Разгрузка, проверка, фото, постановка на учёт' },
    { icon: 'Warehouse', title: 'Хранение', desc: 'Адресное хранение, климат-контроль для чувствительных товаров' },
    { icon: 'PackageOpen', title: 'Упаковка', desc: 'По требованиям WB, Ozon, ЯМ. Защита при транспортировке' },
    { icon: 'Tag', title: 'Маркировка', desc: 'Штрихкоды, честный знак, этикетки по всем стандартам' },
    { icon: 'ListChecks', title: 'Комплектация', desc: 'Сборка заказов, подарочная упаковка, вложения' },
    { icon: 'Send', title: 'Отгрузка', desc: 'Синхронизация с API маркетплейсов в реальном времени' },
  ];

  const steps = [
    { num: '01', title: 'Вы привозите товар', desc: 'Или организуем доставку через партнёров' },
    { num: '02', title: 'Принимаем и размещаем', desc: 'Цифровая приёмка, фото, адресное хранение' },
    { num: '03', title: 'Упаковываем и маркируем', desc: 'По стандартам WB, Ozon, Яндекс.Маркет' },
    { num: '04', title: 'Отгружаем на маркетплейс', desc: 'API-синхронизация, точные сроки' },
    { num: '05', title: 'Вы получаете прибыль', desc: 'Отслеживайте всё в личном кабинете' },
  ];

  const stats = [
    { value: 12000, suffix: ' м²', label: 'площадь склада' },
    { value: 3500, suffix: '+', label: 'паллетомест' },
    { value: 200, suffix: '+', label: 'клиентов' },
    { value: 15000, suffix: '+', label: 'отправок в месяц' },
  ];

  const blogPosts = [
    { tag: 'Маркетплейсы', date: '18 февраля 2026', title: 'Как выбрать фулфилмент для крупногабарита: 7 критических вопросов', desc: 'Разбираем ошибки селлеров при выборе склада' },
    { tag: 'API интеграции', date: '10 февраля 2026', title: 'API Wildberries 2026: новые требования и как подготовиться', desc: 'Обновлённый протокол синхронизации остатков и маркировки' },
    { tag: 'Кейс', date: '3 февраля 2026', title: 'Кейс: рост отгрузок 300% за 3 месяца — мебельный бизнес', desc: 'Как производитель диванов масштабировал продажи на WB' },
  ];

  return (
    <div className="min-h-screen bg-white font-golos text-gray-900 overflow-x-hidden">

      {/* ===== HEADER ===== */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-3' : 'bg-white py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})` }}>
              <Icon name="Package" size={18} className="text-white" />
            </div>
            <div>
              <span className="font-oswald text-xl font-bold tracking-wide text-gray-900">ПОЛКА</span>
              <span className="font-oswald text-xl font-bold" style={{ color: WB }}>+</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7">
            {[['Услуги', 'services'], ['Преимущества', 'advantages'], ['О компании', 'about'], ['Контакты', 'contacts']].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a href="tel:+79001234567" className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
              +7 (900) 123-45-67
            </a>
            <button onClick={() => scrollTo('contacts')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
              style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})` }}>
              Оставить заявку
            </button>
          </div>

          <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            <Icon name={menuOpen ? 'X' : 'Menu'} size={22} />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-5 flex flex-col gap-3 shadow-lg">
            {[['Услуги', 'services'], ['Преимущества', 'advantages'], ['О компании', 'about'], ['Контакты', 'contacts']].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="text-left text-gray-700 hover:text-gray-900 py-2 border-b border-gray-50 font-medium">
                {label}
              </button>
            ))}
            <button onClick={() => scrollTo('contacts')}
              className="mt-1 px-5 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})` }}>
              Оставить заявку
            </button>
          </div>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section className="relative pt-28 pb-20 overflow-hidden" style={{ background: `linear-gradient(160deg, ${WB_LIGHT} 0%, #fff 60%)` }}>
        {/* Decorative blob */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(circle at 70% 30%, ${WB}, transparent 70%)`, transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${WB}, transparent 70%)`, transform: 'translate(-40%, 40%)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn delay={0}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
                  style={{ background: WB_MID, color: WB }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: WB }} />
                  Фулфилмент-центр для маркетплейсов
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <h1 className="font-oswald text-5xl sm:text-6xl font-bold leading-[1.0] mb-5 text-gray-900">
                  РАБОТАЕМ<br />С ТЕМ, ОТ ЧЕГО<br />
                  <span style={{ color: WB }}>ОТКАЗЫВАЮТ</span><br />ДРУГИЕ
                </h1>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p className="text-lg text-gray-500 mb-8 max-w-lg leading-relaxed">
                  Полка+ — фулфилмент-центр для крупногабаритных товаров. Мебель, двери, кабели, металлоконструкции. Полный цикл: приёмка, хранение, упаковка, отгрузка.
                </p>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className="flex flex-wrap gap-3 mb-8">
                  <button onClick={() => scrollTo('contacts')}
                    className="px-7 py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-95"
                    style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})`, boxShadow: `0 8px 30px rgba(203,17,171,0.3)` }}>
                    Рассчитать стоимость
                  </button>
                  <button onClick={() => scrollTo('contacts')}
                    className="px-7 py-3.5 rounded-xl font-semibold border-2 text-gray-700 hover:bg-gray-50 transition-all"
                    style={{ borderColor: '#e5e7eb' }}>
                    Оставить заявку
                  </button>
                </div>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wider mr-1">Интеграции:</span>
                  {['Wildberries', 'Ozon', 'Яндекс.Маркет'].map((mp) => (
                    <span key={mp} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-600 shadow-sm">
                      {mp}
                    </span>
                  ))}
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border" style={{ background: WB_LIGHT, borderColor: WB_MID, color: WB }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: WB }} />
                    API реального времени
                  </span>
                </div>
              </FadeIn>
            </div>

            {/* Hero visual */}
            <FadeIn delay={0.2} className="hidden lg:block">
              <div className="relative">
                {/* Main card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: WB_LIGHT }}>
                      <Icon name="Warehouse" size={20} style={{ color: WB }} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Склад Полка+</div>
                      <div className="text-xs text-gray-400">Москва, Складской пр., 1</div>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Работаем
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { icon: 'Package2', label: 'Приёмка', val: '247' },
                      { icon: 'Box', label: 'Хранение', val: '3.2к' },
                      { icon: 'Send', label: 'Отгрузки', val: '189' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl p-4 text-center" style={{ background: WB_LIGHT }}>
                        <Icon name={item.icon} size={20} className="mx-auto mb-2" style={{ color: WB }} />
                        <div className="font-bold text-gray-900 text-lg">{item.val}</div>
                        <div className="text-xs text-gray-500">{item.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { label: 'Диван угловой 3-местный', mp: 'WB', status: 'Принят', color: '#DCFCE7', tc: '#16A34A' },
                      { label: 'Дверь межкомнатная 2000×900', mp: 'Ozon', status: 'На хранении', color: '#FEF9C3', tc: '#CA8A04' },
                      { label: 'Кабель ВВГ 2×2,5 100м', mp: 'ЯМ', status: 'Отгружен', color: WB_LIGHT, tc: WB },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: row.tc }} />
                        <span className="text-xs text-gray-700 flex-1 truncate font-medium">{row.label}</span>
                        <span className="text-xs font-semibold px-2 py-1 rounded-lg shrink-0" style={{ background: WB_MID, color: WB }}>{row.mp}</span>
                        <span className="text-xs font-medium px-2 py-1 rounded-lg shrink-0" style={{ background: row.color, color: row.tc }}>{row.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2 border border-gray-100">
                  <Icon name="TrendingUp" size={18} style={{ color: WB }} />
                  <div>
                    <div className="font-bold text-gray-900 text-sm">+300%</div>
                    <div className="text-xs text-gray-400">рост за год</div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2 border border-gray-100">
                  <Icon name="Clock" size={18} className="text-green-500" />
                  <div>
                    <div className="font-bold text-gray-900 text-sm">24 часа</div>
                    <div className="text-xs text-gray-400">отгрузка</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ===== MARQUEE ===== */}
      <div className="overflow-hidden border-y border-gray-100 py-4 bg-white">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) =>
            ['КГТ-ФУЛФИЛМЕНТ', 'WILDBERRIES', 'OZON', 'ЯНДЕКС.МАРКЕТ', 'КРУПНОГАБАРИТ', 'МЕБЕЛЬ', 'ДВЕРИ', 'КАБЕЛИ', 'API ИНТЕГРАЦИИ', 'АДРЕСНОЕ ХРАНЕНИЕ'].map((item) => (
              <span key={`${i}-${item}`} className="font-oswald text-xs tracking-[0.25em] text-gray-300 uppercase flex items-center gap-12">
                {item} <span style={{ color: WB }}>◆</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* ===== ADVANTAGES ===== */}
      <section id="advantages" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionLabel tag="Преимущества" />
          <FadeIn>
            <h2 className="font-oswald text-4xl md:text-5xl font-bold mb-3 text-gray-900">
              Почему выбирают <span style={{ color: WB }}>Полку+</span>
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-xl">Специализируемся на том, что другие считают слишком сложным</p>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {advantages.map((adv, i) => (
              <FadeIn key={adv.title} delay={i * 0.07}>
                <div className="group p-7 rounded-2xl border border-gray-100 bg-white hover:shadow-lg hover:border-transparent transition-all duration-300 h-full"
                  style={{ '--hover-border': WB } as React.CSSProperties}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                    style={{ background: WB_LIGHT }}>
                    <Icon name={adv.icon} size={22} style={{ color: WB }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-base mb-2">{adv.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{adv.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-24" style={{ background: WB_LIGHT }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionLabel tag="Категории товаров" />
          <FadeIn>
            <h2 className="font-oswald text-4xl md:text-5xl font-bold mb-3 text-gray-900">
              С чем мы <span style={{ color: WB }}>работаем</span>
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-xl">Специализация на нестандартных и крупногабаритных товарах</p>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <FadeIn key={cat.label} delay={i * 0.07}>
                <div className="bg-white rounded-2xl p-6 border border-white/80 hover:shadow-md transition-all duration-300 group h-full">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: WB_MID }}>
                    <Icon name={cat.icon} size={22} style={{ color: WB }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{cat.label}</h3>
                  <p className="text-sm text-gray-500">{cat.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionLabel tag="Услуги" />
          <FadeIn>
            <h2 className="font-oswald text-4xl md:text-5xl font-bold mb-3 text-gray-900">
              Полный цикл <span style={{ color: WB }}>работ</span>
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-xl">От приёмки до отгрузки — всё под одной крышей</p>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {services.map((svc, i) => (
              <FadeIn key={svc.title} delay={i * 0.07}>
                <div className="flex gap-4 p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-gray-200 transition-all duration-300 group h-full">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: WB_LIGHT }}>
                    <Icon name={svc.icon} size={20} style={{ color: WB }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{svc.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{svc.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* API highlight */}
          <FadeIn delay={0.1}>
            <div className="p-8 rounded-2xl border flex flex-col md:flex-row md:items-center gap-6"
              style={{ background: `linear-gradient(135deg, ${WB_LIGHT}, #fff)`, borderColor: WB_MID }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: WB_MID }}>
                <Icon name="Wifi" size={26} style={{ color: WB }} />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">API-синхронизация в реальном времени</h3>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: WB, color: 'white' }}>LIVE</span>
                </div>
                <p className="text-sm text-gray-500">Двусторонняя синхронизация остатков, заказов и статусов с Wildberries, Ozon и Яндекс.Маркет. Обновление каждые 60 секунд. Нулевые расхождения данных.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {['WB', 'Ozon', 'ЯМ'].map((mp) => (
                  <div key={mp} className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold border"
                    style={{ background: WB_MID, borderColor: WB_MID, color: WB }}>
                    {mp}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <section className="py-24" style={{ background: '#FAFAFA' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <SectionLabel tag="Как это работает" />
          <FadeIn>
            <h2 className="font-oswald text-4xl md:text-5xl font-bold mb-3 text-gray-900">
              Процесс работы
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-xl">Прозрачно на каждом шаге</p>
          </FadeIn>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.1}>
                <div className="flex gap-5 items-start bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-oswald font-bold text-white shrink-0"
                    style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})` }}>
                    {step.num}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                  </div>
                  {i === steps.length - 1 && (
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold shrink-0"
                      style={{ background: '#DCFCE7', color: '#16A34A' }}>
                      <Icon name="TrendingUp" size={14} />
                      Прибыль
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-20" style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y md:divide-y-0 divide-white/20">
            {stats.map((stat) => (
              <div key={stat.label} className="py-10 px-8 text-center">
                <div className="font-oswald text-5xl font-bold text-white mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-white/60 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT / FEDERAL ===== */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <SectionLabel tag="О компании" />
              <h2 className="font-oswald text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Полка+ — будущая<br />
                <span style={{ color: WB }}>федеральная сеть</span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-5">
                Мы строим не просто склад — мы создаём инфраструктуру нового поколения для российских продавцов на маркетплейсах.
              </p>
              <p className="text-gray-400 leading-relaxed mb-8">
                Каждый клиент получает технологического партнёра с полной цифровой интеграцией — от первых 100 до 100 000 отправок в месяц.
              </p>
              <div className="flex flex-wrap gap-2">
                {[['Москва', true], ['Санкт-Петербург', false], ['Казань', false], ['Новосибирск', false], ['Екатеринбург', false]].map(([city, active]) => (
                  <div key={city as string} className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium"
                    style={active ? { background: WB_LIGHT, borderColor: WB_MID, color: WB } : { background: '#F9FAFB', borderColor: '#F3F4F6', color: '#9CA3AF' }}>
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
                  { icon: 'TrendingUp', label: 'Рост 300%', sub: 'средний рост выручки клиентов за год' },
                  { icon: 'Network', label: '5 городов', sub: 'планируем открыть к 2027 году' },
                  { icon: 'Clock', label: '24/7', sub: 'операции и поддержка клиентов' },
                  { icon: 'Award', label: 'ТОП-10', sub: 'КГТ-фулфилмент по России' },
                ].map((item, i) => (
                  <FadeIn key={item.label} delay={i * 0.08}>
                    <div className="p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-gray-200">
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

      {/* ===== BLOG ===== */}
      <section className="py-24" style={{ background: '#FAFAFA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionLabel tag="Блог и новости" />
          <FadeIn>
            <h2 className="font-oswald text-4xl md:text-5xl font-bold mb-3 text-gray-900">
              Экспертиза <span style={{ color: WB }}>в деталях</span>
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-xl">Актуальные материалы о фулфилменте и маркетплейсах</p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {blogPosts.map((post, i) => (
              <FadeIn key={post.title} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer group flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: WB_LIGHT, color: WB }}>
                      {post.tag}
                    </span>
                    <span className="text-xs text-gray-400">{post.date}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-3 leading-snug group-hover:text-[#CB11AB] transition-colors duration-200">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">{post.desc}</p>
                  <div className="flex items-center gap-1.5 mt-5 text-xs font-semibold transition-colors duration-200 group-hover:gap-2.5"
                    style={{ color: WB }}>
                    Читать далее <Icon name="ArrowRight" size={12} />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BIG CTA ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <FadeIn>
            <div className="rounded-3xl p-14 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})` }}>
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
              <div className="relative">
                <h2 className="font-oswald text-4xl sm:text-5xl font-bold text-white mb-4">
                  ГОТОВЫ МАСШТАБИРОВАТЬ<br />ВАШ БИЗНЕС?
                </h2>
                <p className="text-white/70 text-lg mb-8">Оставьте заявку — менеджер свяжется в течение 15 минут</p>
                <button onClick={() => scrollTo('contacts')}
                  className="px-10 py-4 rounded-xl font-bold text-base bg-white transition-all hover:scale-105 active:scale-95 shadow-xl"
                  style={{ color: WB }}>
                  Оставить заявку
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== CONTACTS ===== */}
      <section id="contacts" className="py-24" style={{ background: '#FAFAFA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionLabel tag="Контакты" />
          <FadeIn>
            <h2 className="font-oswald text-4xl md:text-5xl font-bold mb-3 text-gray-900">
              Свяжитесь <span style={{ color: WB }}>с нами</span>
            </h2>
            <p className="text-gray-400 text-lg mb-12">Работаем 24/7. Ответим быстро.</p>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <FadeIn>
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <h3 className="font-oswald text-2xl font-bold mb-6 text-gray-900">Оставить заявку</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Ваше имя</label>
                    <input type="text" placeholder="Иван Иванов"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-300 text-sm focus:outline-none transition-colors duration-200"
                      style={{ '--tw-ring-color': WB } as React.CSSProperties}
                      onFocus={e => e.target.style.borderColor = WB}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Телефон</label>
                    <input type="tel" placeholder="+7 (900) 000-00-00"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-300 text-sm focus:outline-none transition-colors duration-200"
                      onFocus={e => e.target.style.borderColor = WB}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Тип товара</label>
                    <select className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm focus:outline-none transition-colors duration-200"
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
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Комментарий</label>
                    <textarea rows={3} placeholder="Расскажите о вашем товаре и объёмах..."
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-300 text-sm focus:outline-none transition-colors duration-200 resize-none"
                      onFocus={e => e.target.style.borderColor = WB}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </div>
                  <button className="w-full py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.01] active:scale-95 shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})`, boxShadow: `0 8px 25px rgba(203,17,171,0.3)` }}>
                    Отправить заявку
                  </button>
                  <p className="text-xs text-gray-400 text-center">Нажимая, вы соглашаетесь с политикой конфиденциальности</p>
                </div>
              </div>
            </FadeIn>

            {/* Contact info */}
            <FadeIn delay={0.12}>
              <div className="space-y-3">
                {[
                  { icon: 'Phone', label: 'Телефон', value: '+7 (900) 123-45-67', sub: 'Пн–Вс, 09:00–21:00', href: 'tel:+79001234567' },
                  { icon: 'Send', label: 'Telegram', value: '@polkaplus', sub: 'Ответим в течение 15 минут', href: 'https://t.me/polkaplus' },
                  { icon: 'Mail', label: 'Email', value: 'info@polkaplus.ru', sub: 'Для документов и КП', href: 'mailto:info@polkaplus.ru' },
                  { icon: 'MapPin', label: 'Адрес', value: 'г. Москва, Складской проезд, 1', sub: 'Схема проезда', href: '#' },
                ].map((contact) => (
                  <a key={contact.label} href={contact.href}
                    className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-md hover:border-gray-200 transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: WB_LIGHT }}>
                      <Icon name={contact.icon} size={20} style={{ color: WB }} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{contact.label}</div>
                      <div className="font-semibold text-gray-900">{contact.value}</div>
                      <div className="text-xs text-gray-400">{contact.sub}</div>
                    </div>
                  </a>
                ))}

                {/* Map placeholder */}
                <div className="rounded-2xl border border-gray-100 overflow-hidden h-44 relative cursor-pointer hover:shadow-md transition-all group bg-gray-50">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-14 gap-px opacity-10 absolute inset-0">
                      {Array.from({ length: 112 }).map((_, i) => (
                        <div key={i} className="h-full rounded-sm" style={{ background: i % 9 === 0 ? WB : '#E5E7EB' }} />
                      ))}
                    </div>
                    <div className="relative text-center z-10">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg bg-white"
                        style={{ border: `2px solid ${WB_MID}` }}>
                        <Icon name="MapPin" size={20} style={{ color: WB }} />
                      </div>
                      <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">Открыть на карте</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-100 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})` }}>
              <Icon name="Package" size={15} className="text-white" />
            </div>
            <div>
              <span className="font-oswald text-lg font-bold text-gray-900">ПОЛКА</span>
              <span className="font-oswald text-lg font-bold" style={{ color: WB }}>+</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-7 justify-center">
            {[['Услуги', 'services'], ['Преимущества', 'advantages'], ['О компании', 'about'], ['Контакты', 'contacts']].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-sm text-gray-400 hover:text-gray-700 transition-colors font-medium">
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

function SectionLabel({ tag }: { tag: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.15em] mb-4"
      style={{ background: WB_LIGHT, color: WB }}>
      {tag}
    </div>
  );
}
