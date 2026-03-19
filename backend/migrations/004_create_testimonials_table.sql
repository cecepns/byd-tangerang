-- Migration: create testimonials table for customer reviews (MySQL)

CREATE TABLE IF NOT EXISTS testimonials (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  city VARCHAR(120) NULL,
  title VARCHAR(255) NULL,
  message TEXT NOT NULL,
  rating TINYINT UNSIGNED NULL,
  image_url TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_testimonials_is_active ON testimonials (is_active);
CREATE INDEX idx_testimonials_sort_order ON testimonials (sort_order);

