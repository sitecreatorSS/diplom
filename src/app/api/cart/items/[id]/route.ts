import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { id: userId } = verifyToken(token);
    const { quantity } = await request.json();

    const cartItemResult = await query<{
      id: string;
      userId: string;
      quantity: number;
    }>(
      `SELECT id, "userId", quantity FROM "CartItem" WHERE id = $1`,
      [params.id]
    );
    const cartItem = cartItemResult.rows[0];

    if (!cartItem || cartItem.userId !== userId) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    if (quantity <= 0) {
      await query(
        `DELETE FROM "CartItem" WHERE id = $1`,
        [params.id]
      );
      return NextResponse.json({ message: 'Товар удален из корзины' });
    }

    await query(
      `UPDATE "CartItem" SET quantity = $1, updated_at = NOW() WHERE id = $2`,
      [quantity, params.id]
    );

    return NextResponse.json({ message: 'Количество обновлено' });
  } catch (error) {
    console.error('Cart item update error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении товара' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { id: userId } = verifyToken(token);

    const cartItemResult = await query<{
      id: string;
      userId: string;
    }>(
      `SELECT id, "userId" FROM "CartItem" WHERE id = $1`,
      [params.id]
    );
    const cartItem = cartItemResult.rows[0];

    if (!cartItem || cartItem.userId !== userId) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    await query(
      `DELETE FROM "CartItem" WHERE id = $1`,
      [params.id]
    );

    return NextResponse.json({ message: 'Товар удален из корзины' });
  } catch (error) {
    console.error('Cart item delete error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении товара' },
      { status: 500 }
    );
  }
} 