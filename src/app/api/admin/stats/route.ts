import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Get user counts
    const [totalUsers, totalSellers, totalBuyers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'SELLER' } }),
      prisma.user.count({ where: { role: 'BUYER' } }),
    ]);

    // Get total active products count
    const totalProducts = await prisma.product.count();

    // Get pending seller applications count using raw query
    const pendingResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM seller_applications WHERE status = 'PENDING';
    `;
    const pendingCount = pendingResult[0] ? Number(pendingResult[0].count) : 0;

    return NextResponse.json({
      totalUsers,
      totalSellers,
      totalBuyers,
      totalProducts,
      pendingApplications: pendingCount,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке статистики' },
      { status: 500 }
    );
  }
}
