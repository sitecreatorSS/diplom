import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  if (!file) {
    return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = Date.now() + '-' + file.name.replace(/\s/g, '_');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, buffer);
  const url = `/uploads/${fileName}`;
  return NextResponse.json({ url });
}

export async function DELETE(request: Request) {
  const { url } = await request.json();
  if (!url) return NextResponse.json({ error: 'Нет url' }, { status: 400 });
  const filePath = path.join(process.cwd(), 'public', url.replace(/^\/uploads\//, 'uploads/'));
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Ошибка при удалении файла' }, { status: 500 });
  }
} 