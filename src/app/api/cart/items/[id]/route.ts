import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
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

    const { userId } = verifyToken(token);
    const { quantity } = await request.json();

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!cartItem || cartItem.userId !== userId) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id: params.id },
      });
      return NextResponse.json({ message: 'Товар удален из корзины' });
    }

    await prisma.cartItem.update({
      where: { id: params.id },
      data: { quantity },
    });

    return NextResponse.json({ message: 'Количество обновлено' });
  } catch (error) {
    console.error('Cart item update error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении товара' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { userId } = verifyToken(token);

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!cartItem || cartItem.userId !== userId) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Товар удален из корзины' });
  } catch (error) {
    console.error('Cart item delete error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении товара' },
      { status: 500 }
    );
  }
} 