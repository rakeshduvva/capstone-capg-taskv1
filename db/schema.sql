-- ShopZone Database Schema

CREATE DATABASE IF NOT EXISTS shopzone;
USE shopzone;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2),
  badge VARCHAR(20),
  rating DECIMAL(2,1) DEFAULT 0,
  reviews INT DEFAULT 0,
  image_url VARCHAR(500),
  description TEXT,
  stock INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','confirmed','shipped','delivered','cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert sample products
INSERT INTO products (name, category, price, old_price, badge, rating, reviews, image_url) VALUES
('Wireless Noise-Cancelling Headphones', 'Electronics', 79.99, 129.99, 'SALE', 4.8, 342, 'https://picsum.photos/seed/headphones/400/400'),
('Premium Leather Backpack', 'Fashion', 59.99, NULL, NULL, 4.6, 218, 'https://picsum.photos/seed/backpack/400/400'),
('Smart Fitness Watch Pro', 'Electronics', 149.99, 199.99, 'SALE', 4.9, 567, 'https://picsum.photos/seed/smartwatch/400/400'),
('Organic Cotton T-Shirt', 'Fashion', 24.99, NULL, 'NEW', 4.4, 89, 'https://picsum.photos/seed/tshirt/400/400'),
('Portable Bluetooth Speaker', 'Electronics', 39.99, 59.99, 'SALE', 4.7, 431, 'https://picsum.photos/seed/speaker/400/400'),
('Stainless Steel Water Bottle', 'Home', 19.99, NULL, NULL, 4.5, 156, 'https://picsum.photos/seed/bottle/400/400'),
('Running Shoes Ultra Boost', 'Sports', 89.99, 119.99, 'SALE', 4.8, 623, 'https://picsum.photos/seed/shoes/400/400'),
('Ceramic Plant Pot Set', 'Home', 34.99, NULL, 'NEW', 4.3, 72, 'https://picsum.photos/seed/plantpot/400/400'),
('USB-C Fast Charging Cable', 'Electronics', 12.99, NULL, NULL, 4.2, 890, 'https://picsum.photos/seed/cable/400/400'),
('Yoga Mat Premium', 'Sports', 29.99, 44.99, 'SALE', 4.6, 234, 'https://picsum.photos/seed/yogamat/400/400'),
('Scented Soy Candle Set', 'Home', 22.99, NULL, 'NEW', 4.7, 167, 'https://picsum.photos/seed/candle/400/400'),
('Denim Jacket Classic Fit', 'Fashion', 69.99, 89.99, 'SALE', 4.5, 198, 'https://picsum.photos/seed/jacket/400/400');
