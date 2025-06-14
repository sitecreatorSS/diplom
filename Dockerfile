# Используем официальный образ Node.js
FROM node:18-alpine AS base

# Устанавливаем зависимости, необходимые для работы с PostgreSQL и другими библиотеками
RUN apk add --no-cache libc6-compat

# Устанавливаем pnpm (если используется)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Создаем директорию приложения
WORKDIR /app

# Копируем package.json и package-lock.json (или pnpm-lock.yaml)
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Создаем образ для продакшена
FROM node:18-alpine AS runner
WORKDIR /app

# Устанавливаем зависимости, необходимые для работы с PostgreSQL и другими библиотеками
RUN apk add --no-cache libc6-compat

# Копируем package.json и package-lock.json (или pnpm-lock.yaml)
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Устанавливаем только production зависимости
RUN npm ci --only=production

# Копируем собранное приложение из предыдущего этапа
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/next.config.mjs ./

# Открываем порт, который будет использовать приложение
EXPOSE 3000

# Устанавливаем переменные окружения по умолчанию
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Запускаем приложение
CMD ["npm", "start"]
