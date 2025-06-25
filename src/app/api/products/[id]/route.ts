import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Update the type to correctly reflect the included relations and parsed fields
type ProductWithDetails = {
  id: string;
  name: string;
  price: number;
  sizes: string[]; // Expecting parsed JSON array
  colors: string[]; // Expecting parsed JSON array
};

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;

    // Получаем товар из базы данных, с изображениями если таблица существует
    let result;
    let hasImageTable = true;
    
    try {
      // Пробуем запрос с изображениями
      await query('SELECT 1 FROM product_images LIMIT 1');
      
      result = await query(`
        SELECT 
          p.*,
          u.name as seller_name,
          COALESCE(
            json_agg(
              json_build_object('url', pi.url, 'alt', p.name)
            ) FILTER (WHERE pi.id IS NOT NULL), 
            '[]'
          ) AS images
        FROM products p
        LEFT JOIN "User" u ON p.seller_id = u.id OR p."sellerId" = u.id
        LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE p.id = $1
        GROUP BY p.id, p.name, p.description, p.price, p.seller_id, p.created_at, p.updated_at, u.name
      `, [productId]);
    } catch (error) {
      console.log('product_images table not found, using simple query for product', productId);
      hasImageTable = false;
      
      result = await query(`
        SELECT 
          p.*,
          u.name as seller_name
        FROM products p
        LEFT JOIN "User" u ON p.seller_id = u.id OR p."sellerId" = u.id
        WHERE p.id = $1
      `, [productId]);
    }

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    const product = result.rows[0];

    // Приводим цену к числу и парсим JSON поля
    const productWithParsedFields = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      category: 'Общее', // Пока используем статическую категорию, так как в простой схеме нет поля category
      sizes: ['S', 'M', 'L', 'XL'], // Статические размеры пока
      colors: ['Красный', 'Синий', 'Зеленый'], // Статические цвета пока
      stock: Math.floor(Math.random() * 50) + 1, // Статический stock пока
      rating: Math.floor(Math.random() * 1.5 + 3.5 * 10) / 10, // Случайный рейтинг от 3.5 до 5
      images: product.images || (product.image ? [{ url: product.image, alt: product.name }] : []),
      seller: {
        name: product.seller_name || 'Неизвестный продавец',
      },
    };

    return NextResponse.json(productWithParsedFields);
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении данных товара' },
      { status: 500 }
    );
  }
}

// Add or update POST function for updating stock later
// export async function POST(request: Request, { params }: { params: { id: string } }) { /* ... */ }

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;
    // Дополнительная проверка прав (например, только админ может удалять)
    // const session = await getServerSession(authOptions);
    // if (session?.user?.role !== 'ADMIN') {
    //   return NextResponse.json({ message: 'У вас нет прав для этого действия' }, { status: 403 });
    // }

    await query('DELETE FROM products WHERE id = $1', [productId]);

    return NextResponse.json({ message: 'Товар успешно удален' });
  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json({ error: 'Ошибка при удалении товара' }, { status: 500 });
  }
} 