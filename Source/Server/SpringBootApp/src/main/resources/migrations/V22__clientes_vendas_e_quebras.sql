DO $$
DECLARE
    v_data_corrente TIMESTAMP;
    v_venda_id BIGINT;   
    v_descarte_id INT;
    v_cliente_id INT;
    v_user_id BIGINT;    
    v_produto_record RECORD;
    v_quantidade NUMERIC;
    v_preco_unitario NUMERIC;
    v_subtotal_venda NUMERIC;
    v_forma_pagto TEXT;
    
    v_formas_pagto TEXT[] := ARRAY['PIX', 'DINHEIRO', 'CREDITO', 'DEBITO'];
    v_nomes_clientes TEXT[] := ARRAY['Rodrigo Silva', 'Amanda Costa', 'Lucas Mendes', 'Camila Souza', 'Bruno Alves', 'Juliana Rocha', 'Felipe Santos', 'Beatriz Lima', 'Thiago Ferreira', 'Fernanda Oliveira'];
BEGIN
    -- Captura o usuário ativo no ecossistema
    SELECT id FROM usuario LIMIT 1 INTO v_user_id;
    IF v_user_id IS NULL THEN v_user_id := 1; END IF;

    -- 1. CADASTRAR CLIENTES
    FOR i IN 1..ARRAY_LENGTH(v_nomes_clientes, 1) LOOP
        INSERT INTO cliente (apelido, telefone, aniversario, data_cadastro, created_at, updated_at)
        VALUES (v_nomes_clientes[i], '(11) 9' || (1000 + FLOOR(RANDOM() * 9000))::TEXT || '-' || (1000 + FLOOR(RANDOM() * 9000))::TEXT, '1985-05-15'::DATE, (CURRENT_DATE - INTERVAL '90 days')::TIMESTAMP, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days');
    END LOOP;

    -- 2. CADASTRAR VENDAS HISTÓRICAS (Últimos 90 dias)
    FOR v_dia IN REVERSE 89..1 LOOP
        FOR v_venda_no IN 1..(2 + FLOOR(RANDOM() * 3)) LOOP
            v_cliente_id := NULL;
            IF RANDOM() > 0.5 THEN SELECT id FROM cliente ORDER BY RANDOM() LIMIT 1 INTO v_cliente_id; END IF;

            v_data_corrente := (CURRENT_DATE - (v_dia || ' days')::INTERVAL) + (INTERVAL '10 hours' + (RANDOM() * INTERVAL '9 hours'));
            v_forma_pagto := v_formas_pagto[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_formas_pagto, 1))];
            
            INSERT INTO venda (data_venda, valor_total, desconto, fk_usuario_id, fk_cliente_id, created_at, updated_at)
            VALUES (v_data_corrente, 0.00, false, v_user_id, v_cliente_id, v_data_corrente, v_data_corrente)
            RETURNING id INTO v_venda_id;

            v_subtotal_venda := 0.00;

            FOR v_item IN 1..(1 + FLOOR(RANDOM() * 2)) LOOP
                SELECT id, unidade_medida, preco_venda FROM produto ORDER BY RANDOM() LIMIT 1 INTO v_produto_record;
                
                IF v_produto_record.unidade_medida = 'UN' THEN v_quantidade := 1.00; ELSE v_quantidade := ROUND((0.500 + (RANDOM() * 1.500))::NUMERIC, 3); END IF;
                v_preco_unitario := v_produto_record.preco_venda;
                v_subtotal_venda := v_subtotal_venda + (v_quantidade * v_preco_unitario);

                INSERT INTO movimentacao (quantidade, preco_unitario_compra, preco_unitario_venda, data_validade, tipo_movimentacao, fk_produto_id, fk_venda_id, created_at, updated_at)
                VALUES (-v_quantidade, v_preco_unitario * 0.65, v_preco_unitario, (v_data_corrente::DATE + 30)::DATE, 'VENDA', v_produto_record.id, v_venda_id, v_data_corrente, v_data_corrente);
            END LOOP;

            UPDATE venda SET valor_total = ROUND(v_subtotal_venda::NUMERIC, 2) WHERE id = v_venda_id;

            -- Inserções de Pagamentos com Cast para o seu Enum payment_method
            IF v_forma_pagto = 'CREDITO' THEN
                INSERT INTO venda_pagamento (fk_venda_id, metodo_pagamento, valor, acrescimo_percent, acrescimo_valor, valor_pago, criado_em, created_at, updated_at)
                VALUES (v_venda_id, 'CREDITO'::payment_method, ROUND(v_subtotal_venda::NUMERIC, 2), 5.00, ROUND((v_subtotal_venda * 0.05)::NUMERIC, 2), ROUND((v_subtotal_venda * 1.05)::NUMERIC, 2), NOW(), v_data_corrente, v_data_corrente);
            ELSE
                INSERT INTO venda_pagamento (fk_venda_id, metodo_pagamento, valor, acrescimo_percent, acrescimo_valor, valor_pago, criado_em, created_at, updated_at)
                VALUES (v_venda_id, v_forma_pagto::payment_method, ROUND(v_subtotal_venda::NUMERIC, 2), 0.00, 0.00, ROUND(v_subtotal_venda::NUMERIC, 2), NOW(), v_data_corrente, v_data_corrente);
            END IF;
        END LOOP;
    END LOOP;

    -- 3. CADASTRAR SCENARIO DE QUEBRA < 100G (PERDA DE PESO)
    -- Simula um saldo residual de 40g na Picanha (ID 1) gerando o descarte para zerar o lote na balança
    INSERT INTO venda (data_venda, valor_total, desconto, fk_usuario_id, fk_cliente_id, created_at, updated_at)
    VALUES (NOW(), 69.90, false, v_user_id, NULL, NOW(), NOW()) RETURNING id INTO v_venda_id;
    
    INSERT INTO descarte (data_descarte, motivo, created_at, updated_at) VALUES (CURRENT_DATE, 'PERDA_PESO', NOW(), NOW()) RETURNING id INTO v_descarte_id;
    
    INSERT INTO movimentacao (quantidade, preco_unitario_compra, preco_unitario_venda, tipo_movimentacao, fk_produto_id, fk_descarte_id, created_at, updated_at)
    VALUES (-0.040, 0.00, 0.00, 'DESCARTE', 1, v_descarte_id, NOW(), NOW());

    -- 4. CADASTRAR SCENARIO DE VENCIMENTO HOJE (Salmão ID 7)
    INSERT INTO descarte (data_descarte, motivo, created_at, updated_at) VALUES (CURRENT_DATE, 'VENCIMENTO', NOW(), NOW()) RETURNING id INTO v_descarte_id;
    
    INSERT INTO movimentacao (quantidade, preco_unitario_compra, preco_unitario_venda, data_validade, tipo_movimentacao, fk_produto_id, fk_descarte_id, created_at, updated_at)
    VALUES (-12.400, 0.00, 0.00, CURRENT_DATE, 'DESCARTE', 7, v_descarte_id, NOW(), NOW());

