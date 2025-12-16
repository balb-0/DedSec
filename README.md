# Inteli - Instituto de Tecnologia e Liderança

<p align="center">
<a href= "https://www.inteli.edu.br/"><img src="assets/inteli.png" alt="Inteli - Instituto de Tecnologia e Liderança" border="0" width=40% height=40%></a>
</p>

<br>

# CTOS - Sistema de Controle de Acesso IoT

## Sobre o Projeto

**CTOS** (Controle de Acesso Técnico Operacional e Seguro) é um sistema IoT desenvolvido para modernizar e assegurar o controle de acesso físico às áreas técnicas de empresas do setor de transporte. Desenvolvido em parceria com a **TIC Trens**, uma holding referência no setor de transporte rodoferroviário, o projeto visa garantir que apenas colaboradores devidamente capacitados e com atividades agendadas possam acessar áreas técnicas críticas.

O sistema combina identificação por RFID (Radio Frequency Identification), autenticação multifator (MFA) via código SMS, comunicação MQTT em tempo real e um dashboard web para monitoramento e gestão.

## Objetivo

O principal desafio enfrentado pela companhia é a gestão de entrada em locais críticos, onde é necessário não apenas autorizar o acesso, mas garantir que o colaborador possua:

- Capacitação técnica adequada
- Escalação para a atividade específica
- Horário agendado válido
- Autenticação de segurança adicional

O sistema eleva os padrões de segurança, garantindo uma gestão eficiente, auditável e alinhada às exigências regulatórias do setor.

## Nome do Grupo

**DedSec**

## Integrantes

- <a href="https://www.linkedin.com/in/felipecaiafa/">Felipe Caiafa Alvim Soares</a>
- <a href="https://www.linkedin.com/in/joão-pedro-gonçalves-corrêa-araujo">João Pedro Gonçalves Corrêa Araujo</a>
- <a href="https://www.linkedin.com/in/guilhermeholandamarques/">Guilherme Holanda Marques</a>
- <a href="https://www.linkedin.com/in/bruno-gabriel-giordano-guilherme-kadayan-ab86762a0/">Bruno Gabriel Giordano Guilherme Kadayan</a>
- <a href="https://www.linkedin.com/in/vitor-balbo/">Vitor Balbo</a>
- <a href="https://www.linkedin.com/in/rafael-g-ferreira/">Rafael Gomes Ferreira</a>
- <a href="https://www.linkedin.com/in/francisco-filho-87b243346/">Francisco Filho</a>

## Professores

### Orientador(a)

- <a href="https://www.linkedin.com/in/fabiana-martins-de-oliveira-8993b0b2/">Fabiana Martins de Oliveira</a>

### Instrutores

- <a href="https://www.linkedin.com/in/bryan-kano/">Bryan Kano</a>
- <a href="https://www.linkedin.com/in/fernando-pizzo-208b526a/">Fernando Pizzo Ribeiro</a>
- <a href="https://www.linkedin.com/in/gui-cestari/">Guilherme Cestari</a>
- <a href="https://www.linkedin.com/in/laizaribeiro/">Laíza Ribeiro Silva</a>
- <a href="https://www.linkedin.com/in/pedroteberga/">Pedro Teberga</a>

## Vídeo de Demonstração

**Inclua um link para o vídeo de demonstração do funcionamento do projeto (Sprint 5)**

## Arquitetura do Sistema

O sistema CTOS é composto por três camadas principais:

### 1. **Camada de Borda (Edge) - Firmware ESP32**

- **Módulo de Entrada**: Leitor RFID (MFRC522), teclado matricial 4x4, display LCD I2C
- **Módulo de Tranca**: Controle de tranca eletrônica/solenoide
- Comunicação via MQTT (MQTTS) com o backend

### 2. **Camada Backend - Node.js/Express**

- API RESTful para gestão de usuários, salas e alocações
- Cliente MQTT para comunicação com dispositivos IoT
- Integração com Twilio para envio de SMS (PIN de acesso)
- Banco de dados PostgreSQL para persistência

### 3. **Camada Frontend - React + Vite**

- Dashboard web responsivo para monitoramento em tempo real
- Interface para gestão de usuários e salas
- Visualização de eventos de acesso e estatísticas

## Tecnologias Utilizadas

### Backend

- **Node.js** (v18+)
- **Express.js** (v5.1.0)
- **PostgreSQL** (v12+)
- **MQTT** (via biblioteca `mqtt` v5.14.1)
- **Twilio** (v5.10.6) - Envio de SMS
- **dotenv** (v17.2.3) - Gerenciamento de variáveis de ambiente

### Frontend

- **React** (v19.2.0)
- **Vite** (v7.2.4)
- **TypeScript**
- **TailwindCSS** (v3.4.0)
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones

