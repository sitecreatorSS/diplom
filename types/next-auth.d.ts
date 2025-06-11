import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'SELLER' | 'BUYER';
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    role: 'ADMIN' | 'SELLER' | 'BUYER';
  }

  interface JWT {
    id: string;
    role: 'ADMIN' | 'SELLER' | 'BUYER';
  }
}

declare module 'next-auth/react' {
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'SELLER' | 'BUYER';
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'ADMIN' | 'SELLER' | 'BUYER';
  }
} 