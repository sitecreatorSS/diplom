import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  'T-SHIRTS',
  'PANTS',
  'SHOES',
  'DRESSES',
  'JACKETS',
  'ACCESSORIES'
] as const;

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
  {
    name: 'Джинсы скинни',
    description: 'Удобные скинни джинсы',
    price: 4999,
    category: 'PANTS',
    stock: 30,
    sizes: ['28/30', '30/32', '32/34', '34/36'],
    colors: ['Синий', 'Черный'],
    images: [
      '/products/jeans-1.jpg',
      '/products/jeans-2.jpg'
    ]
  },
  {
    name: 'Кроссовки спортивные',
    description: 'Удобные кроссовки для бега',
    price: 8999,
    category: 'SHOES',
    stock: 20,
    sizes: ['40', '41', '42', '43', '44'],
    colors: ['Белый', 'Черный', 'Красный'],
    images: [
      '/products/shoes-1.jpg',
      '/products/shoes-2.jpg',
      '/products/shoes-3.jpg'
    ]
  },
  {
    name: 'Летнее платье миди',
    description: 'Легкое и воздушное платье для теплых дней',
    price: 3599,
    category: 'DRESSES',
    stock: 40,
    sizes: ['S', 'M', 'L'],
    colors: ['Синий', 'Цветочный принт'],
    images: [
      '/products/dress-1.jpg',
      '/products/dress-2.jpg'
    ]
  },
  {
    name: 'Кожаная куртка-косуха',
    description: 'Классическая куртка из натуральной кожи',
    price: 15999,
    category: 'JACKETS',
    stock: 15,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Черный', 'Коричневый'],
    images: [
      '/products/jacket-1.jpg',
      '/products/jacket-2.jpg'
    ]
  },
  {
    name: 'Шапка бини',
    description: 'Теплая вязаная шапка для прохладной погоды',
    price: 999,
    category: 'ACCESSORIES',
    stock: 100,
    sizes: ['Универсальный'],
    colors: ['Черный', 'Серый', 'Бордовый'],
    images: [
      '/products/beanie-1.jpg',
      '/products/beanie-2.jpg'
    ]
  }
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
        createdAt: new Date(),
        updatedAt: new Date(),
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('Создание пользователя customer@example.com с паролем:', userPassword);
    const customerUser = await prisma.user.create({
      data: {
        name: 'Customer User',
        email: 'customer@example.com',
        password: hashedUserPassword,
        role: 'BUYER',
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('Созданы пользователи:', { adminUser, sellerUser, customerUser });

    // Создание заявки на продавца
    const sellerApplication = await prisma.sellerApplication.create({
      data: {
        userId: sellerUser.id,
        status: 'APPROVED',
        message: 'Хочу продавать одежду',
        reviewedBy: adminUser.id,
        reviewedAt: new Date(),
        reviewNotes: 'Одобрено',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    console.log('Создана заявка продавца:', sellerApplication);

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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Добавление изображений продукта
      await prisma.productImage.createMany({
        data: product.images.map((url, index) => ({
          url,
          alt: `${product.name} - фото ${index + 1}`,
          order: index,
          productId: createdProduct.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      });

      // Создание отзывов (для примера добавим отзыв только к первому новому товару)
      if (product.name === 'Летнее платье миди') {
         await prisma.review.create({
            data: {
              userId: customerUser.id,
              productId: createdProduct.id,
              rating: 5,
              comment: 'Отличный товар!',
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          });
      }

      console.log(`Создан продукт: ${createdProduct.name}`);
    }

    // Создание заказа
    const order = await prisma.order.create({
      data: {
        userId: customerUser.id,
        total: 6998, // Цена двух товаров
        status: 'PENDING',
        shippingInfo: JSON.stringify({
          address: 'ул. Примерная, д. 1',
          city: 'Москва',
          postalCode: '123456',
          country: 'Россия'
        }),
        paymentInfo: JSON.stringify({
          method: 'CARD',
          status: 'PENDING'
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    // Добавление товаров в заказ
    const firstProduct = await prisma.product.findFirst();
    if (firstProduct) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: firstProduct.id,
          quantity: 2,
          price: firstProduct.price,
        }
      });
    }

    console.log('Создан заказ:', order);

    // Добавление товаров в корзину
    const cartItems = await prisma.cartItem.createMany({
      data: [
        {
          userId: customerUser.id,
          productId: (await prisma.product.findFirst())!.id,
          quantity: 1,
          size: 'M',
          color: 'Черный',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]
    });

    console.log('Добавлены товары в корзину:', cartItems);

    console.log('База данных успешно заполнена тестовыми данными!');
  } catch (error) {
    console.error('Ошибка при заполнении базы данных:', error);
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
