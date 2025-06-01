import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  // Проверяем, аутентифицирован ли пользователь и является ли он администратором
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Неавторизованный доступ' }, { status: 401 });
  }

  try {
    const applications = await prisma.sellerApplication.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Возможно, также полезно вернуть общую статистику для админ панели
    const totalUsers = await prisma.user.count();
    const totalSellers = await prisma.user.count({ where: { role: 'SELLER' } });
    const totalBuyers = await prisma.user.count({ where: { role: 'BUYER' } });

    const stats = {
      totalUsers,
      totalSellers,
      totalBuyers,
    };

    return NextResponse.json({ applications, stats });
  } catch (error) {
    console.error('Ошибка при получении заявок продавцов:', error);
    return NextResponse.json({ message: 'Ошибка сервера при получении заявок' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Проверяем, аутентифицирован ли пользователь и является ли он администратором
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Неавторизованный доступ' }, { status: 401 });
  }

  const { applicationId, status, reviewNotes } = await request.json();

  if (!applicationId || !status || (status !== 'APPROVED' && status !== 'REJECTED')) {
    return NextResponse.json({ message: 'Некорректные данные заявки' }, { status: 400 });
  }

  try {
    const application = await prisma.sellerApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      return NextResponse.json({ message: 'Заявка не найдена' }, { status: 404 });
    }

    // Обновляем статус заявки
    const updatedApplication = await prisma.sellerApplication.update({
      where: { id: applicationId },
      data: {
        status,
        reviewNotes,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
      include: {
        user: true,
      }
    });

    // Если заявка одобрена, обновляем роль пользователя на SELLER
    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: 'SELLER' }
      });
    } else if (status === 'REJECTED') {
      // Если заявка отклонена, убедимся, что роль пользователя не SELLER (если вдруг была) и не ADMIN
      // На данный момент мы не меняем роль обратно на BUYER при отклонении, если она уже была SELLER или ADMIN.
      // Если нужно сбрасывать роль на BUYER при отклонении, добавьте здесь логику:
      /*
      if (application.user.role === 'PENDING_SELLER') { // Если у вас есть такой промежуточный статус
        await prisma.user.update({
          where: { id: application.userId },
          data: {
            role: 'BUYER',
          },
        });
      }
      */
      // TODO: Возможно, отправить email пользователю об отклонении
    }

    // Возвращаем только статус обновления и обновленную заявку (без stats)
    return NextResponse.json({ message: `Заявка ${applicationId} ${status === 'APPROVED' ? 'одобрена' : 'отклонена'}`, application: updatedApplication });
  } catch (error) {
    console.error('Ошибка при обновлении статуса заявки:', error);
    return NextResponse.json({ message: 'Ошибка сервера при обновлении заявки' }, { status: 500 });
  }
}
