'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: { url: string; alt?: string }[];
  category: string;
  stock: number;
  seller: {
    id: string;
    name: string;
  };
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    newImageFile: null as File | null,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    if (status === 'authenticated') {
      fetchProduct();
    }
  }, [status, productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error('Ошибка при загрузке товара');
      
      const data = await response.json();
      setProduct(data);
      setFormData({
        name: data.name,
        description: data.description,
        price: data.price.toString(),
        category: data.category,
        stock: data.stock.toString(),
        newImageFile: null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, newImageFile: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUpdating(true);

    try {
      let newImageUrl = '';
      
      // Загружаем новое изображение если выбрано
      if (formData.newImageFile) {
        const imgData = new FormData();
        imgData.append('file', formData.newImageFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: imgData,
        });
        if (!uploadRes.ok) throw new Error('Ошибка загрузки изображения');
        const uploadJson = await uploadRes.json();
        newImageUrl = uploadJson.url;
      }

      // Подготавливаем данные для обновления
      const updateData: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
      };

      // Добавляем новое изображение если есть
      if (newImageUrl) {
        updateData.images = [{ url: newImageUrl }];
      }

      // Отправляем обновление (используем PUT метод к API products)
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error('Ошибка при обновлении товара');

      // Перенаправляем обратно к управлению товарами
      router.push('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Товар не найден</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            ← Назад
          </button>
          <h1 className="text-3xl font-bold">Редактировать товар</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Цена (₽)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Категория
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                В наличии (шт)
              </label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Текущее изображение
              </label>
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-32 h-32 object-cover rounded mb-2"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center mb-2">
                  <span className="text-gray-500">Нет изображения</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Новое изображение (необязательно)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Оставьте пустым, чтобы сохранить текущее изображение
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Продавец
              </label>
              <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                {product.seller.name}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={updating}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {updating ? 'Обновление...' : 'Обновить товар'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
