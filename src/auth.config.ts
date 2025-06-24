import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaClient } from "@prisma/client"; // Удалено
import bcrypt from 'bcryptjs';
import { query } from "./lib/db";

// const prisma = new PrismaClient(); // Удалено

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          console.log('Authorize: Missing credentials');
          return null;
        }

        try {
          const result = await query('SELECT * FROM users WHERE email = $1', [credentials.email]);
          const user = result.rows[0];

          if (!user) {
            console.log(`Authorize: User not found for email: ${credentials.email}`);
            return null;
          }

          const isCorrectPassword = await bcrypt.compare(credentials.password, user.password);

          if (!isCorrectPassword) {
            console.log(`Authorize: Incorrect password for email: ${credentials.email}`);
            return null;
          }
          
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (e) {
          console.error("Authorize error:", e);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
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
