import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient() as any;

async function main() {
  try {
    console.log('Starting to seed the database...');
    
    // Clear existing data
    await prisma.cartItem.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.productImage.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.sellerApplication.deleteMany({});
    await prisma.user.deleteMany({});

    // Create a test user
    const hashedPassword = await hash('password123', 12);
    
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    });

    console.log('Created test user:', testUser);
    
    // Create a test product
    const testProduct = await prisma.product.create({
      data: {
        name: 'Test Product',
        description: 'This is a test product',
        price: 999,
        imageUrl: '/test-product.jpg',
        category: 'T-SHIRTS',
        stock: 10,
        sellerId: testUser.id,
        size: JSON.stringify(['M']),
        colors: JSON.stringify(['Black']),
        rating: 5,
        numReviews: 1,
      },
    });

    console.log('Created test product:', testProduct);
    
    // Add an image to the product
    const productImage = await prisma.productImage.create({
      data: {
        url: '/test-product.jpg',
        alt: 'Test Product',
        order: 0,
        productId: testProduct.id,
      },
    });

    console.log('Added image to product:', productImage);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
