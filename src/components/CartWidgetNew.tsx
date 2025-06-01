'use client';

import { useEffect, useState } from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  size: string | null;
  color: string | null;
}

interface CartWidgetProps {
  onClose: () => void;
}

export default function CartWidgetNew({ onClose }: CartWidgetProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    console.log('CartWidgetNew: Mount effect running');
    const storedCart = localStorage.getItem('cart');
    console.log('CartWidgetNew: Loaded from localStorage', storedCart);
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      console.log('CartWidgetNew: Parsed cart data', parsedCart);
      setCartItems(parsedCart);
    }
     console.log('CartWidgetNew: Mount effect finished, current items state (may be delayed):', cartItems);
  }, []);

  useEffect(() => {
    console.log('CartWidgetNew: cartItems state changed', cartItems);
    localStorage.setItem('cart', JSON.stringify(cartItems));
     console.log('CartWidgetNew: Saved to localStorage', JSON.stringify(cartItems));
  }, [cartItems]);

  const updateQuantity = (productId: string, size: string | null, color: string | null, delta: number) => {
    console.log('CartWidgetNew: Calling updateQuantity', { productId, size, color, delta });
    setCartItems(currentItems =>
      currentItems.map(item => {
        if (item.productId === productId && item.size === size && item.color === color) {
          const newQuantity = item.quantity + delta;
          console.log('CartWidgetNew: Updating quantity for item', { item, newQuantity });
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (productId: string, size: string | null, color: string | null) => {
    console.log('CartWidgetNew: Calling removeItem', { productId, size, color });
    setCartItems(currentItems =>
      currentItems.filter(
        item => !(item.productId === productId && item.size === size && item.color === color)
      )
    );
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
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
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Ваша корзина пуста
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
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
                        onClick={() => updateQuantity(item.productId, item.size, item.color, -1)}
                        className="rounded border p-1 hover:bg-gray-100"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.color, 1)}
                        className="rounded border p-1 hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.productId, item.size, item.color)}
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