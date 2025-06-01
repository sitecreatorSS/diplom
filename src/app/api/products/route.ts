import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Extend the Prisma client to include the product image relation
type ProductWithImages = Prisma.ProductGetPayload<{
  include: {
    seller: {
      select: { name: true };
    };
    images: true;
  };
}>;

// Helper function to generate a random rating between 3.5 and 5
const generateRandomRating = () => {
  return parseFloat((Math.random() * 1.5 + 3.5).toFixed(1));
};

// Helper to parse JSON fields with fallback
const tryParseJson = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    return fallback;
  }
};

// Отключаем статическую генерацию для этого роута
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '0');

    const where: any = {
      ...(category ? { category } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      } : {})
    };

    const products = await prisma.product.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
      ...(limit > 0 ? { take: limit } : {}),
    }) as unknown as (ProductWithImages & { rating?: number })[];

    // Transform the data to match the frontend expectations
    const transformedProducts = products.map(product => {
      console.log('Original product:', JSON.stringify(product, null, 2));
      
      // Add a random rating for demo purposes if not present
      const rating = product.rating || generateRandomRating();
      
      // Parse JSON fields with fallback to empty arrays
      const colors = tryParseJson<string[]>(product.colors, []);
      const sizes = tryParseJson<string[]>(product.sizes, []);
      
      // Ensure images is always an array with at least one item
      let images = [];
      if (product.images && product.images.length > 0) {
        images = product.images.map(img => ({
          url: img.url.startsWith('http') ? img.url : `/placeholder-product.jpg`,
          alt: img.alt || 'Изображение товара'
        }));
      } else {
        images = [{ 
          url: '/placeholder-product.jpg', 
          alt: 'Изображение отсутствует' 
        }];
      }
      
      const transformed = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        rating,
        colors,
        sizes,
        images,
        seller: product.seller || { name: 'Продавец' }
      };
      
      console.log('Transformed product:', JSON.stringify(transformed, null, 2));
      return transformed;
    });
    
    console.log('Total products found:', transformedProducts.length);

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении товаров' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { id: userId, role } = verifyToken(token);

    if (role !== 'SELLER' && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Недостаточно прав' },
        { status: 403 }
      );
    }

    const {
      name,
      description,
      price,
      images = [],
      category,
      sizes = [],
      colors = [],
      stock,
    } = await request.json();

    if (!category) {
      return NextResponse.json(
        { error: 'Некорректная категория товара' },
        { status: 400 }
      );
    }

    const product = await prisma.$transaction(async (tx) => {
      // Create the product
      const newProduct = await tx.product.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          category,
          sizes: JSON.stringify(Array.isArray(sizes) ? sizes : sizes ? [sizes] : []),
          colors: JSON.stringify(Array.isArray(colors) ? colors : colors ? [colors] : []),
          stock: parseInt(stock, 10) || 0,
          sellerId: userId,
        },
      });

      // Create product images if any
      if (images && images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img: { url: string; alt?: string }, index: number) => ({
            url: img.url,
            alt: img.alt || `Изображение ${index + 1}`,
            order: index,
            productId: newProduct.id,
          })),
        });
      }

      // Fetch the created product with relations
      const createdProduct = await tx.product.findUnique({
        where: { id: newProduct.id },
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
      }) as unknown as (ProductWithImages & { rating?: number }) | null;

      if (!createdProduct) {
        throw new Error('Failed to fetch created product');
      }

      return createdProduct;
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Products create error:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании товара' },
      { status: 500 }
    );
  }
}