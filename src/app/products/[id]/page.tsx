'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  rating?: number;
  images: { url: string; alt?: string }[];
  seller: {
    name: string;
  };
}

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные товара');
        }
        
        const data: Product = await response.json();
        setProduct(data);
        // Set default size and color if available
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }

      } catch (err) {
        console.error('Ошибка при получении данных товара:', err);
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-full md:w-1/2 h-96" />
          <div className="w-full md:w-1/2">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/4 mb-4" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-2/3 mb-6" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32 mt-4" />
          </div>
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

  if (!product) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">Товар не найден.</div>
      </main>
    );
  }

  // Placeholder for seller/admin stock edit form (will be added later)
  const renderStockEditForm = () => {
    // TODO: Implement logic to check user role and seller ID
    const isSeller = false; // Placeholder
    const isAdmin = false; // Placeholder
    const canEditStock = isSeller || isAdmin;

    if (!canEditStock) return null; // Hide form if user cannot edit

    // TODO: Add actual form implementation
    return (
      <div className="mt-6 p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-2">Управление наличием</h3>
        <p>Здесь будет форма для редактирования количества товара на складе.</p>
        {/* Example: <input type="number" value={product.stock} onChange={...} /> */}
      </div>
    );
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
              width={600}
              height={600}
              objectFit="contain"
              className="rounded-lg shadow-sm"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg shadow-sm">
              <span className="text-gray-500">Нет изображения</span>
            </div>
          )}
          {/* Add image gallery here if needed */}
        </div>

        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 text-xl mb-4">{product.price} ₽</p>
          <p className="text-gray-700 mb-4">{product.description}</p>
          <p className="text-sm text-gray-500 mb-2">Категория: {product.category}</p>
          <p className="text-sm text-gray-500 mb-4">Продавец: {product.seller.name}</p>

          {/* Size selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">Размер:</h3>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map(size => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Color selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">Цвет:</h3>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map(color => (
                  <Button
                    key={color}
                    variant={selectedColor === color ? "default" : "outline"}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500 mb-4">В наличии: {product.stock}</p>

          <Button className="w-full md:w-auto">Добавить в корзину</Button>

          {/* Render stock edit form based on user role */}
          {renderStockEditForm()}
        </div>
      </div>

      {/* Add reviews section here later */}
    </main>
  );
} 