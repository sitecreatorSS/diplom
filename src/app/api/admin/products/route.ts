import { NextResponse } from 'next/server';
import { UserRole, Product } from '@/types/database';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { role } = verifyToken(token);

    if (role !== 'ADMIN') {
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