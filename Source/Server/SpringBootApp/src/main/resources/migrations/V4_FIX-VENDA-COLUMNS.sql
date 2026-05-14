-- Corrige restrições incorretas na tabela venda geradas pela migration V2

-- fk_cliente_id: vendas sem cliente devem ser permitidas (NULL)
ALTER TABLE venda ALTER COLUMN fk_cliente_id DROP NOT NULL;

-- valor_total: NUMERIC(10,40) é inválido (escala > precisão); corrige para NUMERIC(15,4)
ALTER TABLE venda ALTER COLUMN valor_total TYPE NUMERIC(15,4);
