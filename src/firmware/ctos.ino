#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Keypad.h>
#include <SPI.h>
#include <MFRC522.h>
#include <string>
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
String senha_correta = "123456";
bool sistemaAtivo = false;

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

    String getSenha() {
      return senhaDigitada;
    }

    void limparSenha() {
      senhaDigitada = "";
    }
};

// -----------------------------
// COMUNICAÇÃO COM TRANCA
// -----------------------------
WiFiClientSecure espClient;
PubSubClient client(espClient);

// -----------------------------
// CLASSE RFID
// -----------------------------
class Rfid {
  private:
    int ssPin;
    int rstPin;
    MFRC522 rfid;
    byte uidAutorizado[4] = {0x5c, 0x8D, 0x35, 0x4A};

  public:
    Rfid(int porta1, int porta2): ssPin(porta1), rstPin(porta2), rfid(porta1, porta2) {}

    void iniciar() {
      SPI.begin(18, 19, 23, 5);
      rfid.PCD_Init();
      delay(100);
      Serial.println("RC522 pronto!");
    }

    void reiniciar() {
      rfid.PCD_Init(); 
    }

    bool detectarCartao() {
      if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
        return false;
      }
      return true;
    }

    bool eCartaoAutorizado() {
      for (byte i = 0; i < 4; i++) {
        if (rfid.uid.uidByte[i] != uidAutorizado[i]) {
          return false;
        }
      }
      return true;
    }

    void encerrarLeitura() {
      rfid.PICC_HaltA();
      rfid.PCD_StopCrypto1();
      delay(50);
    }

    MFRC522& getRFID() {
      return rfid;
    }
};

// -----------------------------
// CLASSE DISPLAY
// -----------------------------
class Display {
  private:
    int pin1;
    int pin2;
    String texto1;
    String texto2;

  public:
    Display(int porta1, int porta2): pin1(porta1), pin2(porta2) {}

    void iniciar() {
      Serial.begin(115200);
      Wire.begin(pin1, pin2);
      lcd.init();
      lcd.backlight();
    }

    void setTexto1(String novoTexto1) {
      texto1 = novoTexto1;
    }

    void setTexto2(String novoTexto2) {
      texto2 = novoTexto2;
    }

    void escreverLinhaUnica(String texto, int linha = 0) {
      lcd.clear();
      lcd.setCursor(0, linha);
      lcd.print(texto);
    }

    void escreverLinhaDupla() {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print(texto1);
      lcd.setCursor(0, 1);
      lcd.print(texto2);
    }

    void escreverSenhaMascarada(String senha) {
      escreverLinhaUnica("Digite a senha:");
      lcd.setCursor(0, 1);
      for (int i = 0; i < senha.length(); i++) {
        lcd.print('*');
      }
    }
};

// -----------------------------
// CLASSE BUZZER
// -----------------------------
class Buzzer {
  private:
    int pin;

  public:
    Buzzer(int porta): pin(porta) {}

    void iniciar() {
      pinMode(pin, OUTPUT);
      digitalWrite(pin, LOW);
    }

    void tocarSom() {
      digitalWrite(pin, HIGH);
    }

    void desligar() {
      digitalWrite(pin, LOW);
    }
};

// -----------------------------
// CLASSE WIFI
// -----------------------------
class Wifi {
  private:
    const char* ssid;
    const char* password;
  public:
    Wifi(const char* nome, const char* senha) : ssid(nome), password(senha) {}

    void conectar_Wifi() {
      delay(10);
      Serial.println();
      Serial.print("Conectando a rede: ");
      Serial.println(ssid);

      WiFi.begin(ssid, password);

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
    const char* mqtt_broker;
    const int mqtt_port;
    const char* mqtt_username;
    const char* mqtt_password;
  public:
    MQTT(const char* broker, const int port, const char* nome, const char* senha) : mqtt_broker(broker), mqtt_port(port), mqtt_username(nome), mqtt_password(senha) {}
    
    void reconnect() {
      while (!client.connected()) {
        Serial.print("Conectando ao broker MQTT...");
        if (client.connect("ESP32Client", mqtt_username, mqtt_password)) {
          Serial.println("conectado");
        } else {
          Serial.print("falha, rc=");
          Serial.print(client.state());
          Serial.println(" tentando novamente em 5 segundos");
          delay(5000);
        }
      }
    }
    void iniciar_conexao(){
      espClient.setInsecure();
      client.setServer(mqtt_broker, mqtt_port);
    }
    void desligar_tranca(){
      client.publish("tranca", "liberada");
      delay(3000);
      client.publish("tranca", "bloqueada");
    }
    void manter_conexao(){
       if(!client.connected()){
        reconnect();
      }else
        client.loop();
    }
};

// -----------------------------
// CONFIGURAÇÃO TECLADO 4x4
// -----------------------------
const byte LINHAS = 4;
const byte COLUNAS = 4;

char TECLAS_MATRIZ[4][4] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};

