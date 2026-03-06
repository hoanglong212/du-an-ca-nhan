CREATE DATABASE IF NOT EXISTS `real_easte_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `real_easte_db`;




SHOW DATABASES;

CREATE TABLE categories (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  PRIMARY KEY (id)
) ENGINE=InnoDB 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','editor') NOT NULL DEFAULT 'editor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP 
    DEFAULT CURRENT_TIMESTAMP 
    ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4;


CREATE TABLE properties  (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    type ENUM('sale', 'rent') NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    area DECIMAL(10,2) NOT NULL,
    bathrooms INT  NULL,
    bedrooms INT  NULL,
    city VARCHAR(255) NOT NULL,
    district VARCHAR(255) NOT NULL,
    ward VARCHAR(255) NOT NULL,
    address_text VARCHAR(255) NOT NULL,
    lat DECIMAL(10,7) NOT NULL,
    lng DECIMAL(10,7) NOT NULL,
    category_id INT NOT NULL,
    description TEXT,
    status ENUM('available', 'sold', 'rented') NOT NULL DEFAULT 'available',
    FOREIGN KEY (category_id) REFERENCES categories(id)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4;

CREATE table property_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_cover BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4;

CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NULL,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(20) NOT NULL,
    message TEXT NULL,
    status ENUM('new', 'contacted', 'closed') NOT NULL DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_contacts_property_id (property_id),

    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4;


CREATE INDEX idx_properties_price ON properties(price);

CREATE INDEX idx_properties_city ON properties(city);

CREATE INDEX idx_properties_district ON properties(district);

CREATE INDEX idx_properties_category ON properties(category_id);

INSERT INTO properties
(title, slug, type, price, area, city, district, category_id)
VALUES
('Đất mặt tiền Tân Bình',
 'dat-mat-tien-tan-binh',
 'sale',
 3200000000,
 80,
 'HCM',
 'Tan Binh',
 1);