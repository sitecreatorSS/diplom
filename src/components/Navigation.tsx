import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
            <Link href="/auth/register" passHref>
              <Button variant="default">
                Регистрация
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 