DO $$
DECLARE
    v_compra_id BIGINT;
    v_produto_record RECORD;
BEGIN
    -- Abastecimento em lote para os 15 produtos cadastrados na V20
    FOR v_produto_record IN SELECT id, preco_venda FROM produto LOOP
        INSERT INTO compra (data_compra, created_at, updated_at) 
        VALUES (CURRENT_DATE - INTERVAL '90 days', NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days')
        RETURNING id INTO v_compra_id;

        -- Injeta 300 Kg/Unidades de saldo para cada item iniciar com estoque positivo robusto
        INSERT INTO movimentacao (quantidade, preco_unitario_compra, preco_unitario_venda, data_validade, tipo_movimentacao, fk_produto_id, fk_compra_id, created_at, updated_at)
        VALUES (300.00, v_produto_record.preco_venda * 0.65, v_produto_record.preco_venda, CURRENT_DATE + INTERVAL '60 days', 'COMPRA', v_produto_record.id, v_compra_id, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days');
    END LOOP;
END $$;