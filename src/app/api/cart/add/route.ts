import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { productId, quantity, size, color } = body;

    if (!productId || quantity === undefined || quantity <= 0) {
      return new NextResponse('Invalid request payload', { status: 400 });
    }

    // Получаем цену товара
    const productResult = await query(
      'SELECT price FROM "Product" WHERE id = $1',
      [productId]
    );

    if (productResult.rows.length === 0) {
      return new NextResponse('Product not found', { status: 404 });
    }

    const price = productResult.rows[0].price;

    // Проверяем существующий товар в корзине
    const existingItemResult = await query(
      `SELECT * FROM "CartItem" 
       WHERE user_id = $1 
       AND product_id = $2 
       AND (size = $3 OR (size IS NULL AND $3 IS NULL))
       AND (color = $4 OR (color IS NULL AND $4 IS NULL))`,
      [userId, productId, size || null, color || null]
    );

    let cartItem;
    if (existingItemResult.rows.length > 0) {
      // Обновляем количество существующего товара
      const result = await query(
        `UPDATE "CartItem"
         SET 
           quantity = quantity + $1,
           updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [quantity, existingItemResult.rows[0].id]
      );
      cartItem = result.rows[0];
    } else {
      // Создаем новый товар в корзине
      const result = await query(
        `INSERT INTO "CartItem" (
          user_id, product_id, quantity, size, color, 
          price_at_addition, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *`,
        [userId, productId, quantity, size || null, color || null, price]
      );
      cartItem = result.rows[0];
    }

    return NextResponse.json(cartItem, { status: 200 });
  } catch (error: any) {
    console.error('Error adding item to cart:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}

 