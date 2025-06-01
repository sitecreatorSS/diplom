import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
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
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'SELLER') as total_sellers,
        COUNT(*) FILTER (WHERE role = 'BUYER') as total_buyers,
        (SELECT COUNT(*) FROM "Product") as total_products,
        (SELECT COUNT(*) FROM "SellerApplication" WHERE status = 'PENDING') as pending_applications
      FROM "User"
    `);

    const stats = statsResult.rows[0];

    return NextResponse.json({
      totalUsers: parseInt(stats.total_users),
      totalSellers: parseInt(stats.total_sellers),
      totalBuyers: parseInt(stats.total_buyers),
      totalProducts: parseInt(stats.total_products),
      pendingApplications: parseInt(stats.pending_applications)
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке статистики' },
      { status: 500 }
    );
  }
}
