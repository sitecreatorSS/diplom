import { NextResponse } from 'next/server';
import { PrismaClient, UserRole } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

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

    if (role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Недостаточно прав' },
        { status: 403 }
      );
    }

    const { role: newRole } = await request.json();

    if (!Object.values(UserRole).includes(newRole as UserRole)) {
      return NextResponse.json(
        { error: 'Недопустимая роль' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role: newRole as UserRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('User role update error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении роли' },
      { status: 500 }
    );
  }
} 