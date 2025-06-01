import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Update the type to correctly reflect the included relations and parsed fields
type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    seller: { select: { name: true } };
    images: { select: { url: true; alt: true; }; orderBy: { order: 'asc'; }; };
  };
}> & {
  sizes: string[]; // Expecting parsed JSON array
  colors: string[]; // Expecting parsed JSON array
};

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: {
            name: true,
          },
        },
        images: {
          select: {
            url: true,
            alt: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    // Parse JSON fields for sizes and colors and ensure correct type
    const productWithParsedFields: ProductWithDetails = {
      ...(product as any), // Cast to any to allow accessing sizes/colors before parsing
      sizes: product.sizes ? JSON.parse(product.sizes) : [],
      colors: product.colors ? JSON.parse(product.colors) : [],
    };

    return NextResponse.json(productWithParsedFields);
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении данных товара' },
      { status: 500 }
    );
  }
}

// Add or update POST function for updating stock later
// export async function POST(request: Request, { params }: { params: { id: string } }) { /* ... */ } 