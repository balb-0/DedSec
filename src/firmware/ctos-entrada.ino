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

// ==========================================
// CONFIGURAÇÕES DE TEMPORIZAÇÃO (em milissegundos)
// ==========================================
// Feedback Visual e Sonoro (LEDs e Buzzer)
const int tempo_bip_curto = 200;
const int tempo_intervalo_bip = 100;
const int tempo_feedback_led = 1000;
 
// Interface (Dislay)
const int tempo_exibicao_mensagem = 2000;

// Acesso e tranca
const int tempo_porta_aberta = 3000;

// Rede e conexao
const int tempo_reconexao_mqtt = 5000;
const int tempo_conexao_wifi = 1000;


// -----------------------------
// VARIÁVEIS GERAIS
// -----------------------------
const String senha_correta = "123456";  // Senha padrão do sistema atualmente
bool sistemaAtivo = false; // Flag que indica se o sistema está aguardando digitação de senha

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
      delay(tempo_intervalo_bip);
      Serial.println("RC522 pronto!");
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
          Serial.print("falha, rc=");
          Serial.print(client.state());
          Serial.println(" tentando novamente em 5 segundos");
          delay(tempo_reconexao_mqtt);
        }
      }
    }
    
    // Inicializa a conexão MQTT configurando o cliente
    void iniciar_conexao(){
      espClient.setInsecure();  // Desabilita verificação de certificado SSL
      client.setServer(mqtt_broker, mqtt_port);
    }
    
    // Publica comandos para desbloquear e bloquear a tranca
    void desligar_tranca(){
      client.publish("tranca", "liberada");  // Envia comando para liberar a tranca
      delay(tempo_porta_aberta);  // Aguarda 3 segundos com a tranca liberada
      client.publish("tranca", "bloqueada");  // Envia comando para bloquear novamente
    }
    
    // Mantém a conexão MQTT ativa ou reconecta se necessário
    void manter_conexao(){
       if(!client.connected()){
        reconnect();  // Reconecta se a conexão cair
      }else
        client.loop();  // Processa mensagens MQTT pendentes
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
// INSTÂNCIAS DOS OBJETOS
// -----------------------------
Teclado teclado(TECLAS_MATRIZ, PINOS_LINHAS, PINOS_COLUNAS, LINHAS, COLUNAS);  // Teclado 4x4
Buzzer buzzer1(13);    // Buzzer conectado ao pino 13
Display display1(26, 27);   // Display LCD I2C (SDA=26, SCL=27)
Rfid leitorCartao(5, 22);   // Leitor RFID RC522 (SS=5, RST=22)
Wifi Wifi("Inteli.Iot", "%(Yk(sxGMtvFEs.3");  // Credenciais da rede WiFi
MQTT MQTT("18a61305753543af9634a27594738058.s1.eu.hivemq.cloud", 8883, "ESP32-SENHA", "Dedsec2@@");  // Broker MQTT HiveMQ
LED ledVermelho(34);
LED ledVerde(12);


// -----------------------------
// FUNÇÕES DE LÓGICA DO SISTEMA
// -----------------------------
void tratarAcessoLiberado(){
  // Executa a rotina de sucesso (Display, LED Verde, Som e MQTT)
  Serial.println("Acesso Autorizado");
  display1.escreverLinhaUnica("Acesso Liberado");

  // Feedback visual e sonoro
  buzzer1.tocarSom();
  ledVerde.ligar();

  MQTT.desligar_tranca();

  ledVermelho.desligar();
  buzzer1.desligar();
};

void tratarAcessoNegado(String msg1, String msg2){
  Serial.println("Acesso Negado");
  display1.setTexto1(msg1);
  display1.setTexto2(msg2);
  display1.escreverLinhaDupla();
  Serial.println(msg1 + " " + msg2 + "!");

  // Sequência de erro (LED Vermelho + 2 Bipes)
  ledVermelho.ligar();

  buzzer1.tocarSom();
  delay(tempo_bip_curto);
  buzzer1.desligar();

  ledVermelho.desligar();
  delay(tempo_exibicao_mensagem);
} 

// Reinicia o estado para aguardar novo cartão
void resetarSistema(){
  teclado.limparSenha();
  leitorCartao.reiniciar();
  sistemaAtivo = false;

  // Tela inicial
  display1.setTexto1("Aproxime o ");
  display1.setTexto2("Cartão");
  display1.escreverLinhaDupla();

}

void imprimirUID(){
  // Exibe o UID do cartão no monitor serial para debug
  MFRC522& rfidInterno = leitorCartao.getRFID();
  Serial.print("UID lido: ");
  for (byte i = 0; i < rfidInterno.uid.size; i++) {
    Serial.print(rfidInterno.uid.uidByte[i], HEX);
    Serial.print(" ");
  }
  Serial.println();
}
// -----------------------------
// SETUP
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
  // Inicializa os componentes de hardware
  display1.iniciar();         // Inicia o display LCD
  leitorCartao.iniciar();     // Inicia o leitor RFID
  buzzer1.iniciar();     // Inicia o buzzer

  // Exibe mensagem de conexão no display
  display1.setTexto1("Conectando a");
  display1.setTexto2("Internet...");
  display1.escreverLinhaDupla();

  // Definindo LED
  ledVermelho.iniciar();
  ledVerde.iniciar();

  // Conecta à rede WiFi
  Wifi.conectar_Wifi();

  // Inicializa a conexão com o broker MQTT
  MQTT.iniciar_conexao();

  // Exibe mensagem para aproximar o cartão
  display1.setTexto1("Aproxime o");
  display1.setTexto2("cartao");
  display1.escreverLinhaDupla();
}

void loop() {
  // Mantém a conexão MQTT ativa
  MQTT.manter_conexao();
  // MODO 1: Aguardando leitura do cartão RFID
  if (!sistemaAtivo) {
    if (leitorCartao.detectarCartao()) {
      
      // Verifica se o cartão lido está autorizado
      imprimirUID();
      if (leitorCartao.eCartaoAutorizado()) {
        // Ativa o sistema para permitir digitação da senha
        sistemaAtivo = true;
        display1.escreverLinhaUnica("Digite a Senha:");
        Serial.println("Cartão reconhecido. Aguardando senha...");

      } else {
          // Cartão não autorizado - exibe mensagem de erro
          tratarAcessoNegado("Cartao nao", "Cadastrado");
          resetarSistema();
      }
      leitorCartao.encerrarLeitura();
    }
  }
  // MODO 2: Aguardando digitação da senha
  if (sistemaAtivo) {
    char tecla = teclado.lerTecla();
    if (tecla) {
      if (tecla == '#') {
        // Verifica se a senha está correta
        if (teclado.getSenha() == senha_correta) {
          tratarAcessoLiberado(); // logica de sucesso encapsulada
          
        } else {
          // Senha incorreta - nega o acesso
          tratarAcessoNegado("Senha", "Incorreta"); // logica de erro encapsulada
        }
        resetarSistema(); // logica de resete encapsulada
      } else {
        // Adiciona a tecla digitada à senha (números) ou remove último dígito ('*')
        // Atualiza o display mostrando a senha mascarada
        teclado.adicionarTecla(tecla);
        display1.escreverLinhaUnica("Digite a Senha:");
        display1.escreverSenhaMascarada(teclado.getSenha());
      }
    }
  }
}
