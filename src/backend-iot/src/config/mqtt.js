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
  // Aqui você pode subscrever aos tópicos que o ESP32-SENHA vai publicar, por exemplo
  client.on('connect', () => {
  console.log('Backend conectado ao Broker MQTT (HiveMQ)!');
  
  // --- MUDANÇA AQUI: Assinar os dois tópicos ---
  const topicos = ['request_card', 'submit_sms'];
  
  client.subscribe(topicos, (err) => {
    if (!err) {
      console.log(`Subscrito aos tópicos: ${topicos.join(', ')}`);
    } else {
      console.error('Erro ao subscrever:', err);
    }
  });
});
  // Você pode ter outros tópicos aqui, como 'porta/status' para o sensor ultrassônico
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