import { query } from '../db';
import { Product, UserRole } from '@/types/database';

interface FindProductsOptions {
  category?: string;
  search?: string;
  sellerId?: string;
  limit?: number;
  offset?: number;
}

export async function findProducts(options: FindProductsOptions = {}): Promise<{ products: Product[]; total: number }> {
  const { category, search, sellerId, limit, offset } = options;
  
  let queryStr = 'FROM products WHERE 1=1';
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (category) {
    queryStr += ` AND category = $${paramIndex++}`;
    queryParams.push(category);
  }

  if (search) {
    queryStr += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  if (sellerId) {
    queryStr += ` AND seller_id = $${paramIndex++}`;
    queryParams.push(sellerId);
  }

  // Get total count
  const countResult = await query(`SELECT COUNT(*) as count ${queryStr}`, queryParams);
  const total = parseInt(countResult.rows[0].count, 10);

  // Add ordering and pagination
  queryStr += ' ORDER BY createdAt DESC';
  
  if (limit !== undefined) {
    queryStr += ` LIMIT $${paramIndex++}`;
    queryParams.push(limit);
  }
  
  if (offset !== undefined) {
    queryStr += ` OFFSET $${paramIndex++}`;
    queryParams.push(offset);
  }

  // Get products
  const result = await query(`SELECT * ${queryStr}`, queryParams);
  
  return {
    products: result.rows,
    total
  };
}

export async function findProductById(id: string): Promise<Product | null> {
  const result = await query('SELECT * FROM products WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function findProductsBySeller(sellerId: string, options: Omit<FindProductsOptions, 'sellerId'> = {}): 
  Promise<{ products: Product[]; total: number }> {
  return findProducts({ ...options, sellerId });
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  specifications?: Record<string, any>;
  sellerId: string;
}

export async function createProduct(productData: CreateProductData): Promise<Product> {
  const { 
    name, 
    description, 
    price, 
    category, 
    stock, 
    image = null, 
    specifications = {}, 
    sellerId 
  } = productData;
  
  const result = await query(
    `INSERT INTO products (
      name, description, price, category, stock, image, 
      specifications, seller_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
    RETURNING *`,
    [
      name, 
      description, 
      price, 
      category, 
      stock, 
      image, 
      JSON.stringify(specifications), 
      sellerId
    ]
  );
  
  return result.rows[0];
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  image?: string | null;
  specifications?: Record<string, any>;
}

export async function updateProduct(
  id: string, 
  productData: UpdateProductData
): Promise<Product | null> {
  const { 
    name, 
    description, 
    price, 
    category, 
    stock, 
    image, 
    specifications 
  } = productData;
  
  const result = await query(
    `UPDATE products 
     SET 
       name = COALESCE($1, name),
       description = COALESCE($2, description),
       price = COALESCE($3, price),
       category = COALESCE($4, category),
       stock = COALESCE($5, stock),
       image = ${image === undefined ? 'image' : '$6'},
       specifications = COALESCE($7, specifications),
       updated_at = NOW()
     WHERE id = ${image === undefined ? '$6' : '$8'}
     RETURNING *`,
    [
      name,
      description,
      price,
      category,
      stock,
      ...(image !== undefined ? [image] : []),
      specifications ? JSON.stringify(specifications) : null,
      id
    ].filter(Boolean)
  );
  
  return result.rows[0] || null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
  return result.rowCount ? result.rowCount > 0 : false;
}

export async function updateProductStock(
  id: string, 
  quantityChange: number
): Promise<Product | null> {
  const result = await query(
    `UPDATE products 
     SET stock = stock + $1, updated_at = NOW()
     WHERE id = $2 AND stock + $1 >= 0
     RETURNING *`,
    [quantityChange, id]
  );
  
  return result.rows[0] || null;
}

export async function checkProductOwner(productId: string, userId: string, requiredRole: UserRole = 'ADMIN'): Promise<boolean> {
  if (requiredRole === 'ADMIN') {
    const userResult = await query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows[0]?.role === 'ADMIN') {
      return true;
    }
  }
  
  const result = await query('SELECT 1 FROM products WHERE id = $1 AND seller_id = $2', [productId, userId]);
  return result.rowCount ? result.rowCount > 0 : false;
}
