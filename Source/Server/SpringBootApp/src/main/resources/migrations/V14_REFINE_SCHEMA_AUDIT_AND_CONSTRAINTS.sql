-- V14_REFINE_SCHEMA_AUDIT_AND_CONSTRAINTS.sql
-- Refine column types, add integrity checks, ensure FK behaviors include ON UPDATE, and add audit columns + triggers.
-- BACKUP your DB before applying this migration in production.

-- 1) Column type updates
ALTER TABLE usuario ALTER COLUMN senha TYPE CHAR(60) USING left(senha,60)::char(60);

ALTER TABLE venda ALTER COLUMN valor_total TYPE NUMERIC(10,2) USING round(COALESCE(valor_total,0)::numeric,2);

-- 2) Add integrity check constraints (NOT VALID to avoid failing on existing data). Validate later if desired.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_produto_preco_venda_non_negative') THEN
        ALTER TABLE produto ADD CONSTRAINT chk_produto_preco_venda_non_negative CHECK (preco_venda >= 0) NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_movimentacao_quantidade_non_negative') THEN
        ALTER TABLE movimentacao ADD CONSTRAINT chk_movimentacao_quantidade_non_negative CHECK (quantidade >= 0) NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_movimentacao_preco_unitario_compra_non_negative') THEN
        ALTER TABLE movimentacao ADD CONSTRAINT chk_movimentacao_preco_unitario_compra_non_negative CHECK (preco_unitario_compra >= 0) NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_movimentacao_preco_unitario_venda_non_negative') THEN
        ALTER TABLE movimentacao ADD CONSTRAINT chk_movimentacao_preco_unitario_venda_non_negative CHECK (preco_unitario_venda >= 0) NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_venda_valor_total_non_negative') THEN
        ALTER TABLE venda ADD CONSTRAINT chk_venda_valor_total_non_negative CHECK (valor_total >= 0) NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_vendapagamento_valor_non_negative') THEN
        ALTER TABLE venda_pagamento ADD CONSTRAINT chk_vendapagamento_valor_non_negative CHECK (valor >= 0) NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_vendapagamento_valor_pago_non_negative') THEN
        ALTER TABLE venda_pagamento ADD CONSTRAINT chk_vendapagamento_valor_pago_non_negative CHECK (valor_pago >= 0) NOT VALID;
    END IF;
END
$$;

-- 3) Recreate FK constraints with explicit ON UPDATE behavior (keep existing ON DELETE semantics). Drop if exists and re-add.

