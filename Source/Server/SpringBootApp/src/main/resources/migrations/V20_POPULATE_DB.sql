-- 1. LIMPEZA TOTAL DA BASE (Mantém apenas os usuários)
TRUNCATE TABLE 
    venda_pagamento, movimentacao, venda, produto, marca, categoria, 
    despesa, descarte, consentimentos, termos, configuracoes, cliente, compra
RESTART IDENTITY CASCADE;

-- 2. CONFIGURAÇÕES DA CASA
INSERT INTO configuracoes (lucro_esperado, taxa_debito, taxa_credito, acrescimo_credito, created_at, updated_at) 
VALUES (35.00, 1.99, 4.99, 5.00, NOW(), NOW());

-- 3. TERMOS LGPD
INSERT INTO termos (conteudo, criado_em, created_at, updated_at) 
VALUES ('Autorizo o uso dos meus dados para fins de cadastro, privacidade e promoções, conforme a LGPD.', NOW(), NOW(), NOW());

-- 4. CATEGORIAS
INSERT INTO categoria (nome, created_at, updated_at) VALUES 
('Carnes Bovinas', NOW(), NOW()),
('Aves e Peixes', NOW(), NOW()),
('Linguiças e Embutidos', NOW(), NOW()),
('Acompanhamentos e Churrasco', NOW(), NOW());

-- 5. MARCAS
INSERT INTO marca (nome, created_at, updated_at) VALUES 
('Frisa', NOW(), NOW()),
('Minerva', NOW(), NOW()),
('Seara', NOW(), NOW()),
('Friboi', NOW(), NOW()),
('Boutique da Casa', NOW(), NOW());

-- 6. PRODUTOS COMERCIAIS
INSERT INTO produto (nome, unidade_medida, codigo, perecivel, preco_venda, fk_categoria_id, fk_marca_id, estoque_minimo, created_at, updated_at) VALUES 
('Picanha Tradicional', 'KG', 'BOV001', true, 69.90, 1, 4, 10, NOW(), NOW()),
('Contra Filé', 'KG', 'BOV002', true, 48.90, 1, 4, 8, NOW(), NOW()),
('Bife de Chorizo', 'KG', 'BOV003', true, 54.90, 1, 2, 6, NOW(), NOW()),
('Bife Ancho', 'KG', 'BOV004', true, 54.90, 1, 2, 6, NOW(), NOW()),
('Alcatra com Maminha', 'KG', 'BOV005', true, 44.90, 1, 1, 8, NOW(), NOW()),
('Fraldinha para Churrasco', 'KG', 'BOV006', true, 39.90, 1, 4, 7, NOW(), NOW()),
('Filé de Salmão em Postas', 'KG', 'PEI001', true, 79.90, 2, 5, 5, NOW(), NOW()),
('Tulipa de Frango Temperada', 'KG', 'FRA001', true, 21.90, 2, 3, 10, NOW(), NOW()),
('Coração de Frango Temperado', 'KG', 'FRA002', true, 26.90, 2, 3, 8, NOW(), NOW()),
('Linguiça Calabresa Defumada', 'KG', 'EMB001', true, 25.90, 3, 3, 12, NOW(), NOW()),
('Linguiça Toscana para Churrasco', 'KG', 'EMB002', true, 19.90, 3, 3, 15, NOW(), NOW()),
('Carvão Vegetal 5kg', 'UN', 'CAR005', false, 24.90, 4, 5, 20, NOW(), NOW()),
('Sal de Parrilla Tradicional 1kg', 'UN', 'SAL001', false, 11.90, 4, 5, 30, NOW(), NOW()),
('Pacote de Pão de Alho Tradicional', 'UN', 'PAO001', true, 13.90, 4, 5, 15, NOW(), NOW()),
('Pacote de Queijo Coalho para Churrasco', 'UN', 'QJO001', true, 16.50, 4, 5, 12, NOW(), NOW());