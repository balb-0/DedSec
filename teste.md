# 📄 Documentação da Arquitetura do Backend

O Diagrama da arquitetura do Backend tem como objetivo apresentar, de forma integrada, a **inteligência central** e o **fluxo de processamento lógico** da nossa solução de controle de acesso para áreas sensíveis da TIC Trens.

Ele detalha a **orquestração de autenticação** em dois fatores, a comunicação **assíncrona** via Broker MQTT (HiveMQ), a persistência de dados no **PostgreSQL**, e a integração com APIs externas, como o sistema de **Agendamento da TIC Trens** e o **Gateway de SMS**. Essa arquitetura opera de forma coordenada para garantir a **segurança, a rastreabilidade dos logs e o monitoramento em tempo real** pelo CCO.

---

## 1. Camada de Comunicação e Mensageria

Esta camada gerencia a comunicação assíncrona com os dispositivos de Borda (ESP32) através de um Broker de mensagens.

| Componente | Função |
| :--- | :--- |
| **Broker MQTT (HiveMQ)** | Ponto de entrada e saída para a comunicação assíncrona com os dispositivos de Borda (ESP32). |
| **Tópicos de Request** (`request_card`, `submit_sms`) | Tópicos para os quais os dispositivos de Borda **publicam** suas requisições (leitura do cartão e senha SMS). |
| **Tópicos de Resposta** (`response_final`, `tranca`) | Tópicos para os quais o Backend **publica** a resposta final de acesso, direcionando comandos para os dispositivos atuadores (tranca/relé). |

---

## 2. Arquitetura do Backend (Lógica de Serviço)

Esta é a camada de aplicação Node.js, que coordena as regras de negócio, o fluxo de autenticação e a interação com os serviços.

| Componente | Função | Interações / Dados |
| :--- | :--- | :--- |
| **Interface MQTT (Ouve e Publica nos Tópicos)** | Módulo de *listener* e *publisher* do Backend. É responsável por traduzir as mensagens MQTT em eventos de sistema. | Conecta ao **Broker MQTT**. |
| **Orquestrador de Autenticação (A Lógica Principal)** | **Motor de regras** do Backend. Gerencia o estado da sessão de acesso, aplica as regras de segurança e decide a concessão/negação de acesso. | **Valida agendamento**, **Gera e envia PIN**, **Publica resposta** final. |
| **API TIC Trens (Agendamento)** | Serviço externo consultado pelo Orquestrador para verificar a **capacitação** e o **agendamento** prévio do usuário. | Utiliza **HTTPS** para comunicação segura. |
| **Gateway de SMS (Twilio/Zenvia)** | Serviço externo acionado pelo Orquestrador para o envio do **PIN (senha temporária)** gerado. | Recebe o PIN e o telefone do usuário. |

---

## 3. Persistência e Monitoramento

Esta seção garante que todos os eventos sejam registrados, que os dados sejam mantidos e que o CCO tenha visibilidade em tempo real.

| Componente | Função | Interações / Dados |
| :--- | :--- | :--- |
| **Banco de Dados (PostgreSQL)** | Armazena de forma robusta e segura todos os dados primários do sistema: usuários, logs de acesso, sessões e configurações. | **Armazena os dados**. |
| **Valida Credenciais, Salva Logs** | Módulo de interface com o DB. Responsável pela **validação do PIN** e pelo **registro detalhado** de cada evento de acesso (sucesso ou falha). | Escreve/Lê no **Banco de Dados**. |
| **Servidor WebSocket (Envia Alertas em Tempo Real)** | Mantém uma conexão persistente com o Dashboard CCO para enviar **notificações imediatas** de eventos e alertas críticos. | Envia o **Evento de Acesso (Tempo Real)**. |
| **Notifica CCO** | Sub-módulo acionado pelo Orquestrador após eventos importantes (ex: acesso negado, porta aberta, etc.). | Envia a notificação ao **Servidor WebSocket**. |
| **API REST (Consulta Logs/Sessões)** | Interface **síncrona** utilizada pelo Dashboard CCO para consultas mais complexas, como histórico de logs e relatórios. | Utiliza **HTTPS (GET /logs)**. |
| **Dashboard CCO (Vercel)** | A interface de visualização e gerenciamento do Coordenador. Consome dados via **API REST** e **WebSocket**. | Cliente de requisições **HTTPS** e **WebSocket**. |

---

## 4. Fluxo de Autenticação Completa (Sucesso)

Este fluxo detalha a jornada da requisição, desde a borda até a liberação do acesso, conforme orquestrado pelo Backend.

### 4.1. Primeiro Fator (Cartão e Autorização)
1.  **Requisição:** O dispositivo de Borda (ESP32) envia a leitura do cartão via MQTT para o tópico: `request_card`.
2.  **Identificação:** A **Interface MQTT** encaminha a requisição ao **Orquestrador de Autenticação**. Este consulta o **Banco de Dados** para identificar o usuário.
3.  **Autorização Externa:** O Orquestrador consulta a **API TIC Trens (Agendamento)** para **Validar agendamento** e checar se o usuário está qualificado para a área no horário atual.
4.  **Segundo Fator (PIN):** Se a validação do agendamento for positiva, o Orquestrador **Gera e envia PIN** (OTP - *One-Time Password*), utilizando o **Gateway de SMS**.
5.  **Acompanhamento CCO:** O Orquestrador aciona **Notifica CCO** para enviar uma atualização em tempo real (*"Aguardando PIN..."*) via **Servidor WebSocket** ao Dashboard CCO.

### 4.2. Segundo Fator (Validação do PIN)
6.  **Submissão:** O dispositivo de Borda envia o PIN digitado via MQTT para o tópico: `submit_sms`.
7.  **Validação Interna:** O Orquestrador recebe o PIN e o compara com o PIN gerado e ativo, utilizando o módulo **Valida credenciais** (Banco de Dados).
8.  **Decisão e Atuação:**
    * Se a validação for **POSITIVA**, o Orquestrador envia o comando final de liberação via **Publica resposta** no tópico: `tranca`.
9.  **Registro e Notificação:**
    * O módulo **Salva Logs** registra o evento de **Acesso Concedido** no **Banco de Dados**.
    * O Orquestrador aciona **Notifica CCO** para enviar o status final (*"Acesso Concedido"*) ao Dashboard CCO.

### 4.3. Fluxo de Falha (Exemplo: Agendamento Inválido)
* Se o agendamento no passo 3 for inválido, o Orquestrador **pula** a geração de PIN.
* O Orquestrador envia uma resposta de **Acesso Negado** (via **Publica resposta**) para o dispositivo e notifica o CCO com um alerta de "Agendamento Inválido".
* O módulo **Salva Logs** registra a tentativa de acesso negado no **Banco de Dados** para auditoria.

---

Agora temos o fluxo lógico do Backend bem detalhado. Posso te ajudar a montar o **Modelo de Dados (tabelas e campos)** para o Banco de Dados PostgreSQL? 💾