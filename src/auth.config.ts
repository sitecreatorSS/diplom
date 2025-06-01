import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaClient } from "@prisma/client"; // Удалено
import bcrypt from 'bcryptjs';
import { pool } from './lib/db'; // Импорт пула соединений pg

// const prisma = new PrismaClient(); // Удалено

interface AuthUser extends User {
  id: string;
  name?: string | null;
  email?: string | null;
  role: 'ADMIN' | 'SELLER' | 'BUYER';
  [key: string]: any; // Добавляем индексную сигнатуру
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Неверные учетные данные');
        }

        // Пример замены:
        // Вместо prisma.user.findUnique({ where: { email } }) используйте обычный SQL-запрос через pg
        // const result = await pool.query('SELECT * FROM users WHERE email = $1', [credentials.email]);
        // const user = result.rows[0];
        // if (!user) throw new Error('Пользователь не найден');
        // const isCorrectPassword = await bcrypt.compare(credentials.password as string, user.password);
        // if (!isCorrectPassword) throw new Error('Неверный пароль');
        // return { id: user.id, name: user.name, email: user.email, role: user.role };

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as 'ADMIN' | 'SELLER' | 'BUYER',
        } as AuthUser;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};
