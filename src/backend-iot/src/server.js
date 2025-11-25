// server.js
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

// --- Módulos e Configurações ---
const mqttClient = require('./config/mqtt'); // Cliente MQTT configurado
const db = require('./config/database');    // Cliente DB configurado
const { sendSMS } = require('./services/smsService'); // Serviço de SMS (Twilio)
const { generatePin } = require('./utils/pinGenerator'); // Gerador de PIN

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware para parsear corpos de requisição JSON

// --- Estrutura temporária para armazenar PINs MFA ---
// Em um ambiente de produção, esta estrutura seria mais robusta (ex: Redis, DB).
// Para a Prova de Conceito (PoC) da sprint, um objeto em memória é suficiente.
// Formato: { rfidCode: { pin: '123456', userId: 1, expiresAt: <timestamp>, userPhoneNumber: '5511987654321' } }
const activeMfaChallenges = {};

// --- Funções de Interação com o Banco de Dados ---
/**
 * Busca um usuário no banco de dados pelo código RFID.
 * IMPORTANTE: Para esta PoC, ele retorna um número de telefone fixo.
 * Na implementação final, a tabela 'users' DEVE ter uma coluna 'telefone'.
 * @param {string} rfidCode - O código RFID do usuário.
 * @returns {Promise<object|null>} Objeto do usuário ou null se não encontrado.
 */
