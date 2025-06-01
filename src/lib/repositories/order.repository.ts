import { query, transaction } from '../db';
import { Order, OrderItem } from '@/types/database';

interface CreateOrderData {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}

export async function createOrder(orderData: CreateOrderData): Promise<Order> {
  const { userId, items, total } = orderData;
  
  // Начинаем транзакцию
  const queries = [
    // Создаем заказ
    {
      text: `INSERT INTO "Order" ("userId", total) VALUES ($1, $2) RETURNING *`,
      params: [userId, total]
    },
    // Добавляем товары в заказ
    ...items.map(item => ({
      text: `INSERT INTO "OrderItem" ("orderId", "productId", quantity, price) 
             VALUES ((SELECT currval(pg_get_serial_sequence('"Order"','id'))), $1, $2, $3) RETURNING *`,
      params: [item.productId, item.quantity, item.price]
    })),
    // Очищаем корзину
    {
      text: 'DELETE FROM "CartItem" WHERE "userId" = $1',
      params: [userId]
    }
  ];

  const results = await transaction(queries);
  return results[0].rows[0];
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const result = await query(
    'SELECT * FROM "Order" WHERE "userId" = $1 ORDER BY "createdAt" DESC',
    [userId]
  );
  return result.rows;
}

export async function getOrderById(orderId: string, userId: string): Promise<{ order: Order; items: OrderItem[] } | null> {
  // Получаем заказ
  const orderResult = await query(
    'SELECT * FROM "Order" WHERE id = $1 AND "userId" = $2',
    [orderId, userId]
  );

  if (orderResult.rows.length === 0) {
    return null;
  }

  // Получаем товары заказа
  const itemsResult = await query(
    `SELECT oi.*, p.name, p.image 
     FROM "OrderItem" oi 
     JOIN "Product" p ON oi."productId" = p.id 
     WHERE oi."orderId" = $1`,
    [orderId]
  );

  return {
    order: orderResult.rows[0],
    items: itemsResult.rows
  };
}

export async function updateOrderStatus(orderId: string, status: string): Promise<Order | null> {
  const result = await query(
    'UPDATE "Order" SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
    [status, orderId]
  );
  return result.rows[0] || null;
}
