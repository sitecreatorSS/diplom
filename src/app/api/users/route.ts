import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/users - получение списка пользователей
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Проверяем, что пользователь авторизован и является администратором
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Получаем всех пользователей из базы данных
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        // lastLogin: true, // Temporarily remove lastLogin
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PUT /api/users - обновление пользователя
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Проверяем, что пользователь авторизован и является администратором
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { id, name, email, role } = body;

    // Обновляем пользователя в базе данных
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        // lastLogin: true, // Temporarily remove lastLogin
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/users - удаление пользователя
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Проверяем, что пользователь авторизован и является администратором
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    // Удаляем пользователя из базы данных
    await prisma.user.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 