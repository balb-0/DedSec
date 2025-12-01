// routes.js
const express = require("express");
const router = express.Router();
const db = require("./config/database");
const { sendSMS } = require("./services/smsService");

// Rota de saúde (health check)
router.get("/", (req, res) => {
  res.send("Backend IoT está rodando e ouvindo o MQTT!");
});

// Rota de teste simples
router.get("/teste", (req, res) => {
  res.json({ message: "Rota de teste funcionando!" });
});

// Rota para listar todos os usuários
router.get("/users", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, nome, rfid_codigo, ativo, created_at FROM users ORDER BY created_at DESC"
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("[API] Erro ao buscar usuários:", error);
    res.status(500).json({ success: false, error: "Erro ao buscar usuários." });
  }
});

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
