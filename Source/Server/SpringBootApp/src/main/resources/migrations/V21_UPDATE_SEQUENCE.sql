-- Corrige a sequence da tabela 'categoria'
SELECT setval(pg_get_serial_sequence('categoria', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM categoria;

-- Corrige a sequence da tabela 'cliente'
SELECT setval(pg_get_serial_sequence('cliente', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM cliente;

-- Corrige a sequence da tabela 'compra'
SELECT setval(pg_get_serial_sequence('compra', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM compra;

-- Corrige a sequence da tabela 'configuracoes'
SELECT setval(pg_get_serial_sequence('configuracoes', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM configuracoes;

-- Corrige a sequence da tabela 'termos'
SELECT setval(pg_get_serial_sequence('termos', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM termos;

-- Corrige a sequence da tabela 'consentimentos'
SELECT setval(pg_get_serial_sequence('consentimentos', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM consentimentos;

-- Corrige a sequence da tabela 'descarte'
SELECT setval(pg_get_serial_sequence('descarte', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM descarte;

-- Corrige a sequence da tabela 'despesa'
SELECT setval(pg_get_serial_sequence('despesa', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM despesa;

-- Corrige a sequence da tabela 'marca'
SELECT setval(pg_get_serial_sequence('marca', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM marca;

-- Corrige a sequence da tabela 'produto'
SELECT setval(pg_get_serial_sequence('produto', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM produto;

-- Corrige a sequence da tabela 'venda'
SELECT setval(pg_get_serial_sequence('venda', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM venda;

-- Corrige a sequence da tabela 'venda_pagamento'
SELECT setval(pg_get_serial_sequence('venda_pagamento', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM venda_pagamento;