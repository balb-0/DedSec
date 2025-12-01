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

    // Limpar dados existentes
    await client.query("DELETE FROM alocacao_sala");
    await client.query("DELETE FROM users");
    await client.query("DELETE FROM salas");

    // Resetar sequências
    await client.query("ALTER SEQUENCE salas_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE alocacao_sala_id_seq RESTART WITH 1");

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

    // Inserir alocações de salas
    const alocacoes = [
      {
        user_id: 1,
        sala_id: 1,
        inicio: new Date("2024-11-26T10:00:00Z"),
        fim: null,
      },
      {
        user_id: 2,
        sala_id: 2,
        inicio: new Date("2024-11-26T09:00:00Z"),
        fim: new Date("2024-11-26T12:00:00Z"),
      },
      {
        user_id: 4,
        sala_id: 3,
        inicio: new Date("2024-11-26T14:00:00Z"),
        fim: null,
      },
    ];

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
