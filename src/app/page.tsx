'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 z-0 opacity-30">
           {/* Пример использования фонового изображения - замените на ваше, если есть */}
          {/* <Image src="/path/to/your/hero-image.jpg" alt="Магазин одежды" layout="fill" objectFit="cover" /> */}
        </div>
        <div className="container mx-auto px-4 text-center z-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Добро пожаловать в Магазин одежды
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl mb-8 max-w-2xl mx-auto"
          >
            Откройте для себя последние коллекции и найдите свой уникальный стиль.
          </motion.p>
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/catalog" passHref>
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-200 text-lg opacity-100 !important">
                Перейти в каталог
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories Section */}
      {/* Эту секцию можно добавить позже, если у вас будут категории товаров */}
      {/* <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Популярные категории</h2>
        {/* Здесь будут карточки категорий */}
      {/* </section> */}

      {/* About Us Snippet Section */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">О нас</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
            Мы предлагаем широкий ассортимент стильной и качественной одежды для всех. 
            Наша миссия - помочь вам выразить себя через моду, предлагая только лучшие товары от проверенных продавцов.
          </p>
          <Link href="/about" passHref>
             <Button variant="outline" size="lg">
               Подробнее о нас
             </Button>
          </Link>
        </div>
      </section>

      {/* Optional: Call to Action / Newsletter Section */}
      {/* Эту секцию можно добавить позже */}
      {/* <section className="bg-indigo-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
           <h2 className="text-3xl font-bold mb-6">Будьте в курсе</h2>
           <p className="text-xl mb-8">Подпишитесь на нашу рассылку, чтобы получать информацию о новинках и скидках.</p>
           {/* Здесь будет форма подписки */}
        {/* </div>
      </section> */}
    </main>
  );
}
