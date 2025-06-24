import { useState, useEffect } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  size: string | null;
  color: string | null;
}

const CART_KEY = 'shop_cart';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) {
        const parsedCart = JSON.parse(stored);
        // Проверяем что данные валидны
        if (Array.isArray(parsedCart)) {
          // Фильтруем и валидируем каждый элемент корзины
          const validCartItems = parsedCart
            .filter(item => 
              item && 
              typeof item === 'object' &&
              typeof item.productId === 'string' &&
              typeof item.name === 'string' &&
              (typeof item.price === 'number' || typeof item.price === 'string') &&
              typeof item.imageUrl === 'string' &&
              typeof item.quantity === 'number' &&
              item.quantity > 0
            )
            .map(item => ({
              ...item,
              // Убеждаемся, что price всегда число
              price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
            }))
            .filter(item => !isNaN(item.price)); // Исключаем элементы с некорректной ценой
          setCart(validCartItems);
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке корзины из localStorage:', error);
      // Очищаем поврежденные данные
      localStorage.removeItem(CART_KEY);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Ошибка при сохранении корзины в localStorage:', error);
    }
  }, [cart]);

  function addToCart(item: CartItem) {
    setCart(prev => {
      const existing = prev.find(i => 
        i.productId === item.productId && 
        i.size === item.size && 
        i.color === item.color
      );
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId && 
          i.size === item.size && 
          i.color === item.color
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  }

  function removeFromCart(productId: string, size?: string | null, color?: string | null) {
    setCart(prev => prev.filter(i => 
      !(i.productId === productId && 
        (size === undefined || i.size === size) && 
        (color === undefined || i.color === color))
    ));
  }

  function updateQuantity(productId: string, size: string | null, color: string | null, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    
    setCart(prev => prev.map(i =>
      i.productId === productId && i.size === size && i.color === color
        ? { ...i, quantity }
        : i
    ));
  }

  function clearCart() {
    setCart([]);
  }

  return { cart, addToCart, removeFromCart, updateQuantity, clearCart };
} 