import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { User } from '@/types/database';

// GET /api/users - получение списка пользователей
export async function GET() {
  try {
    const session = await getServerSession(authOptions) as { user?: User };

    // Проверяем, что пользователь авторизован и является администратором
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Получаем всех пользователей из базы данных
    const result = await query(`
      SELECT 
        id,
        name,
        email,
        role,
        created_at as "createdAt"
      FROM users
      ORDER BY created_at DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PUT /api/users - обновление пользователя
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions) as { user?: User };

    // Проверяем, что пользователь авторизован и является администратором
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { id, name, email, role } = body;

    // Обновляем пользователя в базе данных
    const result = await query(`
      UPDATE users
      SET 
        name = $1,
        email = $2,
        role = $3,
        updated_at = NOW()
      WHERE id = $4
      RETURNING 
        id,
        name,
        email,
        role,
        created_at as "createdAt"
    `, [name, email, role, id]);

    if (result.rows.length === 0) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/users - удаление пользователя
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions) as { user?: User };

    // Проверяем, что пользователь авторизован и является администратором
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    // Удаляем пользователя из базы данных
    await query('DELETE FROM users WHERE id = $1', [id]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 