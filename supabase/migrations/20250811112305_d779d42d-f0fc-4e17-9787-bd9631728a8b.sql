-- Rename tags table to collection
ALTER TABLE tags RENAME TO collection;

-- Rename product_tags table to product_collections
ALTER TABLE product_tags RENAME TO product_collections;

-- Update the foreign key column name for clarity
ALTER TABLE product_collections RENAME COLUMN tag_id TO collection_id;