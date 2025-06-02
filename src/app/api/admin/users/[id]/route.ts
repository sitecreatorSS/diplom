import { NextResponse } from 'next/server';
import { UserRole } from '@/types/database';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

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

    const { role } = verifyToken(token);

    if (role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Недостаточно прав' },
        { status: 403 }
      );
    }

    const { role: newRole } = await request.json();

    const allowedRoles: UserRole[] = ['ADMIN', 'SELLER', 'BUYER'];
    if (!allowedRoles.includes(newRole)) {
      return NextResponse.json(
        { error: 'Недопустимая роль' },
        { status: 400 }
      );
    }

    const result = await query<{
      id: string;
      name: string;
      email: string;
      role: UserRole;
    }>(
      `UPDATE "User" 
       SET role = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, name, email, role`,
      [newRole, params.id]
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('User role update error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении роли' },
      { status: 500 }
    );
  }
} 