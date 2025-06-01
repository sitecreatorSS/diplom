import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">
            Магазин одежды
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/cart" className="text-gray-600 hover:text-gray-900">
              Корзина
            </Link>
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
              Войти
            </Link>
            <Link
              href="/auth/register"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Регистрация
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 