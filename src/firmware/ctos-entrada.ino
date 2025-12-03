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
#define ende 0x27  // Endereço I2C do display LCD
#define col 16     // Número de colunas do display (16 caracteres)
#define lin 2      // Número de linhas do display (2 linhas)
LiquidCrystal_I2C lcd(ende, col, lin);  // Instância do display LCD

// -----------------------------
// VARIÁVEIS GERAIS
// -----------------------------
String senha_correta = "123456";  // Senha padrão do sistema
bool sistemaAtivo = false;        // Flag que indica se o sistema está aguardando digitação de senha

// -----------------------------
// CLASSE TECLADO
// -----------------------------
// Classe responsável por gerenciar o teclado matricial 4x4
class Teclado {
  private:
    Keypad teclado;          // Instância do teclado matricial
    String senhaDigitada;    // Armazena a senha digitada pelo usuário

  public:
    // Construtor: inicializa o teclado com a matriz de teclas e os pinos
    Teclado(char matriz[4][4], byte* linhas, byte* colunas, byte qtdLinhas, byte qtdColunas)
      : teclado(makeKeymap(matriz), linhas, colunas, qtdLinhas, qtdColunas), senhaDigitada("") {}

    // Lê a tecla pressionada no teclado
    char lerTecla() {
      return teclado.getKey();
    }

    // Adiciona uma tecla à senha digitada ou remove o último dígito com '*'
    void adicionarTecla(char tecla) {
      // Se for número e a senha tiver menos de 6 dígitos, adiciona
      if (tecla >= '0' && tecla <= '9' && senhaDigitada.length() < 6) {
        senhaDigitada += tecla;
      } 
      // Se for '*', remove o último dígito (backspace)
      else if (tecla == '*') {
        if (senhaDigitada.length() > 0) {
          senhaDigitada.remove(senhaDigitada.length() - 1);
        }
      }
    }

    // Retorna a senha digitada
    String getSenha() {
      return senhaDigitada;
    }

    // Limpa a senha digitada
    void limparSenha() {
      senhaDigitada = "";
    }
};

// -----------------------------
// COMUNICAÇÃO COM TRANCA
// -----------------------------
WiFiClientSecure espClient;  // Cliente WiFi seguro (SSL/TLS)
PubSubClient client(espClient);  // Cliente MQTT para comunicação com a tranca

// -----------------------------
// CLASSE RFID
// -----------------------------
// Classe responsável por gerenciar o leitor RFID RC522
class Rfid {
  private:
    int ssPin;             // Pino SS (Slave Select) do módulo RFID
    int rstPin;            // Pino RST (Reset) do módulo RFID
    MFRC522 rfid;          // Instância do leitor RFID
    byte uidAutorizado[4] = {0x5c, 0x8D, 0x35, 0x4A};  // UID do cartão autorizado

  public:
    // Construtor: inicializa o leitor RFID com os pinos SS e RST
    Rfid(int porta1, int porta2): ssPin(porta1), rstPin(porta2), rfid(porta1, porta2) {}

    // Inicializa o módulo RFID e configura o barramento SPI
    void iniciar() {
      SPI.begin(18, 19, 23, 5);  // SCK, MISO, MOSI, SS
      rfid.PCD_Init();
      delay(100);
      Serial.println("RC522 pronto!");
    }

    // Reinicia o módulo RFID
    void reiniciar() {
      rfid.PCD_Init(); 
    }

    // Detecta se há um cartão próximo ao leitor
    bool detectarCartao() {
      if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
        return false;
      }
      return true;
    }

    // Verifica se o cartão lido é um cartão autorizado
    bool eCartaoAutorizado() {
      for (byte i = 0; i < 4; i++) {
        if (rfid.uid.uidByte[i] != uidAutorizado[i]) {
          return false;
        }
      }
      return true;
    }

    // Encerra a leitura do cartão e desativa a criptografia
    void encerrarLeitura() {
      rfid.PICC_HaltA();
      rfid.PCD_StopCrypto1();
      delay(50);
    }

    // Retorna referência ao objeto RFID interno
    MFRC522& getRFID() {
      return rfid;
    }
};

// -----------------------------
// CLASSE DISPLAY
// -----------------------------
// Classe responsável por gerenciar o display LCD I2C
class Display {
  private:
    int pin1;       // Pino SDA (dados I2C)
    int pin2;       // Pino SCL (clock I2C)
    String texto1;  // Texto da primeira linha
    String texto2;  // Texto da segunda linha

  public:
    // Construtor: define os pinos I2C do display
    Display(int porta1, int porta2): pin1(porta1), pin2(porta2) {}

    // Inicializa o display LCD e a comunicação I2C
    void iniciar() {
      Serial.begin(115200);
      Wire.begin(pin1, pin2);  // Inicializa I2C com os pinos SDA e SCL
      lcd.init();
      lcd.backlight();  // Liga a luz de fundo do display
    }

