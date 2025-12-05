#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <MFRC522.h>

const int saidaPin = 16;
const int buzzer = 32;
int contador = 0;

bool portaAberta = false;

WiFiClientSecure espClient;
PubSubClient client(espClient);
// -----------------------------
// CLASSE SENSOR ULTRASONICO
// -----------------------------

class Ultrasonico{
  private: 
    const int echo;
    const int trig;
    long duracao;
    float distancia;

  public:
    Ultrasonico(const int echo, const int trig) : echo(echo), trig(trig){}
  void definir(){
    pinMode(echo, INPUT);
    pinMode(trig, OUTPUT);
  }
  float ler(){
    digitalWrite(trig, LOW);
    delayMicroseconds(2);
    digitalWrite(trig, HIGH);
    delayMicroseconds(10);
    digitalWrite(trig, LOW);
    
    duracao = pulseIn(echo, HIGH); // Mede o tempo de resposta do ECHO  
    distancia = (duracao * 0.0343) / 2;// Calcula a distância usando a velocidade do som (aproximadamente 343 m/s)
    Serial.print("Distância: ");
    Serial.print(distancia);
    Serial.println(" cm");
    return distancia;
  }
};
class Wifi {
  private:
    const char* ssid;      // Nome da rede WiFi
    const char* password;  // Senha da rede WiFi
  public:
    // Construtor: armazena as credenciais da rede WiFi
    Wifi(const char* nome, const char* senha) : ssid(nome), password(senha) {}

    // Conecta o ESP32 à rede WiFi
    void conectar_Wifi() {
      delay(10);
      Serial.println();
      Serial.print("Conectando a rede: ");
      Serial.println(ssid);

      WiFi.begin(ssid, password);

      // Aguarda até que a conexão seja estabelecida
      while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.print(".");
      }

      Serial.println("");
      Serial.println("WiFi conectado");
      Serial.println("Endereco IP: ");
      Serial.println(WiFi.localIP());
    }
};

class MQTT {
private:
  PubSubClient& client;
  const char* broker;
  int port;
  const char* username;
  const char* password;

public:
  MQTT(PubSubClient& c, const char* broker, int port, const char* user, const char* pass)
    : client(c), broker(broker), port(port), username(user), password(pass) {}

  void iniciar() {
    client.setServer(broker, port);
  }

  void reconnect() {
    while (!client.connected()) {
      Serial.print("Conectando ao broker MQTT...");

      if (client.connect("ESP32ClientSub", username, password)) {
        Serial.println("Conectado!");
        client.subscribe("tranca");
      } else {
        Serial.print("Falhou, rc=");
        Serial.println(client.state());
        Serial.println("Tentando de novo em 5s...");
        delay(5000);
      }
    }
  }
};

class Alarme {
  private:
  int pin;
  int contador;
  const int limiteDisparo;
  static const tempo_beep_ms = 500;
  static const tempo_quant_beeps = 3;

  void tocarSom() {
    Serial.println("Alarme Disparado!!");
    for (int i = 0; i < 3; i += 1) {
      digitalWrite(pin, HIGD);
      delay(tempo_beep_ms);
      digitalWrite(pin, LOW);
      delay(tempo_beep_ms);
    }
  }

  public:
  Alarme(int pinoBuzzer, int limite): pin(pinoBuzzer), limiteDisparo(limite) {
    contador = 0;
  }
  void definir() {
    pinMode(pinoBuzzer, OUTPUT);
  }

  void monitorar(bool houveViolacao) {
    if (houveViolacao) {
      contador += 1 

      if (contador >= limiteDisparo){
        tocarSom();
        contador = 0;
      } 
      else {
        contador = 0;
      }
      
    }
  }

}


Ultrasonico sensorUltrasonico(18, 19);
Wifi wifi("Inteli.Iot", "%(Yk(sxGMtvFEs.3");
MQTT mqtt(client, "18a61305753543af9634a27594738058.s1.eu.hivemq.cloud", 8883, "ESP32", "Dedsec2@@");

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Mensagem recebida no tópico: ");
  Serial.println(topic);

  char payloadStr[length + 1];
  memcpy(payloadStr, payload, length);
  payloadStr[length] = '\0';

  if (strcmp(payloadStr, "liberada") == 0) {
    digitalWrite(16, HIGH);
    delay(5000);
    digitalWrite(16, LOW);
  }
}


void setup() {
  Serial.begin(115200);

  pinMode(saidaPin, OUTPUT);
  pinMode(buzzer, OUTPUT);

  wifi.conectar_Wifi();

  espClient.setInsecure();
  client.setCallback(callback);

  mqtt.iniciar();
  sensorUltrasonico.definir();
}


void loop() {
  if (!client.connected())
    mqtt.reconnect();

  client.loop();
  
  if (sensorUltrasonico.ler() >= 10){
    delay(1000);
    tocarAlarme(int buzzer);
  }

  else {
    contador = 0;
  }
}
