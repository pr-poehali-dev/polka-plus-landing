import { Link } from 'react-router-dom';
import { WB, WB_DARK, WB_LIGHT } from '@/components/shared/ui-helpers';
import Icon from '@/components/ui/icon';

const branches = [
  {
    city: 'Самара',
    address: 'ул. Братьев Корастелевых, 3к2',
    phone: '+7 (917) 101-01-63',
    desc: 'Основной склад. Полный цикл фулфилмента для продавцов Wildberries, Ozon и Яндекс.Маркет. Приёмка, хранение, упаковка, маркировка и отгрузка.',
    services: ['Приёмка товара', 'Хранение', 'Упаковка и маркировка', 'Работа с КГТ', 'Отгрузка на маркетплейсы'],
    href: '/samara',
    icon: 'Warehouse',
  },
  {
    city: 'Смоленск',
    address: 'Краснинское шоссе, 19а',
    phone: '+7 (917) 101-01-63',
    desc: 'Склад в центре России. Удобное расположение для поставщиков из Москвы и центральных регионов. Все услуги фулфилмента полного цикла.',
    services: ['Приёмка товара', 'Хранение', 'Упаковка и маркировка', 'Комплектация заказов', 'Отгрузка на маркетплейсы'],
    href: '/smolensk',
    icon: 'Building2',
  },
];

export default function Filialy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <img
              src="https://cdn.poehali.dev/projects/48d0f348-e369-40e0-b696-33913aa2ef26/bucket/5f2ba43f-9fb6-48a8-9b35-29ca379aebfb.jpg"
              alt="Полка+"
              className="h-14 w-auto object-contain drop-shadow-sm"
            />
          </Link>
          <a
            href="tel:+79171010163"
            className="flex items-center gap-2 text-base font-bold text-gray-700 hover:text-gray-900 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: WB_LIGHT }}>
              <Icon name="Phone" size={15} style={{ color: WB }} />
            </div>
            +7 (917) 101-01-63
          </a>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-900 transition-colors font-medium">Главная</Link>
          <Icon name="ChevronRight" size={14} />
          <span className="text-gray-900 font-semibold">Филиалы</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4"
            style={{ background: WB_LIGHT, color: WB }}
          >
            <Icon name="MapPin" size={15} />
            Федеральная сеть складов
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Филиалы <span style={{ color: WB }}>Полка+</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Работаем в двух городах России. Выберите ближайший склад — обработаем товар и отгрузим на маркетплейс за 24 часа.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {branches.map((b) => (
            <div key={b.city} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
              <div className="p-2" style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})` }}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon name={b.icon} size={20} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{b.city}</h2>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-2 mb-3 text-gray-700">
                  <Icon name="MapPin" size={16} className="mt-0.5 shrink-0" style={{ color: WB }} />
                  <span className="font-medium">{b.address}</span>
                </div>
                <div className="flex items-center gap-2 mb-4 text-gray-700">
                  <Icon name="Phone" size={16} className="shrink-0" style={{ color: WB }} />
                  <a href={`tel:${b.phone.replace(/\D/g, '')}`} className="font-medium hover:text-gray-900">{b.phone}</a>
                </div>

                <p className="text-gray-600 text-sm mb-5 leading-relaxed">{b.desc}</p>

                <ul className="space-y-2 mb-6">
                  {b.services.map((s) => (
                    <li key={s} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: WB_LIGHT }}>
                        <Icon name="Check" size={11} style={{ color: WB }} />
                      </div>
                      {s}
                    </li>
                  ))}
                </ul>

                <Link
                  to={b.href}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-bold text-base transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95"
                  style={{ background: `linear-gradient(135deg, ${WB}, ${WB_DARK})`, boxShadow: `0 4px 16px rgba(203,17,171,0.25)` }}
                >
                  Подробнее о складе в {b.city === 'Самара' ? 'Самаре' : 'Смоленске'}
                  <Icon name="ArrowRight" size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Schema.org */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Филиалы Полка+",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@type": "LocalBusiness",
              "name": "Полка+ Самара",
              "url": "https://xn----7sbacbxlj4bggbck0d.xn--p1ai/samara",
              "address": { "@type": "PostalAddress", "streetAddress": "ул. Братьев Корастелевых 3к2", "addressLocality": "Самара", "addressCountry": "RU" },
              "telephone": "+79171010163"
            }
          },
          {
            "@type": "ListItem",
            "position": 2,
            "item": {
              "@type": "LocalBusiness",
              "name": "Полка+ Смоленск",
              "url": "https://xn----7sbacbxlj4bggbck0d.xn--p1ai/smolensk",
              "address": { "@type": "PostalAddress", "streetAddress": "Краснинское шоссе 19а", "addressLocality": "Смоленск", "addressCountry": "RU" },
              "telephone": "+79171010163"
            }
          }
        ]
      })}} />

      {/* Footer */}
      <footer className="mt-16 py-8 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>© 2024 Полка+ Фулфилмент</span>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-gray-900 transition-colors">Главная</Link>
            <span style={{ color: WB }} className="font-semibold">Филиалы</span>
            <a href="https://t.me/Polka_plus" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">Telegram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}