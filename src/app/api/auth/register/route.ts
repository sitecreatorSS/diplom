import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { findUserByEmail, createUser } from '@/lib/repositories/user.repository';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Простая валидация
    if (!name || !email || !password) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Все поля обязательны для заполнения',
          field: !name ? 'name' : !email ? 'email' : 'password'
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Пароль должен содержать минимум 6 символов',
          field: 'password'
        },
        { status: 400 }
      );
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Введите корректный email',
          field: 'email'
        },
        { status: 400 }
      );
    }

    // Проверяем, существует ли пользователь с таким email
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Пользователь с таким email уже существует',
          field: 'email'
        },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await hash(password, 12);

    // Создаем нового пользователя
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role: 'BUYER', // По умолчанию регистрируем как покупателя
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        success: true, 
        message: 'Регистрация прошла успешно',
        user: userWithoutPassword
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Ошибка при регистрации' 
      },
      { status: 500 }
    );
  }
}