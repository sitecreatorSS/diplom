import { NextResponse } from 'next/server';
import { UserRole } from '@/types/database';
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

    const result = await query<{
      id: string;
      name: string;
      email: string;
      role: UserRole;
      created_at: Date;
    }>(
      `SELECT id, name, email, role, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    const users = result.rows;

    return NextResponse.json(users);
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении пользователей' },
      { status: 500 }
    );
  }
} 