byte PINOS_LINHAS[LINHAS] = {17, 16, 14, 25};
byte PINOS_COLUNAS[COLUNAS] = {15, 32, 33, 35};

// -----------------------------
// INSTÂNCIAS
// -----------------------------
Teclado teclado(TECLAS_MATRIZ, PINOS_LINHAS, PINOS_COLUNAS, LINHAS, COLUNAS);
Buzzer somValidacao(13);
Display display1(26, 27);
Rfid leitorCartao(5, 22);
Wifi Wifi("Inteli.Iot", "%(Yk(sxGMtvFEs.3");
MQTT MQTT("18a61305753543af9634a27594738058.s1.eu.hivemq.cloud", 8883, "ESP32-SENHA", "Dedsec2@@");

// -----------------------------
// SETUP (ALTERADO)
// -----------------------------
void setup() {
  display1.iniciar();
  leitorCartao.iniciar();
  somValidacao.iniciar();

  display1.setTexto1("Conectando a");
  display1.setTexto2("Internet...");
  display1.escreverLinhaDupla();

  Wifi.conectar_Wifi();

  MQTT.iniciar_conexao();

  display1.setTexto1("Aproxime o");
  display1.setTexto2("cartao");
  display1.escreverLinhaDupla();
}

// -----------------------------
// LOOP PRINCIPAL
// -----------------------------
void loop() {
  MQTT.manter_conexao();

  if (!sistemaAtivo) {
    if (leitorCartao.detectarCartao()) {
      
      if (leitorCartao.eCartaoAutorizado()) {
          
          MFRC522& rfidInterno = leitorCartao.getRFID();
          Serial.print("UID lido: ");
          for (byte i = 0; i < rfidInterno.uid.size; i++) {
            Serial.print(rfidInterno.uid.uidByte[i], HEX);
            Serial.print(" ");
          }
          Serial.println();
      
          sistemaAtivo = true;
          display1.escreverLinhaUnica("Digite a Senha:");
          
      } else {
          Serial.println("Cartao Negado!");
          display1.setTexto1("Cartao nao");
          display1.setTexto2("cadastrado");
          display1.escreverLinhaDupla();
          
          somValidacao.tocarSom();
          delay(200);
          somValidacao.desligar();
          delay(100);
          somValidacao.tocarSom();
          delay(200);
          somValidacao.desligar();
          
          delay(2000);
          
          display1.setTexto1("Aproxime o");
          display1.setTexto2("cartao");
          display1.escreverLinhaDupla();
      }
      
      leitorCartao.encerrarLeitura();
    }
  }

  if (sistemaAtivo) {
    char tecla = teclado.lerTecla();
    if (tecla) {
      if (tecla == '#') {
        if (teclado.getSenha() == senha_correta) {
          display1.escreverLinhaUnica("Acesso Liberado");
          Serial.println("Senha correta!");
          somValidacao.tocarSom();
          delay(3000);
          somValidacao.desligar();

          MQTT.desligar_tranca();
        } else {
          display1.escreverLinhaUnica("Senha Incorreta");
          Serial.println("Senha incorreta!");
          somValidacao.tocarSom();
          delay(200);
          somValidacao.desligar();
          delay(100);
          somValidacao.tocarSom();
          delay(200);
          somValidacao.desligar();
        }

        delay(2000);
        teclado.limparSenha();
        
        leitorCartao.reiniciar();
        
        sistemaAtivo = false;
        display1.setTexto1("Aproxime o");
        display1.setTexto2("cartao");
        display1.escreverLinhaDupla();
        return;
      } else {
        teclado.adicionarTecla(tecla);
      }

      display1.escreverLinhaUnica("Digite a Senha:");
      display1.escreverSenhaMascarada(teclado.getSenha());
    }
  }
}