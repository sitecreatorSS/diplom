import { NextResponse } from 'next/server';

// Update the type to correctly reflect the included relations and parsed fields
type ProductWithDetails = {
  id: string;
  name: string;
  price: number;
  sizes: string[]; // Expecting parsed JSON array
  colors: string[]; // Expecting parsed JSON array
};

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;

    // Replace this with your actual SQL query to fetch the product
    const product = {
      id: productId,
      name: 'Sample Product',
      price: 100,
      sizes: '["Small", "Medium", "Large"]',
      colors: '["Red", "Blue", "Green"]',
    };

    if (!product) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    // Parse JSON fields for sizes and colors and ensure correct type
    const productWithParsedFields: ProductWithDetails = {
      ...product,
      sizes: JSON.parse(product.sizes),
      colors: JSON.parse(product.colors),
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