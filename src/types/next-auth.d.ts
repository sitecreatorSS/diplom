import { DefaultSession, User as DefaultUser } from 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Возвращается функциями `useSession`, `getSession` и `getServerSession`
   */
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'SELLER' | 'BUYER';
    } & DefaultSession['user']; // `& DefaultSession['user']` добавляет поля name, email, image
  }

  /**
   * Объект пользователя, который передается в колбэки
   */
  interface User extends DefaultUser {
    role: 'ADMIN' | 'SELLER' | 'BUYER';
  }
}

declare module 'next-auth/jwt' {
  /**
   * Возвращается колбэком `jwt` и передается в колбэк `session`.
   */
  interface JWT {
    id: string;
    role: 'ADMIN' | 'SELLER' | 'BUYER';
  }
}
