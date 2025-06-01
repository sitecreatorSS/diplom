import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">О нас</h3>
            <p className="text-gray-400">
              Лучший магазин одежды с широким ассортиментом товаров по доступным ценам.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Быстрые ссылки</h3>
            <ul className="space-y-2">
              <li><Link href="/catalog" className="text-gray-400 hover:text-white">Каталог</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white">О нас</Link></li>
              <li><Link href="/delivery" className="text-gray-400 hover:text-white">Доставка</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Контакты</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: info@example.com</li>
              <li>Телефон: +7 (123) 456-78-90</li>
              <li>Адрес: г. Москва, ул. Примерная, д. 123</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Магазин одежды. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
