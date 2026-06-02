CREATE DATABASE IF NOT EXISTS SMS;
USE SMS;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  product_code VARCHAR(30) PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  category VARCHAR(80) NOT NULL,
  quantity_in_stock INT NOT NULL DEFAULT 0,
  unit_price DECIMAL(12,2) NOT NULL,
  supplier_name VARCHAR(100) NOT NULL,
  date_received DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS warehouses (
  warehouse_code VARCHAR(30) PRIMARY KEY,
  warehouse_name VARCHAR(100) NOT NULL,
  warehouse_location VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_transactions (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_date DATETIME NOT NULL,
  quantity_moved INT NOT NULL,
  transaction_type ENUM('IN','OUT') NOT NULL,
  product_code VARCHAR(30) NOT NULL,
  warehouse_code VARCHAR(30) NOT NULL,
  FOREIGN KEY (product_code) REFERENCES products(product_code),
  FOREIGN KEY (warehouse_code) REFERENCES warehouses(warehouse_code)
);

INSERT INTO users (username, email, password)
VALUES ('admin', 'admin@exam.local', '$2b$10$aULsUjp9bb9lf5CZZyY.7./KhwsocVO0duyPlqu0Qnte75xHBdG5C')
ON DUPLICATE KEY UPDATE username = username;
