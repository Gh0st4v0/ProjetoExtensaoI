/* V8: Remove cliente.documento and cliente.email; add cliente.aniversario, termos and consentimentos tables */

BEGIN;

-- Drop columns if they exist (data will be lost). Consider backing up before running in production.
ALTER TABLE cliente DROP COLUMN IF EXISTS documento;
ALTER TABLE cliente DROP COLUMN IF EXISTS email;

-- Add birthday column (aniversario)
ALTER TABLE cliente ADD COLUMN IF NOT EXISTS aniversario DATE;

-- Create termos table to store term versions (content stored as TEXT)
CREATE TABLE termos (
    id SERIAL PRIMARY KEY,
    conteudo TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add consentimentos table to record client consents (LGPD audit trail)
CREATE TABLE consentimentos (
    id SERIAL PRIMARY KEY,
    fk_cliente_id INTEGER,
    fk_usuario_id INTEGER,
    tipo VARCHAR(100) NOT NULL,
    aceito BOOLEAN NOT NULL,
    fk_termo_id INTEGER,
    capturado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE consentimentos ADD CONSTRAINT FK_Consentimentos_Cliente FOREIGN KEY (fk_cliente_id) REFERENCES cliente (id) ON DELETE SET NULL;
ALTER TABLE consentimentos ADD CONSTRAINT FK_Consentimentos_Usuario FOREIGN KEY (fk_usuario_id) REFERENCES usuario (id) ON DELETE SET NULL;
ALTER TABLE consentimentos ADD CONSTRAINT FK_Consentimentos_Termo FOREIGN KEY (fk_termo_id) REFERENCES termos (id) ON DELETE SET NULL;

CREATE INDEX idx_consentimentos_cliente ON consentimentos (fk_cliente_id);
CREATE INDEX idx_consentimentos_usuario ON consentimentos (fk_usuario_id);
CREATE INDEX idx_consentimentos_termo ON consentimentos (fk_termo_id);

COMMIT;
