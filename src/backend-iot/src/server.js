// server.js
require("dotenv").config(); // Carrega as variáveis de ambiente do arquivo .env

// --- Módulos e Configurações ---
const mqttClient = require("./config/mqtt"); // Cliente MQTT configurado
const db = require("./config/database"); // Cliente DB configurado
const { sendSMS } = require("./services/smsService"); // Serviço de SMS (Twilio)
const { generatePin } = require("./utils/pinGenerator"); // Gerador de PIN

const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Middleware para parsear corpos de requisição JSON

// Rotas da API (devem vir antes do static)
app.use("/api", routes);

// Em produção, servir os arquivos estáticos do frontend
if (process.env.NODE_ENV === "production") {
  // Caminho relativo: de src/backend-iot/src/ para src/frontend/dist
  const frontendPath = path.join(__dirname, "../../../frontend/dist");

  // Verificar se o diretório existe
  const fs = require("fs");
  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));

    // Para todas as rotas que não são API, servir o index.html (SPA routing)
    app.get("*", (req, res) => {
      // Não servir index.html para rotas da API
      if (req.path.startsWith("/api")) {
        return res.status(404).json({ error: "Not found" });
      }
      res.sendFile(path.join(frontendPath, "index.html"));
    });
  } else {
    console.warn(`⚠️  Frontend build não encontrado em: ${frontendPath}`);
    console.warn(
      "   Certifique-se de que o frontend foi buildado antes de iniciar o servidor."
    );
  }
} else {
  // Em desenvolvimento, apenas as rotas da API
  app.use(routes);
}

// --- Estrutura temporária para armazenar PINs MFA ---
const activeMfaChallenges = {};

// --- Funções de Interação com o Banco de Dados ---
async function getUserByRfid(rfidCode) {
  try {
    // 1. Consulta o Banco de Dados REAL
    const res = await db.query('SELECT * FROM users WHERE rfid_codigo = $1', [rfidCode]);
    
    // 2. Se encontrou o usuário...
    if (res.rows.length > 0) {
      const usuario = res.rows[0];
      
      // AQUI ESTÁ A CORREÇÃO:
      // Injeta o telefone do .env pois o banco do colega não tem essa coluna
      usuario.telefone = process.env.TEST_USER_PHONE_NUMBER || '+5511987792285';
      
      return usuario;
    }
    
    // Se não encontrou no banco, retorna null
    return null;

  } catch (error) {
    console.error('Erro ao buscar usuário por RFID:', error);
    return null;
  }
}

