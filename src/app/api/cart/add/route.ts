import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { productId, quantity, size, color } = body;

    if (!productId || quantity === undefined || quantity <= 0) {
        return new NextResponse('Invalid request payload', { status: 400 });
    }

    // Find if the product already exists in the user's cart with the same size and color
    const existingCartItem = await prisma.cartItem.findUnique({
        where: {
            userId_productId_size_color: { // Используем правильный формат составного уникального ключа
                userId: userId,
                productId: productId,
                size: size || null,
                color: color || null,
            }
        },
    });

    let cartItem;
    if (existingCartItem) {
        // Если товар с таким же размером и цветом уже есть в корзине, обновляем количество
        cartItem = await prisma.cartItem.update({
            where: {
                 userId_productId_size_color: { // Используем правильный формат составного уникального ключа
                    userId: userId,
                    productId: productId,
                    size: size || null,
                    color: color || null,
                }
            },
            data: {
                quantity: existingCartItem.quantity + quantity,
            },
        });
    } else {
        // Если нет, создаем новый элемент корзины
        cartItem = await prisma.cartItem.create({
            data: {
                userId: userId,
                productId: productId,
                quantity: quantity,
                size: size || null,
                color: color || null,
            },
        });
    }

    return NextResponse.json(cartItem, { status: 200 });

  } catch (error: any) {
    console.error('Error adding item to cart:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}

 