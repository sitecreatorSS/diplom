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
    const stored = localStorage.getItem(CART_KEY);
    if (stored) setCart(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
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