#!/bin/bash

# Установка зависимостей
npm install

# Генерация Prisma клиента
npx prisma generate

# Применение миграций
npx prisma migrate deploy

# Запуск сидов
node prisma/seed.js

# Сборка приложения
npm run build
