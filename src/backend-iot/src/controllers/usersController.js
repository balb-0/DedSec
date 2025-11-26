// controllers/usersController.js
const db = require("../config/database");

const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, nome, rfid_codigo, ativo, created_at FROM users ORDER BY created_at DESC"
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("[API] Erro ao buscar usuários:", error);
    res.status(500).json({ success: false, error: "Erro ao buscar usuários." });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "SELECT id, nome, rfid_codigo, ativo, created_at FROM users WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Usuário não encontrado." });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("[API] Erro ao buscar usuário:", error);
    res.status(500).json({ success: false, error: "Erro ao buscar usuário." });
  }
};

const createUser = async (req, res) => {
  try {
    const { nome, rfid_codigo, telefone } = req.body;
    if (!nome || !rfid_codigo) {
      return res.status(400).json({
        success: false,
        error: "Nome e código RFID são obrigatórios.",
      });
    }
    // Nota: telefone ainda não está na tabela, mas vamos preparar para o futuro
    const result = await db.query(
      "INSERT INTO users (nome, rfid_codigo, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, rfid_codigo, ativo, created_at",
      [nome, rfid_codigo, "temp_hash"] // senha_hash temporário - ajustar depois
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("[API] Erro ao criar usuário:", error);
    if (error.code === "23505") {
      // Código de violação de constraint única (rfid_codigo duplicado)
      return res
        .status(400)
        .json({ success: false, error: "Código RFID já cadastrado." });
    }
    res.status(500).json({ success: false, error: "Erro ao criar usuário." });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
};
