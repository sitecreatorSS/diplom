import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { query } from '@/lib/db';
import { User } from '@/types/database';

export async function GET() {
  const session = await getServerSession(authOptions) as { user?: User };

  // Проверяем, аутентифицирован ли пользователь и является ли он администратором
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Неавторизованный доступ' }, { status: 401 });
  }

  try {
    // Получаем все заявки с информацией о пользователях
    let applicationsResult;
    try {
      applicationsResult = await query(`
        SELECT 
          sa.*,
          json_build_object(
            'id', u.id,
            'name', u.name,
            'email', u.email,
            'role', u.role,
            'createdAt', u.created_at
          ) as user
        FROM seller_applications sa
        JOIN users u ON sa.user_id = u.id
        ORDER BY sa.created_at DESC
      `);
    } catch (error) {
      console.log('SellerApplication table not found, returning empty data');
      // Если таблицы заявок нет, возвращаем пустые данные
      const statsResult = await query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE role = 'SELLER') as total_sellers,
          COUNT(*) FILTER (WHERE role = 'BUYER') as total_buyers
        FROM users
      `);
      
      return NextResponse.json({
        applications: [],
        stats: statsResult.rows[0]
      });
    }

    // Получаем статистику
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'SELLER') as total_sellers,
        COUNT(*) FILTER (WHERE role = 'BUYER') as total_buyers
      FROM users
    `);

    const stats = statsResult.rows[0];

    return NextResponse.json({
      applications: applicationsResult.rows,
      stats
    });
  } catch (error) {
    console.error('Ошибка при получении заявок продавцов:', error);
    return NextResponse.json({ message: 'Ошибка сервера при получении заявок' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions) as { user?: User };

  // Проверяем, аутентифицирован ли пользователь и является ли он администратором
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Неавторизованный доступ' }, { status: 401 });
  }

  const { applicationId, status, reviewNotes } = await request.json();

  if (!applicationId || !status || (status !== 'APPROVED' && status !== 'REJECTED')) {
    return NextResponse.json({ message: 'Некорректные данные заявки' }, { status: 400 });
  }

  try {
    // Начинаем транзакцию
    await query('BEGIN');

    try {
      // Получаем заявку и пользователя
      const applicationResult = await query(
        `SELECT sa.*, u.id as user_id, u.role as user_role
         FROM seller_applications sa
         JOIN users u ON sa.user_id = u.id
         WHERE sa.id = $1`,
        [applicationId]
      );

      if (applicationResult.rows.length === 0) {
        await query('ROLLBACK');
        return NextResponse.json({ message: 'Заявка не найдена' }, { status: 404 });
      }

      const application = applicationResult.rows[0];

      // Обновляем статус заявки
      const updatedApplicationResult = await query(
        `UPDATE seller_applications
         SET 
           status = $1,
           review_notes = $2,
           reviewed_at = NOW(),
           reviewed_by = $3,
           updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [status, reviewNotes, session.user.id, applicationId]
      );

      // Если заявка одобрена, обновляем роль пользователя
      if (status === 'APPROVED') {
        await query(
          `UPDATE users
           SET role = 'SELLER', updated_at = NOW()
           WHERE id = $1`,
          [application.user_id]
        );
      }

      await query('COMMIT');

      return NextResponse.json({
        message: `Заявка ${applicationId} ${status === 'APPROVED' ? 'одобрена' : 'отклонена'}`,
        application: updatedApplicationResult.rows[0]
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Ошибка при обновлении статуса заявки:', error);
    return NextResponse.json({ message: 'Ошибка сервера при обновлении заявки' }, { status: 500 });
  }
}
