-- Add estoque_minimo column to produto table
ALTER TABLE produto ADD COLUMN estoque_minimo integer DEFAULT 5 NOT NULL;