// controllers/usersController.js
const db = require("../config/database");

// GET /users - Listar todos os usuários
const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, nome, rfid_codigo, telefone, ativo, sala_id, created_at FROM users ORDER BY created_at DESC"
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("[API] Erro ao buscar usuários:", error);
    res.status(500).json({ success: false, error: "Erro ao buscar usuários." });
  }
};

// GET /users/:id - Buscar usuário por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT u.id, u.nome, u.rfid_codigo, u.telefone, u.ativo, u.sala_id, u.created_at,
              s.nome as sala_nome, s.localizacao as sala_localizacao
       FROM users u
       LEFT JOIN salas s ON u.sala_id = s.id
       WHERE u.id = $1`,
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

// POST /users - Criar novo usuário
const createUser = async (req, res) => {
  try {
    const { nome, rfid_codigo, telefone, sala_id, ativo } = req.body;

    // Validações
    if (!nome || !rfid_codigo) {
      return res.status(400).json({
        success: false,
        error: "Nome e código RFID são obrigatórios.",
      });
    }

    // Validar se sala_id existe (se fornecido)
    if (sala_id) {
      const salaCheck = await db.query("SELECT id FROM salas WHERE id = $1", [
        sala_id,
      ]);
      if (salaCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Sala não encontrada.",
        });
      }
    }

    // Validação de ativo (default: true)
    const isAtivo = ativo !== undefined ? ativo : true;

    const result = await db.query(
      `INSERT INTO users (nome, rfid_codigo, senha_hash, telefone, sala_id, ativo) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, nome, rfid_codigo, telefone, ativo, sala_id, created_at`,
      [
        nome,
        rfid_codigo,
        "temp_hash",
        telefone || null,
        sala_id || null,
        isAtivo,
      ]
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
    if (error.code === "23503") {
      // Foreign key violation
      return res.status(400).json({
        success: false,
        error: "Sala inválida.",
      });
    }
    res.status(500).json({ success: false, error: "Erro ao criar usuário." });
  }
};

// PUT /users/:id - Atualizar usuário
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, rfid_codigo, telefone, sala_id, ativo } = req.body;

    // Verificar se usuário existe
    const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [
      id,
    ]);
    if (userCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Usuário não encontrado." });
    }

    // Validar se sala_id existe (se fornecido)
    if (sala_id !== undefined) {
      if (sala_id !== null) {
        const salaCheck = await db.query("SELECT id FROM salas WHERE id = $1", [
          sala_id,
        ]);
        if (salaCheck.rows.length === 0) {
          return res.status(400).json({
            success: false,
            error: "Sala não encontrada.",
          });
        }
      }
    }

    // Construir query dinamicamente baseado nos campos fornecidos
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (nome !== undefined) {
      updates.push(`nome = $${paramCount++}`);
      values.push(nome);
    }
    if (rfid_codigo !== undefined) {
      updates.push(`rfid_codigo = $${paramCount++}`);
      values.push(rfid_codigo);
    }
    if (telefone !== undefined) {
      updates.push(`telefone = $${paramCount++}`);
      values.push(telefone);
    }
    if (sala_id !== undefined) {
      updates.push(`sala_id = $${paramCount++}`);
      values.push(sala_id);
    }
    if (ativo !== undefined) {
      updates.push(`ativo = $${paramCount++}`);
      values.push(ativo);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Nenhum campo para atualizar.",
      });
    }

    // Adicionar updated_at
    updates.push(`updated_at = NOW()`);
    // Adicionar id no final
    values.push(id);

    const query = `UPDATE users 
                   SET ${updates.join(", ")} 
                   WHERE id = $${paramCount} 
                   RETURNING id, nome, rfid_codigo, telefone, ativo, sala_id, created_at, updated_at`;

    const result = await db.query(query, values);

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("[API] Erro ao atualizar usuário:", error);
    if (error.code === "23505") {
      return res
        .status(400)
        .json({ success: false, error: "Código RFID já cadastrado." });
    }
    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        error: "Sala inválida.",
      });
    }
    res
      .status(500)
      .json({ success: false, error: "Erro ao atualizar usuário." });
  }
};

// DELETE /users/:id - Deletar usuário
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se usuário existe
    const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [
      id,
    ]);
    if (userCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Usuário não encontrado." });
    }

    // Verificar se há alocações ativas
    const alocacoesAtivas = await db.query(
      "SELECT id FROM alocacao_sala WHERE user_id = $1 AND fim IS NULL",
      [id]
    );

    if (alocacoesAtivas.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error:
          "Não é possível deletar usuário com alocações ativas. Finalize as alocações primeiro.",
      });
    }

    // Deletar usuário
    await db.query("DELETE FROM users WHERE id = $1", [id]);

    res.status(200).json({
      success: true,
      message: "Usuário deletado com sucesso.",
    });
  } catch (error) {
    console.error("[API] Erro ao deletar usuário:", error);
    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        error:
          "Não é possível deletar usuário com registros relacionados (alocações).",
      });
    }
    res.status(500).json({ success: false, error: "Erro ao deletar usuário." });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
