-- 1. LIMPEZA DO BANCO DE DADOS (Zera dados e reseta contadores SERIAL de todas as tabelas, exceto usuario)
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

-- 2. CADASTROS ESTÁTICOS DE CONFIGURAÇÃO, TERMOS, CATEGORIAS E MARCAS
INSERT INTO configuracoes (lucro_esperado, taxa_debito, taxa_credito, criado_em, atualizado_em, acrescimo_credito) 
VALUES (35.00, 1.99, 4.99, NOW(), NOW(), 5.00);

INSERT INTO termos (conteudo, criado_em, atualizado_em, data_publicacao) 
VALUES ('Autorizo o uso dos meus dados para fins de cadastro, programas de fidelidade e contato sobre cortes e promoções da Casa de Carnes, conforme a LGPD.', NOW(), NOW(), NOW());

INSERT INTO categoria (category_name, criado_em, atualizado_em) VALUES 
('Carnes Bovinas', NOW(), NOW()),
('Aves e Peixes', NOW(), NOW()),
('Linguiças e Embutidos', NOW(), NOW()),
('Acompanhamentos e Churrasco', NOW(), NOW());

INSERT INTO marca (brand_name, criado_em, atualizado_em) VALUES 
('Frisa', NOW(), NOW()),
('Minerva', NOW(), NOW()),
('Seara', NOW(), NOW()),
('Friboi', NOW(), NOW()),
('Boutique da Casa', NOW(), NOW());

-- 3. CADASTRO DE PRODUTOS DA CASA (Cortes Embalados a Vácuo e Itens de Unidade)
INSERT INTO produto (name, unit_measurement, code, perecivel, preco_venda, category_id, brand_id, min_stock, criado_em, atualizado_em) VALUES 
-- Cortes Bovinos (Por KG)
('Picanha Tradicional Vácuo', 'KG', 'BOV001', true, 69.90, 1, 4, 10, NOW(), NOW()),
('Contra Filé Vácuo', 'KG', 'BOV002', true, 48.90, 1, 4, 8, NOW(), NOW()),
('Bife de Chorizo Vácuo', 'KG', 'BOV003', true, 54.90, 1, 2, 6, NOW(), NOW()),
('Bife Ancho Vácuo', 'KG', 'BOV004', true, 54.90, 1, 2, 6, NOW(), NOW()),
('Alcatra com Maminha Vácuo', 'KG', 'BOV005', true, 44.90, 1, 1, 8, NOW(), NOW()),
('Fraldinha para Churrasco Vácuo', 'KG', 'BOV006', true, 39.90, 1, 4, 7, NOW(), NOW()),

-- Aves e Peixes (Por KG)
('Filé de Salmão em Postas Vácuo', 'KG', 'PEI001', true, 79.90, 2, 5, 5, NOW(), NOW()),
('Tulipa de Frango Temperada (Meio da Asa)', 'KG', 'FRA001', true, 21.90, 2, 3, 10, NOW(), NOW()),
('Coração de Frango Temperado Vácuo', 'KG', 'FRA002', true, 26.90, 2, 3, 8, NOW(), NOW()),

-- Linguiças e Embutidos (Por KG)
('Linguiça Calabresa Defumada', 'KG', 'EMB001', true, 25.90, 3, 3, 12, NOW(), NOW()),
('Linguiça Toscana para Churrasco', 'KG', 'EMB002', true, 19.90, 3, 3, 15, NOW(), NOW()),

-- Itens por Unidade (UN)
('Carvão Vegetal 5kg', 'UN', 'CAR005', false, 24.90, 4, 5, 20, NOW(), NOW()),
('Sal de Parrilla Tradicional 1kg', 'UN', 'SAL001', false, 11.90, 4, 5, 30, NOW(), NOW()),
('Pacote de Pão de Alho Tradicional', 'UN', 'PAO001', true, 13.90, 4, 5, 15, NOW(), NOW()),
('Pacote de Queijo Coalho para Churrasco', 'UN', 'QJO001', true, 16.50, 4, 5, 12, NOW(), NOW());

-- 4. BLOCO DO COMPLETO PARA POPULAR O HISTÓRICO TRANSAÇÃO POR TRANSAÇÃO
DO $$
DECLARE
    v_data_venda TIMESTAMP;
    v_venda_id INT;
    v_cliente_id INT;
    v_produto_record RECORD;
    v_quantidade DECIMAL;
    v_preco_unitario DECIMAL;
    v_subtotal_venda DECIMAL;
    v_total_venda DECIMAL;
    v_forma_pagto TEXT;
    
    -- Configuração de mock realistas
    v_nomes_clientes TEXT[] := ARRAY['Rodrigo Silva', 'Amanda Costa', 'Lucas Mendes', 'Camila Souza', 'Bruno Alves', 'Juliana Rocha', 'Felipe Santos', 'Beatriz Lima', 'Thiago Ferreira', 'Fernanda Oliveira'];
    v_formas_pagto TEXT[] := ARRAY['PIX', 'DINHEIRO', 'CREDITO', 'DEBITO'];
