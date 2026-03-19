-- Migration: create banners table for hero & promo banners (MySQL)

CREATE TABLE IF NOT EXISTS banners (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT NULL,
  image_url TEXT NULL,
  link_url VARCHAR(255) NULL,
  position ENUM('hero', 'promo') NOT NULL DEFAULT 'hero',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_banners_position ON banners (position);
CREATE INDEX idx_banners_is_active ON banners (is_active);
CREATE INDEX idx_banners_sort_order ON banners (sort_order);

