import { useState, useEffect } from 'react';
import {
  SiteHeader,
  HeroSection,
  AdvantagesSection,
  HelpBlock,
  ServicesSection,
  CalculatorSection,
  ProcessSection,
  StatsSection,
  AboutSection,
  ReviewsSection,
  FaqSection,
  CtaSection,
  ContactsSection,
  SiteFooter,
  TelegramPopup,
} from '@/components/sections/PageSections';

// ─── Data ─────────────────────────────────────────────────────────────────────
const advantages = [
  { icon: 'BadgeCheck',  title: 'Цены ниже рынка на 10–20%',  desc: 'Фиксируем стоимость в договоре — никаких скрытых платежей и сюрпризов' },
  { icon: 'MapPin',      title: 'Адресное хранение',            desc: 'Цифровая карта склада — каждый товар на своём месте, ни одной потери' },
  { icon: 'ShieldCheck', title: 'Гарантия приёмки 99,5%',      desc: 'Принимаем и фиксируем каждую поставку, цены закреплены в договоре' },
  { icon: 'Layers',      title: 'Качественная упаковка',        desc: 'По стандартам WB, Ozon, Яндекс.Маркет — защита на каждом этапе' },
  { icon: 'Zap',         title: 'Быстрая отгрузка',             desc: 'Отправляем на маркетплейс в течение 24 часов с момента заказа' },
  { icon: 'BarChart3',   title: 'Прозрачная отчётность',        desc: 'Личный кабинет с аналитикой, остатками и историей операций' },
];

const services = [
  { icon: 'Truck',       title: 'Приёмка товара', desc: 'Разгрузка, проверка, фото, постановка на учёт',                lego: '0% 100%' },
  { icon: 'Warehouse',   title: 'Хранение',        desc: 'Адресное хранение, климат-контроль для чувствительных товаров', lego: '50% 0%' },
  { icon: 'PackageOpen', title: 'Упаковка',        desc: 'По требованиям WB, Ozon, ЯМ. Защита при транспортировке',      lego: '0% 0%' },
  { icon: 'Tag',         title: 'Маркировка',      desc: 'Штрихкоды, честный знак, этикетки по всем стандартам',         lego: '100% 0%' },
  { icon: 'ListChecks',  title: 'Комплектация',    desc: 'Сборка заказов, подарочная упаковка, вложения',                lego: '50% 50%' },
  { icon: 'Send',        title: 'Отгрузка',        desc: 'Синхронизация с API маркетплейсов в реальном времени',         lego: '100% 100%' },
];

const steps = [
  { num: '01', title: 'Вы привозите товар',       desc: 'Или организуем доставку через партнёров' },
  { num: '02', title: 'Принимаем и размещаем',    desc: 'Цифровая приёмка, фото, адресное хранение' },
  { num: '03', title: 'Упаковываем и маркируем',  desc: 'По стандартам WB, Ozon, Яндекс.Маркет' },
  { num: '04', title: 'Отгружаем на маркетплейс', desc: 'API-синхронизация, точные сроки' },
  { num: '05', title: 'Вы получаете прибыль',     desc: 'Отслеживайте всё в личном кабинете' },
];

const stats = [
  { value: 1000, suffix: '+',   label: 'Довольных клиентов' },
  { value: 2500, suffix: 'К+',  label: 'Обработано заказов' },
  { value: 24,   suffix: '/7',  label: 'Поддержка' },
  { value: 99,   suffix: ',5%', label: 'Успешных приёмок' },
];

const faq = [
  { q: 'Как начать работать с Полка+?',                   a: 'Оставьте заявку на сайте или позвоните нам. Менеджер свяжется в течение 15 минут, обсудим объёмы, согласуем тарифы и подпишем договор. Уже на следующий день можете привозить товар.' },
  { q: 'С какими маркетплейсами вы работаете?',           a: 'Мы работаем с Wildberries, Ozon и Яндекс.Маркет. Поддерживаем API-синхронизацию в реальном времени — остатки и статусы обновляются автоматически.' },
  { q: 'Какой минимальный объём для начала работы?',      a: 'Минимального порога нет. Работаем как с небольшими партиями от 10 единиц, так и с крупными поставками на тысячи позиций.' },
  { q: 'Как рассчитывается стоимость хранения?',          a: 'Первые 3 дня хранения бесплатно. Далее: паллетоместо — 45 ₽/сутки, короб — 15 ₽/сутки. Все цены фиксируются в договоре.' },
  { q: 'Гарантируете ли вы сохранность товара?',          a: 'Да. Мы принимаем 99,5% поставок с полной фиксацией и фотоотчётом. Адресное хранение исключает потери. Материальная ответственность прописана в договоре.' },
  { q: 'Можно ли приехать на склад?',                     a: 'Конечно. Самара: ул. Братьев Корастелевых 3к2. Смоленск: Краснинское шоссе 19а. Запишитесь заранее по телефону +7 (917) 101-01-63.' },
  { q: 'Как быстро вы отгружаете товар на маркетплейс?',  a: 'Стандартная отгрузка — в течение 24 часов. Срочная отгрузка — в тот же день (наценка 30%). График поставок согласовываем заранее.' },
  { q: 'Что входит в услугу «под ключ»?',                 a: 'Приёмка, хранение, упаковка по стандартам маркетплейса, маркировка, комплектация заказов, формирование поставки и отгрузка. Вам остаётся только продавать.' },
];

const navLinks = [
  ['Услуги',       'services'],
  ['Преимущества', 'advantages'],
  ['Калькулятор',  'calculator'],
  ['О компании',   'about'],
  ['Контакты',     'contacts'],
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────
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

  return (
    <div className="min-h-screen font-golos text-gray-900 overflow-x-hidden" style={{ background: '#F4F6FA' }}>
      <SiteHeader scrollTo={scrollTo} navLinks={navLinks} scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <HeroSection scrollTo={scrollTo} />
      <AdvantagesSection advantages={advantages} />
      <HelpBlock scrollTo={scrollTo} />
      <ServicesSection services={services} />
      <CalculatorSection />
      <ProcessSection steps={steps} />
      <StatsSection stats={stats} />
      <AboutSection />
      <ReviewsSection />
      <FaqSection faq={faq} />
      <CtaSection scrollTo={scrollTo} />
      <ContactsSection />
      <SiteFooter scrollTo={scrollTo} navLinks={navLinks} />
      <TelegramPopup />
    </div>
  );
}