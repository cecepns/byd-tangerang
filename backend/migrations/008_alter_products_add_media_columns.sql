-- Migration: add media JSON columns for products (MySQL)

ALTER TABLE products
  ADD COLUMN description TEXT NULL AFTER short_description,
  ADD COLUMN highlights_json JSON NULL AFTER description,
  ADD COLUMN specs_json JSON NULL AFTER highlights_json,
  ADD COLUMN colors_json JSON NULL AFTER specs_json,
  ADD COLUMN exterior_media_json JSON NULL AFTER colors_json,
  ADD COLUMN interior_media_json JSON NULL AFTER exterior_media_json,
  ADD COLUMN gallery_media_json JSON NULL AFTER interior_media_json;

