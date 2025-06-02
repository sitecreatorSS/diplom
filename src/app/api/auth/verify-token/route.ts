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
    
    return NextResponse.json({ user: decoded });
  } catch (error: any) {
    return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 });
  }
} 