async function getUserByRfid(rfidCode) {
  try {
    // A consulta REAL seria: SELECT id, nome, rfid_codigo, telefone FROM users WHERE rfid_codigo = $1
    // Por enquanto, adaptamos para o seu schema atual e injetamos um telefone para teste.
    const res = await db.query('SELECT id, nome, rfid_codigo FROM users WHERE rfid_codigo = $1', [rfidCode]);
    if (res.rows.length > 0) {
      // ATENÇÃO: SUBSTITUA 'SEU_NUMERO_DE_TESTE_AQUI' pelo seu número de celular VERIFICADO na Twilio,
      // no formato E.164 (ex: +5511987654321).
      // Se você não tiver um número real do usuário no DB ainda, este é o substituto.
      return { ...res.rows[0], telefone: process.env.TEST_USER_PHONE_NUMBER || '+5511987654321' }; // Ex: +5511987654321
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar usuário por RFID:', error);
    return null;
  }
}

// --- Lógica de Assinatura e Processamento de Mensagens MQTT ---
mqttClient.on('message', async (topic, message) => {
  console.log(`[MQTT] Mensagem recebida no tópico: ${topic}, Conteúdo: ${message.toString()}`);

  // 1. Processa a requisição de cartão RFID do ESP32-SENHA
  if (topic === 'request_card') {
    try {
      const payload = JSON.parse(message.toString());
      const rfidCode = payload.rfid; // Espera { "rfid": "XXXXXX" } do ESP32

      const user = await getUserByRfid(rfidCode);

      if (user) {
        console.log(`[Auth] RFID ${rfidCode} lido. Usuário: ${user.nome}. Gerando PIN...`);
        const pin = generatePin(6); // Gera um PIN de 6 dígitos
        const expiresAt = Date.now() + 5 * 60 * 1000; // PIN expira em 5 minutos
        const userPhoneNumber = user.telefone; // Pega o telefone do usuário (ou o de teste)

        // Armazena o desafio MFA em memória
        activeMfaChallenges[rfidCode] = { pin, userId: user.id, expiresAt, userPhoneNumber };
        console.log(`[Auth] PIN gerado para ${user.nome}: ${pin}`);

        // Envia o PIN via SMS usando o serviço Twilio
        const smsResult = await sendSMS(userPhoneNumber, `Seu codigo de acesso: ${pin}. Valido por 5 minutos.`);

        if (smsResult.success) {
          console.log(`[SMS] SMS com PIN enviado para ${userPhoneNumber}`);
          // Publica um comando no MQTT para o ESP32-SENHA exibir a mensagem de "Digite o PIN"
          mqttClient.publish('command_display', JSON.stringify({
            line1: 'Digite o codigo',
            line2: 'SMS recebido'
          }));
        } else {
          console.error('[SMS] Falha ao enviar SMS:', smsResult.error);
          mqttClient.publish('command_display', JSON.stringify({
            line1: 'Erro SMS',
            line2: 'Tente novamente'
          }));
        }

      } else {
        console.log(`[Auth] RFID ${rfidCode} não encontrado no banco de dados.`);
        mqttClient.publish('command_display', JSON.stringify({
          line1: 'Cartao nao',
          line2: 'cadastrado'
        }));
      }

    } catch (e) {
      console.error('[MQTT Error] Erro ao processar mensagem MQTT de request_card:', e);
      mqttClient.publish('command_display', JSON.stringify({
        line1: 'Erro interno',
        line2: 'Contate suporte'
      }));
    }
  }

  // 2. Processa o PIN enviado pelo ESP32-SENHA
  if (topic === 'submit_sms') {
    try {
      const payload = JSON.parse(message.toString());
      const rfidCode = payload.rfid; // Assumindo que o ESP32 envia o RFID novamente para associar
      const submittedPin = payload.pin; // O PIN digitado pelo usuário no teclado do ESP32

      const challenge = activeMfaChallenges[rfidCode];

      if (challenge && challenge.userPhoneNumber) { // Verifica se há um desafio MFA ativo para este RFID
        if (Date.now() > challenge.expiresAt) {
          console.log(`[Auth] Desafio MFA para RFID ${rfidCode} expirou.`);
          mqttClient.publish('command_display', JSON.stringify({
            line1: 'Codigo expirado',
            line2: 'Tente novamente'
          }));
          delete activeMfaChallenges[rfidCode]; // Remove o desafio expirado
          return;
        }

        if (submittedPin === challenge.pin) {
          console.log(`[Auth] PIN correto para RFID ${rfidCode}. Acesso liberado!`);
          mqttClient.publish('command_display', JSON.stringify({
            line1: 'Acesso Liberado',
            line2: 'Bem-vindo!'
          }));
          // TODO: Publicar no tópico 'tranca' para o ESP32-TRANCA desbloquear
          mqttClient.publish('tranca', 'liberada'); // O ESP32-TRANCA precisa subscrever a 'tranca'
          delete activeMfaChallenges[rfidCode]; // Remove o desafio após sucesso
        } else {
          console.log(`[Auth] PIN incorreto para RFID ${rfidCode}.`);
          mqttClient.publish('command_display', JSON.stringify({
            line1: 'Codigo incorreto',
            line2: 'Acesso negado'
          }));
          // O desafio permanece ativo para mais tentativas, mas o contador de tentativas
          // e o bloqueio temporário seriam implementados em uma versão mais robusta.
        }
      } else {
        console.log(`[Auth] Nenhum desafio MFA ativo para RFID ${rfidCode}.`);
        mqttClient.publish('command_display', JSON.stringify({
          line1: 'Nenhum pedido',
          line2: 'de PIN ativo'
        }));
      }

    } catch (e) {
      console.error('[MQTT Error] Erro ao processar mensagem MQTT de submit_sms:', e);
      mqttClient.publish('command_display', JSON.stringify({
        line1: 'Erro interno',
        line2: 'Contate suporte'
      }));
    }
  }
});

// --- Rotas HTTP (para testar o envio de SMS e verificar o status do backend) ---

// Rota de saúde (health check) para verificar se o backend está ativo
app.get('/', (req, res) => {
  res.send('Backend IoT está rodando e ouvindo o MQTT!');
});

// Rota de teste para enviar SMS via Twilio (pode ser removida após os testes iniciais)
app.post('/test-twilio-sms', async (req, res) => {
  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ error: 'Número de telefone e mensagem são obrigatórios.' });
  }

  // Certifique-se que o número 'to' esteja verificado na Twilio se for conta trial
  // O formato deve ser E.164 (ex: +5511987654321)
  const formattedTo = to.startsWith('+') ? to : `+55${to}`; // Adiciona +55 se não tiver (presumindo Brasil)
  
  console.log(`[HTTP] Tentando enviar SMS para ${formattedTo} com mensagem: "${message}"`);
  const result = await sendSMS(formattedTo, message);

  if (result.success) {
    res.status(200).json({ success: true, message: 'SMS enviado com sucesso!', data: result.data });
  } else {
    res.status(500).json({ success: false, message: 'Falha ao enviar SMS.', error: result.error });
  }
});

// --- Iniciar o Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor backend ouvindo na porta ${PORT}`);
  console.log('Aguardando mensagens MQTT...');
});