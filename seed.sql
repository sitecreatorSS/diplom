-- Создание таблиц (если ещё не созданы)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    name TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    category TEXT,
    stock INTEGER DEFAULT 0,
    seller_id INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL
);

-- Добавление продавца
INSERT INTO users (email, password, role, name)
VALUES ('seller@example.com', 'hashed_password', 'SELLER', 'Продавец')
ON CONFLICT (email) DO NOTHING;

-- Добавление товаров
INSERT INTO products (name, description, price, category, stock, seller_id) VALUES
('Брюки классические', 'Стильные классические брюки для офиса и прогулок.', 2990, 'Брюки', 10, 1),
('Рубаха летняя', 'Лёгкая рубаха для жаркой погоды.', 1990, 'Рубахи', 15, 1),
('Шорты спортивные', 'Удобные шорты для спорта и отдыха.', 1490, 'Шорты', 20, 1),
('Кроссовки Fila', 'Стильные кроссовки Fila для города и спорта.', 4990, 'Обувь', 8, 1);

-- Добавление изображений к товарам
INSERT INTO product_images (product_id, url) VALUES
(1, 'https://raw.githubusercontent.com/Kamar2499/Shop4/refs/heads/master/public/одежда/1.1bryki.webp'),
(2, 'https://raw.githubusercontent.com/Kamar2499/Shop4/refs/heads/master/public/одежда/7.1rybaha.webp'),
(3, 'https://raw.githubusercontent.com/Kamar2499/Shop4/refs/heads/master/public/одежда/7.2rybaha.webp'),
(4, 'https://raw.githubusercontent.com/Kamar2499/Shop4/refs/heads/master/public/одежда/fila.webp'); 