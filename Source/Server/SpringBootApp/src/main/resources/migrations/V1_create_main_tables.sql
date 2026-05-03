CREATE TABLE Categoria (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE Marca (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE Usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255),
    senha VARCHAR(60),
    nivel_acesso VARCHAR(8) CHECK (nivel_acesso IN ('OPERATOR', 'ADMIN'))
);

CREATE TABLE Produto (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255),
    unidade_medida VARCHAR(2) CHECK (unidade_medida IN ('KG', 'UN')),
    codigo INTEGER UNIQUE NOT NULL,
    fk_Categoria_id INTEGER,
    fk_Marca_id INTEGER
);

CREATE TABLE Compra (
    id SERIAL PRIMARY KEY,
    data DATE
);

CREATE TABLE Venda (
    id SERIAL PRIMARY KEY,
    data TIMESTAMP,
    metodo_pagamento VARCHAR(9) CHECK (metodo_pagamento IN ('DEBIT', 'CREDIT', 'PIX', 'CASH', 'DISCARDED')),
    desconto NUMERIC(10,4),
    fk_Usuario_id INTEGER
);

CREATE TABLE Item (
    id SERIAL PRIMARY KEY,
    quantidade NUMERIC(10,4) NOT NULL,
    preco_unitario_compra NUMERIC(10,4),
    preco_unitario_venda NUMERIC(10,4),
    data_validade DATE,
    fk_Produto_id INTEGER,
    fk_Compra_id INTEGER,
    fk_Venda_id INTEGER
);

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

ALTER TABLE Item ADD CONSTRAINT FK_Item_2
    FOREIGN KEY (fk_Produto_id)
    REFERENCES Produto (id)
    ON DELETE CASCADE;

ALTER TABLE Item ADD CONSTRAINT FK_Item_3
    FOREIGN KEY (fk_Compra_id)
    REFERENCES Compra (id)
    ON DELETE RESTRICT;

ALTER TABLE Item ADD CONSTRAINT FK_Item_4
    FOREIGN KEY (fk_Venda_id)
    REFERENCES Venda (id)
    ON DELETE RESTRICT;