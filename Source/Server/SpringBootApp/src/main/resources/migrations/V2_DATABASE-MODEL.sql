/* Junior_Prime_Beef_Locico_V4: */

CREATE TABLE Produto (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255),
    unidade_medida VARCHAR(2) CHECK (unidade_medida IN ('KG', 'UN')),
    codigo VARCHAR(6),
    perecivel BOOLEAN,
    preco_venda NUMERIC(10,4),
    fk_Categoria_id SERIAL,
    fk_Marca_id SERIAL
);

CREATE TABLE Categoria (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255)
);

CREATE TABLE Marca (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255)
);

CREATE TABLE Usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255),
    senha VARCHAR(60),
    nivel_acesso VARCHAR(7) CHECK (nivel_acesso IN ('USUARIO', 'ADM')),
    email VARCHAR(255),
    ultimo_email_alteracao TIMESTAMP
);

CREATE TABLE Compra (
    id SERIAL PRIMARY KEY,
    data_compra DATE
);

CREATE TABLE Venda (
    id SERIAL PRIMARY KEY,
    data_venda DATE,
    valor_total NUMERIC(10,40),
    metodo_pagamento VARCHAR(8) CHECK (metodo_pagamento IN ('PIX', 'CREDITO', 'DEBITO', 'DINHEIRO')),
    desconto BOOLEAN,
    fk_Usuario_id SERIAL,
    fk_cliente_id SERIAL
);

CREATE TABLE Movimentacao (
    id SERIAL PRIMARY KEY,
    quantidade NUMERIC(10,4),
    preco_unitario_compra NUMERIC(10,4),
    preco_unitario_venda NUMERIC(10,4),
    data_validade DATE,
    tipo_movimentacao VARCHAR(8) CHECK (tipo_movimentacao IN ('COMPRA', 'VENDA', 'DESCARTE')),
    fk_Produto_id SERIAL,
    fk_Compra_id SERIAL,
    fk_Descarte_id SERIAL,
    fk_Venda_id SERIAL
);

CREATE TABLE Descarte (
    id SERIAL PRIMARY KEY,
    data_descarte DATE,
    motivo VARCHAR(255)
);

CREATE TABLE Cliente (
    id SERIAL PRIMARY KEY,
    apelido VARCHAR(255)
);

CREATE TABLE Despesa (
    id SERIAL PRIMARY KEY,
    data DATE,
    valor NUMERIC(10,4),
    tipo VARCHAR(255)
);

 CREATE TABLE recuperacao_senha_token (
     id BIGSERIAL PRIMARY KEY,
     token VARCHAR(255) UNIQUE NOT NULL,
     fk_usuario_id BIGINT NOT NULL REFERENCES usuario(id),
     expiracao TIMESTAMP NOT NULL,
     utilizado BOOLEAN DEFAULT FALSE,
     criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );

CREATE INDEX idx_token ON recuperacao_senha_token (token);

CREATE INDEX idx_usuario_criado ON recuperacao_senha_token (fk_usuario_id, criado_em DESC);

ALTER TABLE Produto ADD CONSTRAINT FK_Produto_2
    FOREIGN KEY (fk_Categoria_id)
    REFERENCES Categoria (id)
    ON DELETE CASCADE;

ALTER TABLE Produto ADD CONSTRAINT FK_Produto_3
    FOREIGN KEY (fk_Marca_id)
    REFERENCES Marca (id)
    ON DELETE CASCADE;

ALTER TABLE Venda ADD CONSTRAINT FK_Venda_2
    FOREIGN KEY (fk_Usuario_id)
    REFERENCES Usuario (id)
    ON DELETE CASCADE;

ALTER TABLE Venda ADD CONSTRAINT FK_Venda_3
    FOREIGN KEY (fk_cliente_id)
    REFERENCES cliente (id)
    ON DELETE SET NULL;

ALTER TABLE Movimentacao ADD CONSTRAINT FK_Movimentacao_2
    FOREIGN KEY (fk_Produto_id)
    REFERENCES Produto (id)
    ON DELETE CASCADE;

ALTER TABLE Movimentacao ADD CONSTRAINT FK_Movimentacao_3
    FOREIGN KEY (fk_Compra_id)
    REFERENCES Compra (id)
    ON DELETE RESTRICT;

ALTER TABLE Movimentacao ADD CONSTRAINT FK_Movimentacao_4
    FOREIGN KEY (fk_Descarte_id)
    REFERENCES Descarte (id)
    ON DELETE RESTRICT;

ALTER TABLE Movimentacao ADD CONSTRAINT FK_Movimentacao_5
    FOREIGN KEY (fk_Venda_id)
    REFERENCES Venda (id)
    ON DELETE RESTRICT;