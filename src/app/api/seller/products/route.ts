import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// Helper function to check if the user is a seller
async function isSeller(session: any) {
  return session?.user.role === 'SELLER';
}

// GET /api/seller/products - Get products for the logged-in seller
export async function GET() {
  try {
    const session = await getServerSession();

    // Check if user is authenticated and is a seller
    if (!session || session.user.role !== 'SELLER') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const sellerId = session.user.id; // Now TypeScript knows session is not null

    const products = await prisma.product.findMany({
      where: {
        sellerId: sellerId,
      },
      include: { // Include images to display them in the seller panel
        images: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching seller products:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST /api/seller/products - Add a new product
export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    // Check if user is authenticated and is a seller
    if (!session || session.user.role !== 'SELLER') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const sellerId = session.user.id; // Now TypeScript knows session is not null
    const body = await request.json();
    const { name, description, price, stock, category, sizes, colors, images } = body;

    // Basic validation (can be enhanced)
    if (!name || !description || price === undefined || stock === undefined || !category || !sizes || !colors || !images) {
        return new NextResponse('Missing required fields', { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        category,
        sizes: JSON.stringify(sizes),
        colors: JSON.stringify(colors),
        sellerId,
        // Default values for rating and numReviews
        rating: 0,
        numReviews: 0,
        images: {
          create: images.map((image: { url: string, alt: string }, index: number) => ({
            url: image.url,
            alt: image.alt || `${name} image ${index + 1}`,
            order: index,
          })),
        },
      },
      include: { // Include images in the response
        images: {
           orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error adding product:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PUT /api/seller/products - Update an existing product
export async function PUT(request: Request) {
   try {
    const session = await getServerSession();

    // Check if user is authenticated and is a seller
    if (!session || session.user.role !== 'SELLER') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const sellerId = session.user.id; // Now TypeScript knows session is not null
    const body = await request.json();
    const { id, name, description, price, stock, category, sizes, colors, images } = body;

    if (!id || !name || !description || price === undefined || stock === undefined || !category || !sizes || !colors || !images) {
        return new NextResponse('Missing required fields', { status: 400 });
    }

    // Verify the product belongs to the seller
    const existingProduct = await prisma.product.findUnique({
        where: { id: id }
    });

    if (!existingProduct || existingProduct.sellerId !== sellerId) {
        return new NextResponse('Product not found or does not belong to this seller', { status: 404 });
    }

    // Update product and handle images (delete existing and create new ones for simplicity)
    // A more robust solution might compare and update images instead of replacing all
    await prisma.productImage.deleteMany({ where: { productId: id } });

    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        category,
        sizes: JSON.stringify(sizes),
        colors: JSON.stringify(colors),
        images: {
          create: images.map((image: { url: string, alt: string }, index: number) => ({
            url: image.url,
            alt: image.alt || `${name} image ${index + 1}`,
            order: index,
          })),
        },
      },
       include: { // Include images in the response
        images: {
           orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return NextResponse.json(updatedProduct);

  } catch (error) {
    console.error('Error updating product:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/seller/products - Delete a product
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();

    // Check if user is authenticated and is a seller
    if (!session || session.user.role !== 'SELLER') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const sellerId = session.user.id; // Now TypeScript knows session is not null
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
        return new NextResponse('Product ID is required', { status: 400 });
    }

     // Verify the product belongs to the seller
    const existingProduct = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (!existingProduct || existingProduct.sellerId !== sellerId) {
        return new NextResponse('Product not found or does not belong to this seller', { status: 404 });
    }

    // Delete related images first (due to foreign key constraint)
     await prisma.productImage.deleteMany({ where: { productId: productId } });

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('Error deleting product:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
} 