-- Adiciona campos opcionais ao cadastro de cliente
ALTER TABLE cliente ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
ALTER TABLE cliente ADD COLUMN IF NOT EXISTS documento VARCHAR(18);
ALTER TABLE cliente ADD COLUMN IF NOT EXISTS email VARCHAR(255);
