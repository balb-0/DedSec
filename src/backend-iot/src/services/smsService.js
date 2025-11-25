// src/services/smsService.js (para Twilio)
require('dotenv').config(); // Carrega as variáveis do .env
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER; // O número que a Twilio te deu

const client = new twilio(accountSid, authToken);

const sendSMS = async (to, body) => {
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.error('Erro: Credenciais da Twilio (SID, Token ou Número) não configuradas no .env');
    return { success: false, error: 'Credenciais da Twilio não configuradas.' };
  }

  try {
    const message = await client.messages.create({
      body: body,
      from: twilioPhoneNumber, // O número da Twilio que envia o SMS
      to: to // O número do destinatário (DEVE SER VERIFICADO na Twilio se for uma conta trial)
    });
    console.log(`SMS enviado com sucesso via Twilio! SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('Erro ao enviar SMS via Twilio:', error);
    // Erros comuns aqui: número não verificado, formato incorreto do 'to'
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS };