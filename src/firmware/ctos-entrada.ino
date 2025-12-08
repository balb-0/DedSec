#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Keypad.h>
#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>

// -----------------------------
// CONFIGURAÇÃO LCD
// -----------------------------
#define ende 0x27
#define col 16
#define lin 2
LiquidCrystal_I2C lcd(ende, col, lin);

// -----------------------------
// VARIÁVEIS GERAIS
// -----------------------------
bool aguardandoPin = false; 
String rfidAtual = "";      

// -----------------------------
// CLASSE TECLADO
// -----------------------------
class Teclado {
  private:
    Keypad teclado;
    String senhaDigitada;

  public:
    // Construtor
    Teclado(char matriz[4][4], byte* linhas, byte* colunas, byte qtdLinhas, byte qtdColunas)
      : teclado(makeKeymap(matriz), linhas, colunas, qtdLinhas, qtdColunas), senhaDigitada("") {}

    char lerTecla() {
      return teclado.getKey();
    }

    void adicionarTecla(char tecla) {
      if (tecla >= '0' && tecla <= '9' && senhaDigitada.length() < 6) {
        senhaDigitada += tecla;
      } else if (tecla == '*') {
        if (senhaDigitada.length() > 0) {
          senhaDigitada.remove(senhaDigitada.length() - 1);
        }
      }
    }

    String getSenha() { return senhaDigitada; }
    void limparSenha() { senhaDigitada = ""; }
};

// -----------------------------
// CLASSE DISPLAY
// -----------------------------
class Display {
  private:
    int pin1, pin2;
  public:
    Display(int porta1, int porta2): pin1(porta1), pin2(porta2) {}

    void iniciar() {
      Wire.begin(pin1, pin2);
      lcd.init();
      lcd.backlight();
    }

    void escrever(String l1, String l2) {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print(l1);
      lcd.setCursor(0, 1);
      lcd.print(l2);
    }
};

// -----------------------------
// CLASSE RFID
// -----------------------------
class Rfid {
  private:
    int ssPin, rstPin;
    MFRC522 rfid;
  public:
    Rfid(int porta1, int porta2): ssPin(porta1), rstPin(porta2), rfid(porta1, porta2) {}

    void iniciar() {
      SPI.begin(18, 19, 23, 5);
      rfid.PCD_Init();
    }

    void reiniciar() { rfid.PCD_Init(); }

    bool detectarCartao() {
      return rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial();
    }

    String lerUID() {
      String uidString = "";
      for (byte i = 0; i < rfid.uid.size; i++) {
        if(rfid.uid.uidByte[i] < 0x10) uidString += "0";
        uidString += String(rfid.uid.uidByte[i], HEX);
      }
      uidString.toUpperCase();
      return uidString;
    }

    void encerrarLeitura() {
      rfid.PICC_HaltA();
      rfid.PCD_StopCrypto1();
    }
};

// -----------------------------
// INSTANCIAS GLOBAIS
// -----------------------------

// --- CORREÇÃO DE HARDWARE (SOFTWARE FIX) ---
const byte LINHAS = 4;
const byte COLUNAS = 4;

// Matriz Transposta (Invertemos para compensar a troca de pinos)
char TECLAS_MATRIZ[4][4] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}  // '*' = backspace, '#' = confirmar
};

// Pinos que eram Colunas viraram LINHAS (Input - Seguro para o pino 35)
byte PINOS_LINHAS[LINHAS] = {17, 16, 14, 25};
// Pinos do ESP32 conectados às colunas do teclado
byte PINOS_COLUNAS[COLUNAS] = {15, 32, 33, 35};

Teclado teclado(TECLAS_MATRIZ, PINOS_LINHAS, PINOS_COLUNAS, LINHAS, COLUNAS);
Display display1(26, 27);
Rfid leitorCartao(5, 22);

WiFiClientSecure espClient;
PubSubClient client(espClient);

// -----------------------------
// AUXILIAR JSON
// -----------------------------
String extrairJSON(String json, String chave) {
  String busca = "\"" + chave + "\":";
  int inicio = json.indexOf(busca);
  if (inicio == -1) return "";
  inicio += busca.length();
  while (json[inicio] == ' ' || json[inicio] == '"') inicio++;
  int fim = json.indexOf("\"", inicio);
  if (fim == -1) return "";
  return json.substring(inicio, fim);
}

