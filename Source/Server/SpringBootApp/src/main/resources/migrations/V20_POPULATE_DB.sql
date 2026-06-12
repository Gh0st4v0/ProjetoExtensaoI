-- 1. LIMPEZA SEGURA DO BANCO DE DADOS (Zera tudo respeitando as FKs, mantendo a tabela usuario intacta)
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

-- 2. CADASTROS ESTÁTICOS (Alinhado 100% com o seu DDL)
INSERT INTO configuracoes (lucro_esperado, taxa_debito, taxa_credito, acrescimo_creedito, created_at, updated_at) 
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

-- 3. CADASTRO DE PRODUTOS DA CASA
INSERT INTO produto (nome, unidade_medida, codigo, perecivel, preco_venda, fk_categoria_id, fk_marca_id, estoque_minimo, created_at, updated_at) VALUES 
-- Cortes Bovinos (Por KG)
('Picanha Tradicional Vácuo', 'KG', 'BOV001', true, 69.90, 1, 4, 10, NOW(), NOW()),
('Contra Filé Vácuo', 'KG', 'BOV002', true, 48.90, 1, 4, 8, NOW(), NOW()),
('Bife de Chorizo Vácuo', 'KG', 'BOV003', true, 54.90, 1, 2, 6, NOW(), NOW()),
('Bife Ancho Vácuo', 'KG', 'BOV004', true, 54.90, 1, 2, 6, NOW(), NOW()),
('Alcatra com Maminha Vácuo', 'KG', 'BOV005', true, 44.90, 1, 1, 8, NOW(), NOW()),
('Fraldinha para Churrasco Vácuo', 'KG', 'BOV006', true, 39.90, 1, 4, 7, NOW(), NOW()),

-- Aves e Peixes (Por KG)
('Filé de Salmão em Postas Vácuo', 'KG', 'PEI001', true, 79.90, 2, 5, 5, NOW(), NOW()),
('Tulipa de Frango Temperada', 'KG', 'FRA001', true, 21.90, 2, 3, 10, NOW(), NOW()),
('Coração de Frango Temperado Vácuo', 'KG', 'FRA002', true, 26.90, 2, 3, 8, NOW(), NOW()),

-- Linguiças e Embutidos (Por KG)
('Linguiça Calabresa Defumada', 'KG', 'EMB001', true, 25.90, 3, 3, 12, NOW(), NOW()),
('Linguiça Toscana para Churrasco', 'KG', 'EMB002', true, 19.90, 3, 3, 15, NOW(), NOW()),

-- Itens por Unidade (UN)
('Carvão Vegetal 5kg', 'UN', 'CAR005', false, 24.90, 4, 5, 20, NOW(), NOW()),
('Sal de Parrilla Tradicional 1kg', 'UN', 'SAL001', false, 11.90, 4, 5, 30, NOW(), NOW()),
('Pacote de Pão de Alho Tradicional', 'UN', 'PAO001', true, 13.90, 4, 5, 15, NOW(), NOW()),
('Pacote de Queijo Coalho para Churrasco', 'UN', 'QJO001', true, 16.50, 4, 5, 12, NOW(), NOW());

-- 4. BLOCO PROCEDURAL TOTALMENTE ALINHADO ÀS SUAS COLUNAS
DO $$
DECLARE
    v_data_venda TIMESTAMP;
    v_venda_id INT;
    v_cliente_id INT;
    v_user_id INT;
    v_produto_record RECORD;
    v_quantidade DECIMAL;
    v_preco_unitario DECIMAL;
    v_subtotal_venda DECIMAL;
    v_total_venda DECIMAL;
    v_forma_pagto TEXT;
    
    v_nomes_clientes TEXT[] := ARRAY['Rodrigo Silva', 'Amanda Costa', 'Lucas Mendes', 'Camila Souza', 'Bruno Alves', 'Juliana Rocha', 'Felipe Santos', 'Beatriz Lima', 'Thiago Ferreira', 'Fernanda Oliveira'];
    v_formas_pagto TEXT[] := ARRAY['PIX', 'DINHEIRO', 'CREDITO', 'DEBITO'];
