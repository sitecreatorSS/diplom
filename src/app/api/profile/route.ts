import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { findUserByEmail } from "@/lib/repositories/user.repository";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Вы не авторизованы" },
        { status: 401 }
      );
    }

    // Получаем пользователя по email
    const user = await findUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Удаляем хеш пароля из ответа
    const { password, ...userWithoutPassword } = user;

    // TODO: Добавить загрузку sellerApplication, количества заказов и продуктов
    // когда будут реализованы соответствующие репозитории
    const userWithStats = {
      ...userWithoutPassword,
      _count: {
        orders: 0,
        products: 0,
      },
      sellerApplication: null,
    };

    return NextResponse.json(userWithStats);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: "Произошла ошибка при получении профиля" },
      { status: 500 }
    );
  }
}
