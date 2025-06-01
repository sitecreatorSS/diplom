import { query } from '../db';
import { User, UserRole, SellerApplication } from '@/types/database';

type UserCreateInput = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'emailVerified' | 'lastLogin'>;
type UserUpdateInput = Partial<Omit<User, 'id' | 'email' | 'createdAt' | 'updatedAt' | 'emailVerified' | 'lastLogin'>>;

/**
 * Найти пользователя по email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query('SELECT * FROM "User" WHERE email = $1', [email]);
  return result.rows[0] || null;
}

/**
 * Найти пользователя по ID
 */
export async function findUserById(id: string): Promise<User | null> {
  const result = await query('SELECT * FROM "User" WHERE id = $1', [id]);
  return result.rows[0] || null;
}

/**
 * Создать нового пользователя
 */
export async function createUser(userData: UserCreateInput): Promise<User> {
  const { 
    email, 
    name, 
    password, 
    role = 'BUYER',
    image = null,
    phone = null,
    address = null,
    city = null,
    country = null,
    postalCode = null,
    isActive = true
  } = userData;
  
  const result = await query(
    `INSERT INTO "User" (
      email, name, password, role, image, phone, 
      address, city, country, "postalCode", "isActive"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
    RETURNING *`,
    [
      email, 
      name, 
      password, 
      role, 
      image,
      phone,
      address,
      city,
      country,
      postalCode,
      isActive
    ]
  );
  
  return result.rows[0];
}

/**
 * Обновить данные пользователя
 */
export async function updateUser(
  id: string, 
  userData: UserUpdateInput
): Promise<User | null> {
  const { 
    name, 
    password, 
    role, 
    image, 
    phone,
    address,
    city,
    country,
    postalCode,
    isActive
  } = userData;
  
  const result = await query(
    `UPDATE "User" 
     SET 
       name = COALESCE($1, name),
       password = COALESCE($2, password),
       role = COALESCE($3, role),
       image = ${image === undefined ? 'image' : '$4'},
       phone = COALESCE($5, phone),
       address = COALESCE($6, address),
       city = COALESCE($7, city),
       country = COALESCE($8, country),
       "postalCode" = COALESCE($9, "postalCode"),
       "isActive" = COALESCE($10, "isActive"),
       "updatedAt" = NOW()
     WHERE id = ${image === undefined ? '$5' : '$11'}
     RETURNING *`,
    [
      name,
      password,
      role,
      ...(image !== undefined ? [image] : []),
      phone,
      address,
      city,
      country,
      postalCode,
      isActive,
      id
    ].filter(Boolean)
  );
  
  return result.rows[0] || null;
}
