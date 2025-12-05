// src/config/mqtt.js
require('dotenv').config(); // Carrega as variáveis do .env
const mqtt = require('mqtt');

// Opções de conexão para o HiveMQ Cloud (que usa TLS/SSL)
const mqttOptions = {
  port: parseInt(process.env.MQTT_PORT), // Garante que a porta seja um número
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  clientId: `backend_iot_${Math.random().toString(16).substring(2, 8)}`, // ID de cliente único
  clean: true, // Limpa sessões anteriores
  reconnectPeriod: 1000, // Tenta reconectar a cada 1 segundo
  protocol: 'mqtts' // HiveMQ Cloud usa MQTTS (MQTT sobre SSL/TLS)
};

const client = mqtt.connect(process.env.MQTT_BROKER_URL, mqttOptions);

client.on('connect', () => {
  console.log('Backend conectado ao Broker MQTT (HiveMQ)!');
  
  // --- LISTA DE TÓPICOS ATUALIZADA ---
  // Agora ouvimos o pedido do cartão E o envio do PIN
  const topicos = ['request_card', 'submit_sms'];

  client.subscribe(topicos, (err) => {
    if (!err) {
      console.log(`Subscrito aos tópicos: ${topicos.join(', ')}`);
    } else {
      console.error('Erro ao subscrever:', err);
    }
  });
});

client.on('error', (error) => {
  console.error('Erro na conexão MQTT do backend:', error);
});

client.on('close', () => {
  console.log('Conexão MQTT do backend fechada.');
});

client.on('reconnect', () => {
  console.log('Backend tentando reconectar ao Broker MQTT...');
});


module.exports = client;