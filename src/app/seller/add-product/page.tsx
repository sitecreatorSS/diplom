'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AddProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    sizes: '', // Comma separated string for now
    colors: '', // Comma separated string for now
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if not authenticated or not a seller
  useEffect(() => {
    if (status === 'loading') return; // Wait for session loading
    if (!session || session.user.role !== 'SELLER') {
      router.push('/'); // Redirect to home or login page
    }
  }, [session, status, router]);

  if (status === 'loading' || !session || session.user.role !== 'SELLER') {
    return null; // Render nothing while redirecting or loading
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Prepare data for API
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
      colors: formData.colors.split(',').map(c => c.trim()).filter(c => c),
    };

    try {
      const response = await fetch('/api/seller/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add product');
      }

      const newProduct = await response.json();
      setSuccess('Product added successfully!');
      // Optionally redirect to seller panel or edit page
      // router.push('/seller');
      setFormData({ // Clear form
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        sizes: '',
        colors: '',
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Добавить новый товар</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Название товара</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
             {/* Replace with dynamic categories later if needed */}
            <select id="category" name="category" value={formData.category} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option value="">Выберите категорию</option>
                <option value="T-SHIRTS">Футболки</option>
                <option value="PANTS">Штаны</option>
                <option value="SHOES">Обувь</option>
                <option value="DRESSES">Платья</option>
                <option value="JACKETS">Куртки</option>
                <option value="ACCESSORIES">Аксессуары</option>
            </select>
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Цена (₽)</label>
            <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">На складе</label>
            <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} required min="0" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows={4} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>
          <div>
            <label htmlFor="sizes" className="block text-sm font-medium text-gray-700 mb-1">Размеры (через запятую)</label>
            <input type="text" id="sizes" name="sizes" value={formData.sizes} onChange={handleChange} placeholder="S, M, L, XL" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="colors" className="block text-sm font-medium text-gray-700 mb-1">Цвета (через запятую)</label>
            <input type="text" id="colors" name="colors" value={formData.colors} onChange={handleChange} placeholder="Красный, Синий, Зеленый" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:bg-gray-200 disabled:text-black disabled:opacity-100`}
        >
          {isSubmitting ? 'Добавление...' : 'Добавить товар'}
        </button>
      </form>
    </div>
  );
} 