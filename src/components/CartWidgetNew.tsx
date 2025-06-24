'use client';

import { X, Plus, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCartContext } from '@/context/CartContext';

interface CartWidgetProps {
  onClose: () => void;
}

export default function CartWidgetNew({ onClose }: CartWidgetProps) {
  const { cart, updateQuantity, removeFromCart } = useCartContext();

  const getTotalPrice = (): number => {
    return cart.reduce((total: number, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold">Корзина</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Ваша корзина пуста
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div 
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-4 border-b pb-4"
                >
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="h-24 w-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.price.toFixed(2)} ₽
                    </p>
                    {(item.size || item.color) && (
                      <p className="text-sm text-gray-500">
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
                        className="ml-auto text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-lg font-semibold">Итого:</span>
            <span className="text-lg font-bold">{getTotalPrice().toFixed(2)} ₽</span>
          </div>
          <Link 
            href="/checkout" 
            onClick={onClose}
            className="block w-full"
          >
            <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Перейти к оформлению
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
} 