-- Produto -> Categoria
ALTER TABLE produto DROP CONSTRAINT IF EXISTS FK_Produto_2;
ALTER TABLE produto ADD CONSTRAINT FK_Produto_2 FOREIGN KEY (fk_Categoria_id) REFERENCES Categoria (id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Produto -> Marca
ALTER TABLE produto DROP CONSTRAINT IF EXISTS FK_Produto_3;
ALTER TABLE produto ADD CONSTRAINT FK_Produto_3 FOREIGN KEY (fk_Marca_id) REFERENCES Marca (id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Venda -> Usuario
ALTER TABLE venda DROP CONSTRAINT IF EXISTS FK_Venda_2;
ALTER TABLE venda ADD CONSTRAINT FK_Venda_2 FOREIGN KEY (fk_Usuario_id) REFERENCES Usuario (id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Venda -> Cliente (SET NULL on delete stays)
ALTER TABLE venda DROP CONSTRAINT IF EXISTS FK_Venda_3;
ALTER TABLE venda ADD CONSTRAINT FK_Venda_3 FOREIGN KEY (fk_cliente_id) REFERENCES cliente (id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Movimentacao -> Produto
ALTER TABLE movimentacao DROP CONSTRAINT IF EXISTS FK_Movimentacao_2;
ALTER TABLE movimentacao ADD CONSTRAINT FK_Movimentacao_2 FOREIGN KEY (fk_Produto_id) REFERENCES Produto (id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Movimentacao -> Compra
ALTER TABLE movimentacao DROP CONSTRAINT IF EXISTS FK_Movimentacao_3;
ALTER TABLE movimentacao ADD CONSTRAINT FK_Movimentacao_3 FOREIGN KEY (fk_Compra_id) REFERENCES Compra (id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Movimentacao -> Descarte
ALTER TABLE movimentacao DROP CONSTRAINT IF EXISTS FK_Movimentacao_4;
ALTER TABLE movimentacao ADD CONSTRAINT FK_Movimentacao_4 FOREIGN KEY (fk_Descarte_id) REFERENCES Descarte (id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Movimentacao -> Venda
ALTER TABLE movimentacao DROP CONSTRAINT IF EXISTS FK_Movimentacao_5;
ALTER TABLE movimentacao ADD CONSTRAINT FK_Movimentacao_5 FOREIGN KEY (fk_Venda_id) REFERENCES Venda (id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Consentimentos FKs (from V8)
ALTER TABLE consentimentos DROP CONSTRAINT IF EXISTS FK_Consentimentos_Cliente;
ALTER TABLE consentimentos ADD CONSTRAINT FK_Consentimentos_Cliente FOREIGN KEY (fk_cliente_id) REFERENCES cliente (id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE consentimentos DROP CONSTRAINT IF EXISTS FK_Consentimentos_Usuario;
ALTER TABLE consentimentos ADD CONSTRAINT FK_Consentimentos_Usuario FOREIGN KEY (fk_usuario_id) REFERENCES usuario (id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE consentimentos DROP CONSTRAINT IF EXISTS FK_Consentimentos_Termo;
ALTER TABLE consentimentos ADD CONSTRAINT FK_Consentimentos_Termo FOREIGN KEY (fk_termo_id) REFERENCES termos (id) ON DELETE SET NULL ON UPDATE CASCADE;

-- venda_pagamento FKs (from V9)
ALTER TABLE venda_pagamento DROP CONSTRAINT IF EXISTS FK_VendaPagamento_Venda;
ALTER TABLE venda_pagamento ADD CONSTRAINT FK_VendaPagamento_Venda FOREIGN KEY (fk_venda_id) REFERENCES venda (id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE venda_pagamento DROP CONSTRAINT IF EXISTS FK_VendaPagamento_Usuario;
ALTER TABLE venda_pagamento ADD CONSTRAINT FK_VendaPagamento_Usuario FOREIGN KEY (fk_usuario_id) REFERENCES usuario (id) ON DELETE SET NULL ON UPDATE CASCADE;

-- 4) Add audit columns (created_at, updated_at) to main tables if not present
ALTER TABLE produto ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE produto ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE categoria ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE categoria ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE marca ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE marca ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE usuario ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE compra ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE compra ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE venda ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE venda ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE movimentacao ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE movimentacao ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE descarte ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE descarte ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE cliente ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE cliente ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE despesa ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE venda_pagamento ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE venda_pagamento ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE recuperacao_senha_token ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE recuperacao_senha_token ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE termos ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE termos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE consentimentos ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE consentimentos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 5) Create or replace trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers to tables (drop if exists then create)

DO $$
BEGIN
    -- produto
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='produto' AND column_name='updated_at') THEN
        PERFORM 1;
        IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_produto_update_updated_at') THEN
            EXECUTE 'DROP TRIGGER IF EXISTS trg_produto_update_updated_at ON produto';
        END IF;
        EXECUTE 'CREATE TRIGGER trg_produto_update_updated_at BEFORE UPDATE ON produto FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
    END IF;

    -- categoria
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categoria' AND column_name='updated_at') THEN
        EXECUTE 'DROP TRIGGER IF EXISTS trg_categoria_update_updated_at ON categoria';
        EXECUTE 'CREATE TRIGGER trg_categoria_update_updated_at BEFORE UPDATE ON categoria FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
    END IF;

    -- marca
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marca' AND column_name='updated_at') THEN
        EXECUTE 'DROP TRIGGER IF EXISTS trg_marca_update_updated_at ON marca';
        EXECUTE 'CREATE TRIGGER trg_marca_update_updated_at BEFORE UPDATE ON marca FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
    END IF;

    -- usuario
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usuario' AND column_name='updated_at') THEN
        EXECUTE 'DROP TRIGGER IF EXISTS trg_usuario_update_updated_at ON usuario';
        EXECUTE 'CREATE TRIGGER trg_usuario_update_updated_at BEFORE UPDATE ON usuario FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
    END IF;

    -- compra
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='compra' AND column_name='updated_at') THEN
        EXECUTE 'DROP TRIGGER IF EXISTS trg_compra_update_updated_at ON compra';
        EXECUTE 'CREATE TRIGGER trg_compra_update_updated_at BEFORE UPDATE ON compra FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
    END IF;

    -- venda
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='venda' AND column_name='updated_at') THEN
        EXECUTE 'DROP TRIGGER IF EXISTS trg_venda_update_updated_at ON venda';
        EXECUTE 'CREATE TRIGGER trg_venda_update_updated_at BEFORE UPDATE ON venda FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
    END IF;

    -- movimentacao
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='movimentacao' AND column_name='updated_at') THEN
        EXECUTE 'DROP TRIGGER IF EXISTS trg_movimentacao_update_updated_at ON movimentacao';
        EXECUTE 'CREATE TRIGGER trg_movimentacao_update_updated_at BEFORE UPDATE ON movimentacao FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
    END IF;

    -- descarte
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='descarte' AND column_name='updated_at') THEN
        EXECUTE 'DROP TRIGGER IF EXISTS trg_descarte_update_updated_at ON descarte';
        EXECUTE 'CREATE TRIGGER trg_descarte_update_updated_at BEFORE UPDATE ON descarte FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
    END IF;

    -- cliente
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cliente' AND column_name='updated_at') THEN
        EXECUTE 'DROP TRIGGER IF EXISTS trg_cliente_update_updated_at ON cliente';
        EXECUTE 'CREATE TRIGGER trg_cliente_update_updated_at BEFORE UPDATE ON cliente FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
    END IF;

    -- despesa
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='despesa' AND column_name='updated_at') THEN
        EXECUTE 'DROP TRIGGER IF EXISTS trg_despesa_update_updated_at ON despesa';
        EXECUTE 'CREATE TRIGGER trg_despesa_update_updated_at BEFORE UPDATE ON despesa FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
    END IF;

    -- venda_pagamento
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='venda_pagamento' AND column_name='updated_at') THEN
        EXECUTE 'DROP TRIGGER IF EXISTS trg_venda_pagamento_update_updated_at ON venda_pagamento';
        EXECUTE 'CREATE TRIGGER trg_venda_pagamento_update_updated_at BEFORE UPDATE ON venda_pagamento FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
    END IF;

    -- recuperacao_senha_token
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recuperacao_senha_token' AND column_name='updated_at') THEN
        EXECUTE 'DROP TRIGGER IF EXISTS trg_recuperacao_senha_token_update_updated_at ON recuperacao_senha_token';
        EXECUTE 'CREATE TRIGGER trg_recuperacao_senha_token_update_updated_at BEFORE UPDATE ON recuperacao_senha_token FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
    END IF;

    -- termos
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='termos' AND column_name='updated_at') THEN
        EXECUTE 'DROP TRIGGER IF EXISTS trg_termos_update_updated_at ON termos';
        EXECUTE 'CREATE TRIGGER trg_termos_update_updated_at BEFORE UPDATE ON termos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
    END IF;

    -- consentimentos
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='consentimentos' AND column_name='updated_at') THEN
        EXECUTE 'DROP TRIGGER IF EXISTS trg_consentimentos_update_updated_at ON consentimentos';
        EXECUTE 'CREATE TRIGGER trg_consentimentos_update_updated_at BEFORE UPDATE ON consentimentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
    END IF;
END
$$;

-- End of V14