    // Define o texto da primeira linha
    void setTexto1(String novoTexto1) {
      texto1 = novoTexto1;
    }

    // Define o texto da segunda linha
    void setTexto2(String novoTexto2) {
      texto2 = novoTexto2;
    }

    // Escreve um texto em uma linha específica do display
    void escreverLinhaUnica(String texto, int linha = 0) {
      lcd.clear();
      lcd.setCursor(0, linha);
      lcd.print(texto);
    }

    // Escreve duas linhas de texto no display
    void escreverLinhaDupla() {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print(texto1);
      lcd.setCursor(0, 1);
      lcd.print(texto2);
    }

    // Escreve a senha com asteriscos para ocultar os dígitos
    void escreverSenhaMascarada(String senha) {
      escreverLinhaUnica("Digite a senha:");
      lcd.setCursor(0, 1);
      for (int i = 0; i < senha.length(); i++) {
        lcd.print('*');  // Mascara cada dígito com asterisco
      }
    }
};

// -----------------------------
// CLASSE BUZZER
// -----------------------------
// Classe responsável por controlar o buzzer (som de feedback)
class Buzzer {
  private:
    int pin;  // Pino digital conectado ao buzzer

  public:
    // Construtor: define o pino do buzzer
    Buzzer(int porta): pin(porta) {}

    // Inicializa o pino do buzzer como saída
    void iniciar() {
      pinMode(pin, OUTPUT);
      digitalWrite(pin, LOW);  // Garante que o buzzer comece desligado
    }

    // Liga o buzzer
    void tocarSom() {
      digitalWrite(pin, HIGH);
    }

    // Desliga o buzzer
    void desligar() {
      digitalWrite(pin, LOW);
    }
};

// -----------------------------
// CLASSE LED
// -----------------------------
// Classe responsável por controlar o led (som de feedback)
class LED {
  private:
    int pin;  // Pino digital conectado ao led

  public:
    // Construtor: define o pino do led
    LED(int porta): pin(porta) {}

    // Inicializa o pino do led como saída
    void iniciar() {
      pinMode(pin, OUTPUT);
      digitalWrite(pin, LOW);  // Garante que o led comece desligado
    }

    // Liga o led
    void ligar() {
      digitalWrite(pin, HIGH);
    }

    // Desliga o led
    void desligar() {
      digitalWrite(pin, LOW);
    }
};

// -----------------------------
// CLASSE WIFI
// -----------------------------
// Classe responsável por gerenciar a conexão WiFi
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

// -----------------------------
// CLASSE MQTT
// -----------------------------
// Classe responsável por gerenciar a comunicação MQTT com o broker
class MQTT {
  private:
    const char* mqtt_broker;    // Endereço do broker MQTT
    const int mqtt_port;        // Porta do broker MQTT
    const char* mqtt_username;  // Usuário para autenticação MQTT
    const char* mqtt_password;  // Senha para autenticação MQTT
  public:
    // Construtor: armazena as credenciais do broker MQTT
    MQTT(const char* broker, const int port, const char* nome, const char* senha) 
      : mqtt_broker(broker), mqtt_port(port), mqtt_username(nome), mqtt_password(senha) {}
    
    // Reconecta ao broker MQTT caso a conexão seja perdida
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
    
    // Inicializa a conexão MQTT configurando o cliente
    void iniciar_conexao(){
      espClient.setInsecure();  // Desabilita verificação de certificado SSL
      client.setServer(mqtt_broker, mqtt_port);
    }
    
    // Publica comandos para desbloquear e bloquear a tranca
    void desligar_tranca(){
      client.publish("tranca", "liberada");  // Envia comando para liberar a tranca
      delay(3000);  // Aguarda 3 segundos com a tranca liberada
      client.publish("tranca", "bloqueada");  // Envia comando para bloquear novamente
    }
    
    // Mantém a conexão MQTT ativa ou reconecta se necessário
    void manter_conexao(){
       if(!client.connected()){
        reconnect();  // Reconecta se a conexão cair
      }else
        client.loop();  // Processa mensagens MQTT pendentes
    }
};

// -----------------------------
// CONFIGURAÇÃO TECLADO 4x4
// -----------------------------
const byte LINHAS = 4;   // Número de linhas do teclado matricial
const byte COLUNAS = 4;  // Número de colunas do teclado matricial

// Mapeamento das teclas do teclado 4x4
char TECLAS_MATRIZ[4][4] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}  // '*' = backspace, '#' = confirmar
};

// Pinos do ESP32 conectados às linhas do teclado
byte PINOS_LINHAS[LINHAS] = {17, 16, 14, 25};
// Pinos do ESP32 conectados às colunas do teclado
byte PINOS_COLUNAS[COLUNAS] = {15, 32, 33, 35};

