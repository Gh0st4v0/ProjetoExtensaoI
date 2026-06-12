-- =============================================================================
-- 1. EXTERMÍNIO DE DADOS ANTERIORES E FANTASMAS
-- =============================================================================
TRUNCATE TABLE 
    venda_pagamento, 
    movimentacao, 
    venda, 
    produto, 
    marca, 
    categoria, 
    despesa, 
    descarte, 
    consentimentos, 
    termos, 
    configuracoes, 
    cliente, 
    compra
RESTART IDENTITY CASCADE;

-- =============================================================================
-- 2. CADASTROS ESTÁTICOS 
-- =============================================================================
INSERT INTO configuracoes (lucro_esperado, taxa_debito, taxa_credito, acrescimo_credito, created_at, updated_at) 
VALUES (35.00, 1.99, 4.99, 5.00, NOW(), NOW());

INSERT INTO termos (conteudo, criado_em, created_at, updated_at) 
VALUES ('Autorizo o uso dos meus dados para fins de cadastro, programas de privacidade e promoções, conforme a LGPD.', NOW(), NOW(), NOW());

INSERT INTO categoria (nome, created_at, updated_at) VALUES 
('Carnes Bovinas', NOW(), NOW()),
('Aves e Peixes', NOW(), NOW()),
('Linguiças e Embutidos', NOW(), NOW()),
('Acompanhamentos e Churrasco', NOW(), NOW());

INSERT INTO marca (nome, created_at, updated_at) VALUES 
('Frisa', NOW(), NOW()),
('Minerva', NOW(), NOW()),
('Seara', NOW(), NOW()),
('Friboi', NOW(), NOW()),
('Boutique da Casa', NOW(), NOW());

-- CORREÇÃO: Nomes limpos sem o termo "A Vácuo"
INSERT INTO produto (nome, unidade_medida, codigo, perecivel, preco_venda, fk_categoria_id, fk_marca_id, estoque_minimo, created_at, updated_at) VALUES 
-- Cortes Bovinos (Por KG) - IDs 1 a 6
('Picanha Tradicional', 'KG', 'BOV001', true, 69.90, 1, 4, 10, NOW(), NOW()),
('Contra Filé', 'KG', 'BOV002', true, 48.90, 1, 4, 8, NOW(), NOW()),
('Bife de Chorizo', 'KG', 'BOV003', true, 54.90, 1, 2, 6, NOW(), NOW()),
('Bife Ancho', 'KG', 'BOV004', true, 54.90, 1, 2, 6, NOW(), NOW()),
('Alcatra com Maminha', 'KG', 'BOV005', true, 44.90, 1, 1, 8, NOW(), NOW()),
('Fraldinha para Churrasco', 'KG', 'BOV006', true, 39.90, 1, 4, 7, NOW(), NOW()),

-- Aves e Peixes (Por KG) - IDs 7 a 9
('Filé de Salmão em Postas', 'KG', 'PEI001', true, 79.90, 2, 5, 5, NOW(), NOW()),
('Tulipa de Frango Temperada', 'KG', 'FRA001', true, 21.90, 2, 3, 10, NOW(), NOW()),
('Coração de Frango Temperado', 'KG', 'FRA002', true, 26.90, 2, 3, 8, NOW(), NOW()),

-- Linguiças e Embutidos (Por KG) - IDs 10 e 11
('Linguiça Calabresa Defumada', 'KG', 'EMB001', true, 25.90, 3, 3, 12, NOW(), NOW()),
('Linguiça Toscana para Churrasco', 'KG', 'EMB002', true, 19.90, 3, 3, 15, NOW(), NOW()),

-- Itens por Unidade (UN) - IDs 12 a 15
('Carvão Vegetal 5kg', 'UN', 'CAR005', false, 24.90, 4, 5, 20, NOW(), NOW()),
('Sal de Parrilla Tradicional 1kg', 'UN', 'SAL001', false, 11.90, 4, 5, 30, NOW(), NOW()),
('Pacote de Pão de Alho Tradicional', 'UN', 'PAO001', true, 13.90, 4, 5, 15, NOW(), NOW()),
('Pacote de Queijo Coalho para Churrasco', 'UN', 'QJO001', true, 16.50, 4, 5, 12, NOW(), NOW());

-- =============================================================================
-- 4. SIMULAÇÃO HISTÓRICA INTELIGENTE (90 DIAS) - VERSÃO CORRIGIDA SEM COLUNA "DATA"
-- =============================================================================
DO $$
DECLARE
    v_data_corrente TIMESTAMP;
    v_compra_id INT;
    v_venda_id INT;
    v_descarte_id INT;
    v_cliente_id INT;
    v_user_id INT;
    v_produto_record RECORD;
    v_quantidade DECIMAL;
    v_preco_unitario DECIMAL;
    v_subtotal_venda DECIMAL;
    v_forma_pagto TEXT;
    
    v_formas_pagto TEXT[] := ARRAY['PIX', 'DINHEIRO', 'CREDITO', 'DEBITO'];
    v_nomes_clientes TEXT[] := ARRAY['Rodrigo Silva', 'Amanda Costa', 'Lucas Mendes', 'Camila Souza', 'Bruno Alves', 'Juliana Rocha', 'Felipe Santos', 'Beatriz Lima', 'Thiago Ferreira', 'Fernanda Oliveira'];