END $$;

-- 5. CADASTRAR DESPESAS OPERACIONAIS FIXAS (Para cálculo de fluxo de caixa no dashboard)
INSERT INTO despesa (valor, descricao, categoria, data_despesa, created_at, updated_at) VALUES 
(1200.00, 'Aluguel do Ponto Comercial', 'Infraestrutura', CURRENT_DATE - INTERVAL '30 days', NOW(), NOW()),
(450.30, 'Conta de Energia Elétrica (Câmaras Frias)', 'Utilidades', CURRENT_DATE - INTERVAL '15 days', NOW(), NOW()),
(180.00, 'Insumos de Embalagem a Vácuo', 'Operação', CURRENT_DATE - INTERVAL '5 days', NOW(), NOW());

-- 6. REAJUSTE E ALINHAMENTO IMPERATIVO DAS SEQUENCES
SELECT setval(pg_get_serial_sequence('categoria', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM categoria;
SELECT setval(pg_get_serial_sequence('marca', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM marca;
SELECT setval(pg_get_serial_sequence('produto', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM produto;
SELECT setval(pg_get_serial_sequence('cliente', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM cliente;
SELECT setval(pg_get_serial_sequence('compra', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM compra;
SELECT setval(pg_get_serial_sequence('venda', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM venda;
SELECT setval(pg_get_serial_sequence('movimentacao', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM movimentacao;
SELECT setval(pg_get_serial_sequence('venda_pagamento', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM venda_pagamento;