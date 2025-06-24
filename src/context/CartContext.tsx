"use client";

import React, { createContext, useContext } from 'react';
import { useCart, CartItem } from '@/hooks/useCart';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size?: string | null, color?: string | null) => void;
  updateQuantity: (productId: string, size: string | null, color: string | null, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cartHook = useCart();
  return (
    <CartContext.Provider value={cartHook}>
      {children}
    </CartContext.Provider>
  );
};

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
} 