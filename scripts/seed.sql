-- Добавляем тестового пользователя (пароль: test123)
INSERT INTO users (id, email, password, name, role) VALUES
('1', 'admin@example.com', '$2b$10$YourHashedPasswordHere', 'Admin User', 'ADMIN');

-- Добавляем тестовые товары
INSERT INTO products (id, name, description, price, imageUrl, category, size, color, stock, sellerId) VALUES
('1', 'Classic White T-Shirt', 'Comfortable cotton t-shirt', 29.99, '/images/white-tshirt.jpg', 'T-Shirts', 'M', 'White', 100, '1'),
('2', 'Blue Jeans', 'Classic blue denim jeans', 59.99, '/images/blue-jeans.jpg', 'Jeans', '32', 'Blue', 50, '1'),
('3', 'Black Hoodie', 'Warm and cozy hoodie', 79.99, '/images/black-hoodie.jpg', 'Hoodies', 'L', 'Black', 30, '1'),
('4', 'Red Sneakers', 'Stylish red sneakers', 89.99, '/images/red-sneakers.jpg', 'Shoes', '42', 'Red', 25, '1'),
('5', 'Green Jacket', 'Lightweight spring jacket', 129.99, '/images/green-jacket.jpg', 'Jackets', 'M', 'Green', 20, '1'); 