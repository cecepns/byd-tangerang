-- Migration: tambahkan kolom lanjutan untuk produk BYD (MySQL)

ALTER TABLE products
  ADD COLUMN slug VARCHAR(255) NULL AFTER name,
  ADD COLUMN description TEXT NULL AFTER short_description,
  ADD COLUMN highlights_json JSON NULL AFTER description,
  ADD COLUMN specs_json JSON NULL AFTER highlights_json,
  ADD COLUMN colors_json JSON NULL AFTER specs_json;

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products (slug);

