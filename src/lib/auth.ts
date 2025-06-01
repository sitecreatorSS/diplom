import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@/types/database';
import { findUserByEmail } from './repositories/user.repository';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  image?: string | null;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Пароль', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Требуется ввести email и пароль');
        }

        const user = await findUserByEmail(credentials.email);

        if (!user || !user.password) {
          throw new Error('Неверный email или пароль');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Неверный email или пароль');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: { id: string; email: string; role: UserRole }): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function verifyToken(token: string): { id: string; email: string; role: UserRole } {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: UserRole };
  } catch (error) {
    throw new Error('Недействительный токен');
  }
}