'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  size: string | null;
  color: string | null;
  product: { // Assuming product details are included
    id: string;
    name: string;
    price: number;
    imageUrl: string; // Assuming imageUrl is available
  };
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setIsLoading(true);
        // Replace with your actual API endpoint for fetching cart data
        const response = await fetch('/api/cart'); 
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить корзину');
        }
        
        const data = await response.json();
        // Assuming the API returns an object with an 'items' array
        setCartItems(data.items || []); 

      } catch (err) {
        console.error('Ошибка при получении корзины:', err);
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    // TODO: Implement API call to update item quantity
    console.log(`Update item ${itemId} quantity to ${newQuantity}`);
    // After successful API call, refetch cart or update state
  };

  const handleRemoveItem = (itemId: string) => {
    // TODO: Implement API call to remove item
    console.log(`Remove item ${itemId}`);
    // After successful API call, refetch cart or update state
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" /> Загрузка корзины...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-red-500">Ошибка: {error}</div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Ваша корзина пуста</h1>
        <p className="text-gray-600 mb-6">Добавьте товары, чтобы они здесь появились.</p>
        <Link href="/">
          <Button>Перейти к покупкам</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Ваша корзина</h1>
      <div className="grid gap-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center border-b pb-4">
            <div className="flex-shrink-0 mr-4">
              <Image
                src={item.product.imageUrl || '/placeholder-product.jpg'}
                alt={item.product.name}
                width={80}
                height={80}
                objectFit="cover"
                className="rounded-md"
              />
            </div>
            <div className="flex-grow">
              <Link href={`/products/${item.productId}`} className="text-lg font-semibold hover:underline">
                {item.product.name}
              </Link>
              {(item.size || item.color) && (
                <p className="text-sm text-gray-600">
                  {item.size && `Размер: ${item.size}`}
                  {item.size && item.color && ', '}
                  {item.color && `Цвет: ${item.color}`}
                </p>
              )}
              <p className="text-gray-800">{item.product.price} ₽</p>
            </div>
            <div className="flex items-center">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                className="w-16 border rounded-md text-center mr-4"
              />
              <Button variant="outline" size="sm" onClick={() => handleRemoveItem(item.id)}>
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-right">
        <h2 className="text-xl font-bold">Итого: {totalAmount} ₽</h2>
        {/* TODO: Add checkout button */}
        <Button className="mt-4">Перейти к оформлению</Button>
      </div>
    </main>
  );
} 