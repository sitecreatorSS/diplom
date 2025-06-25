import { NextResponse } from 'next/server';
import { UserRole, Product } from '@/types/database';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { User } from '@/types/database';

export async function GET() {
  try {
    // Проверяем сессию пользователя
    const session = await getServerSession(authOptions) as { user?: User };
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Недостаточно прав' },
        { status: 403 }
      );
    }

    const result = await query<Product & { seller_name: string }>(
      `SELECT 
         p.*, 
         u.name as seller_name
       FROM products p
       JOIN users u ON p.seller_id = u.id
       ORDER BY p.created_at DESC`
    );
    const products = result.rows.map(row => ({
      ...row,
      seller: { name: row.seller_name },
    }));
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при получении товаров' },
      { status: 500 }
    );
  }
}