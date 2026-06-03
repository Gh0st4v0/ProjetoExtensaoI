-- V12: Convert venda.data_venda (DATE) to TIMESTAMP and set default to current timestamp
-- Backfill: convert existing DATE values to TIMESTAMP at midnight

ALTER TABLE venda ALTER COLUMN data_venda TYPE TIMESTAMP USING data_venda::timestamp;
ALTER TABLE venda ALTER COLUMN data_venda SET DEFAULT CURRENT_TIMESTAMP;

-- NOTE: This migration keeps the column name data_venda for compatibility while changing its type to TIMESTAMP.
-- After rollout, remove any old code paths that assume date-only semantics if needed.
