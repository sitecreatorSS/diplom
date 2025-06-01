import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// import { prisma } from '@/lib/prisma'; // Удалено

export async function GET() {
  const session = await getServerSession(authOptions);

  // Проверяем, аутентифицирован ли пользователь и является ли он администратором
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Неавторизованный доступ' }, { status: 401 });
  }

  try {
    // TODO: Заменить все обращения к prisma на SQL-запросы через pg
    const applications = await prisma.sellerApplication.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Ошибка при получении заявок продавцов:', error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
} 