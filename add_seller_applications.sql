-- Создание таблицы заявок на продавца
-- Используем INTEGER для user_id, так как users.id имеет тип INTEGER
CREATE TABLE IF NOT EXISTS seller_applications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  company_description TEXT NOT NULL,
  business_type VARCHAR(100),
  tax_id VARCHAR(100),
  website VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  rejection_reason TEXT,
  review_notes TEXT,
  reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Создание индексов для ускорения поиска
CREATE INDEX IF NOT EXISTS idx_seller_applications_user_id ON seller_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_applications_status ON seller_applications(status);
CREATE INDEX IF NOT EXISTS idx_seller_applications_created_at ON seller_applications(created_at);

-- Добавляем триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_seller_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seller_applications_updated_at
BEFORE UPDATE ON seller_applications
FOR EACH ROW EXECUTE FUNCTION update_seller_applications_updated_at();

-- Добавляем несколько тестовых заявок
INSERT INTO seller_applications (user_id, company_name, company_description, business_type, phone, address, status) 
SELECT 
  id, 
  'Компания ' || name, 
  'Описание бизнеса для ' || name,
  'ИП',
  '+7 (900) 123-45-67',
  'г. Москва, ул. Примерная, д. 1',
  'PENDING'
FROM users 
WHERE role = 'BUYER' 
LIMIT 3
ON CONFLICT (user_id) DO NOTHING;
