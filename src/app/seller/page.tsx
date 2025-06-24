'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { CustomSession } from '@/app/providers';

interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: { url: string }[];
}

export default function SellerPanelPage() {
  const { data: session, status } = useSession() as { data: CustomSession | null, status: string };
  const router = useRouter();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load

    // Redirect if user is not logged in or not a seller
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'SELLER')) {
      router.push('/'); // Redirect to home or login page
      return;
    }

    const fetchProducts = async () => {
      try {
        // API endpoint to get seller's products (will create this next)
        const response = await fetch(`/api/seller/products`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError('Error fetching products');
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [session, status, router]);

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/seller/products?id=${productId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete product');
        }

        // Remove product from the list on the client
        setProducts(products.filter(product => product.id !== productId));
      } catch (err) {
        setError('Error deleting product');
        console.error('Error deleting product:', err);
      }
    }
  };

  // Show loading or error states
  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-destructive px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  // Check access rights again after loading
   if (!session || session.user.role !== 'SELLER') {
     return null; // Redirect already happened in useEffect
   }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-8">Seller Panel - My Products</h1>
        <Link href="/seller/add-product">
          <button className="flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Product
          </button>
        </Link>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {products.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            You haven&apos;t added any products yet.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={product.images[0]?.url || '/placeholder.jpg'} alt={product.name} className="h-10 w-10 object-cover rounded" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {product.price.toFixed(2)} ₽
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/seller/edit-product/${product.id}`} className="text-primary hover:text-primary/80 mr-4">
                       <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 