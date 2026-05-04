ALTER TABLE usuario
    ADD COLUMN IF NOT EXISTS email VARCHAR(255);

ALTER TABLE usuario
    ADD COLUMN IF NOT EXISTS ultimo_email_alteracao TIMESTAMP;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'usuario'
          AND column_name = 'nivel_acesso'
    ) THEN
        UPDATE usuario
        SET nivel_acesso = 'ADM'
        WHERE nivel_acesso = 'ADMIN';

        UPDATE usuario
        SET nivel_acesso = 'USUARIO'
        WHERE nivel_acesso = 'OPERATOR';
    END IF;
END $$;
