#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Keypad.h>

// -----------------------------
// CONFIGURAÇÃO LCD
// -----------------------------
#define ende 0x27
#define col 16
#define lin 2
LiquidCrystal_I2C lcd(ende, col, lin);


// -----------------------------
// CONFIGURAÇÃO TECLADO 4x4
// -----------------------------
const byte LINHAS = 4;
const byte COLUNAS = 4;

bool pressionado = false;

char TECLAS_MATRIZ[LINHAS][COLUNAS] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};

byte PINOS_LINHAS[LINHAS] = {17, 22, 14, 25};
byte PINOS_COLUNAS[COLUNAS] = {16, 32, 33, 35};

Keypad teclado_personalizado = Keypad(
  makeKeymap(TECLAS_MATRIZ),
  PINOS_LINHAS,
  PINOS_COLUNAS,
  LINHAS,
  COLUNAS
);

// -----------------------------
// VARIÁVEIS GERAIS
// -----------------------------
String senha_digitada = "";
String senha_correta = "123456";
bool sistemaAtivo = false;

// -----------------------------
// CONFIGURAÇÃO INICIAL
// -----------------------------
void setup() {

  // Inicializa LCD e I2C
  Serial.begin(115200);
  Wire.begin(26, 27);
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Aproxime o");
  lcd.setCursor(0, 1);
  lcd.print("cartao");

  pinMode(19, INPUT);
}

void loop() {

  char tecla = teclado_personalizado.getKey();
  pressionado = digitalRead(19);
  if (!sistemaAtivo) {

    // Verifica UID autorizado
    if (verificarUID()) {
      sistemaAtivo = true;
      lcd.clear();
      lcd.print("Digite a Senha:");
      lcd.setCursor(0, 1);
    } 
  }

  if (tecla) {
    if (tecla >= '0' && tecla <= '9') {
      if (senha_digitada.length() < 6) {
        senha_digitada += tecla;
      }
    } 
    else if (tecla == '*') {
      if (senha_digitada.length() > 0) {
        senha_digitada.remove(senha_digitada.length() - 1);
      }
    } 
    else if (tecla == '#') {
      lcd.clear();
      if (senha_digitada == senha_correta) {
        lcd.print("Acesso Liberado");
        Serial.println("Senha correta!");
      } else {
        lcd.print("Acesso Negado");
        Serial.println("Senha incorreta!");
      }
      delay(2000);
      senha_digitada = "";
      return;
    }

    // Atualiza LCD com senha mascarada
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Digite a Senha:");
    lcd.setCursor(0, 1);

    for (int i = 0; i < senha_digitada.length(); i++) {
      lcd.print('*');
    }
  } 
}
bool verificarUID() {
  if (pressionado == HIGH) {
    return true;
  }
  else {
    return false;
  }
 
}
