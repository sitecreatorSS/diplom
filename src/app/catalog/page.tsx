'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  size: string[] | null;
  colors: string[] | null;
  stock: number;
  rating?: number;
  images: { url: string; alt?: string }[];
  seller: {
    name: string;
  };
}

export default function CatalogPage() { // Renamed from Home
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить товары');
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error('Ошибка при получении товаров:', err);
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Скелетон для загрузки
  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Наши товары</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden shadow-sm">
              <Skeleton className="h-64 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  // Обработка ошибок
  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}. <button onClick={() => window.location.reload()} className="font-medium underline hover:text-red-600">Попробовать снова</button>
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Основной контент
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Наши товары</h1>
        <div className="text-sm text-gray-500">
          Показано <span className="font-medium">{products.length}</span> товаров
        </div>
      </div>
      
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <ProductCard
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                images={product.images && product.images.length > 0
                  ? product.images
                  : [{ url: '/placeholder-product.jpg', alt: 'Изображение отсутствует' }]
                }
                category={product.category}
                size={Array.isArray(product.size) ? product.size : product.size ? [product.size] : null}
                colors={Array.isArray(product.colors) ? product.colors : product.colors ? [product.colors] : null}
                stock={product.stock}
                rating={product.rating || 0}
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Товары не найдены</h3>
          <p className="mt-1 text-gray-500">Попробуйте изменить параметры поиска или фильтры.</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Обновить страницу
            </button>
          </div>
        </div>
      )}
    </main>
  );
} 