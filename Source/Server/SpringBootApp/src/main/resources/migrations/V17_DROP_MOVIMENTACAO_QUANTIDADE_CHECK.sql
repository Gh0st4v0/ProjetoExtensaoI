-- V17_DROP_MOVIMENTACAO_QUANTIDADE_CHECK.sql
-- Drop incorrect non-negative check on movimentacao.quantidade; sales use negative quantities to record stock outflows.
-- This migration is idempotent and safe to run against existing databases.

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_movimentacao_quantidade_non_negative') THEN
        ALTER TABLE movimentacao DROP CONSTRAINT chk_movimentacao_quantidade_non_negative;
    END IF;
END
$$;