BEGIN

    -- 4.1 GERAÇÃO DE CLIENTES DA BASE DE FIDELIDADE
    FOR i IN 1..ARRAY_LENGTH(v_nomes_clientes, 1) LOOP
        INSERT INTO cliente (nickname, telefone, aniversario, aceita_termos_servico, receber_promocoes, criado_em, atualizado_em)
        VALUES (
            v_nomes_clientes[i],
            '(11) 9' || (1000 + FLOOR(RANDOM() * 9000))::TEXT || '-' || (1000 + FLOOR(RANDOM() * 9000))::TEXT,
            '1980-01-01'::DATE + (FLOOR(RANDOM() * 10000) * INTERVAL '1 day'),
            true,
            (RANDOM() > 0.3),
            NOW() - INTERVAL '70 days',
            NOW() - INTERVAL '70 days'
        );
    END LOOP;

    -- 4.2 ENTRADAS DE ESTOQUE (COMPRAS INICIAIS BRUTAS)
    FOR v_produto_record IN SELECT id, preco_venda FROM produto LOOP
        INSERT INTO compra (data_compra, criado_em, atualizado_em) 
        VALUES (CURRENT_DATE - INTERVAL '61 days', NOW() - INTERVAL '61 days', NOW() - INTERVAL '61 days')
        RETURNING id INTO v_venda_id;

        -- Garante 500 unidades/kg no estoque de cada item para a Boutique iniciar com saldo positivo
        INSERT INTO movimentacao (quantidade, preco_custo, preco_venda, data_movimentacao, tipo_movimentacao, produto_id, compra_id, criado_em, atualizado_em)
        VALUES (500.00, v_produto_record.preco_venda * 0.65, v_produto_record.preco_venda, CURRENT_DATE - INTERVAL '61 days', 'COMPRA', v_produto_record.id, v_venda_id, NOW() - INTERVAL '61 days', NOW() - INTERVAL '61 days');
    END LOOP;

    -- 4.3 LOOP TRANSACOES DIÁRIAS (5 vendas fictícias por dia retroativas a 60 dias)
    FOR v_dia IN REVERSE 60..1 LOOP
        FOR v_venda_no IN 1..5 LOOP
            
            -- Decide se a venda terá CPF/Identificação na nota
            v_cliente_id := NULL;
            IF RANDOM() > 0.4 THEN
                SELECT id FROM cliente ORDER BY RANDOM() LIMIT 1 INTO v_cliente_id;
            END IF;

            -- Sorteia horário de atendimento comercial e o método de pagamento
            v_data_venda := (CURRENT_DATE - (v_dia || ' days')::INTERVAL) + (INTERVAL '9 hours' + (RANDOM() * INTERVAL '11 hours'));
            v_forma_pagto := v_formas_pagto[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_formas_pagto, 1))];
            
            -- Registra Venda Mãe zerada
            INSERT INTO venda (data_venda, total_value, has_discount, user_id, cliente_id, criado_em, atualizado_em)
            VALUES (v_data_venda, 0.00, false, 1, v_cliente_id, v_data_venda, v_data_venda)
            RETURNING id INTO v_venda_id;

            v_subtotal_venda := 0.00;

            -- Adiciona de 1 a 5 produtos por venda
            FOR v_item IN 1..(1 + FLOOR(RANDOM() * 5)) LOOP
                SELECT id, unit_measurement, preco_venda FROM produto ORDER BY RANDOM() LIMIT 1 INTO v_produto_record;
                
                -- Se for unidade (Carvão, pão de alho, sal), vende quantidades inteiras
                IF v_produto_record.unit_measurement = 'UN' THEN
                    v_quantidade := 1 + FLOOR(RANDOM() * 2); 
                ELSE
                    -- Se for carne/peixe por KG, vende frações simulando a pesagem real do vácuo
                    v_quantidade := ROUND((0.500 + (RANDOM() * 2.000))::NUMERIC, 3); 
                END IF;

                v_preco_unitario := v_produto_record.preco_venda;
                v_subtotal_venda := v_subtotal_venda + (v_quantidade * v_preco_unitario);

                -- Registra a Movimentação com sinal negativo (Baixa de Estoque por venda)
                INSERT INTO movimentacao (quantidade, preco_custo, preco_venda, data_movimentacao, tipo_movimentacao, produto_id, venda_id, criado_em, updated_at)
                VALUES (-v_quantidade, v_preco_unitario * 0.65, v_preco_unitario, v_data_venda::DATE, 'VENDA', v_produto_record.id, v_venda_id, v_data_venda, v_data_venda);
            END LOOP;

            v_total_venda := v_subtotal_venda;

            -- Atualiza o valor final consolidado da Venda Mãe
            UPDATE venda SET total_value = ROUND(v_total_venda::NUMERIC, 2) WHERE id = v_venda_id;

            -- Grava o pagamento respeitando a porcentagem de acréscimo se for cartão de crédito
            IF v_forma_pagto = 'CREDITO' THEN
                INSERT INTO venda_pagamento (venda_id, payment_method, valor, acrescimo_percent, acrescimo_valor, valor_pago, criado_em, atualizado_em)
                VALUES (v_venda_id, 'CREDITO', ROUND(v_total_venda::NUMERIC, 2), 5.00, ROUND((v_total_venda * 0.05)::NUMERIC, 2), ROUND((v_total_venda * 1.05)::NUMERIC, 2), v_data_venda, v_data_venda);
            ELSE
                INSERT INTO venda_pagamento (venda_id, payment_method, valor, acrescimo_percent, acrescimo_valor, valor_pago, criado_em, atualizado_em)
                VALUES (v_venda_id, v_forma_pagto, ROUND(v_total_venda::NUMERIC, 2), 0.00, 0.00, ROUND(v_total_venda::NUMERIC, 2), v_data_venda, v_data_venda);
            END IF;

        END LOOP;
    END LOOP;

END $$;