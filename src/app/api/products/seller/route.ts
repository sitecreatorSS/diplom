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

    const { id: userId, role } = verifyToken(token);

    if (role !== 'SELLER' && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Недостаточно прав' },
        { status: 403 }
      );
    }

    const result = await query<Product>(
      `SELECT * 
       FROM products 
       WHERE seller_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    const products = result.rows.map(row => ({
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      specifications: typeof row.specifications === 'string' ? JSON.parse(row.specifications) : row.specifications
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error('Seller products fetch error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении товаров' },
      { status: 500 }
    );
  }
} 