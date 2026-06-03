-- V9: Add venda_pagamento table to support split payments and credit surcharges
-- Creates a payment row per payment used in a sale and backfills existing vendas

CREATE TABLE venda_pagamento (
    id SERIAL PRIMARY KEY,
    fk_venda_id INTEGER NOT NULL,
    metodo_pagamento VARCHAR(50) NOT NULL,
    valor NUMERIC(15,4) NOT NULL,
    acrescimo_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    acrescimo_valor NUMERIC(15,4) NOT NULL DEFAULT 0.0000,
    valor_pago NUMERIC(15,4) NOT NULL,
    parcelas SMALLINT,
    referencia VARCHAR(255),
    fk_usuario_id INTEGER,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Foreign keys and indexes
ALTER TABLE venda_pagamento ADD CONSTRAINT FK_VendaPagamento_Venda FOREIGN KEY (fk_venda_id) REFERENCES venda (id) ON DELETE CASCADE;
ALTER TABLE venda_pagamento ADD CONSTRAINT FK_VendaPagamento_Usuario FOREIGN KEY (fk_usuario_id) REFERENCES usuario (id) ON DELETE SET NULL;
CREATE INDEX idx_vendapagamento_venda ON venda_pagamento (fk_venda_id);
CREATE INDEX idx_vendapagamento_usuario ON venda_pagamento (fk_usuario_id);

-- Backfill: create one payment per existing venda using the venda.metodo_pagamento and valor_total.
-- For CREDITO payments apply a 5% surcharge (acrescimo_percent = 5.00).
INSERT INTO venda_pagamento (fk_venda_id, metodo_pagamento, valor, acrescimo_percent, acrescimo_valor, valor_pago, referencia, fk_usuario_id, criado_em)
SELECT v.id,
       v.metodo_pagamento,
       v.valor_total,
       CASE WHEN v.metodo_pagamento = 'CREDITO' THEN 5.00 ELSE 0.00 END as acrescimo_percent,
       CASE WHEN v.metodo_pagamento = 'CREDITO' THEN round(v.valor_total * 0.05, 4) ELSE 0::numeric END as acrescimo_valor,
       CASE WHEN v.metodo_pagamento = 'CREDITO' THEN v.valor_total + round(v.valor_total * 0.05, 4) ELSE v.valor_total END as valor_pago,
       NULL,
       v.fk_usuario_id,
       CURRENT_TIMESTAMP
FROM venda v;

-- NOTE: this migration does NOT drop the existing venda.metodo_pagamento column.
-- Recommended two-phase rollout:
-- 1) Deploy this migration and server changes that write to venda_pagamento (reading venda.metodo_pagamento if present).
-- 2) Backfill completed here is idempotent; after verifying reads/writes use venda_pagamento, create a follow-up migration to drop venda.metodo_pagamento and any deprecated columns.
