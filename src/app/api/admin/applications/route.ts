import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { SellerApplication, User } from '@/types/database';
// import { prisma } from '@/lib/prisma'; // Удалено

export async function GET() {
  const session = await getServerSession(authOptions) as { user?: User };

  // Проверяем, аутентифицирован ли пользователь и является ли он администратором
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Неавторизованный доступ' }, { status: 401 });
  }

  try {
    const result = await query<SellerApplication & { user_name: string; user_email: string }>(
      `SELECT 
         sa.*,
         u.name as user_name,
         u.email as user_email
       FROM "SellerApplication" sa
       JOIN users u ON sa."userId" = u.id
       ORDER BY sa.created_at DESC`
    );

    const applications = result.rows.map(row => ({
      ...row,
      user: {
        id: row.userId,
        name: row.user_name,
        email: row.user_email,
      },
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
    }));

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Ошибка при получении заявок продавцов:', error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
} 