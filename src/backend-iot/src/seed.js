// seed.js
require("dotenv").config(); // Carrega o .env da raiz do projeto backend-iot
const { Pool } = require("pg");

// Usa as mesmas configurações do .env que o servidor usa
// Render requer SSL para conexões externas
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false, // Necessário para Render
  },
});

async function seed() {
  const client = await pool.connect();

  try {
    console.log("🌱 Iniciando seed do banco de dados...");

    // Dropar tabelas (em ordem reversa devido às foreign keys)
    console.log("🗑️  Removendo tabelas existentes...");
    await client.query("DROP TABLE IF EXISTS alocacao_sala CASCADE");
    await client.query("DROP TABLE IF EXISTS users CASCADE");
    await client.query("DROP TABLE IF EXISTS salas CASCADE");

    // Criar tabelas novamente
    console.log("📋 Criando tabelas...");
    await client.query(`
      CREATE TABLE salas (
        id          BIGSERIAL PRIMARY KEY,
        nome        VARCHAR(80) NOT NULL,
        localizacao VARCHAR(120) NOT NULL,
        status      VARCHAR(20) NOT NULL DEFAULT 'disponivel',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE users (
        id              BIGSERIAL PRIMARY KEY,
        nome            VARCHAR(120) NOT NULL,
        rfid_codigo     VARCHAR(64) UNIQUE NOT NULL,
        senha_hash      VARCHAR(255) NOT NULL,
        sala_id         BIGINT REFERENCES salas(id),
        ativo           BOOLEAN NOT NULL DEFAULT TRUE,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE alocacao_sala (
        id          BIGSERIAL PRIMARY KEY,
        user_id     BIGINT NOT NULL REFERENCES users(id),
        sala_id     BIGINT NOT NULL REFERENCES salas(id),
        inicio      TIMESTAMPTZ NOT NULL,
        fim         TIMESTAMPTZ,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE UNIQUE INDEX uniq_user_alocacao_aberta
        ON alocacao_sala (user_id)
        WHERE fim IS NULL
    `);

    // Inserir salas
    const salas = [
      {
        nome: "Sala 101",
        localizacao: "Primeiro andar, lado esquerdo",
        status: "disponivel",
      },
      {
        nome: "Sala 102",
        localizacao: "Primeiro andar, lado direito",
        status: "disponivel",
      },
      {
        nome: "Sala 201",
        localizacao: "Segundo andar, lado esquerdo",
        status: "disponivel",
      },
      {
        nome: "Sala 202",
        localizacao: "Segundo andar, lado direito",
        status: "ocupada",
      },
      {
        nome: "Sala de Reunião A",
        localizacao: "Terceiro andar",
        status: "disponivel",
      },
    ];

    for (const sala of salas) {
      await client.query(
        "INSERT INTO salas (nome, localizacao, status) VALUES ($1, $2, $3)",
        [sala.nome, sala.localizacao, sala.status]
      );
    }

    // Inserir usuários
    const usuarios = [
      {
        nome: "Alice Cooper",
        rfid_codigo: "A1B2C3D4",
        senha_hash: "hash123",
        sala_id: 1,
        ativo: true,
      },
      {
        nome: "Bob Martin",
        rfid_codigo: "B2C3D4E5",
        senha_hash: "hash456",
        sala_id: 2,
        ativo: true,
      },
      {
        nome: "Carol White",
        rfid_codigo: "C3D4E5F6",
        senha_hash: "hash789",
        sala_id: null,
        ativo: true,
      },
      {
        nome: "Dan Brown",
        rfid_codigo: "D4E5F6G7",
        senha_hash: "hash012",
        sala_id: 3,
        ativo: true,
      },
      {
        nome: "Eve Davis",
        rfid_codigo: "E5F6G7H8",
        senha_hash: "hash345",
        sala_id: 4,
        ativo: false,
      },
    ];

    for (const usuario of usuarios) {
      await client.query(
        "INSERT INTO users (nome, rfid_codigo, senha_hash, sala_id, ativo) VALUES ($1, $2, $3, $4, $5)",
        [
          usuario.nome,
          usuario.rfid_codigo,
          usuario.senha_hash,
          usuario.sala_id,
          usuario.ativo,
        ]
      );
    }

    // Inserir alocações de salas com histórico completo
    // Vamos criar um histórico rico para vários usuários
    const agora = new Date();
    const hoje = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate()
    );

    const alocacoes = [
      // Alice Cooper (user_id: 1) - Histórico extenso
      {
        user_id: 1,
        sala_id: 1,
        inicio: new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
        fim: new Date(
          hoje.getTime() - 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000
        ), // 4 horas depois
      },
      {
        user_id: 1,
        sala_id: 2,
        inicio: new Date(hoje.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
        fim: new Date(
          hoje.getTime() - 5 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000
        ), // 6 horas depois
      },
      {
        user_id: 1,
        sala_id: 3,
        inicio: new Date(hoje.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
        fim: new Date(
          hoje.getTime() - 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
        ), // 3 horas depois
      },
      {
        user_id: 1,
        sala_id: 1,
        inicio: new Date(hoje.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
        fim: new Date(
          hoje.getTime() - 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000
        ), // 5 horas depois
      },
      {
        user_id: 1,
        sala_id: 1,
        inicio: new Date(hoje.getTime() + 8 * 60 * 60 * 1000), // Hoje às 8h
        fim: null, // Alocação ativa
      },

      // Bob Martin (user_id: 2) - Histórico moderado
      {
        user_id: 2,
        sala_id: 2,
        inicio: new Date(hoje.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
        fim: new Date(
          hoje.getTime() - 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
        ), // 2 horas depois
      },
      {
        user_id: 2,
        sala_id: 4,
        inicio: new Date(hoje.getTime() - 8 * 24 * 60 * 60 * 1000), // 8 dias atrás
        fim: new Date(
          hoje.getTime() - 8 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000
        ), // 8 horas depois
      },
      {
        user_id: 2,
        sala_id: 2,
        inicio: new Date(hoje.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 dias atrás
        fim: new Date(
          hoje.getTime() - 6 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000
        ), // 4 horas depois
      },
      {
        user_id: 2,
        sala_id: 2,
        inicio: new Date(hoje.getTime() + 9 * 60 * 60 * 1000), // Hoje às 9h
        fim: new Date(hoje.getTime() + 13 * 60 * 60 * 1000), // Hoje às 13h (finalizada)
      },

      // Carol White (user_id: 3) - Histórico recente
      {
        user_id: 3,
        sala_id: 5,
        inicio: new Date(hoje.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 dias atrás
        fim: new Date(
          hoje.getTime() - 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
        ), // 3 horas depois
      },
      {
        user_id: 3,
        sala_id: 3,
        inicio: new Date(hoje.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
        fim: new Date(
          hoje.getTime() - 2 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000
        ), // 7 horas depois
      },
      {
        user_id: 3,
        sala_id: 1,
        inicio: new Date(hoje.getTime() + 10 * 60 * 60 * 1000), // Hoje às 10h
        fim: null, // Alocação ativa
      },

      // Dan Brown (user_id: 4) - Histórico variado
      {
        user_id: 4,
        sala_id: 3,
        inicio: new Date(hoje.getTime() - 12 * 24 * 60 * 60 * 1000), // 12 dias atrás
        fim: new Date(
          hoje.getTime() - 12 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000
        ), // 5 horas depois
      },
      {
        user_id: 4,
        sala_id: 4,
        inicio: new Date(hoje.getTime() - 9 * 24 * 60 * 60 * 1000), // 9 dias atrás
        fim: new Date(
          hoje.getTime() - 9 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000
        ), // 6 horas depois
      },
      {
        user_id: 4,
        sala_id: 5,
        inicio: new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
        fim: new Date(
          hoje.getTime() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
        ), // 2 horas depois
      },
      {
        user_id: 4,
        sala_id: 3,
        inicio: new Date(hoje.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 dias atrás
        fim: new Date(
          hoje.getTime() - 4 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000
        ), // 4 horas depois
      },
      {
        user_id: 4,
        sala_id: 3,
        inicio: new Date(hoje.getTime() + 14 * 60 * 60 * 1000), // Hoje às 14h
        fim: null, // Alocação ativa
      },

      // Eve Davis (user_id: 5) - Histórico antigo (usuário inativo)
      {
        user_id: 5,
        sala_id: 4,
        inicio: new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
        fim: new Date(
          hoje.getTime() - 30 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000
        ), // 8 horas depois
      },
      {
        user_id: 5,
        sala_id: 2,
        inicio: new Date(hoje.getTime() - 25 * 24 * 60 * 60 * 1000), // 25 dias atrás
        fim: new Date(
          hoje.getTime() - 25 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
        ), // 3 horas depois
      },
      {
        user_id: 5,
        sala_id: 1,
        inicio: new Date(hoje.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 dias atrás
        fim: new Date(
          hoje.getTime() - 20 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000
        ), // 6 horas depois
      },
    ];

    console.log("📝 Inserindo alocações...");
    for (const alocacao of alocacoes) {
      await client.query(
        "INSERT INTO alocacao_sala (user_id, sala_id, inicio, fim) VALUES ($1, $2, $3, $4)",
        [alocacao.user_id, alocacao.sala_id, alocacao.inicio, alocacao.fim]
      );
    }

    console.log("✅ Seed concluído com sucesso!");
    console.log(`   - ${salas.length} salas criadas`);
    console.log(`   - ${usuarios.length} usuários criados`);
    console.log(`   - ${alocacoes.length} alocações criadas`);
    console.log(
      `   - Histórico de alocações populado para ${
        new Set(alocacoes.map((a) => a.user_id)).size
      } usuários`
    );
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed()
  .then(() => {
    console.log("✨ Processo finalizado!");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