// --- Lógica de Assinatura e Processamento de Mensagens MQTT ---
mqttClient.on("message", async (topic, message) => {
  console.log(
    `[MQTT] Mensagem recebida no tópico: ${topic}, Conteúdo: ${message.toString()}`
  );

  // =================================================================
  // 1. Processa a requisição de cartão RFID (REQUEST_CARD)
  // =================================================================
  if (topic === "request_card") {
    try {
      const payload = JSON.parse(message.toString());
      const rfidCode = payload.rfid; 

      const user = await getUserByRfid(rfidCode);

      if (user) {
        console.log(
          `[Auth] RFID ${rfidCode} lido. Usuário: ${user.nome}. Gerando PIN...`
        );
        const pin = generatePin(6); 
        const expiresAt = Date.now() + 5 * 60 * 1000; 
        const userPhoneNumber = user.telefone; 

        // Armazena o desafio MFA em memória
        activeMfaChallenges[rfidCode] = {
          pin,
          userId: user.id,
          salaId: user.sala_id, // Guardamos a sala também
          expiresAt,
          userPhoneNumber,
        };
        console.log(`[Auth] PIN gerado para ${user.nome}: ${pin}`);

        // Envia o PIN via SMS
        const smsResult = await sendSMS(
          userPhoneNumber,
          `Seu codigo de acesso: ${pin}. Valido por 5 minutos.`
        );

        if (smsResult.success) {
          console.log(`[SMS] SMS com PIN enviado para ${userPhoneNumber}`);
          mqttClient.publish(
            "command_display",
            JSON.stringify({
              line1: "Digite o codigo",
              line2: "SMS recebido",
            })
          );
        } else {
          console.error("[SMS] Falha ao enviar SMS:", smsResult.error);
          mqttClient.publish(
            "command_display",
            JSON.stringify({
              line1: "Erro SMS",
              line2: "Tente novamente",
            })
          );
        }
      } else {
        console.log(`[Auth] RFID ${rfidCode} não encontrado no banco de dados.`);
        mqttClient.publish(
          "command_display",
          JSON.stringify({
            line1: "Cartao nao",
            line2: "cadastrado",
          })
        );
      }
    } catch (e) {
      console.error("[MQTT Error] Erro ao processar request_card:", e);
      mqttClient.publish(
        "command_display",
        JSON.stringify({
          line1: "Erro interno",
          line2: "Contate suporte",
        })
      );
    }
  }

  // =================================================================
  // 2. Processa o PIN enviado pelo ESP32 (SUBMIT_SMS)
  // =================================================================
  if (topic === "submit_sms") {
    try {
      const payload = JSON.parse(message.toString());
      const rfidCode = payload.rfid; 
      const submittedPin = payload.pin; // O PIN que veio do teclado

      const challenge = activeMfaChallenges[rfidCode];

      // Verifica se existe um desafio para esse cartão
      if (challenge) {
        
        // Verifica se expirou
        if (Date.now() > challenge.expiresAt) {
          console.log(`[Auth] Desafio MFA para RFID ${rfidCode} expirou.`);
          mqttClient.publish("command_display", JSON.stringify({ line1: "Codigo expirado", line2: "Tente novamente" }));
          delete activeMfaChallenges[rfidCode];
          return;
        }

        // VERIFICAÇÃO DO PIN
        if (challenge.pin === submittedPin) {
          console.log(`[Auth] PIN correto para RFID ${rfidCode}. Acesso Liberado!`);

          // --- LOG DE ACESSO NO BANCO ---
          try {
            const userId = challenge.userId; 
            const salaId = challenge.salaId || 1; 

            // A. Fecha sessão anterior (Update)
            await db.query(
              `UPDATE alocacao_sala SET fim = NOW() WHERE user_id = $1 AND fim IS NULL`,
              [userId]
            );

            // B. Cria nova sessão (Insert)
            await db.query(
              `INSERT INTO alocacao_sala (user_id, sala_id, inicio) VALUES ($1, $2, NOW())`,
              [userId, salaId]
            );

            console.log(`[DB] Log registrado para User ID ${userId}`);
          } catch (dbError) {
            console.error("[DB Error] Erro ao salvar no banco:", dbError);
          }

          // Libera a porta
          mqttClient.publish("command_display", JSON.stringify({ line1: "Acesso Liberado", line2: "Bem-vindo!" }));
          mqttClient.publish("tranca", "liberada");
          
          delete activeMfaChallenges[rfidCode]; // Limpa desafio

        } else {
          // PIN INCORRETO
          console.log(`[Auth] PIN incorreto para RFID ${rfidCode}.`);
          mqttClient.publish("command_display", JSON.stringify({ line1: "Codigo incorreto", line2: "Tente novamente" }));
        }

      } else {
        // SEM DESAFIO ATIVO
        console.log(`[Auth] Nenhum desafio ativo para ${rfidCode}.`);
        mqttClient.publish("command_display", JSON.stringify({ line1: "Nenhum pedido", line2: "de PIN ativo" }));
      }

    } catch (e) {
      console.error("[MQTT Error] Erro ao processar submit_sms:", e);
      mqttClient.publish("command_display", JSON.stringify({ line1: "Erro interno", line2: "Contate suporte" }));
    }
  }
});

// --- Iniciar o Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor backend ouvindo na porta ${PORT}`);
  console.log("Aguardando mensagens MQTT...");
});