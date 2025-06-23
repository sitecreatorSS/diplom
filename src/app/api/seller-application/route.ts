import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { query } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Вы не авторизованы" },
        { status: 401 }
      );
    }

    // Получаем пользователя
    const userResult = await query(
      'SELECT * FROM users WHERE email = $1',
      [session.user.email]
    );
    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    if (user.role === 'SELLER') {
      return NextResponse.json(
        { error: "Вы уже являетесь продавцом" },
        { status: 400 }
      );
    }

    // Проверяем существующую заявку
    const existingApplicationResult = await query(
      'SELECT * FROM "SellerApplication" WHERE user_id = $1',
      [user.id]
    );
    const existingApplication = existingApplicationResult.rows[0];

    if (existingApplication) {
      if (existingApplication.status === 'PENDING') {
        return NextResponse.json(
          { error: "Ваша заявка уже находится на рассмотрении" },
          { status: 400 }
        );
      } else if (existingApplication.status === 'APPROVED') {
        return NextResponse.json(
          { error: "Ваша заявка уже была одобрена" },
          { status: 400 }
        );
      }
    }

    const { message } = await req.json();

    // Создаем или обновляем заявку
    const applicationResult = await query(
      `INSERT INTO "SellerApplication" (
        user_id, status, message, created_at, updated_at
      ) VALUES ($1, 'PENDING', $2, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        status = 'PENDING',
        message = $2,
        updated_at = NOW(),
        reviewed_by = NULL,
        reviewed_at = NULL,
        review_notes = NULL
      RETURNING *`,
      [user.id, message]
    );

    return NextResponse.json(applicationResult.rows[0]);
  } catch (error) {
    console.error('Error submitting seller application:', error);
    return NextResponse.json(
      { error: "Произошла ошибка при отправке заявки" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Вы не авторизованы" },
        { status: 401 }
      );
    }

    // Получаем пользователя и его заявку
    const result = await query(
      `SELECT 
        u.*,
        sa.*
      FROM users u
      LEFT JOIN "SellerApplication" sa ON u.id = sa.user_id
      WHERE u.email = $1`,
      [session.user.email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    const user = result.rows[0];
    const application = user.user_id ? {
      id: user.id,
      userId: user.user_id,
      status: user.status,
      message: user.message,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      reviewedBy: user.reviewed_by,
      reviewedAt: user.reviewed_at,
      reviewNotes: user.review_notes
    } : null;

    return NextResponse.json({
      application,
      role: user.role
    });
  } catch (error) {
    console.error('Error fetching seller application:', error);
    return NextResponse.json(
      { error: "Произошла ошибка при получении данных о заявке" },
      { status: 500 }
    );
  }
}