BEGIN
    SELECT id FROM usuario LIMIT 1 INTO v_user_id;
    IF v_user_id IS NULL THEN v_user_id := 1; END IF;

    -- 4.1 GERAÇÃO DE CLIENTES DE FIDELIDADE
    FOR i IN 1..ARRAY_LENGTH(v_nomes_clientes, 1) LOOP
        INSERT INTO cliente (apelido, telefone, aniversario, data_cadastro, created_at, updated_at)
        VALUES (v_nomes_clientes[i], '(11) 9' || (1000 + FLOOR(RANDOM() * 9000))::TEXT || '-' || (1000 + FLOOR(RANDOM() * 9000))::TEXT, '1985-05-15'::DATE, CURRENT_DATE - INTERVAL '90 days', NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days');
    END LOOP;

    -- 4.2 COMPRA BRUTA INICIAL (Há 90 dias)
    FOR v_produto_record IN SELECT id, preco_venda FROM produto LOOP
        INSERT INTO compra (data_compra, created_at, updated_at) 
        VALUES (CURRENT_DATE - INTERVAL '90 days', NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days')
        RETURNING id INTO v_compra_id;

        INSERT INTO movimentacao (quantidade, preco_unitario_compra, preco_unitario_venda, data_validade, tipo_movimentacao, fk_produto_id, fk_compra_id, created_at, updated_at)
        VALUES (300.00, v_produto_record.preco_venda * 0.65, v_produto_record.preco_venda, CURRENT_DATE + INTERVAL '60 days', 'COMPRA', v_produto_record.id, v_compra_id, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days');
    END LOOP;

    -- 4.3 HISTÓRICO DE DIAS ANTERIORES
    FOR v_dia IN REVERSE 89..1 LOOP
        FOR v_venda_no IN 1..(2 + FLOOR(RANDOM() * 4)) LOOP
            v_cliente_id := NULL;
            IF RANDOM() > 0.5 THEN SELECT id FROM cliente ORDER BY RANDOM() LIMIT 1 INTO v_cliente_id; END IF;

            v_data_corrente := (CURRENT_DATE - (v_dia || ' days')::INTERVAL) + (INTERVAL '10 hours' + (RANDOM() * INTERVAL '9 hours'));
            v_forma_pagto := v_formas_pagto[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_formas_pagto, 1))];
            
            -- CORREÇÃO AQUI: Removida a coluna "data" que causava o erro na esteira
            INSERT INTO venda (data_venda, valor_total, desconto, fk_usuario_id, fk_cliente_id, created_at, updated_at)
            VALUES (v_data_corrente, 0.00, 0.00, v_user_id, v_cliente_id, v_data_corrente, v_data_corrente)
            RETURNING id INTO v_venda_id;

            v_subtotal_venda := 0.00;

            FOR v_item IN 1..(1 + FLOOR(RANDOM() * 3)) LOOP
                SELECT id, unidade_medida, preco_venda FROM produto ORDER BY RANDOM() LIMIT 1 INTO v_produto_record;
                
                IF v_produto_record.unidade_medida = 'UN' THEN v_quantidade := 1; ELSE v_quantidade := ROUND((0.600 + (RANDOM() * 1.500))::NUMERIC, 3); END IF;
                v_preco_unitario := v_produto_record.preco_venda;
                v_subtotal_venda := v_subtotal_venda + (v_quantidade * v_preco_unitario);

                INSERT INTO movimentacao (quantidade, preco_unitario_compra, preco_unitario_venda, data_validade, tipo_movimentacao, fk_produto_id, fk_venda_id, created_at, updated_at)
                VALUES (-v_quantidade, v_preco_unitario * 0.65, v_preco_unitario, v_data_corrente::DATE + 30, 'VENDA', v_produto_record.id, v_venda_id, v_data_corrente, v_data_corrente);
            END LOOP;

            UPDATE venda SET valor_total = ROUND(v_subtotal_venda::NUMERIC, 2) WHERE id = v_venda_id;

            IF v_forma_pagto = 'CREDITO' THEN
                INSERT INTO venda_pagamento (fk_venda_id, metodo_pagamento, valor, acrescimo_percent, acrescimo_valor, valor_pago, criado_em, created_at, updated_at)
                VALUES (v_venda_id, 'CREDITO', ROUND(v_subtotal_venda::NUMERIC, 2), 5.00, ROUND((v_subtotal_venda * 0.05)::NUMERIC, 2), ROUND((v_subtotal_venda * 1.05)::NUMERIC, 2), NOW(), v_data_corrente, v_data_corrente);
            ELSE
                INSERT INTO venda_pagamento (fk_venda_id, metodo_pagamento, valor, acrescimo_percent, acrescimo_valor, valor_pago, criado_em, created_at, updated_at)
                VALUES (v_venda_id, v_forma_pagto, ROUND(v_subtotal_venda::NUMERIC, 2), 0.00, 0.00, ROUND(v_subtotal_venda::NUMERIC, 2), NOW(), v_data_corrente, v_data_corrente);
            END IF;
        END LOOP;
    END LOOP;

    -- =========================================================================
    -- SCENARIO DE APRESENTAÇÃO 1: PRODUTO QUE VENCE HOJE (SALMÃO) + DESCARTE
    -- =========================================================================
    INSERT INTO compra (data_compra, created_at, updated_at) VALUES (CURRENT_DATE - INTERVAL '15 days', NOW(), NOW()) RETURNING id INTO v_compra_id;
    INSERT INTO movimentacao (quantidade, preco_unitario_compra, preco_unitario_venda, data_validade, tipo_movimentacao, fk_produto_id, fk_compra_id, created_at, updated_at)
    VALUES (15.500, 50.00, 79.90, CURRENT_DATE, 'COMPRA', 7, v_compra_id, NOW(), NOW());

    INSERT INTO descarte (data_descarte, motivo, created_at, updated_at) VALUES (CURRENT_DATE, 'VENCIMENTO', NOW(), NOW()) RETURNING id INTO v_descarte_id;
    INSERT INTO movimentacao (quantidade, preco_unitario_compra, preco_unitario_venda, data_validade, tipo_movimentacao, fk_produto_id, fk_descarte_id, created_at, updated_at)
    VALUES (-15.500, 0.00, 0.00, CURRENT_DATE, 'DESCARTE', 7, v_descarte_id, NOW(), NOW());

    -- =========================================================================
    -- SCENARIO DE APRESENTAÇÃO 2: REGRA DE QUEBRA < 100G (PICANHA TRADICIONAL)
    -- =========================================================================
    INSERT INTO compra (data_compra, created_at, updated_at) VALUES (CURRENT_DATE - INTERVAL '2 days', NOW(), NOW()) RETURNING id INTO v_compra_id;
    INSERT INTO movimentacao (quantidade, preco_unitario_compra, preco_unitario_venda, data_validade, tipo_movimentacao, fk_produto_id, fk_compra_id, created_at, updated_at)
    VALUES (10.000, 45.00, 69.90, CURRENT_DATE + INTERVAL '30 days', 'COMPRA', 1, v_compra_id, NOW(), NOW());

    INSERT INTO venda (data_venda, valor_total, desconto, fk_usuario_id, fk_cliente_id, created_at, updated_at)
    VALUES (NOW(), 9.960 * 69.90, 0.00, v_user_id, NULL, NOW(), NOW()) RETURNING id INTO v_venda_id;
    
    INSERT INTO movimentacao (quantidade, preco_unitario_compra, preco_unitario_venda, data_validade, tipo_movimentacao, fk_produto_id, fk_venda_id, created_at, updated_at)
    VALUES (-9.960, 45.00, 69.90, CURRENT_DATE + INTERVAL '30 days', 'VENDA', 1, v_venda_id, NOW(), NOW());

    INSERT INTO descarte (data_descarte, motivo, created_at, updated_at) VALUES (CURRENT_DATE, 'PERDA_PESO', NOW(), NOW()) RETURNING id INTO v_descarte_id;
    INSERT INTO movimentacao (quantidade, preco_unitario_compra, preco_unitario_venda, tipo_movimentacao, fk_produto_id, fk_descarte_id, created_at, updated_at)
    VALUES (-0.040, 0.00, 0.00, 'DESCARTE', 1, v_descarte_id, NOW(), NOW());

END $$;

-- =============================================================================
-- 5. REAJUSTE E ALINHAMENTO AUTOMÁTICO DAS SEQUENCES
-- =============================================================================
SELECT setval(pg_get_serial_sequence('categoria', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM categoria;
SELECT setval(pg_get_serial_sequence('marca', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM marca;
SELECT setval(pg_get_serial_sequence('produto', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM produto;
SELECT setval(pg_get_serial_sequence('cliente', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM cliente;
SELECT setval(pg_get_serial_sequence('compra', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM compra;
SELECT setval(pg_get_serial_sequence('venda', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM venda;
SELECT setval(pg_get_serial_sequence('movimentacao', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM movimentacao;
SELECT setval(pg_get_serial_sequence('venda_pagamento', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM venda_pagamento;