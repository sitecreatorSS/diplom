const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

const categories = [
  'T-SHIRTS',
  'PANTS',
  'SHOES',
  'DRESSES',
  'JACKETS',
  'ACCESSORIES'
];

const products = [
  {
    name: 'Футболка оверсайз',
    description: 'Модная оверсайз футболка из хлопка',
    price: 1999,
    category: 'T-SHIRTS',
    stock: 50,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Черный', 'Белый', 'Серый'],
    images: [
      '/products/tshirt-1.jpg',
      '/products/tshirt-2.jpg',
      '/products/tshirt-3.jpg'
    ]
  },
  // ... (остальные товары из seed.ts)
];

async function main() {
  try {
    console.log('Начало заполнения базы данных...');

    // Очистка базы данных
    await prisma.cartItem.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.productImage.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.sellerApplication.deleteMany({});
    await prisma.user.deleteMany({});

    // Создание пользователей
    const adminPassword = 'admin123';
    const userPassword = 'password123';
    
    console.log('Создание пользователя admin@example.com с паролем:', adminPassword);
    const hashedAdminPassword = await hash(adminPassword, 12);
    const hashedUserPassword = await hash(userPassword, 12);

    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedAdminPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    });

    console.log('Создание пользователя seller@example.com с паролем:', userPassword);
    const sellerUser = await prisma.user.create({
      data: {
        name: 'Seller User',
        email: 'seller@example.com',
        password: hashedUserPassword,
        role: 'SELLER',
        emailVerified: new Date(),
      },
    });

    console.log('Создание пользователя customer@example.com с паролем:', userPassword);
    await prisma.user.create({
      data: {
        name: 'Customer User',
        email: 'customer@example.com',
        password: hashedUserPassword,
        role: 'BUYER',
        emailVerified: new Date(),
      },
    });

    // Создание заявки на продавца
    await prisma.sellerApplication.create({
      data: {
        userId: sellerUser.id,
        status: 'APPROVED',
        message: 'Хочу продавать одежду',
        reviewedBy: adminUser.id,
        reviewedAt: new Date(),
        reviewNotes: 'Одобрено',
      }
    });

    // Создание продуктов
    for (const product of products) {
      const createdProduct = await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          stock: product.stock,
          sizes: JSON.stringify(product.sizes),
          colors: JSON.stringify(product.colors),
          sellerId: sellerUser.id,
          rating: 4.5,
          numReviews: 10,
        },
      });

      // Добавление изображений продукта
      await prisma.productImage.createMany({
        data: product.images.map((url, index) => ({
          url,
          alt: `${product.name} - фото ${index + 1}`,
          order: index,
          productId: createdProduct.id,
        })),
      });
    }


    console.log('База данных успешно заполнена!');
  } catch (error) {
    console.error('Ошибка при заполнении базы данных:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
