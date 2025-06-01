-- Создаем таблицу пользователей
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- Для SQLite используем VARCHAR для ENUM
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Создаем таблицу товаров
CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price REAL NOT NULL, -- Для SQLite используем REAL для FLOAT
    imageUrl VARCHAR(255),
    category VARCHAR(255),
    size VARCHAR(255),
    color VARCHAR(255),
    stock INTEGER NOT NULL,
    sellerId VARCHAR(255) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sellerId) REFERENCES users(id) ON DELETE CASCADE
);

-- Создаем таблицу корзин
CREATE TABLE carts (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255) UNIQUE NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Создаем таблицу элементов корзины
CREATE TABLE cart_items (
    id VARCHAR(255) PRIMARY KEY,
    cartId VARCHAR(255) NOT NULL,
    productId VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cartId) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
); 