// -----------------------------
// INSTÂNCIAS DOS OBJETOS
// -----------------------------
Teclado teclado(TECLAS_MATRIZ, PINOS_LINHAS, PINOS_COLUNAS, LINHAS, COLUNAS);  // Teclado 4x4
Buzzer somValidacao(13);    // Buzzer conectado ao pino 13
Display display1(26, 27);   // Display LCD I2C (SDA=26, SCL=27)
Rfid leitorCartao(5, 22);   // Leitor RFID RC522 (SS=5, RST=22)
Wifi Wifi("Inteli.Iot", "%(Yk(sxGMtvFEs.3");  // Credenciais da rede WiFi
MQTT MQTT("18a61305753543af9634a27594738058.s1.eu.hivemq.cloud", 8883, "ESP32-SENHA", "Dedsec2@@");  // Broker MQTT HiveMQ
LED ledVermelho(34);
LED ledVerde(12);
// -----------------------------
// SETUP
// -----------------------------
// Função executada uma vez na inicialização do sistema
void setup() {
  // Inicializa os componentes de hardware
  display1.iniciar();         // Inicia o display LCD
  leitorCartao.iniciar();     // Inicia o leitor RFID
  somValidacao.iniciar();     // Inicia o buzzer

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

// -----------------------------
// LOOP PRINCIPAL
// -----------------------------
// Função executada continuamente após o setup
void loop() {
  // Mantém a conexão MQTT ativa
  MQTT.manter_conexao();

  // MODO 1: Aguardando leitura do cartão RFID
  if (!sistemaAtivo) {
    if (leitorCartao.detectarCartao()) {
      
      // Verifica se o cartão lido está autorizado
      if (leitorCartao.eCartaoAutorizado()) {
          
          // Exibe o UID do cartão no monitor serial para debug
          MFRC522& rfidInterno = leitorCartao.getRFID();
          Serial.print("UID lido: ");
          for (byte i = 0; i < rfidInterno.uid.size; i++) {
            Serial.print(rfidInterno.uid.uidByte[i], HEX);
            Serial.print(" ");
          }
          Serial.println();
      
          // Ativa o sistema para permitir digitação da senha
          sistemaAtivo = true;
          display1.escreverLinhaUnica("Digite a Senha:");
          
      } else {
          // Cartão não autorizado - exibe mensagem de erro
          Serial.println("Cartao Negado!");
          display1.setTexto1("Cartao nao");
          display1.setTexto2("cadastrado");
          display1.escreverLinhaDupla();
          ledVermelho.ligar();
          delay(1000);
          ledVermelho.desligar();
          
          // Toca dois bipes de erro
          somValidacao.tocarSom();
          delay(200);
          somValidacao.desligar();
          delay(100);
          somValidacao.tocarSom();
          delay(200);
          somValidacao.desligar();
          
          delay(2000);
          
          // Retorna à tela inicial
          display1.setTexto1("Aproxime o");
          display1.setTexto2("cartao");
          display1.escreverLinhaDupla();
      }
      
      leitorCartao.encerrarLeitura();
    }
  }

  // MODO 2: Aguardando digitação da senha
  if (sistemaAtivo) {
    char tecla = teclado.lerTecla();
    if (tecla) {
      // Tecla '#' confirma a senha
      if (tecla == '#') {
        // Verifica se a senha está correta
        if (teclado.getSenha() == senha_correta) {
          // Senha correta - libera o acesso
          display1.escreverLinhaUnica("Acesso Liberado");
          Serial.println("Senha correta!");

          //Liga o Led

          
          somValidacao.tocarSom();  // Bipe longo de sucesso
          ledVerde.ligar();
          delay(3000);
          ledVerde.desligar();
          somValidacao.desligar();

          // Envia comando via MQTT para desbloquear a tranca
          MQTT.desligar_tranca();
          
        } else {
          // Senha incorreta - nega o acesso
          display1.escreverLinhaUnica("Senha Incorreta");
          Serial.println("Senha incorreta!");
          // Toca dois bipes de erro
          somValidacao.tocarSom();
          ledVermelho.ligar();
          delay(200);
          somValidacao.desligar();
          delay(100);
          somValidacao.tocarSom();
          delay(200);
          ledVermelho.desligar();
          somValidacao.desligar();
        }

        delay(2000);
        teclado.limparSenha();  // Limpa a senha digitada
        
        leitorCartao.reiniciar();  // Reinicia o leitor RFID
        
        // Retorna ao modo de leitura de cartão
        sistemaAtivo = false;
        display1.setTexto1("Aproxime o");
        display1.setTexto2("cartao");
        display1.escreverLinhaDupla();
        return;
      } else {
        // Adiciona a tecla digitada à senha (números) ou remove último dígito ('*')
        teclado.adicionarTecla(tecla);
      }

      // Atualiza o display mostrando a senha mascarada
      display1.escreverLinhaUnica("Digite a Senha:");
      display1.escreverSenhaMascarada(teclado.getSenha());
    }
  }
}