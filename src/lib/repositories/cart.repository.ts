import { query } from '../db';
import { CartItem } from '@/types/database';

export async function getCartItems(userId: string): Promise<CartItem[]> {
  const result = await query(
    `SELECT c.*, p.name, p.price, p.image, p.stock 
     FROM "CartItem" c 
     JOIN "Product" p ON c."productId" = p.id 
     WHERE c."userId" = $1 
     ORDER BY c."createdAt" DESC`,
    [userId]
  );
  return result.rows;
}

export async function addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartItem> {
  // Проверяем, есть ли уже такой товар в корзине
  const existingItem = await query(
    'SELECT * FROM "CartItem" WHERE "userId" = $1 AND "productId" = $2',
    [userId, productId]
  );

  if (existingItem.rows.length > 0) {
    // Если товар уже есть в корзине, увеличиваем количество
    const result = await query(
      'UPDATE "CartItem" SET quantity = quantity + $1, "updatedAt" = NOW() WHERE "userId" = $2 AND "productId" = $3 RETURNING *',
      [quantity, userId, productId]
    );
    return result.rows[0];
  } else {
    // Если товара еще нет в корзине, добавляем новый
    const result = await query(
      'INSERT INTO "CartItem" ("userId", "productId", quantity) VALUES ($1, $2, $3) RETURNING *',
      [userId, productId, quantity]
    );
    return result.rows[0];
  }
}

export async function updateCartItem(userId: string, itemId: string, quantity: number): Promise<CartItem | null> {
  if (quantity <= 0) {
    // Если количество меньше или равно 0, удаляем товар из корзины
    await query('DELETE FROM "CartItem" WHERE id = $1 AND "userId" = $2', [itemId, userId]);
    return null;
  }
  
  const result = await query(
    'UPDATE "CartItem" SET quantity = $1, "updatedAt" = NOW() WHERE id = $2 AND "userId" = $3 RETURNING *',
    [quantity, itemId, userId]
  );
  return result.rows[0] || null;
}

export async function removeFromCart(userId: string, itemId: string): Promise<boolean> {
  const result = await query('DELETE FROM "CartItem" WHERE id = $1 AND "userId" = $2 RETURNING id', [itemId, userId]);
  return (result.rowCount ?? 0) > 0;
}

export async function clearCart(userId: string): Promise<void> {
  await query('DELETE FROM "CartItem" WHERE "userId" = $1', [userId]);
}
