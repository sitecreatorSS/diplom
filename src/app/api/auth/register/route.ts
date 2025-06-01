import { NextResponse } from 'next/server';
import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

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
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Пользователь с таким email уже зарегистрирован',
          field: 'email'
        },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await hash(password, 10);
    
    // Создаем пользователя с ролью BUYER по умолчанию
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: UserRole.BUYER, // Используем BUYER как роль по умолчанию
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Возвращаем успешный ответ без чувствительных данных
    return NextResponse.json(
      { 
        success: true,
        message: 'Пользователь успешно зарегистрирован',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    // Более детальная обработка ошибок
    let errorMessage = 'Произошла ошибка при регистрации';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Обработка ошибок Prisma
      if (error.message.includes('prisma') || error.message.includes('database')) {
        errorMessage = 'Ошибка базы данных';
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: statusCode }
    );
  } finally {
    await prisma.$disconnect();
  }
}