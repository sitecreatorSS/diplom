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
       FROM "Product" p
       JOIN "User" u ON p."sellerId" = u.id
       ORDER BY p.created_at DESC`
    );
    const products = result.rows.map(row => ({
      ...row,
      seller: { name: row.seller_name },
      created_at: new Date(row.created_at), 
      updated_at: new Date(row.updated_at), 
      specifications: typeof row.specifications === 'string' ? JSON.parse(row.specifications) : row.specifications
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении товаров' },
      { status: 500 }
    );
  }
} 