// -----------------------------
// CALLBACK MQTT
// -----------------------------
void mqtt_callback(char* topic, byte* payload, unsigned int length) {
  String mensagem = "";
  for (int i = 0; i < length; i++) mensagem += (char)payload[i];
  
  Serial.print("Mensagem recebida ["); Serial.print(topic); Serial.print("]: ");
  Serial.println(mensagem);

  if (String(topic) == "command_display") {
    String l1 = extrairJSON(mensagem, "line1");
    String l2 = extrairJSON(mensagem, "line2");
    display1.escrever(l1, l2);
    
    // ATENÇÃO: Verifique se o seu backend manda "Digite" (case sensitive)
    if (l1.indexOf("Digite") >= 0 || l2.indexOf("SMS") >= 0) {
      aguardandoPin = true;
      teclado.limparSenha();
    } 
    else if (l1.indexOf("Acesso") >= 0 || l1.indexOf("Cartao nao") >= 0 || l1.indexOf("Codigo") >= 0) {
      aguardandoPin = false;
      rfidAtual = ""; 
      
      // Pequeno delay para ler a mensagem antes de resetar
      if(l1.indexOf("Acesso") >= 0) delay(4000); 
      else delay(3000);

      display1.escrever("Aproxime o", "cartao");
      leitorCartao.reiniciar();
    }
  }
}

// -----------------------------
// CLASSE MQTT
// -----------------------------
class MQTT_Manager {
  private:
    const char* broker;
    int port;
    const char* user;
    const char* pass;
  public:
    MQTT_Manager(const char* b, int p, const char* u, const char* pw) 
      : broker(b), port(p), user(u), pass(pw) {}

    void iniciar() {
      espClient.setInsecure();
      client.setServer(broker, port);
      client.setCallback(mqtt_callback);
    }

    void reconectar() {
      while (!client.connected()) {
        Serial.print("Conectando ao MQTT...");
        if (client.connect("ESP32_Entrada_Final", user, pass)) { // ID Aleatorio ou fixo diferente
          Serial.println("Conectado!");
          client.subscribe("command_display");
        } else {
          Serial.print("Falha: "); Serial.print(client.state());
          delay(2000);
        }
      }
    }

    void loop() {
      if (!client.connected()) reconectar();
      client.loop();
    }

    void publicarCartao(String uid) {
      String payload = "{\"rfid\": \"" + uid + "\"}";
      client.publish("request_card", payload.c_str());
    }

    void publicarPin(String uid, String pin) {
      String payload = "{\"rfid\": \"" + uid + "\", \"pin\": \"" + pin + "\"}";
      client.publish("submit_sms", payload.c_str());
    }
};

MQTT_Manager meuMQTT("18a61305753543af9634a27594738058.s1.eu.hivemq.cloud", 8883, "ESP32-SENHA", "Dedsec2@@");

// -----------------------------
// WIFI E SETUP
// -----------------------------
void conectarWiFi() {
  WiFi.begin("Inteli.Iot", "%(Yk(sxGMtvFEs.3");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Conectado!");
}

void setup() {
  Serial.begin(115200);
  display1.iniciar();
  leitorCartao.iniciar();
  
  display1.escrever("Conectando", "WiFi...");
  conectarWiFi();
  
  display1.escrever("Conectando", "MQTT...");
  meuMQTT.iniciar();
  
  display1.escrever("Aproxime o", "cartao");
}

void loop() {
  meuMQTT.loop();

  if (!aguardandoPin) {
    if (leitorCartao.detectarCartao()) {
      rfidAtual = leitorCartao.lerUID();
      Serial.println("RFID Lido: " + rfidAtual);
      display1.escrever("Verificando...", "Aguarde");
      meuMQTT.publicarCartao(rfidAtual);
      leitorCartao.encerrarLeitura();
    }
  }

  if (aguardandoPin) {
    char tecla = teclado.lerTecla();
    if (tecla) {
      if (tecla == '#') {
        display1.escrever("Validando", "PIN...");
        meuMQTT.publicarPin(rfidAtual, teclado.getSenha());
        teclado.limparSenha();
        // Não reseta aguardandoPin aqui, espera o backend responder
      } else {
        teclado.adicionarTecla(tecla);
        lcd.setCursor(0, 1);
        lcd.print("                ");
        lcd.setCursor(0, 1);
        String s = teclado.getSenha();
        for(int i=0; i<s.length(); i++) lcd.print("*");
      }
    }
  }
}