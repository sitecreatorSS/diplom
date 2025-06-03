-- Создание перечисляемых типов (ENUM)
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('ADMIN', 'SELLER', 'BUYER');

CREATE TYPE IF NOT EXISTS order_status AS ENUM (
    'PENDING_PAYMENT',
    'PAYMENT_RECEIVED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED'
);

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  email_verified TIMESTAMP WITH TIME ZONE,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'BUYER',
  image VARCHAR(512),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Таблица заявок на продавца
CREATE TABLE IF NOT EXISTS "SellerApplication" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  company_description TEXT NOT NULL,
  tax_id VARCHAR(100),
  website VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  rejection_reason TEXT,
  processed_by_id UUID REFERENCES "User"(id) ON DELETE SET NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Таблица категорий товаров
CREATE TABLE IF NOT EXISTS "Category" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES "Category"(id) ON DELETE SET NULL,
  image VARCHAR(512),
  is_featured BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Таблица тегов
CREATE TABLE IF NOT EXISTS "Tag" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Таблица товаров
CREATE TABLE IF NOT EXISTS "Product" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category_id UUID REFERENCES "Category"(id) ON DELETE SET NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image VARCHAR(512),
  seller_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  specifications JSONB,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  sku VARCHAR(100),
  weight DECIMAL(10, 2),
  dimensions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Таблица связи товаров и тегов (многие-ко-многим)
CREATE TABLE IF NOT EXISTS "ProductTag" (
  product_id UUID NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES "Tag"(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (product_id, tag_id)
);

-- Таблица изображений товаров
CREATE TABLE IF NOT EXISTS "ProductImage" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
  url VARCHAR(512) NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Таблица отзывов
CREATE TABLE IF NOT EXISTS "Review" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  response TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS "Order" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  total DECIMAL(10, 2) NOT NULL,
  status order_status NOT NULL DEFAULT 'PENDING_PAYMENT',
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  payment_method VARCHAR(100) NOT NULL,
  payment_id VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'PENDING',
  payment_details JSONB,
  shipping_method VARCHAR(100),
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tracking_number VARCHAR(100),
  tracking_url VARCHAR(512),
  notes TEXT,
  customer_note TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Таблица позиций заказа
CREATE TABLE IF NOT EXISTS "OrderItem" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES "Product"(id) ON DELETE RESTRICT,
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(512),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  variant_id UUID,
  variant_name VARCHAR(100),
  sku VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Таблица корзины
CREATE TABLE IF NOT EXISTS "CartItem" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_addition DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Таблица избранного
CREATE TABLE IF NOT EXISTS "WishlistItem" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Таблица уведомлений
CREATE TABLE IF NOT EXISTS "Notification" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  type VARCHAR(50) NOT NULL,
  related_id UUID,
  related_type VARCHAR(50),
  action_url VARCHAR(512),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Таблица аудита
CREATE TABLE IF NOT EXISTS "AuditLog" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "User"(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Индексы для ускорения поиска
CREATE INDEX idx_product_category ON "Product"(category_id);
CREATE INDEX idx_product_seller ON "Product"(seller_id);
CREATE INDEX idx_order_user ON "Order"(user_id);
CREATE INDEX idx_order_status ON "Order"(status);
CREATE INDEX idx_review_product ON "Review"(product_id);
CREATE INDEX idx_review_user ON "Review"(user_id);
CREATE INDEX idx_cart_user ON "CartItem"(user_id);
CREATE INDEX idx_wishlist_user ON "WishlistItem"(user_id);
CREATE INDEX idx_notification_user ON "Notification"(user_id);
CREATE INDEX idx_notification_read ON "Notification"(is_read);
CREATE INDEX idx_audit_entity ON "AuditLog"(entity_type, entity_id);

-- Функция для обновления поля updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_user_updated_at
BEFORE UPDATE ON "User"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_updated_at
BEFORE UPDATE ON "Product"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_updated_at
BEFORE UPDATE ON "Category"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tag_updated_at
BEFORE UPDATE ON "Tag"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_image_updated_at
BEFORE UPDATE ON "ProductImage"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_updated_at
BEFORE UPDATE ON "Review"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_updated_at
BEFORE UPDATE ON "Order"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_item_updated_at
BEFORE UPDATE ON "OrderItem"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_item_updated_at
BEFORE UPDATE ON "CartItem"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_item_updated_at
BEFORE UPDATE ON "WishlistItem"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_updated_at
BEFORE UPDATE ON "Notification"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для обновления рейтинга товара
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "Product" SET
    rating = (
      SELECT AVG(rating)::numeric(3,2)
      FROM "Review"
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
      AND is_approved = true
    ),
    review_count = (
      SELECT COUNT(*)
      FROM "Review"
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
      AND is_approved = true
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для обновления рейтинга товара
CREATE TRIGGER update_product_rating_after_insert
AFTER INSERT ON "Review"
FOR EACH ROW
WHEN (NEW.is_approved = true)
EXECUTE FUNCTION update_product_rating();

CREATE TRIGGER update_product_rating_after_update
AFTER UPDATE ON "Review"
FOR EACH ROW
WHEN (OLD.is_approved IS DISTINCT FROM NEW.is_approved OR OLD.rating IS DISTINCT FROM NEW.rating)
EXECUTE FUNCTION update_product_rating();

CREATE TRIGGER update_product_rating_after_delete
AFTER DELETE ON "Review"
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();
