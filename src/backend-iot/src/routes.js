// routes.js
const express = require("express");
const router = express.Router();
const db = require("./config/database");
const { sendSMS } = require("./services/smsService");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("./controllers/usersController");

// Rota de saúde (health check)
router.get("/", (req, res) => {
  res.send("Backend IoT está rodando e ouvindo o MQTT!");
});

// Rota de teste simples
router.get("/teste", (req, res) => {
  res.json({ message: "Rota de teste funcionando!" });
});

// ===== ROTAS DE USUÁRIOS (CRUD) =====
// GET /users - Listar todos os usuários
router.get("/users", getAllUsers);

// GET /users/search?q=nome - Buscar usuários por nome (DEVE VIR ANTES DE /users/:id)
router.get("/users/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Parâmetro de busca 'q' é obrigatório.",
      });
    }

    const result = await db.query(
      `SELECT id, nome, rfid_codigo, ativo, sala_id 
       FROM users 
       WHERE nome ILIKE $1 
       ORDER BY nome 
       LIMIT 20`,
      [`%${q}%`]
    );

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("[API] Erro ao buscar usuários:", error);
    res.status(500).json({ success: false, error: "Erro ao buscar usuários." });
  }
});

// GET /users/:id - Buscar usuário por ID (com histórico de alocações)
router.get("/users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Busca dados do usuário
    const userResult = await db.query(
      `SELECT u.id, u.nome, u.rfid_codigo, u.ativo, u.created_at, 
              s.nome as sala_nome, s.localizacao as sala_localizacao
       FROM users u
       LEFT JOIN salas s ON u.sala_id = s.id
       WHERE u.id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Usuário não encontrado." });
    }

    // Busca histórico de alocações
    const alocacoesResult = await db.query(
      `SELECT a.id, a.inicio, a.fim, 
              s.nome as sala_nome, s.localizacao as sala_localizacao,
              s.status as sala_status
       FROM alocacao_sala a
       JOIN salas s ON a.sala_id = s.id
       WHERE a.user_id = $1
       ORDER BY a.inicio DESC`,
      [userId]
    );

    const user = userResult.rows[0];
    const alocacoes = alocacoesResult.rows;

    res.status(200).json({
      success: true,
      data: {
        ...user,
        alocacoes: alocacoes,
      },
    });
  } catch (error) {
    console.error("[API] Erro ao buscar detalhes do usuário:", error);
    res
      .status(500)
      .json({ success: false, error: "Erro ao buscar detalhes do usuário." });
  }
});

// POST /users - Criar novo usuário
router.post("/users", createUser);

// PUT /users/:id - Atualizar usuário
router.put("/users/:id", updateUser);

// DELETE /users/:id - Deletar usuário
router.delete("/users/:id", deleteUser);

// GET /salas - Listar todas as salas
router.get("/salas", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, nome, localizacao, status FROM salas ORDER BY nome"
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("[API] Erro ao buscar salas:", error);
    res.status(500).json({ success: false, error: "Erro ao buscar salas." });
  }
});

// ===== ROTAS DE ALOCAÇÕES (TAREFAS) =====
// GET /users/:id/alocacoes - Listar alocações de um usuário
router.get("/users/:id/alocacoes", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const result = await db.query(
      `SELECT a.id, a.inicio, a.fim, 
              s.id as sala_id, s.nome as sala_nome, s.localizacao as sala_localizacao,
              CASE 
                WHEN a.fim IS NULL THEN 'em_andamento'
                ELSE 'completa'
              END as status
       FROM alocacao_sala a
       JOIN salas s ON a.sala_id = s.id
       WHERE a.user_id = $1
       ORDER BY a.inicio DESC`,
      [userId]
    );

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("[API] Erro ao buscar alocações:", error);
    res
      .status(500)
      .json({ success: false, error: "Erro ao buscar alocações." });
  }
});

// POST /alocacoes - Criar nova alocação (atribuir tarefa)
router.post("/alocacoes", async (req, res) => {
  try {
    const { user_id, sala_id, inicio, fim } = req.body;

    if (!user_id || !sala_id) {
      return res.status(400).json({
        success: false,
        error: "user_id e sala_id são obrigatórios.",
      });
    }

    // Verificar se usuário existe
    const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [
      user_id,
    ]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Usuário não encontrado.",
      });
    }

    // Verificar se sala existe
    const salaCheck = await db.query("SELECT id FROM salas WHERE id = $1", [
      sala_id,
    ]);
    if (salaCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Sala não encontrada.",
      });
    }

    // Verificar se usuário já tem alocação ativa (apenas se não tiver fim definido)
    if (!fim) {
      const alocacaoAtiva = await db.query(
        "SELECT id FROM alocacao_sala WHERE user_id = $1 AND fim IS NULL",
        [user_id]
      );

      if (alocacaoAtiva.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error:
            "Usuário já possui uma tarefa em andamento. Finalize a tarefa atual antes de criar uma nova.",
        });
      }
    }

    // Validar datas
    const inicioDate = inicio ? new Date(inicio) : new Date();
    const fimDate = fim ? new Date(fim) : null;

    if (isNaN(inicioDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Data/hora de início inválida.",
      });
    }

    if (fimDate && isNaN(fimDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Data/hora de fim inválida.",
      });
    }

    if (fimDate && fimDate <= inicioDate) {
      return res.status(400).json({
        success: false,
        error: "A data/hora de fim deve ser posterior à data/hora de início.",
      });
    }

    // Criar alocação
    const result = await db.query(
      `INSERT INTO alocacao_sala (user_id, sala_id, inicio, fim) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, user_id, sala_id, inicio, fim`,
      [
        user_id,
        sala_id,
        inicioDate.toISOString(),
        fimDate ? fimDate.toISOString() : null,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("[API] Erro ao criar alocação:", error);
    res.status(500).json({ success: false, error: "Erro ao criar alocação." });
  }
});

// PUT /alocacoes/:id/complete - Finalizar alocação (marcar tarefa como completa)
router.put("/alocacoes/:id/complete", async (req, res) => {
  try {
    const alocacaoId = parseInt(req.params.id);

    // Verificar se alocação existe e está ativa
    const alocacaoCheck = await db.query(
      "SELECT id, user_id, sala_id, inicio, fim FROM alocacao_sala WHERE id = $1",
      [alocacaoId]
    );

    if (alocacaoCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Alocação não encontrada.",
      });
    }

    if (alocacaoCheck.rows[0].fim !== null) {
      return res.status(400).json({
        success: false,
        error: "Esta tarefa já foi finalizada.",
      });
    }

    // Finalizar alocação
    const result = await db.query(
      `UPDATE alocacao_sala 
       SET fim = NOW() 
       WHERE id = $1 
       RETURNING id, user_id, sala_id, inicio, fim`,
      [alocacaoId]
    );

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("[API] Erro ao finalizar alocação:", error);
    res
      .status(500)
      .json({ success: false, error: "Erro ao finalizar alocação." });
  }
});

// ===== OUTRAS ROTAS =====
// Rota para obter estatísticas/KPIs
router.get("/stats", async (req, res) => {
  try {
    // Total de usuários
    const totalUsers = await db.query("SELECT COUNT(*) as count FROM users");

    // Usuários ativos
    const activeUsers = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE ativo = true"
    );

    // Total de salas
    const totalSalas = await db.query("SELECT COUNT(*) as count FROM salas");

    // Salas disponíveis
    const salasDisponiveis = await db.query(
      "SELECT COUNT(*) as count FROM salas WHERE status = 'disponivel'"
    );

    // Salas ocupadas (com alocação ativa)
    const salasOcupadas = await db.query(
      `SELECT COUNT(DISTINCT sala_id) as count 
       FROM alocacao_sala 
       WHERE fim IS NULL`
    );

    res.status(200).json({
      success: true,
      data: {
        totalUsers: parseInt(totalUsers.rows[0].count),
        activeUsers: parseInt(activeUsers.rows[0].count),
        totalSalas: parseInt(totalSalas.rows[0].count),
        salasDisponiveis: parseInt(salasDisponiveis.rows[0].count),
        salasOcupadas: parseInt(salasOcupadas.rows[0].count),
      },
    });
  } catch (error) {
    console.error("[API] Erro ao buscar estatísticas:", error);
    res
      .status(500)
      .json({ success: false, error: "Erro ao buscar estatísticas." });
  }
});

// Rota de teste para enviar SMS via Twilio
router.post("/test-twilio-sms", async (req, res) => {
  const { to, message } = req.body;
  if (!to || !message) {
    return res
      .status(400)
      .json({ error: "Número de telefone e mensagem são obrigatórios." });
  }

  const formattedTo = to.startsWith("+") ? to : `+55${to}`;

  console.log(
    `[HTTP] Tentando enviar SMS para ${formattedTo} com mensagem: "${message}"`
  );
  const result = await sendSMS(formattedTo, message);

  if (result.success) {
    res.status(200).json({
      success: true,
      message: "SMS enviado com sucesso!",
      data: result.data,
    });
  } else {
    res.status(500).json({
      success: false,
      message: "Falha ao enviar SMS.",
      error: result.error,
    });
  }
});

module.exports = router;
