import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// List of public paths that don't require authentication
const publicPaths = [
  '/',
  '/auth/login',
  '/auth/register',
  '/products',
  '/products/[id]',
  '/api/auth/[...nextauth]',
];

// List of admin paths that require admin role
const adminPaths = [
  '/admin',
  '/admin/*',
  '/api/admin/*',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public paths
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path.replace(/\[\w+\]/, '')))) {
    return NextResponse.next();
  }

  // Check for token in Authorization header
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    // If no token and trying to access protected route, redirect to login
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.json(
      { error: 'Требуется авторизация' },
      { status: 401 }
    );
  }

  try {
    const decoded = verifyToken(token);
    
    // Check if user is trying to access admin routes without admin role
    if (adminPaths.some(path => 
      pathname === path || 
      (path.endsWith('/*') && pathname.startsWith(path.replace('/*', '')))
    )) {
      if (decoded.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Доступ запрещен. Требуются права администратора.' },
          { status: 403 }
        );
      }
    }

    // Add user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // If token is invalid and trying to access protected route, redirect to login
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      loginUrl.searchParams.set('error', 'SessionExpired');
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.json(
      { error: 'Недействительный токен' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};