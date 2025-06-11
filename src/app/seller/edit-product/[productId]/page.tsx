'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface Session {
  user: {
    id: string;
    role: 'ADMIN' | 'SELLER' | 'BUYER';
  };
}

interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  sizes: string; // Stored as JSON string in DB, but form uses string
  colors: string; // Stored as JSON string in DB, but form uses string
  images: { id: string; url: string; alt: string; order: number }[];
}

// Define a type for form data, where numeric fields are strings initially
interface ProductFormData {
  id?: string;
  name: string;
  description: string;
  price: string; // String in form
  stock: string; // String in form
  category: string;
  sizes: string; // Comma separated string in form
  colors: string; // Comma separated string in form
  images: string; // Comma separated URLs in form
}

export default function EditProductPage() {
  const { data: session, status } = useSession() as { data: Session | null; status: string; };
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  // Use the new form data type
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    sizes: '',
    colors: '',
    images: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null); // Error for fetching initial data

  // Redirect if not authenticated or not a seller
  useEffect(() => {
    if (status === 'loading') return; // Wait for session loading
    if (!session || !session.user || session.user.role !== 'SELLER') {
      router.push('/'); // Redirect to home or login page
    }
  }, [session, status, router]);

  // Fetch product data
  useEffect(() => {
    if (!productId || !session || !session.user || session.user.role !== 'SELLER') return; // Only fetch if we have product ID and seller session

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/seller/products?id=${productId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch product');
        }

        const product: ProductData = await response.json();
        // Populate form data, converting array fields back to comma-separated strings
        setFormData({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price.toString(), // Convert number to string for form
          stock: product.stock.toString(), // Convert number to string for form
          category: product.category,
          sizes: product.sizes, // Keep as string from DB if already string, or join if array
          colors: product.colors, // Keep as string from DB if already string, or join if array
          images: product.images.map(img => img.url).join(','), // Join image URLs into a string
        });

      } catch (err: any) {
        setFetchError(err.message);
        setError(err.message); // Also set general error
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, session]); // Depend on productId and session

  // Show loading, error states, or redirecting state
  if (status === 'loading' || isLoading || !session || !session.user || session.user.role !== 'SELLER') {
    return (
       <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (fetchError) {
     return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {fetchError}</span>
        </div>
      </div>
    );
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

     if (!formData.id) { // Ensure product ID is available for update
         setError('Product ID is missing.');
         setIsSubmitting(false);
         return;
     }

    // Prepare data for API, converting string fields back to correct types
    const productData = {
      id: formData.id,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      category: formData.category,
      sizes: typeof formData.sizes === 'string' ? formData.sizes.split(',').map(s => s.trim()).filter(s => s) : formData.sizes || [],
      colors: typeof formData.colors === 'string' ? formData.colors.split(',').map(c => c.trim()).filter(c => c) : formData.colors || [],
      images: (formData.images as string)
                .split(',')
                .map((url: string) => ({ url: url.trim(), alt: '' }))
                .filter((img: { url: string, alt: string }) => img.url),
    };

    // Basic validation before sending to API (optional, but good practice)
    if (!productData.name || !productData.description || isNaN(productData.price) || isNaN(productData.stock) || !productData.category) {
         setError('Please fill in all required fields correctly.');
         setIsSubmitting(false);
         return;
    }

    try {
      const response = await fetch('/api/seller/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }

      const updatedProduct = await response.json();
      setSuccess('Product updated successfully!');
      // Optionally redirect back to seller panel
      // router.push('/seller');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Редактировать товар</h1>
      
      {error && !fetchError && ( // Show submit error only if no fetch error
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && ( // Show success message
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Product ID (hidden) */}
          <input type="hidden" name="id" value={formData.id} />

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Название товара</label>
            <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
             {/* Replace with dynamic categories later if needed */}
            <select id="category" name="category" value={formData.category || ''} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500">
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
            <input type="number" id="price" name="price" value={formData.price || ''} onChange={handleChange} required min="0" step="0.01" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">На складе</label>
            <input type="number" id="stock" name="stock" value={formData.stock || ''} onChange={handleChange} required min="0" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
           <div className="md:col-span-2">\n            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Описание</label>\n            <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} required rows={4} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>\n          </div>
          <div>
            <label htmlFor="sizes" className="block text-sm font-medium text-gray-700 mb-1">Размеры (через запятую)</label>
            <input type="text" id="sizes" name="sizes" value={formData.sizes || ''} onChange={handleChange} placeholder="S, M, L, XL" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="colors" className="block text-sm font-medium text-gray-700 mb-1">Цвета (через запятую)</label>
            <input type="text" id="colors" name="colors" value={formData.colors || ''} onChange={handleChange} placeholder="Красный, Синий, Зеленый" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">URL изображений (через запятую)</label>
            <input 
              type="text" 
              id="images" 
              name="images" 
              value={formData.images} 
              onChange={handleChange} 
              placeholder="/images/product-1.jpg, /images/product-2.jpg" 
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        </div>
        
        <Button
          type="submit"
          disabled={isSubmitting}
          variant="default"
          size="default"
          className="w-full font-semibold"
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>
      </form>
    </div>
  );
} 