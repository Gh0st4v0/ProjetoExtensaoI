INSERT INTO usuario (email, nome, senha, nivel_acesso)
VALUES (
    'juniorprimebeef2@gmail.com',
    'Admin',
    '$2a$10$R9h/cIPz0gi.URNNX3kh2OPST9/OBBWe6YVfHCV6Bw4Anvwt.b6iG',
    'ADM'
)
ON CONFLICT (email) DO NOTHING;