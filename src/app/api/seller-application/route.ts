import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Вы не авторизованы" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { sellerApplication: true }
    });

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

    if (user.sellerApplication) {
      if (user.sellerApplication.status === 'PENDING') {
        return NextResponse.json(
          { error: "Ваша заявка уже находится на рассмотрении" },
          { status: 400 }
        );
      } else if (user.sellerApplication.status === 'APPROVED') {
        return NextResponse.json(
          { error: "Ваша заявка уже была одобрена" },
          { status: 400 }
        );
      }
    }

    const { message } = await req.json();

    const application = await prisma.sellerApplication.upsert({
      where: { userId: user.id },
      update: {
        status: 'PENDING',
        message,
        updatedAt: new Date(),
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: null
      },
      create: {
        userId: user.id,
        status: 'PENDING',
        message
      }
    });

    return NextResponse.json(application);
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { sellerApplication: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      application: user.sellerApplication,
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
