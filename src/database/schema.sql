-- Cria a tabela de salas
CREATE TABLE salas (
    id          BIGSERIAL PRIMARY KEY,
    nome        VARCHAR(80) NOT NULL,
    localizacao VARCHAR(120) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'disponivel',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cria a tabela de usuários
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    nome            VARCHAR(120) NOT NULL,
    rfid_codigo     VARCHAR(64) UNIQUE NOT NULL,
    senha_hash      VARCHAR(255) NOT NULL,
    sala_id         BIGINT REFERENCES salas(id),
    ativo           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cria a tabela de alocação de salas
CREATE TABLE alocacao_sala (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id),
    sala_id     BIGINT NOT NULL REFERENCES salas(id),
    inicio      TIMESTAMPTZ NOT NULL,
    fim         TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cria o índice único de alocação de salas
CREATE UNIQUE INDEX uniq_user_alocacao_aberta
    ON alocacao_sala (user_id)
    WHERE fim IS NULL;