'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useCartContext } from '@/context/CartContext';

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
  const { cart, removeFromCart, clearCart } = useCartContext();

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Ваша корзина пуста</h1>
        <p className="text-muted-foreground mb-6">Добавьте товары, чтобы они здесь появились.</p>
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
        {cart.map((item) => (
          <div key={item.productId} className="flex items-center border-b pb-4">
            <div className="flex-shrink-0 mr-4">
              <img src={item.image} alt={item.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
            </div>
            <div className="flex-grow">
              <Link href={`/products/${item.productId}`} className="text-lg font-semibold hover:underline">
                {item.name}
              </Link>
              <p className="text-foreground">{item.price} ₽</p>
            </div>
            <div className="flex items-center">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => {
                  const qty = parseInt(e.target.value);
                  if (qty > 0) {
                    removeFromCart(item.productId);
                    // addToCart с новым количеством
                    // (можно реализовать через useCart, если нужно)
                  }
                }}
                className="w-16 border rounded-md text-center mr-4"
              />
              <Button variant="outline" size="sm" onClick={() => removeFromCart(item.productId)}>
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-right">
        <h2 className="text-xl font-bold">Итого: {totalAmount} ₽</h2>
        <Button className="mt-4" onClick={clearCart}>Очистить корзину</Button>
      </div>
    </main>
  );
} 