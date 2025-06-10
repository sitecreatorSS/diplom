import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">О нашей компании</h1>
          <p className="text-xl text-gray-600">Мы создаем качественную одежду для активной жизни</p>
        </div>

        {/* Основной контент */}
        <div className="space-y-16">
          {/* История компании */}
          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Наша история</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="mb-4">
                Наша компания была основана в 2020 году с целью создания качественной и доступной одежды для активного образа жизни. Мы верим, что каждый человек заслуживает иметь возможность выглядеть стильно и чувствовать себя комфортно в любой ситуации.
              </p>
              <p>
                За время работы мы выросли из небольшого ателье в полноценное производство, сохраняя при этом индивидуальный подход к каждому клиенту и внимание к деталям.
              </p>
            </div>
          </section>

          {/* Наши ценности */}
          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-8 text-gray-800">Наши ценности</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Качество</h3>
                <p className="text-gray-800">Мы используем только лучшие материалы и тщательно контролируем каждый этап производства</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Надежность</h3>
                <p className="text-gray-800">Мы ценим время наших клиентов и всегда выполняем свои обязательства</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Забота</h3>
                <p className="text-gray-800">Мы заботимся о комфорте наших клиентов и окружающей среде</p>
              </div>
            </div>
          </section>

          {/* Контакты */}
          <section className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Свяжитесь с нами</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Наши контакты</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    +7 (999) 123-45-67
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    info@example.com
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    г. Москва, ул. Примерная, 123
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Режим работы</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>Понедельник - Пятница: 9:00 - 18:00</li>
                  <li>Суббота: 10:00 - 16:00</li>
                  <li>Воскресенье: выходной</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}