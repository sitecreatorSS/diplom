import NextAuth from 'next-auth';
import { authOptions } from './auth.config';
import { getServerSession } from 'next-auth/next';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

export const auth = () => {
  return getServerSession(authOptions);
};

export { signIn, signOut } from 'next-auth/react';

export default handler;

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'SELLER' | 'BUYER';
    } & {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    role: 'ADMIN' | 'SELLER' | 'BUYER';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'ADMIN' | 'SELLER' | 'BUYER';
  }
}
