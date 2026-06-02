-- V10: Drop venda.metodo_pagamento column now that venda_pagamento is in place
-- WARNING: destructive: ensure backups if this has production data
-- This migration assumes V9_ADD_VENDA_PAGAMENTO.sql has been applied and backfilled existing rows.

ALTER TABLE venda DROP COLUMN IF EXISTS metodo_pagamento;

-- If you also want to remove the PaymentMethod enum usage in code, change the Java model and DTOs after deploying this migration.