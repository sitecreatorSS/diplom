import { query } from '../db';
import { WishlistItem } from '@/types/database';

interface FindWishlistItemsOptions {
  userId: string;
  productId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Найти товары в списке желаний пользователя
 */
export async function findWishlistItems(
  options: FindWishlistItemsOptions
): Promise<{ items: WishlistItem[]; total: number }> {
  const { userId, productId, limit = 20, offset = 0 } = options;

  let queryStr = 'FROM "WishlistItem" WHERE "userId" = $1';
  const queryParams: any[] = [userId];
  let paramIndex = 2;

  if (productId) {
    queryStr += ` AND "productId" = $${paramIndex++}`;
    queryParams.push(productId);
  }

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as count ${queryStr}`,
    queryParams
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Add ordering and pagination
  queryStr += ' ORDER BY "createdAt" DESC';
  queryStr += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryParams.push(limit, offset);

  // Get wishlist items with product details
  const result = await query(
    `SELECT wi.*, 
            p.name as "productName", 
            p.price as "productPrice",
            p.image as "productImage",
            p.stock as "productStock",
            p."sellerId" as "productSellerId"
     ${queryStr}
     LEFT JOIN "Product" p ON wi."productId" = p.id`,
    queryParams
  );

  return {
    items: result.rows,
    total
  };
}

/**
 * Добавить товар в список желаний
 */
export async function addToWishlist(
  userId: string,
  productId: string
): Promise<WishlistItem> {
  // Check if item already exists in wishlist
  const existingItem = await query(
    'SELECT * FROM "WishlistItem" WHERE "userId" = $1 AND "productId" = $2',
    [userId, productId]
  );

  if (existingItem.rows.length > 0) {
    return existingItem.rows[0];
  }

  // Add new item to wishlist
  const result = await query(
    `INSERT INTO "WishlistItem" ("userId", "productId")
     VALUES ($1, $2)
     RETURNING *`,
    [userId, productId]
  );

  return result.rows[0];
}

/**
 * Удалить товар из списка желаний
 */
export async function removeFromWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  const result = await query(
    'DELETE FROM "WishlistItem" WHERE "userId" = $1 AND "productId" = $2 RETURNING id',
    [userId, productId]
  );
  
  return result.rowCount ? result.rowCount > 0 : false;
}

/**
 * Очистить список желаний пользователя
 */
export async function clearWishlist(userId: string): Promise<number> {
  const result = await query(
    'DELETE FROM "WishlistItem" WHERE "userId" = $1 RETURNING id',
    [userId]
  );
  
  return result.rowCount || 0;
}

/**
 * Проверить, есть ли товар в списке желаний пользователя
 */
export async function isInWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  const result = await query(
    'SELECT 1 FROM "WishlistItem" WHERE "userId" = $1 AND "productId" = $2',
    [userId, productId]
  );
  
  return result.rowCount ? result.rowCount > 0 : false;
}

/**
 * Получить количество товаров в списке желаний пользователя
 */
export async function getWishlistCount(userId: string): Promise<number> {
  const result = await query(
    'SELECT COUNT(*) as count FROM "WishlistItem" WHERE "userId" = $1',
    [userId]
  );
  
  return parseInt(result.rows[0].count, 10) || 0;
}

/**
 * Перенести товары из гостевого списка желаний в список зарегистрированного пользователя
 */
export async function mergeGuestWishlist(
  userId: string,
  guestWishlist: string[]
): Promise<{ added: number; skipped: number }> {
  if (!guestWishlist || guestWishlist.length === 0) {
    return { added: 0, skipped: 0 };
  }

  // Remove duplicates and existing items
  const uniqueProductIds = [...new Set(guestWishlist)];
  
  // Check which items already exist in user's wishlist
  const existingItems = await query(
    'SELECT "productId" FROM "WishlistItem" WHERE "userId" = $1 AND "productId" = ANY($2::text[])'
    [userId, uniqueProductIds]
  );
  
  const existingProductIds = existingItems.rows.map(item => item.productId);
  const newProductIds = uniqueProductIds.filter(id => !existingProductIds.includes(id));
  
  if (newProductIds.length === 0) {
    return { added: 0, skipped: uniqueProductIds.length };
  }
  
  // Add new items to wishlist
  const values = newProductIds
    .map((productId, index) => `($1, $${index + 2})`)
    .join(',');
  
  const params = [userId, ...newProductIds];
  
  await query(
    `INSERT INTO "WishlistItem" ("userId", "productId")
     VALUES ${values}
     ON CONFLICT DO NOTHING`,
    params
  );
  
  return {
    added: newProductIds.length,
    skipped: existingProductIds.length
  };
}
