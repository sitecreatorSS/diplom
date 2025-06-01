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

// Функция для генерации случайного цвета в HEX формате
const getRandomColor = () => {
  return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
};

// Функция для создания URL плейсхолдера с текстом
const placeholderImage = (text, width = 600, height = 400) => {
  const bgColor = getRandomColor();
  const textColor = parseInt(bgColor.replace('#', ''), 16) > 0xffffff/1.5 ? '000000' : 'ffffff';
  return `https://placehold.co/${width}x${height}/${bgColor.substring(1)}/${textColor}?text=${encodeURIComponent(text)}`;
};

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
      placeholderImage('Футболка 1'),
      placeholderImage('Футболка 2'),
      placeholderImage('Футболка 3')
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
      placeholderImage('Джинсы 1'),
      placeholderImage('Джинсы 2')
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
      placeholderImage('Кроссовки 1'),
      placeholderImage('Кроссовки 2'),
      placeholderImage('Кроссовки 3')
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
      placeholderImage('Платье 1'),
      placeholderImage('Платье 2')
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
      placeholderImage('Куртка 1'),
      placeholderImage('Куртка 2')
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
      placeholderImage('Шапка 1'),
      placeholderImage('Шапка 2')
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
