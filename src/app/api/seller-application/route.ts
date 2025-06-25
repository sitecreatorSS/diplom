import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { query } from '@/lib/db';
import { User } from '@/types/database';

// POST - подача заявки на продавца
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as { user?: User };

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    // Проверяем, что пользователь имеет роль BUYER
    if (session.user.role !== 'BUYER') {
      return NextResponse.json(
        { error: 'Только покупатели могут подавать заявки на продавца' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      companyName, 
      companyDescription, 
      businessType, 
      taxId, 
      website, 
      phone, 
      address 
    } = body;

    // Валидация обязательных полей
    if (!companyName || !companyDescription || !phone) {
      return NextResponse.json(
        { error: 'Заполните все обязательные поля' },
        { status: 400 }
      );
    }

    // Проверяем, нет ли уже активной заявки от этого пользователя
    const existingApplicationResult = await query(
      'SELECT id, status FROM seller_applications WHERE user_id = $1',
      [session.user.id]
    );

    if (existingApplicationResult.rows.length > 0) {
      const existingApplication = existingApplicationResult.rows[0];
      if (existingApplication.status === 'PENDING') {
        return NextResponse.json(
          { error: 'У вас уже есть активная заявка на рассмотрении' },
          { status: 400 }
        );
      }
      if (existingApplication.status === 'APPROVED') {
        return NextResponse.json(
          { error: 'Ваша заявка уже одобрена' },
          { status: 400 }
        );
      }
    }

    // Создаем новую заявку
    const applicationResult = await query(
      `INSERT INTO seller_applications (
        user_id, 
        company_name, 
        company_description, 
        business_type, 
        tax_id, 
        website, 
        phone, 
        address,
        status,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING', NOW(), NOW())
      RETURNING *`,
      [
        session.user.id,
        companyName,
        companyDescription,
        businessType,
        taxId,
        website,
        phone,
        address
      ]
    );

    return NextResponse.json({
      message: 'Заявка успешно подана',
      application: applicationResult.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating seller application:', error);
    return NextResponse.json(
      { error: 'Ошибка при подаче заявки' },
      { status: 500 }
    );
  }
}

// GET - получение статуса заявки текущего пользователя
export async function GET() {
  try {
    const session = await getServerSession(authOptions) as { user?: User };

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    // Получаем заявку пользователя
    const applicationResult = await query(
      `SELECT sa.*, 
        CASE 
          WHEN sa.reviewed_by IS NOT NULL THEN 
            (SELECT name FROM users WHERE id = sa.reviewed_by)
          ELSE NULL 
        END as reviewer_name
      FROM seller_applications sa 
      WHERE sa.user_id = $1
      ORDER BY sa.created_at DESC
      LIMIT 1`,
      [session.user.id]
    );

    if (applicationResult.rows.length === 0) {
      return NextResponse.json({ application: null });
    }

    return NextResponse.json({
      application: applicationResult.rows[0]
    });

  } catch (error) {
    console.error('Error fetching seller application:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении заявки' },
      { status: 500 }
    );
  }
}
