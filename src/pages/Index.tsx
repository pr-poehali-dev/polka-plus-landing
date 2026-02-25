import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';

const useInView = (threshold = 0.15) => {
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
    const duration = 2000;
    const step = target / (duration / 16);
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

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const advantages = [
    { icon: 'Package', label: 'Крупногабарит', desc: 'Принимаем и храним товары любых размеров — мебель, двери, кабели' },
    { icon: 'MapPin', label: 'Адресное хранение', desc: 'Точная система навигации на складе с цифровой картой мест' },
    { icon: 'ShieldCheck', label: 'Контроль качества', desc: 'Проверка каждой единицы товара при приёмке и упаковке' },
    { icon: 'Box', label: 'Усиленная упаковка', desc: 'Специальная защита для хрупких и нестандартных товаров' },
    { icon: 'Zap', label: 'Быстрая отгрузка', desc: 'Отгрузка в течение 24 часов с момента поступления заказа' },
    { icon: 'BarChart3', label: 'Прозрачная отчётность', desc: 'Личный кабинет с аналитикой и историей всех операций' },
  ];

  const categories = [
    { icon: 'Armchair', label: 'Мебель', desc: 'Диваны, шкафы, кровати — принимаем без ограничений по габаритам', tone: 'orange' },
    { icon: 'DoorOpen', label: 'Двери', desc: 'Межкомнатные и входные двери. Специальная упаковка и стойки хранения', tone: 'cyan' },
    { icon: 'Cable', label: 'Кабельная продукция', desc: 'Барабаны, бухты, кабель-каналы. Адресное хранение и разукрупнение', tone: 'green' },
    { icon: 'Dumbbell', label: 'Спорттовары', desc: 'Тренажёры, велосипеды, самокаты — сборка и упаковка по стандартам маркетплейсов', tone: 'orange' },
    { icon: 'Wrench', label: 'Нестандартные грузы', desc: 'Если другие отказали — мы найдём решение. Работаем с любым форматом', tone: 'cyan' },
  ];

  const services = [
    { icon: 'Truck', title: 'Приёмка товара', desc: 'Разгрузка, проверка количества и качества, фотофиксация, постановка на учёт' },
    { icon: 'Warehouse', title: 'Хранение', desc: 'Адресное хранение в защищённых зонах. Климат-контроль для чувствительных товаров' },
    { icon: 'PackageOpen', title: 'Упаковка', desc: 'Усиленная упаковка по требованиям WB и Ozon. Защита от повреждений при транспортировке' },
    { icon: 'Tag', title: 'Маркировка', desc: 'Нанесение штрихкодов, этикеток, честных знаков по всем стандартам маркетплейсов' },
    { icon: 'ListChecks', title: 'Комплектация заказов', desc: 'Сборка многотоварных заказов, подарочная упаковка, вложение документов' },
    { icon: 'Send', title: 'Отгрузка WB / Ozon / ЯМ', desc: 'Синхронизация с API маркетплейсов в реальном времени. Автоматическая передача данных' },
  ];

  const steps = [
    { num: '01', title: 'Вы привозите товар', desc: 'Или организуем доставку силами наших партнёров' },
    { num: '02', title: 'Принимаем и размещаем', desc: 'Цифровая приёмка, фото, постановка на адрес хранения' },
    { num: '03', title: 'Упаковываем и маркируем', desc: 'По стандартам WB, Ozon, Яндекс.Маркет автоматически' },
    { num: '04', title: 'Отгружаем на маркетплейс', desc: 'Синхронизация с API платформ — заказы уходят в срок' },
    { num: '05', title: 'Вы получаете прибыль', desc: 'Отслеживайте всё в личном кабинете в реальном времени' },
  ];

  const stats = [
    { value: 12000, suffix: ' м²', label: 'площадь склада' },
    { value: 3500, suffix: '+', label: 'паллетомест' },
    { value: 200, suffix: '+', label: 'клиентов' },
    { value: 15000, suffix: '+', label: 'отправок в месяц' },
  ];

  const blogPosts = [
    { tag: 'Маркетплейсы', date: '18 февраля 2026', title: 'Как выбрать фулфилмент для крупногабарита: 7 критических вопросов', desc: 'Разбираем ошибки селлеров при выборе склада и что нужно проверить перед подписанием договора' },
    { tag: 'API интеграции', date: '10 февраля 2026', title: 'API Wildberries 2026: новые требования и как к ним подготовиться', desc: 'Обновлённый протокол синхронизации остатков и изменения в правилах маркировки' },
    { tag: 'Кейс', date: '3 февраля 2026', title: 'Кейс: 300% рост отгрузок за 3 месяца — история клиента из мебели', desc: 'Как один производитель диванов масштабировал продажи на WB с помощью КГТ-фулфилмента' },
  ];

  const toneColors: Record<string, { bg: string; border: string; icon: string; glow: string }> = {
    orange: { bg: 'rgba(255,107,43,0.06)', border: 'rgba(255,107,43,0.2)', icon: 'text-[#FF6B2B]', glow: '#FF6B2B' },
    cyan: { bg: 'rgba(0,229,255,0.04)', border: 'rgba(0,229,255,0.15)', icon: 'text-[#00E5FF]', glow: '#00E5FF' },
    green: { bg: 'rgba(57,255,20,0.04)', border: 'rgba(57,255,20,0.15)', icon: 'text-[#39FF14]', glow: '#39FF14' },
  };

  return (
    <div className="min-h-screen bg-[#080810] font-golos text-white overflow-x-hidden">

      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: `linear-gradient(rgba(255,107,43,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,43,0.025) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      {/* Glow orbs */}
      <div className="fixed top-0 left-1/4 w-[700px] h-[700px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(255,107,43,0.07) 0%, transparent 70%)' }} />
      <div className="fixed top-1/3 right-0 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)' }} />

      {/* ===== HEADER ===== */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#080810]/95 backdrop-blur-xl border-b border-white/5 py-3' : 'py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF6B2B, #FF3D00)' }}>
              <Icon name="Package" size={16} className="text-white" />
            </div>
            <span className="font-oswald text-xl font-semibold tracking-wide">
              ПОЛКА<span style={{ color: '#FF6B2B' }}>+</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {[['Услуги', 'services'], ['Преимущества', 'advantages'], ['О компании', 'about'], ['Контакты', 'contacts']].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="text-sm text-white/60 hover:text-white transition-colors duration-200 tracking-wide">
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href="tel:+79001234567" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
              +7 (900) 123-45-67
            </a>
            <button onClick={() => scrollTo('contacts')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #FF6B2B, #FF3D00)' }}>
              Оставить заявку
            </button>
          </div>

          <button className="md:hidden text-white/80" onClick={() => setMenuOpen(!menuOpen)}>
            <Icon name={menuOpen ? 'X' : 'Menu'} size={24} />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-[#0F0F1A]/98 backdrop-blur-xl border-t border-white/5 px-4 py-6 flex flex-col gap-4 animate-fade-in">
            {[['Услуги', 'services'], ['Преимущества', 'advantages'], ['О компании', 'about'], ['Контакты', 'contacts']].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-left text-white/70 hover:text-white py-2 border-b border-white/5 text-base">
                {label}
              </button>
            ))}
            <button onClick={() => scrollTo('contacts')}
              className="mt-2 px-5 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #FF6B2B, #FF3D00)' }}>
              Оставить заявку
            </button>
          </div>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-2/3"
            style={{ background: 'linear-gradient(to top, rgba(8,8,16,1) 0%, transparent 100%)' }} />
          <div className="absolute inset-0 flex items-center justify-end opacity-[0.06] pr-8 pt-24">
            <svg viewBox="0 0 600 700" className="h-[80vh] max-h-[700px]" fill="none">
              {Array.from({ length: 5 }).map((_, col) =>
                Array.from({ length: 6 }).map((_, row) => (
                  <rect key={`${col}-${row}`} x={col * 110 + 8} y={row * 110 + 8} width={95} height={95} rx={6}
                    fill={`rgba(255,107,43,${0.3 + Math.random() * 0.7})`} />
                ))
              )}
            </svg>
          </div>
          {[...Array(18)].map((_, i) => (
            <div key={i} className="absolute rounded-full animate-float"
              style={{
                width: `${2 + (i % 3) * 2}px`, height: `${2 + (i % 3) * 2}px`,
                left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`,
                background: i % 3 === 0 ? '#FF6B2B' : i % 3 === 1 ? '#00E5FF' : '#39FF14',
                opacity: 0.25 + (i % 4) * 0.1,
                animationDelay: `${(i * 0.7) % 4}s`,
                animationDuration: `${3 + (i % 3)}s`
              }} />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF6B2B]/30 bg-[#FF6B2B]/10 mb-8 animate-fade-in"
              style={{ animationDelay: '0.1s', opacity: 0 }}>
              <div className="w-2 h-2 rounded-full bg-[#FF6B2B] animate-pulse" />
              <span className="text-sm text-[#FF6B2B] font-medium">Работаем с тем, от чего отказывают другие</span>
            </div>

            <h1 className="font-oswald text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-6 animate-fade-in"
              style={{ animationDelay: '0.2s', opacity: 0 }}>
              ФУЛФИЛМЕНТ<br />
              <span style={{ background: 'linear-gradient(135deg, #FF6B2B 0%, #FF8C42 50%, #FFB347 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                НОВОГО
              </span>{' '}
              <span className="relative inline-block">
                ПОКОЛЕНИЯ
                <span className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full"
                  style={{ background: 'linear-gradient(90deg, #FF6B2B, #FF3D00)', boxShadow: '0 0 8px #FF6B2B' }} />
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/55 mb-10 max-w-2xl leading-relaxed font-golos animate-fade-in"
              style={{ animationDelay: '0.35s', opacity: 0 }}>
              Полный цикл работы с маркетплейсами:<br />
              <span className="text-white/80">приёмка, хранение, упаковка, отгрузка.</span>
            </p>

            <div className="flex flex-wrap gap-4 mb-16 animate-fade-in" style={{ animationDelay: '0.5s', opacity: 0 }}>
              <button onClick={() => scrollTo('contacts')}
                className="px-8 py-4 rounded-2xl text-base font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #FF6B2B, #FF3D00)', boxShadow: '0 0 40px rgba(255,107,43,0.4)' }}>
                Рассчитать стоимость
              </button>
              <button onClick={() => scrollTo('contacts')}
                className="px-8 py-4 rounded-2xl text-base font-semibold text-white border border-white/20 bg-white/5 backdrop-blur hover:bg-white/10 hover:border-white/30 transition-all duration-200">
                Оставить заявку
              </button>
            </div>

            <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: '0.65s', opacity: 0 }}>
              <span className="text-xs text-white/30 uppercase tracking-widest self-center mr-1">Интеграции:</span>
              {['Wildberries', 'Ozon', 'Яндекс.Маркет'].map((mp) => (
                <div key={mp} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/60 font-medium">
                  {mp}
                </div>
              ))}
              <div className="px-3 py-2 rounded-xl border border-[#00E5FF]/25 bg-[#00E5FF]/8 text-sm text-[#00E5FF]/80 font-medium flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                API реального времени
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float opacity-40">
          <span className="text-xs text-white/50 tracking-widest uppercase">Прокрутить</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ===== MARQUEE ===== */}
      <div className="relative overflow-hidden py-5 border-y border-white/5"
        style={{ background: 'linear-gradient(90deg, rgba(255,107,43,0.04), rgba(255,107,43,0.08), rgba(255,107,43,0.04))' }}>
        <div className="flex gap-10 animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) =>
            ['КГТ-ФУЛФИЛМЕНТ', 'WILDBERRIES', 'OZON', 'ЯНДЕКС.МАРКЕТ', 'КРУПНОГАБАРИТ', 'МЕБЕЛЬ', 'ДВЕРИ', 'КАБЕЛИ', 'API ИНТЕГРАЦИИ', 'АДРЕСНОЕ ХРАНЕНИЕ'].map((item) => (
              <span key={`${i}-${item}`} className="font-oswald text-xs font-medium tracking-[0.3em] text-white/25 uppercase flex items-center gap-10">
                {item} <span style={{ color: '#FF6B2B' }}>◆</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* ===== ADVANTAGES ===== */}
      <section id="advantages" className="py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            tag="Преимущества"
            title={<>Почему выбирают <span style={{ color: '#FF6B2B' }}>Полку+</span></>}
            subtitle="Специализируемся на том, что другие фулфилмент-центры считают слишком сложным"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {advantages.map((adv, i) => (
              <FadeInCard key={adv.label} delay={i * 0.08}>
                <div className="p-6 rounded-2xl border border-white/8 bg-white/[0.03] hover:border-[#FF6B2B]/30 hover:bg-white/[0.05] transition-all duration-300 group h-full">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: 'rgba(255,107,43,0.12)', border: '1px solid rgba(255,107,43,0.2)' }}>
                    <Icon name={adv.icon} size={22} className="text-[#FF6B2B]" />
                  </div>
                  <h3 className="font-oswald text-lg font-semibold mb-2 tracking-wide">{adv.label}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{adv.desc}</p>
                </div>
              </FadeInCard>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            tag="Категории"
            title={<>С кем мы <span style={{ color: '#FF6B2B' }}>работаем</span></>}
            subtitle="Специализация на нестандартных и крупногабаритных товарах"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, i) => {
              const c = toneColors[cat.tone];
              return (
                <FadeInCard key={cat.label} delay={i * 0.1}>
                  <div className="relative p-7 rounded-2xl border overflow-hidden group hover:border-white/15 transition-all duration-300 h-full"
                    style={{ background: c.bg, borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                      <Icon name={cat.icon} size={26} className={c.icon} />
                    </div>
                    <h3 className="font-oswald text-xl font-semibold mb-2 tracking-wide">{cat.label}</h3>
                    <p className="text-sm text-white/45 leading-relaxed">{cat.desc}</p>
                    <div className="absolute bottom-0 right-0 w-36 h-36 rounded-full opacity-10 blur-3xl -mr-10 -mb-10"
                      style={{ background: c.glow }} />
                  </div>
                </FadeInCard>
              );
            })}
            <FadeInCard delay={0.55}>
              <div className="p-7 rounded-2xl border border-dashed border-white/12 flex flex-col items-center justify-center text-center hover:border-[#FF6B2B]/30 transition-colors duration-300 cursor-pointer group min-h-[200px]"
                onClick={() => scrollTo('contacts')}>
                <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-3 group-hover:border-[#FF6B2B]/40 transition-colors">
                  <Icon name="Plus" size={20} className="text-white/30 group-hover:text-[#FF6B2B]/60 transition-colors" />
                </div>
                <p className="text-sm text-white/30 group-hover:text-white/50 transition-colors">Ваш товар здесь?<br />Напишите нам</p>
              </div>
            </FadeInCard>
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" className="py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            tag="Услуги"
            title={<>Полный цикл <span style={{ color: '#FF6B2B' }}>работ</span></>}
            subtitle="От приёмки до отгрузки — всё под одной крышей"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {services.map((svc, i) => (
              <FadeInCard key={svc.title} delay={i * 0.08}>
                <div className="p-6 rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.04] to-transparent hover:from-white/[0.06] hover:border-[#FF6B2B]/25 transition-all duration-300 group h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: 'rgba(255,107,43,0.1)', border: '1px solid rgba(255,107,43,0.2)' }}>
                      <Icon name={svc.icon} size={20} className="text-[#FF6B2B]" />
                    </div>
                    <div>
                      <h3 className="font-oswald text-base font-semibold mb-2 tracking-wide">{svc.title}</h3>
                      <p className="text-sm text-white/40 leading-relaxed">{svc.desc}</p>
                    </div>
                  </div>
                </div>
              </FadeInCard>
            ))}
          </div>

          <FadeInCard delay={0.1}>
            <div className="p-8 rounded-2xl border border-[#00E5FF]/20 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.05), rgba(0,229,255,0.02))' }}>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl -mr-20 -mt-20"
                style={{ background: '#00E5FF' }} />
              <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.25)' }}>
                  <Icon name="Wifi" size={26} className="text-[#00E5FF]" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-oswald text-xl font-semibold tracking-wide">API-синхронизация в реальном времени</h3>
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: 'rgba(0,229,255,0.15)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.2)' }}>LIVE</span>
                  </div>
                  <p className="text-sm text-white/45">Двусторонняя синхронизация остатков, заказов и статусов с Wildberries, Ozon и Яндекс.Маркет. Обновление каждые 60 секунд. Нулевые расхождения в данных.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {['WB', 'Ozon', 'ЯМ'].map((mp) => (
                    <div key={mp} className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                      style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.15)', color: '#00E5FF' }}>
                      {mp}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeInCard>
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <section className="py-28 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <SectionHeader
            tag="Процесс"
            title={<>Как это <span style={{ color: '#FF6B2B' }}>работает</span></>}
            subtitle="Прозрачный процесс от первого звонка до прибыли на счёте"
          />
          <div className="relative space-y-4">
            <div className="absolute left-[27px] top-0 bottom-0 w-px"
              style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,107,43,0.3) 10%, rgba(255,107,43,0.3) 90%, transparent)' }} />
            {steps.map((step, i) => (
              <FadeInCard key={step.num} delay={i * 0.1}>
                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center font-oswald font-bold text-sm shrink-0 z-10"
                    style={{ background: 'linear-gradient(135deg, #FF6B2B, #FF3D00)', boxShadow: '0 0 20px rgba(255,107,43,0.35)' }}>
                    {step.num}
                  </div>
                  <div className="flex-1 pb-2 pt-3">
                    <h3 className="font-oswald text-xl font-semibold mb-1 tracking-wide">{step.title}</h3>
                    <p className="text-sm text-white/45 leading-relaxed">{step.desc}</p>
                  </div>
                  {i === steps.length - 1 && (
                    <div className="shrink-0 self-center hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-[#39FF14]/25 bg-[#39FF14]/8 text-sm font-medium" style={{ color: '#39FF14' }}>
                      <Icon name="TrendingUp" size={14} />
                      Прибыль
                    </div>
                  )}
                </div>
              </FadeInCard>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl border border-white/8 overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, rgba(255,107,43,0.08), rgba(15,15,26,0.95) 50%, rgba(0,229,255,0.04))' }}>
            <div className="absolute top-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #FF6B2B, transparent)' }} />
            <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full blur-3xl opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #00E5FF, transparent)' }} />
            <div className="relative grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/8">
              {stats.map((stat) => (
                <div key={stat.label} className="p-8 md:p-12 text-center">
                  <div className="font-oswald text-4xl md:text-5xl font-bold mb-2" style={{ color: '#FF6B2B' }}>
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-white/35 uppercase tracking-widest font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT / FEDERAL ===== */}
      <section id="about" className="py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <FadeInCard>
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF6B2B]/30 bg-[#FF6B2B]/10 mb-6">
                  <Icon name="Globe" size={14} className="text-[#FF6B2B]" />
                  <span className="text-sm text-[#FF6B2B] font-medium uppercase tracking-widest">Федеральная сеть</span>
                </div>
                <h2 className="font-oswald text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-wide">
                  ПОЛКА+ —<br />
                  <span style={{ background: 'linear-gradient(135deg, #FF6B2B, #FFB347)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    БУДУЩАЯ ФЕДЕРАЛЬНАЯ
                  </span><br />
                  СЕТЬ
                </h2>
                <p className="text-white/55 text-lg leading-relaxed mb-5">
                  Мы строим не просто склад — мы создаём инфраструктуру нового поколения для российских продавцов на маркетплейсах.
                </p>
                <p className="text-white/35 leading-relaxed mb-8">
                  Каждый клиент получает технологического партнёра с полной цифровой интеграцией — от первых 100 до 100 000 отправок в месяц.
                </p>
                <div className="flex flex-wrap gap-3">
                  {[['Москва', true], ['Санкт-Петербург', false], ['Казань', false], ['Новосибирск', false], ['Екатеринбург', false]].map(([city, active]) => (
                    <div key={city as string} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm">
                      <div className={`w-2 h-2 rounded-full ${active ? 'bg-[#FF6B2B]' : 'bg-white/15'}`} />
                      <span className={active ? 'text-white/80' : 'text-white/30'}>{city as string}</span>
                      {!active && <span className="text-[9px] text-white/20 uppercase tracking-wider">скоро</span>}
                    </div>
                  ))}
                </div>
              </div>
            </FadeInCard>

            <FadeInCard delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: 'TrendingUp', label: 'Рост 300%', sub: 'средний рост выручки клиентов за год' },
                  { icon: 'Network', label: '5 городов', sub: 'планируем к 2027 году' },
                  { icon: 'Clock', label: '24/7', sub: 'поддержка и операции' },
                  { icon: 'Award', label: 'ТОП-10', sub: 'КГТ-фулфилмент в России' },
                ].map((item) => (
                  <div key={item.label} className="p-6 rounded-2xl border border-white/8 bg-white/[0.03] hover:border-[#FF6B2B]/25 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: 'rgba(255,107,43,0.1)', border: '1px solid rgba(255,107,43,0.15)' }}>
                      <Icon name={item.icon} size={18} className="text-[#FF6B2B]" />
                    </div>
                    <div className="font-oswald text-xl font-bold mb-1">{item.label}</div>
                    <div className="text-xs text-white/35 leading-relaxed">{item.sub}</div>
                  </div>
                ))}
              </div>
            </FadeInCard>
          </div>
        </div>
      </section>

      {/* ===== BLOG ===== */}
      <section className="py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            tag="Блог и новости"
            title={<>Экспертиза <span style={{ color: '#FF6B2B' }}>в деталях</span></>}
            subtitle="Актуальные материалы о фулфилменте, маркетплейсах и росте бизнеса"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {blogPosts.map((post, i) => (
              <FadeInCard key={post.title} delay={i * 0.1}>
                <div className="p-6 rounded-2xl border border-white/8 bg-white/[0.03] hover:border-[#FF6B2B]/25 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer group h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-lg text-xs font-medium"
                      style={{ background: 'rgba(255,107,43,0.12)', color: '#FF6B2B', border: '1px solid rgba(255,107,43,0.2)' }}>
                      {post.tag}
                    </span>
                    <span className="text-xs text-white/25">{post.date}</span>
                  </div>
                  <h3 className="font-oswald text-base font-semibold mb-3 leading-snug tracking-wide group-hover:text-[#FF6B2B] transition-colors duration-200">
                    {post.title}
                  </h3>
                  <p className="text-sm text-white/35 leading-relaxed flex-1">{post.desc}</p>
                  <div className="flex items-center gap-1.5 mt-5 text-xs text-[#FF6B2B]/50 group-hover:text-[#FF6B2B] transition-colors duration-200 font-medium">
                    Читать далее <Icon name="ArrowRight" size={12} />
                  </div>
                </div>
              </FadeInCard>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BIG CTA ===== */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeInCard>
            <div className="relative rounded-3xl border border-[#FF6B2B]/20 overflow-hidden text-center py-20 px-6"
              style={{ background: 'linear-gradient(135deg, rgba(255,107,43,0.1), rgba(255,61,0,0.05), rgba(15,15,26,0.85))' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #FF6B2B, transparent)' }} />
              <div className="relative">
                <h2 className="font-oswald text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-wide">
                  ГОТОВЫ МАСШТАБИРОВАТЬ<br />
                  <span style={{ background: 'linear-gradient(135deg, #FF6B2B, #FFB347)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    ВАШ БИЗНЕС?
                  </span>
                </h2>
                <p className="text-xl text-white/45 mb-10 max-w-md mx-auto">
                  Оставьте заявку — менеджер свяжется в течение 15 минут
                </p>
                <button onClick={() => scrollTo('contacts')}
                  className="px-12 py-5 rounded-2xl text-lg font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #FF6B2B, #FF3D00)', boxShadow: '0 0 60px rgba(255,107,43,0.5)' }}>
                  Оставить заявку
                </button>
              </div>
            </div>
          </FadeInCard>
        </div>
      </section>

      {/* ===== CONTACTS ===== */}
      <section id="contacts" className="py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            tag="Контакты"
            title={<>Свяжитесь <span style={{ color: '#FF6B2B' }}>с нами</span></>}
            subtitle="Работаем 24/7. Ответим быстро."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FadeInCard>
              <div className="p-8 rounded-2xl border border-white/8 bg-white/[0.03]">
                <h3 className="font-oswald text-2xl font-semibold mb-6 tracking-wide">Оставить заявку</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-white/35 uppercase tracking-widest mb-2 block">Ваше имя</label>
                    <input type="text" placeholder="Иван Иванов"
                      className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#FF6B2B]/50 transition-colors duration-200" />
                  </div>
                  <div>
                    <label className="text-xs text-white/35 uppercase tracking-widest mb-2 block">Телефон</label>
                    <input type="tel" placeholder="+7 (900) 000-00-00"
                      className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#FF6B2B]/50 transition-colors duration-200" />
                  </div>
                  <div>
                    <label className="text-xs text-white/35 uppercase tracking-widest mb-2 block">Тип товара</label>
                    <select className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-[#0F0F1A] text-white/65 text-sm focus:outline-none focus:border-[#FF6B2B]/50 transition-colors duration-200">
                      <option>Мебель и КГТ</option>
                      <option>Двери</option>
                      <option>Кабельная продукция</option>
                      <option>Спорттовары</option>
                      <option>Другое</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/35 uppercase tracking-widest mb-2 block">Комментарий</label>
                    <textarea rows={3} placeholder="Расскажите о вашем товаре и объёмах..."
                      className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#FF6B2B]/50 transition-colors duration-200 resize-none" />
                  </div>
                  <button className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-95 mt-2"
                    style={{ background: 'linear-gradient(135deg, #FF6B2B, #FF3D00)', boxShadow: '0 0 30px rgba(255,107,43,0.3)' }}>
                    Отправить заявку
                  </button>
                  <p className="text-xs text-white/20 text-center">Нажимая, вы соглашаетесь с политикой конфиденциальности</p>
                </div>
              </div>
            </FadeInCard>

            <FadeInCard delay={0.15}>
              <div className="space-y-4">
                {[
                  { icon: 'Phone', label: 'Телефон', value: '+7 (900) 123-45-67', sub: 'Пн–Вс, 09:00–21:00', href: 'tel:+79001234567' },
                  { icon: 'Send', label: 'Telegram', value: '@polkaplus', sub: 'Ответим в течение 15 минут', href: 'https://t.me/polkaplus' },
                  { icon: 'Mail', label: 'Email', value: 'info@polkaplus.ru', sub: 'Для документов и КП', href: 'mailto:info@polkaplus.ru' },
                  { icon: 'MapPin', label: 'Адрес', value: 'г. Москва, Складской проезд, 1', sub: 'Координаты на карте', href: '#' },
                ].map((contact) => (
                  <a key={contact.label} href={contact.href}
                    className="flex items-center gap-5 p-5 rounded-2xl border border-white/8 bg-white/[0.03] hover:border-[#FF6B2B]/25 hover:bg-white/[0.05] transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: 'rgba(255,107,43,0.1)', border: '1px solid rgba(255,107,43,0.2)' }}>
                      <Icon name={contact.icon} size={20} className="text-[#FF6B2B]" />
                    </div>
                    <div>
                      <div className="text-xs text-white/30 uppercase tracking-widest mb-0.5">{contact.label}</div>
                      <div className="font-medium text-white/85 group-hover:text-white transition-colors">{contact.value}</div>
                      <div className="text-xs text-white/30">{contact.sub}</div>
                    </div>
                  </a>
                ))}

                <div className="p-0 rounded-2xl border border-white/8 overflow-hidden h-44 relative cursor-pointer hover:border-[#FF6B2B]/25 transition-all duration-300 group">
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(12,12,24,0.9), rgba(18,18,32,0.9))' }}>
                    <div className="grid grid-cols-12 gap-0.5 opacity-15 absolute inset-2">
                      {Array.from({ length: 144 }).map((_, i) => (
                        <div key={i} className="rounded-sm h-3" style={{ background: i % 7 === 0 ? '#FF6B2B' : 'rgba(255,255,255,0.08)' }} />
                      ))}
                    </div>
                    <div className="relative text-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                        style={{ background: 'rgba(255,107,43,0.2)', border: '1px solid rgba(255,107,43,0.4)' }}>
                        <Icon name="MapPin" size={18} className="text-[#FF6B2B]" />
                      </div>
                      <p className="text-sm text-white/45 group-hover:text-white/60 transition-colors">Открыть на карте</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInCard>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF6B2B, #FF3D00)' }}>
              <Icon name="Package" size={14} className="text-white" />
            </div>
            <span className="font-oswald text-lg font-semibold tracking-wide">
              ПОЛКА<span style={{ color: '#FF6B2B' }}>+</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-6 justify-center">
            {[['Услуги', 'services'], ['Преимущества', 'advantages'], ['О компании', 'about'], ['Контакты', 'contacts']].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-sm text-white/30 hover:text-white/65 transition-colors">
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-white/18">© 2026 Полка+. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({ tag, title, subtitle }: { tag: string; title: React.ReactNode; subtitle: string }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className="mb-14 transition-all duration-700"
      style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)' }}>
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#FF6B2B]/25 bg-[#FF6B2B]/8 mb-4">
        <span className="text-xs text-[#FF6B2B] font-medium uppercase tracking-[0.15em]">{tag}</span>
      </div>
      <h2 className="font-oswald text-3xl sm:text-4xl md:text-5xl font-bold mb-3 leading-tight tracking-wide">{title}</h2>
      <p className="text-white/40 text-base md:text-lg max-w-xl leading-relaxed">{subtitle}</p>
    </div>
  );
}

function FadeInCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className="transition-all duration-700 h-full"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transitionDelay: inView ? `${delay}s` : '0s'
      }}>
      {children}
    </div>
  );
}