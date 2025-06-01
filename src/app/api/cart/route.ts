import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { id: userId } = verifyToken(token);

    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
          },
        },
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Cart error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении корзины' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { id: userId } = verifyToken(token);
    const { productId, quantity, size, color } = await request.json();

    if (!productId || quantity === undefined || quantity <= 0) {
      return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
    }

    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId_size_color: {
          userId,
          productId,
          size: size || null,
          color: color || null,
        },
      },
    });

    if (existingCartItem) {
      await prisma.cartItem.update({
        where: {
          userId_productId_size_color: {
            userId,
            productId,
            size: size || null,
            color: color || null,
          },
        },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
          size: size || null,
          color: color || null,
        },
      });
    }

    return NextResponse.json({ message: 'Товар добавлен в корзину' });
  } catch (error) {
    console.error('Cart error:', error);
    return NextResponse.json(
      { error: 'Ошибка при добавлении в корзину' },
      { status: 500 }
    );
  }
} 