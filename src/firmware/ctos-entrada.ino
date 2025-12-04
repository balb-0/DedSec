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
bool aguardandoPin = false; // Substitui o sistemaAtivo antigo
String rfidAtual = "";      // Armazena o UID do cartão lido para enviar junto com o PIN

// -----------------------------
// CLASSE TECLADO
// -----------------------------
class Teclado {
  private:
    Keypad teclado;
    String senhaDigitada;

  public:
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
// CLASSE DISPLAY (Simplificada para acesso global)
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

    // Métodos estáticos ou globais facilitariam, mas vamos usar a instância global lcd diretamente nos callbacks
    void escrever(String l1, String l2) {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print(l1);
      lcd.setCursor(0, 1);
      lcd.print(l2);
    }
    
    void escreverSenhaMascarada(String senha) {
      lcd.setCursor(0, 1);
      lcd.print("                "); // Limpa linha 2
      lcd.setCursor(0, 1);
      for (int i = 0; i < senha.length(); i++) lcd.print('*');
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
// INSTANCIAS GLOBAIS (Necessárias para o Callback MQTT)
// -----------------------------
// Pinos do Teclado
const byte LINHAS = 4;
const byte COLUNAS = 4;
char TECLAS_MATRIZ[4][4] = { {'1', '2', '3', 'A'}, {'4', '5', '6', 'B'}, {'7', '8', '9', 'C'}, {'*', '0', '#', 'D'} };
byte PINOS_LINHAS[LINHAS] = {17, 16, 14, 25};
byte PINOS_COLUNAS[COLUNAS] = {15, 32, 33, 35};

Teclado teclado(TECLAS_MATRIZ, PINOS_LINHAS, PINOS_COLUNAS, LINHAS, COLUNAS);
Display display1(26, 27);
Rfid leitorCartao(5, 22);

WiFiClientSecure espClient;
PubSubClient client(espClient);

// -----------------------------
// FUNÇÃO AUXILIAR: PARSE JSON MANUAL
// -----------------------------
// Extrai valor de uma chave JSON simples (ex: {"line1": "Texto"})
String extrairJSON(String json, String chave) {
  String busca = "\"" + chave + "\":";
  int inicio = json.indexOf(busca);
  if (inicio == -1) return "";
  
  inicio += busca.length();
  // Pula espaços e aspas iniciais
  while (json[inicio] == ' ' || json[inicio] == '"') inicio++;
  
  int fim = json.indexOf("\"", inicio);
  if (fim == -1) return "";
  
  return json.substring(inicio, fim);
}

// -----------------------------
// CALLBACK MQTT (Onde a mágica acontece)
// -----------------------------
void mqtt_callback(char* topic, byte* payload, unsigned int length) {
  String mensagem = "";
  for (int i = 0; i < length; i++) mensagem += (char)payload[i];
  
  Serial.print("Mensagem recebida ["); Serial.print(topic); Serial.print("]: ");
  Serial.println(mensagem);

  // Se o backend mandou algo para o display
  if (String(topic) == "command_display") {
    String l1 = extrairJSON(mensagem, "line1");
    String l2 = extrairJSON(mensagem, "line2");
    display1.escrever(l1, l2);
    
    // Se a mensagem for pedindo código, ativamos o teclado
    if (l1.indexOf("Digite") >= 0 || l2.indexOf("SMS") >= 0) {
      aguardandoPin = true;
      teclado.limparSenha();
    } 
    // Se for acesso liberado ou negado, resetamos
    else if (l1.indexOf("Acesso") >= 0 || l1.indexOf("Cartao nao") >= 0 || l1.indexOf("Codigo") >= 0) {
      aguardandoPin = false;
      rfidAtual = ""; // Limpa o RFID atual
      delay(3000); // Mostra a mensagem por 3s
      display1.escrever("Aproxime o", "cartao"); // Volta ao inicio
      leitorCartao.reiniciar();
    }
  }
}

// -----------------------------
// CLASSE MQTT (Adaptada)
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
      espClient.setInsecure(); // Ignora certificado SSL
      client.setServer(broker, port);
      client.setCallback(mqtt_callback); // Define a função global acima
    }

    void reconectar() {
      while (!client.connected()) {
        Serial.print("Conectando ao MQTT...");
        // Tenta conectar
        if (client.connect("ESP32_Entrada", user, pass)) {
          Serial.println("Conectado!");
          
          // --- LINHAS NOVAS DE DEBUG ---
          boolean r = client.subscribe("command_display");
          if(r) {
             Serial.println("SUCESSO: Inscricao no topico 'command_display' enviada!");
          } else {
             Serial.println("ERRO: Falha ao tentar se inscrever!");
          }
          // -----------------------------
          
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
// WIFI
// -----------------------------
void conectarWiFi() {
  WiFi.begin("Inteli.Iot", "%(Yk(sxGMtvFEs.3");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Conectado!");
}

// -----------------------------
// SETUP
// -----------------------------
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

// -----------------------------
// LOOP
// -----------------------------
void loop() {
  meuMQTT.loop();

  // 1. Lendo Cartão (Só se não estiver esperando PIN)
  if (!aguardandoPin) {
    if (leitorCartao.detectarCartao()) {
      rfidAtual = leitorCartao.lerUID();
      Serial.println("RFID Lido: " + rfidAtual);
      
      display1.escrever("Verificando...", "Aguarde");
      
      // Envia para o backend processar
      meuMQTT.publicarCartao(rfidAtual);
      
      leitorCartao.encerrarLeitura();
    }
  }

  // 2. Digitando PIN (Só se o backend pediu)
  if (aguardandoPin) {
    char tecla = teclado.lerTecla();
    if (tecla) {
      if (tecla == '#') {
        // Envia PIN + RFID para o backend conferir
        display1.escrever("Verificando", "PIN...");
        meuMQTT.publicarPin(rfidAtual, teclado.getSenha());
        teclado.limparSenha();
        // Não mudamos 'aguardandoPin' aqui, esperamos o backend responder via command_display
      } else {
        teclado.adicionarTecla(tecla);
        // Atualiza a tela (mantém a linha 1 fixa, atualiza a linha 2)
        lcd.setCursor(0, 1);
        lcd.print("                "); // Limpa visualmente
        lcd.setCursor(0, 1);
        String s = teclado.getSenha();
        for(int i=0; i<s.length(); i++) lcd.print("*");
      }
    }
  }
}