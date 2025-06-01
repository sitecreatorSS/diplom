import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Токен не предоставлен' }, { status: 400 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: 'ADMIN' | 'SELLER' | 'BUYER' };
    
    // Optionally, you might want to fetch the user from the database here
    // using Prisma if you need more up-to-date user info.
    // For now, we'll just return the decoded info.
    
    return NextResponse.json({ user: decoded });
  } catch (error: any) {
    return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 });
  }
} 