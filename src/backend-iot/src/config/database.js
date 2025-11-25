// src/config/database.js
require('dotenv').config(); // Carrega as variáveis do .env

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // Use com cuidado em produção. Para Render/Heroku, pode ser necessário.
  }
});

pool.on('error', (err) => {
  console.error('Erro inesperado no cliente idle do DB', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};