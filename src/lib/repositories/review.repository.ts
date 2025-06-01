import { query } from '../db';
import { Review } from '@/types/database';

interface FindReviewsOptions {
  productId?: string;
  userId?: string;
  isApproved?: boolean;
  isFeatured?: boolean;
  minRating?: number;
  maxRating?: number;
  page?: number;
  limit?: number;
}

/**
 * Найти отзывы по заданным критериям
 */
export async function findReviews(
  options: FindReviewsOptions = {}
): Promise<{ reviews: Review[]; total: number }> {
  const {
    productId,
    userId,
    isApproved,
    isFeatured,
    minRating,
    maxRating,
    page = 1,
    limit = 10
  } = options;

  let queryStr = 'FROM "Review" WHERE 1=1';
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (productId) {
    queryStr += ` AND "productId" = $${paramIndex++}`;
    queryParams.push(productId);
  }

  if (userId) {
    queryStr += ` AND "userId" = $${paramIndex++}`;
    queryParams.push(userId);
  }

  if (isApproved !== undefined) {
    queryStr += ` AND "isApproved" = $${paramIndex++}`;
    queryParams.push(isApproved);
  }

  if (isFeatured !== undefined) {
    queryStr += ` AND "isFeatured" = $${paramIndex++}`;
    queryParams.push(isFeatured);
  }

  if (minRating !== undefined) {
    queryStr += ` AND rating >= $${paramIndex++}`;
    queryParams.push(minRating);
  }

  if (maxRating !== undefined) {
    queryStr += ` AND rating <= $${paramIndex++}`;
    queryParams.push(maxRating);
  }

  // Get total count
  const countResult = await query(`SELECT COUNT(*) as count ${queryStr}`, queryParams);
  const total = parseInt(countResult.rows[0].count, 10);

  // Add pagination
  const offset = (page - 1) * limit;
  queryStr += ' ORDER BY "createdAt" DESC';
  queryStr += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryParams.push(limit, offset);

  // Get reviews with user info
  const result = await query(
    `SELECT r.*, u.name as "userName", u.image as "userImage"
     ${queryStr}
     LEFT JOIN "User" u ON r."userId" = u.id`,
    queryParams
  );

  return {
    reviews: result.rows,
    total
  };
}

/**
 * Найти отзыв по ID
 */
export async function findReviewById(id: string): Promise<Review | null> {
  const result = await query(
    `SELECT r.*, u.name as "userName", u.image as "userImage"
     FROM "Review" r
     LEFT JOIN "User" u ON r."userId" = u.id
     WHERE r.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Создать новый отзыв
 */
export async function createReview(reviewData: {
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
}): Promise<Review> {
  const { productId, userId, rating, title = null, comment = null } = reviewData;
  
  const result = await query(
    `INSERT INTO "Review" ("productId", "userId", rating, title, comment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [productId, userId, rating, title, comment]
  );

  // Update product rating
  await updateProductRating(productId);
  
  return result.rows[0];
}

/**
 * Обновить отзыв
 */
export async function updateReview(
  id: string,
  updateData: {
    rating?: number;
    title?: string | null;
    comment?: string | null;
    isApproved?: boolean;
    isFeatured?: boolean;
    response?: string | null;
  }
): Promise<Review | null> {
  const {
    rating,
    title,
    comment,
    isApproved,
    isFeatured,
    response
  } = updateData;

  const result = await query(
    `UPDATE "Review"
     SET
       rating = COALESCE($1, rating),
       title = ${title === undefined ? 'title' : '$2'},
       comment = ${comment === undefined ? 'comment' : '$3'},
       "isApproved" = COALESCE($4, "isApproved"),
       "isFeatured" = COALESCE($5, "isFeatured"),
       response = ${response === undefined ? 'response' : '$6'},
       "responseDate" = ${response === undefined ? '"responseDate"' : 'CASE WHEN $6 IS NOT NULL THEN NOW() ELSE NULL END'},
       "updatedAt" = NOW()
     WHERE id = ${response === undefined ? '$4' : '$7'}
     RETURNING *`,
    [
      rating,
      ...(title !== undefined ? [title] : []),
      ...(comment !== undefined ? [comment] : []),
      isApproved,
      isFeatured,
      ...(response !== undefined ? [response] : []),
      id
    ].filter(Boolean)
  );

  // Update product rating if rating was changed
  if (rating !== undefined && result.rows[0]) {
    await updateProductRating(result.rows[0].productId);
  }

  return result.rows[0] || null;
}

/**
 * Удалить отзыв
 */
export async function deleteReview(id: string): Promise<{ productId: string } | null> {
  // Get product ID before deletion to update its rating
  const review = await findReviewById(id);
  if (!review) return null;

  const result = await query('DELETE FROM "Review" WHERE id = $1 RETURNING id', [id]);
  
  if (result.rowCount && result.rowCount > 0) {
    // Update product rating
    await updateProductRating(review.productId);
    return { productId: review.productId };
  }
  
  return null;
}

/**
 * Увеличить счетчик полезности отзыва
 */
export async function incrementHelpfulCount(reviewId: string): Promise<Review | null> {
  const result = await query(
    `UPDATE "Review"
     SET "helpfulCount" = "helpfulCount" + 1,
         "updatedAt" = NOW()
     WHERE id = $1
     RETURNING *`,
    [reviewId]
  );
  
  return result.rows[0] || null;
}

/**
 * Получить сводку рейтингов продукта
 */
export async function getProductRatingSummary(productId: string): Promise<{
  averageRating: number;
  totalReviews: number;
  ratingCounts: Record<number, number>;
} | null> {
  const result = await query(
    `SELECT 
       COALESCE(AVG(rating), 0) as "averageRating",
       COUNT(*) as "totalReviews",
       jsonb_object_agg(
         rating, 
         COALESCE((SELECT COUNT(*) FROM "Review" WHERE "productId" = $1 AND rating = r.rating), 0)
       ) as "ratingCounts"
     FROM (SELECT generate_series(1, 5) as rating) r
     LEFT JOIN "Review" rev ON rev.rating = r.rating AND rev."productId" = $1 AND rev."isApproved" = true
     GROUP BY "productId"`,
    [productId]
  );

  if (!result.rows[0]) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }


  // Convert string keys to numbers and fill missing ratings with 0
  const ratingCounts: Record<number, number> = {};
  for (let i = 1; i <= 5; i++) {
    ratingCounts[i] = parseInt(result.rows[0].ratingCounts[i] || '0', 10);
  }

  return {
    averageRating: parseFloat(result.rows[0].averageRating) || 0,
    totalReviews: parseInt(result.rows[0].totalReviews, 10) || 0,
    ratingCounts
  };
}

/**
 * Обновить рейтинг продукта
 */
async function updateProductRating(productId: string): Promise<void> {
  await query(
    `UPDATE "Product" p
     SET 
       rating = (
         SELECT COALESCE(AVG(rating), 0)
         FROM "Review"
         WHERE "productId" = $1 AND "isApproved" = true
       ),
       "reviewCount" = (
         SELECT COUNT(*)
         FROM "Review"
         WHERE "productId" = $1 AND "isApproved" = true
       )
     WHERE id = $1`,
    [productId]
  );
}