BEGIN
    -- Busca dinâmica da FK de usuário real da base
    SELECT id FROM usuario LIMIT 1 INTO v_user_id;
    
    IF v_user_id IS NULL THEN
        v_user_id := 1;
    END IF;

    -- 4.1 GERAÇÃO DE CLIENTES (Mapeado: apelido, telefone, aniversario)
    FOR i IN 1..ARRAY_LENGTH(v_nomes_clientes, 1) LOOP
        INSERT INTO cliente (apelido, telefone, aniversario, data_cadastro, created_at, updated_at)
        VALUES (
            v_nomes_clientes[i],
            '(11) 9' || (1000 + FLOOR(RANDOM() * 9000))::TEXT || '-' || (1000 + FLOOR(RANDOM() * 9000))::TEXT,
            '1980-01-01'::DATE + (FLOOR(RANDOM() * 10000) * INTERVAL '1 day'),
            (CURRENT_DATE - INTERVAL '65 days'),
            NOW() - INTERVAL '65 days',
            NOW() - INTERVAL '65 days'
        );
    END LOOP;

    -- 4.2 ENTRADAS DE ESTOQUE (Mapeado: preco_unitario_compra, preco_unitario_venda)
    FOR v_produto_record IN SELECT id, preco_venda FROM produto LOOP
        INSERT INTO compra (data_compra, data, created_at, updated_at) 
        VALUES (CURRENT_DATE - INTERVAL '61 days', CURRENT_DATE - INTERVAL '61 days', NOW() - INTERVAL '61 days', NOW() - INTERVAL '61 days')
        RETURNING id INTO v_venda_id;

        INSERT INTO movimentacao (quantidade, preco_unitario_compra, preco_unitario_venda, data_validade, tipo_movimentacao, fk_produto_id, fk_compra_id, created_at, updated_at)
        VALUES (500.00, v_produto_record.preco_venda * 0.65, v_produto_record.preco_venda, CURRENT_DATE + INTERVAL '90 days', 'COMPRA', v_produto_record.id, v_venda_id, NOW() - INTERVAL '61 days', NOW() - INTERVAL '61 days');
    END LOOP;

    -- 4.3 LOOP TRANSAÇÕES DIÁRIAS (5 vendas por dia nos últimos 60 dias)
    FOR v_dia IN REVERSE 60..1 LOOP
        FOR v_venda_no IN 1..5 LOOP
            
            v_cliente_id := NULL;
            IF RANDOM() > 0.4 THEN
                SELECT id FROM cliente ORDER BY RANDOM() LIMIT 1 INTO v_cliente_id;
            END IF;

            v_data_venda := (CURRENT_DATE - (v_dia || ' days')::INTERVAL) + (INTERVAL '9 hours' + (RANDOM() * INTERVAL '11 hours'));
            v_forma_pagto := v_formas_pagto[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_formas_pagto, 1))];
            
            -- Registra Venda Mãe (Mapeado: data_venda, valor_total, desconto, fk_usuario_id, fk_cliente_id, data)
            INSERT INTO venda (data_venda, valor_total, desconto, fk_usuario_id, fk_cliente_id, data, created_at, updated_at)
            VALUES (v_data_venda, 0.00, 0.00, v_user_id, v_cliente_id, v_data_venda::DATE, v_data_venda, v_data_venda)
            RETURNING id INTO v_venda_id;

            v_subtotal_venda := 0.00;

            -- Adiciona de 1 a 5 produtos por venda
            FOR v_item IN 1..(1 + FLOOR(RANDOM() * 5)) LOOP
                SELECT id, unidade_medida, preco_venda FROM produto ORDER BY RANDOM() LIMIT 1 INTO v_produto_record;
                
                IF v_produto_record.unidade_medida = 'UN' THEN
                    v_quantidade := 1 + FLOOR(RANDOM() * 2); 
                ELSE
                    v_quantidade := ROUND((0.500 + (RANDOM() * 2.000))::NUMERIC, 3); 
                END IF;

                v_preco_unitario := v_produto_record.preco_venda;
                v_subtotal_venda := v_subtotal_venda + (v_quantidade * v_preco_unitario);

                -- Registra a Movimentação (Mapeado: preco_unitario_compra, preco_unitario_venda, fk_produto_id, fk_venda_id)
                INSERT INTO movimentacao (quantidade, preco_unitario_compra, preco_unitario_venda, data_validade, tipo_movimentacao, fk_produto_id, fk_venda_id, created_at, updated_at)
                VALUES (-v_quantidade, v_preco_unitario * 0.65, v_preco_unitario, v_data_venda::DATE + 60, 'VENDA', v_produto_record.id, v_venda_id, v_data_venda, v_data_venda);
            END LOOP;

            v_total_venda := v_subtotal_venda;

            -- Atualiza valor_total da Venda Mãe
            UPDATE venda SET valor_total = ROUND(v_total_venda::NUMERIC, 2) WHERE id = v_venda_id;

            -- Grava o pagamento (Mapeado: fk_venda_id, metodo_pagamento, valor, acrescimo_percent, acrescimo_valor, valor_pago)
            IF v_forma_pagto = 'CREDITO' THEN
                INSERT INTO venda_pagamento (fk_venda_id, metodo_pagamento, valor, acrescimo_percent, acrescimo_valor, valor_pago, criado_em, created_at, updated_at)
                VALUES (v_venda_id, 'CREDITO', ROUND(v_total_venda::NUMERIC, 2), 5.00, ROUND((v_total_venda * 0.05)::NUMERIC, 2), ROUND((v_total_venda * 1.05)::NUMERIC, 2), NOW(), v_data_venda, v_data_venda);
            ELSE
                INSERT INTO venda_pagamento (fk_venda_id, metodo_pagamento, valor, acrescimo_percent, acrescimo_valor, valor_pago, criado_em, created_at, updated_at)
                VALUES (v_venda_id, v_forma_pagto, ROUND(v_total_venda::NUMERIC, 2), 0.00, 0.00, ROUND(v_total_venda::NUMERIC, 2), NOW(), v_data_venda, v_data_venda);
            END IF;

        END LOOP;
    END LOOP;

END $$;

-- 5. REAJUSTE DE SEQUENCES (Garante o alinhamento com as triggers do Hibernate)
SELECT setval(pg_get_serial_sequence('categoria', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM categoria;
SELECT setval(pg_get_serial_sequence('marca', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM marca;
SELECT setval(pg_get_serial_sequence('produto', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM produto;
SELECT setval(pg_get_serial_sequence('cliente', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM cliente;
SELECT setval(pg_get_serial_sequence('compra', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM compra;
SELECT setval(pg_get_serial_sequence('venda', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM venda;
SELECT setval(pg_get_serial_sequence('movimentacao', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM movimentacao;
SELECT setval(pg_get_serial_sequence('venda_pagamento', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM venda_pagamento;