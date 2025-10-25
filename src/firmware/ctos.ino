#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Keypad.h>

class DisplayLCD {
private:
  LiquidCrystal_I2C lcd; // objeto da biblioteca LCD

public:
  // Construtor que recebe o endereço I2C, colunas e linhas
  DisplayLCD(uint8_t endereco, uint8_t col, uint8_t lin) : lcd(endereco, col, lin) {}

  // Inicializa o LCD e o barramento I2C
  void iniciar(int sda, int scl) {
    Wire.begin(sda, scl);
    lcd.init();
    lcd.backlight();
    lcd.clear();
  }

  // Mostra duas linhas de texto no LCD
  void mostrarMensagem(String linha1, String linha2 = "") {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(linha1);
    if (linha2 != "") {
      lcd.setCursor(0, 1);
      lcd.print(linha2);
    }
  }

  // Mostra a senha digitada como asteriscos
  void mostrarSenhaMascarada(String senha) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Digite a Senha:");
    lcd.setCursor(0, 1);
    for (int i = 0; i < senha.length(); i++) {
      lcd.print('*');
    }
  }
};

class TecladoSenha {
private:
  Keypad teclado;         // objeto da biblioteca Keypad
  String senhaDigitada;   // armazena os dígitos inseridos

public:
  // Construtor recebe o mapa de teclas e pinos de conexão
  TecladoSenha(char teclas[4][4], byte linhas[4], byte colunas[4])
    : teclado(makeKeymap(teclas), linhas, colunas, 4, 4), senhaDigitada("") {}

  // Lê a tecla pressionada
  char lerTecla() {
    return teclado.getKey();
  }

  // Adiciona dígito numérico à senha (máx. 6 caracteres)
  void adicionarTecla(char tecla) {
    if (tecla >= '0' && tecla <= '9' && senhaDigitada.length() < 6) {
      senhaDigitada += tecla;
    }
  }

  // Apaga o último caractere digitado
  void apagarUltimo() {
    if (senhaDigitada.length() > 0) {
      senhaDigitada.remove(senhaDigitada.length() - 1);
    }
  }

  // Limpa a senha digitada
  void limpar() {
    senhaDigitada = "";
  }

  // Retorna a senha atual
  String getSenha() {
    return senhaDigitada;
  }
};


class LeitorUID {
private:
  int pinoSensor; // pino conectado ao sensor

public:
  LeitorUID(int pino) : pinoSensor(pino) {}

  void iniciar() {
    pinMode(pinoSensor, INPUT);
  }

  // Retorna true se o sensor detectar o "cartão"
  bool verificarUID() {
    return digitalRead(pinoSensor) == HIGH;
  }
};

char TECLAS_MATRIZ[4][4] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};

// Pinos conectados ao teclado matricial
byte LINHAS[4] = {17, 22, 14, 25};
byte COLUNAS[4] = {16, 32, 33, 35};


DisplayLCD lcd(0x27, 16, 2);                  // LCD I2C 16x2
TecladoSenha teclado(TECLAS_MATRIZ, LINHAS, COLUNAS); // Teclado 4x4
LeitorUID leitor(19);                         // Sensor no pino 19


String senhaCorreta = "123456";  // Senha pré-definida
bool sistemaAtivo = false;       // Estado do sistema (bloqueado ou ativo)


void setup() {
  Serial.begin(115200);           // Comunicação serial para debug
  lcd.iniciar(26, 27);            // Inicializa LCD nos pinos SDA=26, SCL=27
  leitor.iniciar();               // Configura o pino do sensor
  lcd.mostrarMensagem("Aproxime o", "cartao"); // Mensagem inicial
}

void loop() {
  char tecla = teclado.lerTecla();          // Lê tecla do teclado
  bool pressionado = leitor.verificarUID(); // Verifica se o "cartão" foi lido

  if (!sistemaAtivo) {   // Se o sistema ainda está bloqueado
    if (pressionado) {   // Se o sensor foi acionado
      sistemaAtivo = true;
      lcd.mostrarMensagem("Digite a Senha:"); // Solicita senha
    }
    return; // Sai do loop até detectar cartão
  }

  if (tecla) { // Se alguma tecla foi pressionada
    if (tecla >= '0' && tecla <= '9') {
      teclado.adicionarTecla(tecla); // Adiciona número
    }
    else if (tecla == '*') {
      teclado.apagarUltimo(); // Remove último caractere
    }
    else if (tecla == '#') {  // Confirma senha
      if (teclado.getSenha() == senhaCorreta) {
        lcd.mostrarMensagem("Acesso Liberado");
        Serial.println("Senha correta!");
      } else {
        lcd.mostrarMensagem("Acesso Negado");
        Serial.println("Senha incorreta!");
      }

      delay(2000); // Pausa para exibir resultado
      teclado.limpar();
      sistemaAtivo = false; // Volta para estado inicial
      lcd.mostrarMensagem("Aproxime o", "cartao");
      return;
    }

    // Atualiza LCD com a senha mascarada
    lcd.mostrarSenhaMascarada(teclado.getSenha());
  }
}

