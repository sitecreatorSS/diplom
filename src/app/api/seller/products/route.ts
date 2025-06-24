import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { User } from '@/types/database';

// Helper function to check if the user is a seller
async function isSeller(session: any) {
  return session?.user.role === 'SELLER';
}

// GET /api/seller/products - Get products for the logged-in seller
export async function GET() {
  try {
    const session = await getServerSession(authOptions) as { user?: User };

    // Check if user is authenticated and is a seller
    if (!session?.user || session.user.role !== 'SELLER') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const sellerId = session.user.id;

    // Получаем товары продавца с изображениями
    const result = await query(`
      SELECT 
        p.*,
        json_agg(
          json_build_object(
            'id', pi.id,
            'url', pi.url,
            'alt', pi.alt_text,
            'order', pi."order"
          ) ORDER BY pi."order"
        ) as images
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.seller_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `, [sellerId]);

    // Преобразуем JSON строки в объекты
    const products = result.rows.map(product => ({
      ...product,
      images: product.images[0] === null ? [] : product.images,
      sizes: JSON.parse(product.sizes || '[]'),
      colors: JSON.parse(product.colors || '[]')
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching seller products:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST /api/seller/products - Add a new product
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as { user?: User };
    if (!session?.user || session.user.role !== 'SELLER') {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const sellerId = session.user.id;
    const body = await request.json();
    const { name, description, price, stock, category, sizes, colors, images } = body;

    // Basic validation
    if (!name || !description || price === undefined || stock === undefined || !category || !sizes || !colors || !images) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Начинаем транзакцию
    await query('BEGIN');

    try {
      // Создаем товар
      const productResult = await query(
        `INSERT INTO products (
          name, description, price, stock, category, 
          sizes, colors, seller_id, rating, num_reviews,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 0, NOW(), NOW())
        RETURNING *`,
        [
          name,
          description,
          parseFloat(price),
          parseInt(stock, 10),
          category,
          JSON.stringify(sizes),
          JSON.stringify(colors),
          sellerId
        ]
      );

      const product = productResult.rows[0];

      // Добавляем изображения
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        await query(
          `INSERT INTO product_images (
            product_id, url, alt_text, "order", created_at, updated_at
          ) VALUES ($1, $2, $3, $4, NOW(), NOW())`,
          [
            product.id,
            image.url,
            image.alt || `${name} image ${i + 1}`,
            i
          ]
        );
      }

      // Получаем созданный товар со всеми изображениями
      const finalResult = await query(
        `SELECT 
          p.*,
          json_agg(
            json_build_object(
              'id', pi.id,
              'url', pi.url,
              'alt', pi.alt_text,
              'order', pi."order"
            ) ORDER BY pi."order"
          ) as images
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE p.id = $1
        GROUP BY p.id`,
        [product.id]
      );

      await query('COMMIT');

      const finalProduct = finalResult.rows[0];
      finalProduct.images = finalProduct.images[0] === null ? [] : finalProduct.images;
      finalProduct.sizes = JSON.parse(finalProduct.sizes || '[]');
      finalProduct.colors = JSON.parse(finalProduct.colors || '[]');

      return NextResponse.json(finalProduct, { status: 201 });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error adding product:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PUT /api/seller/products - Update an existing product
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions) as { user?: User };
    if (!session?.user || session.user.role !== 'SELLER') {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const sellerId = session.user.id;
    const body = await request.json();
    const { id, name, description, price, stock, category, sizes, colors, images } = body;

    if (!id || !name || !description || price === undefined || stock === undefined || !category || !sizes || !colors || !images) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Verify the product belongs to the seller
    const existingProductResult = await query(
      'SELECT id FROM products WHERE id = $1 AND seller_id = $2',
      [id, sellerId]
    );

    if (existingProductResult.rows.length === 0) {
      return new NextResponse('Product not found or does not belong to this seller', { status: 404 });
    }

    // Начинаем транзакцию
    await query('BEGIN');

    try {
      // Обновляем товар
      const productResult = await query(
        `UPDATE products
        SET 
          name = $1,
          description = $2,
          price = $3,
          stock = $4,
          category = $5,
          sizes = $6,
          colors = $7,
          updated_at = NOW()
        WHERE id = $8
        RETURNING *`,
        [
          name,
          description,
          parseFloat(price),
          parseInt(stock, 10),
          category,
          JSON.stringify(sizes),
          JSON.stringify(colors),
          id
        ]
      );

      // Удаляем старые изображения
      await query('DELETE FROM product_images WHERE product_id = $1', [id]);

      // Добавляем новые изображения
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        await query(
          `INSERT INTO product_images (
            product_id, url, alt_text, "order", created_at, updated_at
          ) VALUES ($1, $2, $3, $4, NOW(), NOW())`,
          [
            id,
            image.url,
            image.alt || `${name} image ${i + 1}`,
            i
          ]
        );
      }

      // Получаем обновленный товар со всеми изображениями
      const finalResult = await query(
        `SELECT 
          p.*,
          json_agg(
            json_build_object(
              'id', pi.id,
              'url', pi.url,
              'alt', pi.alt_text,
              'order', pi."order"
            ) ORDER BY pi."order"
          ) as images
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE p.id = $1
        GROUP BY p.id`,
        [id]
      );

      await query('COMMIT');

      const finalProduct = finalResult.rows[0];
      finalProduct.images = finalProduct.images[0] === null ? [] : finalProduct.images;
      finalProduct.sizes = JSON.parse(finalProduct.sizes || '[]');
      finalProduct.colors = JSON.parse(finalProduct.colors || '[]');

      return NextResponse.json(finalProduct);
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating product:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/seller/products - Delete a product
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions) as { user?: User };
    if (!session?.user || session.user.role !== 'SELLER') {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const sellerId = session.user.id;
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return new NextResponse('Product ID is required', { status: 400 });
    }

    // Verify the product belongs to the seller
    const existingProductResult = await query(
      'SELECT id FROM products WHERE id = $1 AND seller_id = $2',
      [productId, sellerId]
    );

    if (existingProductResult.rows.length === 0) {
      return new NextResponse('Product not found or does not belong to this seller', { status: 404 });
    }

    // Начинаем транзакцию
    await query('BEGIN');

    try {
      // Удаляем изображения товара
      await query('DELETE FROM product_images WHERE product_id = $1', [productId]);

      // Удаляем товар
      await query('DELETE FROM products WHERE id = $1', [productId]);

      await query('COMMIT');

      return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
} 