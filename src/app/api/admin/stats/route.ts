import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { User } from '@/types/database';

export async function GET() {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions) as { user?: User };
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Получаем статистику одним запросом
    let statsResult;
    try {
      // Пробуем с таблицей orders
      statsResult = await query(`
        SELECT
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM products) as total_products,
          (SELECT COUNT(*) FROM orders) as total_orders,
          (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'DELIVERED') as total_revenue
      `);
    } catch (error) {
      console.log('Orders table not found, using fallback stats');
      // Fallback если таблицы заказов нет
      statsResult = await query(`
        SELECT
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM products) as total_products,
          0 as total_orders,
          0 as total_revenue
      `);
    }

    const stats = statsResult.rows[0];

    return NextResponse.json({
      totalUsers: parseInt(stats.total_users),
      totalProducts: parseInt(stats.total_products),
      totalOrders: parseInt(stats.total_orders),
      totalRevenue: parseFloat(stats.total_revenue)
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке статистики' },
      { status: 500 }
    );
  }
}
