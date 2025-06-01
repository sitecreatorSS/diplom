import { NextResponse } from 'next/server';
import { verifyPassword, generateToken } from '@/lib/auth';
import { findUserByEmail } from '@/lib/repositories/user.repository';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Неверный пароль' },
        { status: 401 }
      );
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'SELLER' | 'BUYER'
    });

    return NextResponse.json({
      message: 'Успешный вход',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Ошибка при входе' },
      { status: 500 }
    );
  }
}