### Firmware/IoT

- **ESP32** (Arduino Framework)
- **Arduino IDE** ou **PlatformIO**
- Bibliotecas:
  - `WiFi` - Conexão Wi-Fi
  - `PubSubClient` - Cliente MQTT
  - `MFRC522` - Leitor RFID
  - `LiquidCrystal_I2C` - Display LCD
  - `Keypad` - Teclado matricial

### Infraestrutura e DevOps

- **Render** (ou similar) - Deploy do backend
- **HiveMQ Cloud** (ou broker MQTT) - Broker MQTT
- **PostgreSQL** (gratuito ou pago) - Banco de dados

## Estrutura de Pastas

```
.
├── assets/                          # Arquivos gráficos (imagens, logos, diagramas)
│   ├── documentação/                # Diagramas e documentação visual
│   └── inteli.png                   # Logo do Inteli
│
├── document/                        # Documentação do projeto
│   ├── documentacao.md              # Documentação técnica completa
│   ├── Manual de Instruções...pdf  # Manual de instruções
│   └── outros/                      # Documentos complementares
│
├── src/
│   ├── backend-iot/                 # Backend Node.js/Express
│   │   ├── src/
│   │   │   ├── config/              # Configurações (database, mqtt)
│   │   │   ├── controllers/         # Controladores da API
│   │   │   ├── services/            # Serviços (SMS, etc)
│   │   │   ├── utils/               # Utilitários
│   │   │   ├── routes.js            # Rotas da API
│   │   │   ├── server.js            # Servidor principal
│   │   │   └── seed.js              # Script de seed do banco
│   │   └── package.json
│   │
│   ├── database/
│   │   └── schema.sql               # Schema do banco de dados
│   │
│   ├── firmware/                    # Firmware ESP32
│   │   ├── ctos-entrada.ino         # Firmware módulo de entrada
│   │   ├── ctos-tranca.ino          # Firmware módulo de tranca
│   │   ├── wokwi.toml               # Configuração Wokwi (simulador)
│   │   └── build/                   # Arquivos compilados
│   │
│   └── frontend/                    # Frontend React
│       ├── src/
│       │   ├── components/          # Componentes React
│       │   │   ├── dashboard/       # Componentes do dashboard
│       │   │   └── ui/              # Componentes UI reutilizáveis
│       │   ├── lib/                 # Utilitários e helpers
│       │   ├── App.tsx              # Componente principal
│       │   └── main.jsx             # Entry point
│       ├── public/                  # Arquivos estáticos
│       ├── dist/                    # Build de produção
│       └── package.json
│
├── build.sh                         # Script de build para produção
├── render.yaml                      # Configuração de deploy (Render)
├── package.json                     # Workspace root (monorepo)
└── README.md                        # Este arquivo
```

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (v18 ou superior) - [Download](https://nodejs.org/)
- **npm** (v9 ou superior) - Vem com Node.js
- **PostgreSQL** (v12 ou superior) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)
- **Arduino IDE** ou **PlatformIO** - Para desenvolvimento do firmware ESP32
  - **Arduino IDE**: [Download](https://www.arduino.cc/en/software)
  - **PlatformIO**: [Extension VS Code](https://platformio.org/install/ide?install=vscode)

### Serviços Externos Necessários

1. **Broker MQTT** (recomendado: HiveMQ Cloud - plano gratuito disponível)

   - [HiveMQ Cloud](https://www.hivemq.com/cloud/)
   - Alternativas: Mosquitto, AWS IoT Core, Azure IoT Hub

2. **Conta Twilio** (para envio de SMS)

   - [Twilio](https://www.twilio.com/)
   - Conta trial gratuita disponível

3. **Banco de dados PostgreSQL** (local ou cloud)
   - Local: PostgreSQL instalado
   - Cloud: [Render PostgreSQL](https://render.com/docs/databases), [Supabase](https://supabase.com/), [ElephantSQL](https://www.elephantsql.com/)

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/Inteli-College/2025-2B-T18-IN04-G04
cd ctos-iot
```

### 2. Instale as dependências

```bash
# Instala dependências do workspace root e de todos os subprojetos
npm run install:all
```

Ou instale manualmente:

```bash
# Instalar dependências do root
npm install

# Instalar dependências do backend
cd src/backend-iot
npm install
cd ../..

# Instalar dependências do frontend
cd src/frontend
npm install
cd ../..
```

### 3. Configure o Banco de Dados

#### 3.1. Crie o banco de dados PostgreSQL

```bash
# Conecte ao PostgreSQL
psql -U postgres

# Crie o banco de dados
CREATE DATABASE ctos_db;

# Saia do psql
\q
```

#### 3.2. Execute o schema SQL

```bash
psql -U postgres -d ctos_db -f src/database/schema.sql
```

Ou execute manualmente o conteúdo do arquivo `src/database/schema.sql` no seu cliente PostgreSQL.

### 4. Configure as Variáveis de Ambiente

#### 4.1. Backend

Crie um arquivo `.env` em `src/backend-iot/.env`:

```env
# Servidor
NODE_ENV=development
PORT=3000

# Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=ctos_db
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# MQTT Broker (HiveMQ Cloud exemplo)
MQTT_BROKER_URL=mqtts://seu-broker.hivemq.cloud:8883
MQTT_PORT=8883
MQTT_USERNAME=seu_username_mqtt
MQTT_PASSWORD=sua_senha_mqtt

# Twilio (SMS)
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Número de telefone para testes (opcional)
TEST_USER_PHONE_NUMBER=+5511987654321
```

**Importante**: Substitua todos os valores pelos seus próprios. Nunca commite o arquivo `.env` no repositório!

#### 4.2. Frontend (opcional)

Se o frontend precisar de variáveis de ambiente, crie `src/frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### 5. Popule o banco de dados (Opcional)

Execute o script de seed para criar dados de exemplo:

```bash
cd src/backend-iot
npm run seed
```

## Como Executar

### Modo Desenvolvimento

#### Opção 1: Executar tudo de uma vez (recomendado)

Na raiz do projeto:

```bash
npm run dev
```

Isso irá iniciar:

- Backend na porta `3000` (ou a porta definida em `PORT`)
- Frontend na porta `5173` (porta padrão do Vite)

#### Opção 2: Executar separadamente

**Backend:**

```bash
cd src/backend-iot
npm run dev
```

**Frontend (em outro terminal):**

```bash
cd src/frontend
npm run dev
```

### Modo Produção

#### 1. Build do Frontend

```bash
cd src/frontend
npm run build
```

#### 2. Inicie o Backend (que serve o frontend)

```bash
cd src/backend-iot
NODE_ENV=production npm start
```

Ou use o script de build automatizado:

```bash
./build.sh
cd src/backend-iot
NODE_ENV=production npm start
```

## Configuração do Firmware ESP32

### 1. Instale as Bibliotecas Necessárias

No Arduino IDE, instale as seguintes bibliotecas via Library Manager:

- `WiFi` (incluída por padrão)
- `PubSubClient` (Nick O'Leary)
- `MFRC522` (GithubCommunity)
- `LiquidCrystal_I2C` (Frank de Brabander)
- `Keypad` (Mark Stanley, Alexander Brevig)

### 2. Configure as Credenciais WiFi e MQTT

Edite os arquivos `ctos-entrada.ino` e `ctos-tranca.ino` e configure:

```cpp
// Credenciais WiFi
const char* ssid = "SEU_WIFI_SSID";
const char* password = "SUA_SENHA_WIFI";

// Credenciais MQTT
const char* mqtt_server = "seu-broker.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "seu_username_mqtt";
const char* mqtt_password = "sua_senha_mqtt";
```

### 3. Faça o Upload do Firmware

1. Conecte o ESP32 ao computador via USB
2. Selecione a placa: `Tools > Board > ESP32 Arduino > ESP32 Dev Module`
3. Selecione a porta: `Tools > Port > [Sua porta USB]`
4. Faça upload do código:
   - Para o módulo de entrada: `ctos-entrada.ino`
   - Para o módulo de tranca: `ctos-tranca.ino`

### 4. Conexões Físicas

#### Módulo de Entrada (ctos-entrada.ino)

- **RFID (MFRC522)**: SPI (SDA, SCK, MOSI, MISO, RST, SS)
- **LCD I2C**: SDA, SCL (GPIO 21, 22 no ESP32)
- **Teclado Matricial**: Linhas e colunas (configurar no código)
- **LEDs**: GPIOs para feedback visual
- **Buzzer**: GPIO para feedback sonoro

#### Módulo de Tranca (ctos-tranca.ino)

- **Rele/Solenoide**: GPIO para controle da tranca
- **Sensor de porta** (opcional): GPIO para detecção de abertura/fechamento

Consulte a documentação completa em `document/documentacao.md` para diagramas detalhados.

## API Endpoints

A API REST está disponível em `http://localhost:3000/api` (ou a URL do seu servidor).

### Usuários

- `GET /api/users` - Lista todos os usuários
- `GET /api/users/search?q=nome` - Busca usuários por nome
- `GET /api/users/:id` - Busca usuário por ID (com histórico de alocações)
- `POST /api/users` - Cria novo usuário
- `PUT /api/users/:id` - Atualiza usuário
- `DELETE /api/users/:id` - Remove usuário

### Salas

- `GET /api/salas` - Lista todas as salas

### Alocações (Tarefas/Agendamentos)

- `GET /api/users/:id/alocacoes` - Lista alocações de um usuário
- `POST /api/alocacoes` - Cria nova alocação
  ```json
  {
    "user_id": 1,
    "sala_id": 1,
    "inicio": "2025-01-15T10:00:00Z",
    "fim": "2025-01-15T12:00:00Z" // opcional
  }
  ```
- `PUT /api/alocacoes/:id/complete` - Finaliza uma alocação (marca como completa)

### Estatísticas

- `GET /api/stats` - Retorna estatísticas/KPIs do sistema

### Testes

- `GET /api/teste` - Rota de teste
- `POST /api/test-twilio-sms` - Testa envio de SMS via Twilio
  ```json
  {
    "to": "+5511987654321",
    "message": "Mensagem de teste"
  }
  ```

## Fluxo de Funcionamento

### Processo de Acesso

1. **Usuário aproxima o crachá RFID** no módulo de entrada
2. **ESP32 lê o código RFID** e publica no tópico MQTT `request_card`
3. **Backend recebe a requisição** e:
   - Valida se o RFID está cadastrado
   - Gera um PIN de 6 dígitos (válido por 5 minutos)
   - Envia o PIN via SMS (Twilio) para o telefone do usuário
   - Publica mensagem no tópico `command_display` para exibir "Digite o código"
4. **Usuário digita o PIN** recebido via SMS no teclado matricial
5. **ESP32 publica o PIN** no tópico MQTT `submit_sms`
6. **Backend valida o PIN**:
   - Se correto: publica no tópico `tranca` com comando "liberada"
   - Se incorreto: exibe mensagem de erro no display
7. **Módulo de tranca recebe o comando** e libera a tranca eletrônica
8. **Evento de acesso é registrado** no banco de dados

### Saída

1. **Usuário aproxima o crachá** no leitor de saída (dentro da sala)
2. **Sistema registra a saída** automaticamente
3. **Tranca é liberada** para saída

## Documentação Adicional

- **Documentação Completa**: `document/documentacao.md`
- **Manual de Instruções**: `document/Manual de Instruções Módulo 4 - Grupo 4.docx (1).pdf`
- **Schema do Banco**: `src/database/schema.sql`

## Deploy

### Deploy no Render

O projeto inclui configuração para deploy no Render (`render.yaml`). Para fazer deploy:

1. Crie uma conta no [Render](https://render.com/)
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente no dashboard do Render
4. O Render irá fazer o build e deploy automaticamente

Alternativamente, você pode fazer deploy manual seguindo os passos do "Modo Produção" acima.

### Variáveis de Ambiente no Render

Certifique-se de configurar todas as variáveis de ambiente necessárias no dashboard do Render, incluindo:

- Variáveis do banco de dados
- Credenciais MQTT
- Credenciais Twilio
- `NODE_ENV=production`

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Histórico de Lançamentos

- **0.1.0** - 24/10/2025 - Versão inicial
- **0.2.0** - 07/11/2025 - Melhorias no backend e integração MQTT
- **0.3.0** - 19/11/2025 - Dashboard frontend e gestão de usuários
- **0.4.0** - 05/12/2025 - Sistema de alocações e melhorias no firmware
- **0.5.0** - 19/12/2025 - Versão final com todas as funcionalidades

## Licença

Este projeto está licenciado sob a licença Creative Commons Attribution 4.0 International (CC BY 4.0).
Mais informações: https://creativecommons.org/licenses/by/4.0/

<p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><a property="dct:title" rel="cc:attributionURL" href="https://github.com/Inteli-College/2025-2B-T18-IN04-G04">CTOS</a> by <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https://inteli.edu.br">INTELI, <a href="https://www.linkedin.com/in/felipecaiafa/">Felipe Caiafa Alvim Soares</a>, <a href="https://www.linkedin.com/in/joão-pedro-gonçalves-corrêa-araujo">João Pedro Gonçalves Corrêa Araujo</a>, <a href="https://www.linkedin.com/in/guilhermeholandamarques/">Guilherme Holanda Marques</a>, <a href="https://www.linkedin.com/in/bruno-gabriel-giordano-guilherme-kadayan-ab86762a0/">Bruno Gabriel Giordano Guilherme Kadayan</a>, <a href="https://www.linkedin.com/in/vitor-balbo/">Vitor Balbo</a>, <a href="https://www.linkedin.com/in/rafael-g-ferreira/">Rafael Gomes Ferreira</a>, <a href="https://www.linkedin.com/in/francisco-filho-87b243346/">Francisco Filho</a></a> is licensed under <a href="http://creativecommons.org/licenses/by/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">Attribution 4.0 International<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"></a></p>
