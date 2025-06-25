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
          p.id, p.name, p.description, p.price, p.seller_id, p.created_at, p.updated_at,
          u.name as seller_name
        FROM products p
        LEFT JOIN users u ON p.seller_id = u.id
        WHERE p.id = $1
      `, [productId]);
    } catch (error) {
      console.log('product_images table not found, using simple query for product', productId);
      hasImageTable = false;
      
      result = await query(`
        SELECT 
          p.*,
          u.name as seller_name
        FROM products p
        LEFT JOIN users u ON p.seller_id = u.id
        WHERE p.id = $1
      `, [productId]);
    }

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    const product = result.rows[0];
    
    // Получаем изображения для продукта, если таблица существует
    let images: { url: string; alt: string }[] = [];
    if (hasImageTable) {
      try {
        const imagesResult = await query(
          'SELECT url FROM product_images WHERE product_id = $1',
          [productId]
        );
        images = imagesResult.rows.map(img => ({ url: img.url, alt: product.name }));
      } catch (error) {
        console.log('Error fetching images for product:', error);
        images = [];
      }
    }

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
      images: images.length > 0 ? images : (product.image ? [{ url: product.image, alt: product.name }] : []),
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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;
    const body = await request.json();
    const { name, description, price, category, stock, images } = body;

    // Валидация
    if (!name || !description || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные поля' },
        { status: 400 }
      );
    }

    // Начинаем транзакцию
    await query('BEGIN');

    try {
      // Обновляем основную информацию о товаре
      const updateResult = await query(
        `UPDATE products 
         SET name = $1, description = $2, price = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [name, description, parseFloat(price), productId]
      );

      if (updateResult.rows.length === 0) {
        await query('ROLLBACK');
        return NextResponse.json(
          { error: 'Товар не найден' },
          { status: 404 }
        );
      }

      // Если переданы новые изображения, обновляем их
      if (images && images.length > 0) {
        // Удаляем старые изображения
        await query('DELETE FROM product_images WHERE product_id = $1', [productId]);
        
        // Добавляем новые изображения
        for (const image of images) {
          await query(
            'INSERT INTO product_images (product_id, url) VALUES ($1, $2)',
            [productId, image.url]
          );
        }
      }

      await query('COMMIT');

      // Возвращаем обновленный товар
      const response = await GET(request, { params });
      return response;

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении товара' },
      { status: 500 }
    );
  }
}

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