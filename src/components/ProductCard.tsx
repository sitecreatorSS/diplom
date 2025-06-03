'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ProductImageSlider } from './ProductImageSlider';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  images: { url: string; alt?: string }[];
  category: string;
  size?: string | string[] | null;
  colors?: string | string[] | null;
  stock: number;
  rating?: number;
  className?: string;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  size: string | null;
  color: string | null;
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  images = [],
  category,
  size,
  colors,
  stock,
  rating = 0,
  className,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];

      const itemToAdd: CartItem = {
        productId: id,
        name: name,
        price: price,
        imageUrl: images.length > 0 ? images[0].url : '/placeholder.jpg',
        quantity: 1,
        size: Array.isArray(size) && size.length > 0 ? size[0] : null,
        color: Array.isArray(colors) && colors.length > 0 ? colors[0] : null,
      };

      const existingItemIndex = currentCart.findIndex(
        (item) => 
          item.productId === itemToAdd.productId &&
          item.size === itemToAdd.size &&
          item.color === itemToAdd.color
      );

      if (existingItemIndex > -1) {
        currentCart[existingItemIndex].quantity += 1;
      } else {
        currentCart.push(itemToAdd);
      }

      localStorage.setItem('cart', JSON.stringify(currentCart));

      const button = e.currentTarget as HTMLButtonElement;
      button.classList.add('bg-green-500');
      setTimeout(() => {
        button.classList.remove('bg-green-500');
      }, 1000);

    } catch (error) {
      console.error('Ошибка при работе с корзиной:', error);
      alert('Не удалось добавить товар в корзину');
    }
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlist(!isWishlist);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderRatingStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ));
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out bg-white hover:bg-blue-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
        transition={{ duration: 0.3 }}
        className={cn('h-full flex flex-col', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-64 w-full overflow-hidden">
          <Link href={`/products/${id}`} className="block h-full">
            <ProductImageSlider images={images} />
          </Link>
          
          <div className="absolute top-3 left-3 z-10">
            {stock < 10 && stock > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Осталось мало!
              </span>
            )}
            {stock === 0 && (
              <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Нет в наличии
              </span>
            )}
          </div>

          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-3 left-0 right-0 flex justify-center gap-3 px-3"
              >
                <button
                  onClick={addToCart}
                  className="bg-white hover:bg-gray-50 text-gray-800 p-2 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200"
                  aria-label="Добавить в корзину"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleWishlist}
                  className={`p-2 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200 ${
                    isWishlist 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-white text-gray-800 hover:bg-gray-50'
                  }`}
                  aria-label={isWishlist ? 'Удалить из избранного' : 'Добавить в избранное'}
                >
                  <Heart 
                    className={`w-5 h-5 ${isWishlist ? 'fill-current' : ''}`} 
                    strokeWidth={isWishlist ? 2 : 1.5}
                  />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 mb-1">{name}</h3>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{description}</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {Array.isArray(size) && size.length > 0 && (
                <div className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {size[0]}
                  {size.length > 1 && ` +${size.length - 1}`}
                </div>
              )}
              {Array.isArray(colors) && colors.length > 0 && (
                <div className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {colors[0]}
                  {colors.length > 1 && ` +${colors.length - 1}`}
                </div>
              )}
            </div>

            <div className="mt-auto">
              <p className="text-xl font-bold text-gray-900">{formatPrice(price)}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}