'use client';

import { X, Plus, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCartContext } from '@/context/CartContext';

interface CartWidgetProps {
  onClose: () => void;
}

export default function CartWidget({ onClose }: CartWidgetProps) {
  const { cart, updateQuantity, removeFromCart } = useCartContext();

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      // Дополнительная проверка на NaN
      if (isNaN(price)) {
        console.warn('Некорректная цена товара:', item);
        return total;
      }
      return total + (price * item.quantity);
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="relative w-full md:w-96 bg-white shadow-xl flex flex-col overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white px-4 py-3 border-b flex justify-between items-center z-10">
          <h2 className="text-lg font-semibold text-foreground">Корзина</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 px-4 py-6">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground">Ваша корзина пуста</div>
          ) : (
            <ul className="space-y-4">
              {cart.map((item) => (
                <li 
                  key={`${item.productId}-${item.size}-${item.color}`} 
                  className="flex gap-4 border-b pb-4 last:border-b-0 last:pb-0"
                >
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="h-20 w-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {(() => {
                        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                        return isNaN(price) ? '0.00' : price.toFixed(2);
                      })()} ₽
                    </p>
                    {(item.size || item.color) && (
                      <p className="text-sm text-muted-foreground">
                        {item.size && `Размер: ${item.size}`}
                        {item.size && item.color && ', '}
                        {item.color && `Цвет: ${item.color}`}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                        className="rounded border p-1 hover:bg-gray-100"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                        className="rounded border p-1 hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productId, item.size, item.color)}
                        className="ml-auto text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer / Checkout */}
        <div className="sticky bottom-0 bg-white px-4 py-3 border-t shadow-lg z-10">
           <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-foreground">Итого:</span>
              <span className="text-lg font-bold text-foreground">{getTotalPrice().toFixed(2)} ₽</span>
           </div>
           <Link href="/checkout" onClick={onClose} className="w-full">
              <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md text-lg font-semibold hover:bg-primary/90 transition-colors">
                 Перейти к оформлению
              </button>
           </Link>
        </div>

      </div>
    </div>
  );
} 