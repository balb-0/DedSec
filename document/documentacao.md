# Documentação IoTDoc - Módulo 4 - Inteli

**_Os trechos em itálico servem apenas como guia para o preenchimento da seção. Por esse motivo, não devem fazer parte da documentação final_**

## Nome do Grupo

#### Nomes dos integrantes do grupo

<img src="../assets/inteli.png">

## Sumário

[1. Introdução](#c1)

[2. Metodologia](#c2)

[3. Desenvolvimento e Resultados](#c3)

[4. Conclusões e Recomendações](#c4)

[5. Referências](#c5)

<br>


# <a name="c1"></a>1. Introdução (sprint 1)

O parceiro de negócio, TIC Trens, é uma holding brasileira que atua no setor de transporte, abrangendo empresas de transporte rodoviário e urbano de passageiros, ônibus, cargas e turismo. Sua principal área de atuação é o transporte de pessoas. O problema a ser resolvido pela empresa está relacionado à gestão e validação do acesso físico a suas áreas técnicas. A empresa enfrenta desafios em coordenar as demandas de acesso lidando com a sobreposição de atividades, priorização entre manutenção e implantação, e a necessidade de verificar a capacitação dos colaboradores conforme a análise de risco. Além disso, há o desafio de garantir que o acesso físico autorizado foi, de fato, realizado por pessoas capacitadas para a atividade programada.

## 1.1 Objetivos

**Objetivo Geral:**
Criar uma solução que permita monitorar e validar acessos físicos a áreas técnicas , garantindo que apenas colaboradores devidamente capacitados e com atividades agendadas possam executar tarefas nesses locais.

**Objetivos Específicos:**
- Aumentar a segurança e a praticidade operacional da empresa.
- Melhorar a gestão e a organização da agenda.
- Registrar e validar acessos físicos a salas técnicas.
- Garantir a entrada apenas de pessoas capacitadas ou autorizadas para a atividade programada.


## 1.2 Proposta da solução

Como o próprio nome sugere, “internet das coisas”, vamos aplicar internet nas “coisas”. Essas coisas se referem a dispositivos físicos do cotidiano que podem se tornar mais inteligentes, permitindo que coletem, troquem e processem dados automaticamente — e é isso que vamos fazer.
Nossa solução para a empresa parceira de veículos rodoferroviários, a Tic Trens — uma holding brasileira que opera em um ambiente que exige os mais altos padrões de segurança e conformidade regulatória — foca principalmente no controle de acesso às suas áreas técnicas, onde enfrentam dificuldades em garantir que o acesso físico autorizado seja efetivamente realizado por pessoas capacitadas para a atividade programada.

Nesse contexto, este projeto propõe desenvolver uma solução IoT (Internet das Coisas) que funcionaria como um dispositivo de validação. Ele possuirá uma área para leitura de cartão, que identificará cada pessoa e verificará se ela tem horário agendado para estar naquele espaço, além de um teclado externo para inserção de uma senha — um código gerado e enviado ao dispositivo do usuário, que deverá digitá-lo em nosso equipamento.

Com essa solução baseada em IoT, buscamos garantir que o acesso às áreas técnicas da Tic Trens seja realizado exclusivamente por pessoas autorizadas e devidamente capacitadas, reforçando os padrões de segurança exigidos pela empresa. Ao integrar identificação por cartão, agendamento prévio e autenticação por código, criamos um sistema robusto, inteligente e automatizado, que contribui diretamente para a eficiência operacional e a conformidade regulatória da organização.
## 1.3 Justificativa

_Faça uma breve defesa de sua proposta de solução, escreva sobre seus potenciais, seus benefícios e como ela se diferencia._

# <a name="c2"></a>2. Metodologia (sprint 3)

_Descreva as etapas da metodologia RM-ODP que foram utilizadas para o desenvolvimento, citando o referencial teórico. Você deve apenas enunciar os métodos, sem dizer ainda como ele foi aplicado e quais resultados obtidos._

# <a name="c3"></a>3. Desenvolvimento e Resultados 

## 3.1. Domínio de Fundamentos de Negócio

_Link para os templates de negócios: https://drive.google.com/drive/folders/1lTqisJ_gxxtc5J5aXM8ula2kQ4MsII_M?usp=sharing_

### 3.1.1. Contexto da Indústria 

O setor de concessões de transporte ferroviário passa por uma profunda transformação no Brasil com a migração do modelo estatal para o privado. Este novo cenário, onde a TIC Trens atua, é marcado por alta competição em licitações e forte pressão regulatória do governo. O sucesso agora depende da capacidade de garantir eficiência e segurança operacional, justificando a necessidade de soluções de controle como este projeto.

**Principais Players (Rivais Corporativos)**

No mercado de operação ferroviária, a "rivalidade" não se dá pela disputa diária do mesmo passageiro, pois cada linha é um monopólio geográfico. A competição estratégica ocorre no nível corporativo, pela **disputa de novas licitações de concessão**. Os principais rivais da TIC Trens são os grandes grupos que competem nos leilões do governo, como a **ViaMobilidade** (parte do grupo CCR, opera as linhas 8 e 9 em SP), o **Grupo Invepar** (operador do MetrôRio) e a **CCR Metrô Bahia**. Essas empresas competem por capital, por fornecedores estratégicos (como fabricantes de trens) e por mão de obra técnica, estabelecendo os benchmarks de performance (segurança, pontualidade) que o governo usa para fiscalizar todas as operadoras.

**Modelos de Negócio**

O modelo de negócio é o de **Concessão de Serviço Público**. O grupo privado vence um leilão para construir/reformar, operar e manter (modelo "BOT" ou similar) uma linha por um longo período (ex: 20-30 anos). A receita vem da **tarifa** paga pelo passageiro (muitas vezes complementada por subsídios do governo) e de **receitas não-tarifárias** (aluguel de lojas nas estações, publicidade). O sucesso do negócio depende estritamente do cumprimento de indicadores de desempenho (KPIs) contratuais, onde falhas de segurança ou operação (como as que seu projeto visa evitar) podem gerar multas milionárias e afetar a viabilidade da concessão.

**Tendências**

A principal tendência do setor é a **Digitalização da Operação** para aumento de eficiência e segurança. Isso inclui a implementação de sistemas de **Manutenção Preditiva**, onde sensores (IoT) em trilhos e trens antecipam falhas antes que elas parem a operação. Outra forte tendência é a **Gestão de Ativos (Asset Management)**, que é exatamente onde seu projeto de controle de acesso se encaixa, garantindo o rastreamento e a segurança de infraestruturas críticas. Por fim, há um foco crescente na **Experiência do Passageiro (Passenger Experience)**, com investimentos em informação em tempo real, métodos de pagamento digitais (como PIX e contactless) e melhoria da segurança nas estações e trilhos, esta última também relacionada ao seu desafio de detecção de invasão.

**Conclusão**

Conclui-se que o setor é um ambiente de alta pressão, onde o modelo de negócio punitivo (baseado em KPIs e multas) e a rivalidade estratégica (por reputação e performance) se encontram. A tendência da digitalização, especialmente a gestão de ativos e a manutenção preditiva, não é um luxo, mas uma necessidade de sobrevivência e competitividade. É neste nexo de segurança rigorosa e necessidade de eficiência que o projeto de controle de acesso se torna uma alavanca estratégica para a TIC Trens, garantindo conformidade e protegendo a empresa das penalidades contratuais.

### Análise das 5 Forças de Porter

A análise das 5 Forças de Porter ajuda a mapear o ambiente competitivo das concessões ferroviárias. Este modelo avalia a intensidade das pressões que a TIC Trens enfrenta de concorrentes, fornecedores, clientes e substitutos, identificando os principais desafios para o seu sucesso operacional e rentabilidade.

**1\. Ameaça de Novos Entrantes: Baixa**

*   **Por quê:** As barreiras de entrada são altíssimas. A entrada no setor exige a vitória em uma licitação governamental, que é um processo longo e complexo. Além disso, o investimento de capital (CAPEX) necessário é astronômico, envolvendo a compra de trens (que custam milhões cada), modernização de sistemas de sinalização, estações e contratação de mão de obra altamente especializada. Não é um mercado em que uma nova empresa pode "decidir" entrar; ela precisa ser um consórcio com enorme capacidade financeira e técnica.
    

**2\. Poder de Barganha dos Fornecedores: Alto**

*   **Por quê:** O setor depende de um número muito restrito de fornecedores globais e especializados. Fabricantes de trens (como Alstom, Siemens, Hitachi) formam um oligopólio e possuem alto poder de negociação nos preços e prazos de entrega. O mesmo vale para fornecedores de sistemas de sinalização (como o CBTC) e equipamentos de manutenção pesada. A TIC Trens terá poucas alternativas, tornando-se dependente desses fornecedores para manter a operação e cumprir seus investimentos contratuais.
    

**3\. Poder de Barganha dos Clientes: Baixo (Passageiro) / Altíssimo (Governo)**

*   **Análise:** É preciso dividir o "cliente" em dois:
    
    *   **O Passageiro Individual (Cliente Final):** Tem poder de barganha **baixo**. A linha de trem opera como um monopólio natural em sua rota. O passageiro que precisa se deslocar pela área da Linha 7 não pode "escolher" um trem concorrente; suas únicas alternativas são os _substitutos_.
        
    *   **O Poder Concedente (Governo/Agência Reguladora):** Este é o "cliente" real do contrato e tem poder de barganha **altíssimo**. O governo (e a agência reguladora, como a ARTESP) fiscaliza o contrato de concessão e pode aplicar multas severas por descumprimento de KPIs (pontualidade, segurança, limpeza). Em casos extremos de má performance, pode até mesmo cassar a concessão.
        

**4\. Ameaça de Produtos ou Serviços Substitutos: Alta**

*   **Por quê:** Esta é a força que você mencionou e é, de fato, a principal concorrência pelo passageiro.
    
    *   **Para a Linha 7 (Urbana):** Os substitutos são o transporte rodoviário (ônibus municipais/intermunicipais) e o transporte individual (carros, motos, aplicativos como Uber). A ameaça é média, pois o trem ganha em tempo (não pega trânsito) e custo.
        
    *   **Para o Trem SP-Campinas (Média Distância):** A ameaça é **altíssima**. O trem competirá diretamente com empresas de ônibus executivos (ex: **Viação Cometa, Buser**), com o conforto do carro particular e com a flexibilidade dos aplicativos. O sucesso do trem dependerá de uma combinação de preço, tempo total de viagem (incluindo o "porta-a-porta") e conforto muito superior aos substitutos.
        

**5\. Rivalidade entre os Concorrentes: Média**

*   **Por quê:** Como explicado no item 1, a rivalidade não se dá pela disputa do passageiro no dia-a-dia. A rivalidade é **feroz** em três frentes estratégicas:
    
    1.  **Disputa por Novas Concessões:** Os grandes grupos (CCR, Invepar, a própria TIC Trens) competem agressivamente nos leilões de privatização de novas linhas.
        
    2.  **Disputa por Recursos:** Competição por mão de obra técnica qualificada (que é escassa) e pela atenção dos fornecedores limitados.
        
    3.  **Benchmarking:** Competição por reputação e performance. Ser vista como a "melhor operadora" perante o governo e a opinião pública é vital para garantir a renovação e a vitória em futuros leilões.
        

A análise das 5 Forças revela que o setor de concessões ferroviárias é **estruturalmente desafiador**. A TIC Trens opera "pressionada" por três lados: o **Poder de Barganha dos Fornecedores** (alto), o **Poder de Barganha do Cliente-Chave (Governo)** (altíssimo) e a **Ameaça de Substitutos** (alta). A rentabilidade da empresa não virá da ausência de concorrência (pois os substitutos são fortes), mas sim da sua capacidade de ser **extremamente eficiente** e **impecável no cumprimento do contrato** (para evitar multas do Governo). Portanto, investimentos em tecnologia de controle e segurança, como este projeto, não são diferenciais competitivos, mas sim **requisitos essenciais de sobrevivência** para mitigar as forças mais poderosas que atuam contra a empresa.

### 3.1.2. Análise SWOT	

A análise SWOT é um documento essencial para todo projeto, isso se deve por nele apresentar fatores internos(forças e fraquezas) e externos(ameaças e oportunidades), esses que vão mostrar a situação clara da empresa, facilitando a tomada de decisão e rumo do produto.

<div align="center">
<sub>Imagem 03: Análise SWOT</sub>
</div>
<div align="center">
<img src="../assets/documentação/SWOT.png">
</div>
<div align="center">
<sub>Fonte: Material produzido pelo Time DedSec, 2025.</sub>
</div> 

A análise SWOT evidencia que a TicTrens possui diferenciais estratégicos importantes, sendo parte do Grupo Comporte e contando com a CRRC como fabricante de seus trens. Essa estrutura garante o benefício de não comprar trens de terceiros, conferindo uma vantagem competitiva de controle e custo, além da facilidade na manutenção e a segurança de uma concessão longa de 30 anos.

Essas forças se alinham perfeitamente às oportunidades geradas pela modernização e expansão do setor ferroviário brasileiro e pelo crescente potencial de expansão do transporte de passageiros e turismo de curta distância, criando um cenário promissor para o crescimento.

No entanto, a pouca flexibilidade no desenvolvimento do produto, a baixa visibilidade pública e o marketing fraco representam pontos de atenção internos que precisam ser urgentemente endereçados para maximizar a captura das oportunidades.

Além disso, as ameaças de mudanças regulatórias governamentais, o risco de atrasos e estouro de orçamento devido ao alto investimento inicial em infraestrutura e o desafio cultural de o brasileiro não ter o costume de andar de trem destacam a necessidade de estratégias que combinem eficiência operacional, gestão rigorosa de projetos e campanhas para favorecer à cultura ferroviária.

Dessa forma, a empresa deve direcionar esforços para aproveitar a capacidade de produção própria e a base da concessão, enquanto mitiga ativamente os riscos de custos e fortalece sua imagem e penetração no mercado, superando as barreiras culturais e regulatórias.

### 3.1.3. Descrição da Solução a ser Desenvolvida (sprint 1)	

#### 3.1.3.1 Qual é o problema a ser resolvido

#### 3.1.3.2 Qual a solução proposta (visão de negócios)

#### 3.1.3.3 Como a solução proposta deverá ser utilizada

#### 3.1.3.4 Quais os benefícios trazidos pela solução proposta

#### 3.1.3.5 Qual será o critério de sucesso e qual medida será utilizada para o avaliar
	
### 3.1.4. Value Proposition Canvas

&nbsp;&nbsp;&nbsp;&nbsp;O Value Proposition Canvas é uma ferramenta visual utilizada para ajudar a desenvolver e alinhar a proposta de valor de um produto ou serviço às necessidades dos clientes. Ele é dividido em duas áreas principais: o Perfil do Cliente e o Mapa de Valor.<sup>[2](#foot2)</sup>.

&nbsp;&nbsp;&nbsp;&nbsp;No Perfil do Cliente, são analisadas as tarefas que o cliente precisa realizar (jobs), os problemas ou desafios que ele enfrenta (pains) e os benefícios ou resultados que ele deseja alcançar (gains). Isso ajuda a entender com maior profundidade o que realmente importa para o cliente e quais são suas principais preocupações e desejos.

&nbsp;&nbsp;&nbsp;&nbsp;Já o Mapa de Valor descreve como o produto ou serviço (Products & services) atende a essas necessidades. Aqui são detalhados os produtos e serviços oferecidos, como eles ajudam a resolver os problemas do cliente (Pain relievers) e como eles criam valor adicional, gerando benefícios que o cliente valoriza (Gain creators).

&nbsp;&nbsp;&nbsp;&nbsp;O objetivo do Value Proposition Canvas é garantir que a solução desenvolvida esteja diretamente conectada às dores e necessidades do cliente, oferecendo um valor claro e relevante. Ele ajuda a identificar se a proposta de valor realmente faz sentido para o cliente, focado em entregar uma solução que resolva seus problemas e maximize os benefícios desejados. (Figura 3.1.4.1).

<div align="center">
<sub>Figura 3.1.4.1 - Value Proposition Canvas</sub><br>
<img src="../assets/valuePropositionCanvas.png" width="80%" ><br>
<sup>Fonte: Material produzido pelos autores (2025)</sup>
</div>

#### 1. Customer Profile (Perfil do Usuário)

##### Pains (Dores)

1. **Falta de controle eficiente sobre acessos físicos às áreas técnicas**  
A TIC Trens enfrenta dificuldades em gerenciar os acessos de colaboradores e prestadores de serviço em áreas restritas, como salas técnicas e zonas operacionais. Atualmente, o processo depende de registros manuais e verificações descentralizadas, o que aumenta o risco de entradas não autorizadas e dificulta a rastreabilidade de quem acessou cada local. Essa falta de controle pode comprometer tanto a segurança operacional quanto a integridade dos equipamentos e dados sensíveis da empresa.

2. **Dificuldade na verificação da capacitação dos colaboradores em tempo real**  
A ausência de integração entre os sistemas de capacitação e os mecanismos de controle de acesso torna difícil confirmar, no momento da entrada, se o colaborador está devidamente treinado para executar a tarefa programada. Isso expõe a empresa a riscos de segurança e descumprimento de normas regulatórias, além de aumentar a probabilidade de acidentes e falhas técnicas causadas por pessoal não habilitado.

3. **Dificuldade na rastreabilidade e auditoria de acessos**  
A falta de registros digitais integrados impede o acompanhamento detalhado de quem acessou cada área, em qual horário e para qual finalidade. Em auditorias internas ou externas, a ausência dessas informações dificulta a comprovação de conformidade e a identificação de falhas no controle de acesso, gerando vulnerabilidades tanto operacionais quanto legais.

4. **Riscos trabalhistas e de segurança devido a acessos indevidos**  
Sem validações automáticas, existe a possibilidade de que colaboradores entrem em áreas restritas sem autorização adequada e ficam expostos a riscos físicos e colocando a empresa em posição vulnerável em casos de acidentes. Além de comprometer a segurança dos funcionários, esse cenário pode resultar em sanções legais e aumentar os custos com indenizações e seguros.

##### Gains (Ganhos)

1. **Aumento da segurança operacional com controle automatizado de acesso**  
Com a implementação de uma solução IoT integrada, a TIC Trens garante que apenas colaboradores devidamente autorizados e capacitados possam acessar áreas técnicas. O controle automatizado reduz drasticamente o risco de acidentes e falhas humanas, promovendo um ambiente de trabalho mais seguro e em conformidade com as normas internas de segurança do trabalho.

2. **Melhoria na eficiência das operações e redução de conflitos de agenda**  
A integração entre o sistema de controle de acesso e o agendamento de atividades permite melhor planejamento e coordenação entre as equipes. Dessa forma, evitam-se sobreposições de tarefas e atrasos causados por conflitos de agenda, resultando em maior fluidez nas operações e otimização do uso dos espaços técnicos.

3. **Maior rastreabilidade e transparência nas atividades de campo**  
Com o registro automatizado de todos os acessos — incluindo data, hora, local e identificação do colaborador —, a empresa passa a dispor de um histórico completo e confiável para auditorias e análises internas. Essa rastreabilidade melhora a gestão de riscos e fornece dados estratégicos para aprimorar os protocolos de segurança e manutenção.


##### Customer Jobs (Tarefas do Cliente)

1. **Gerenciar acessos físicos a áreas técnicas de forma segura e organizada**  
Os gestores e equipes operacionais da TIC Trens precisam controlar quem entra e sai das áreas técnicas, garantindo que apenas pessoas autorizadas tenham acesso. Atualmente, esse processo é realizado de maneira manual ou fragmentada, exigindo verificação de listas, comunicação entre equipes e conferência física no local, o que consome tempo e está sujeito a erros humanos.

2. **Agendar e coordenar atividades de manutenção e implantação em áreas restritas**  
Os gestores de operação precisam planejar e organizar o uso das áreas técnicas, conciliando diferentes demandas e evitando conflitos de agenda entre equipes. Sem um sistema integrado, essa coordenação depende de planilhas ou comunicações informais, o que pode gerar atrasos, sobreposições e falhas de planejamento.

3. **Manter registros confiáveis para auditorias e conformidade**  
A empresa deve registrar com precisão todos os acessos realizados, incluindo identificação do colaborador, horário, local e motivo do acesso. Essa rastreabilidade é essencial para auditorias internas, inspeções de segurança e certificações de conformidade, mas atualmente é dificultada pela ausência de um sistema centralizado e automatizado.

4. **Responder rapidamente a situações de risco ou acessos indevidos**  
Em casos de tentativas de acesso não autorizado ou irregularidades, os gestores precisam ser notificados em tempo real para agir imediatamente. A falta de um sistema que gere alertas automáticos e permita o monitoramento contínuo reduz a capacidade de resposta, aumentando os riscos à segurança e à operação.

#### 2. Value Map (Mapa de Valor)

##### Pain Relievers (Aliviadores de Dores)

1. **Automatização do controle de acesso físico com validação de credenciais**  
A solução IoT elimina a necessidade de verificações manuais, automatizando o processo de entrada em áreas técnicas por meio de sensores, leitores RFID ou autenticação biométrica. O sistema valida, em tempo real, se o colaborador está autorizado e capacitado para acessar o local, reduzindo significativamente o risco de entradas indevidas e erros humanos.

2. **Integração com banco de dados de capacitação e agendamento de atividades**  
O sistema é projetado para se conectar aos registros internos de capacitação e ao cronograma de atividades da TIC Trens. Essa integração permite verificar automaticamente se o colaborador possui as certificações exigidas para a tarefa agendada, além de cruzar informações com o calendário de manutenções e implantações, evitando sobreposições e conflitos de agenda.

3. **Emissão de alertas automáticos para acessos não autorizados ou riscos operacionais**  
O sistema envia notificações em tempo real quando detecta tentativas de acesso indevido, capacitação vencida ou incompatibilidade entre a atividade programada e o colaborador. Esses alertas permitem uma resposta imediata da equipe de segurança ou do gestor responsável, prevenindo incidentes e reforçando o controle sobre áreas críticas.

4. **Registro digital centralizado e rastreável de todos os acessos**  
Todos os eventos de entrada e saída são registrados em um banco de dados seguro e auditável, incluindo identificação do colaborador, data, hora e motivo do acesso. Essa rastreabilidade facilita auditorias, inspeções de conformidade e investigações internas, oferecendo total transparência e confiabilidade às operações.

5. **Redução da burocracia e do tempo gasto em processos de verificação**  
Ao automatizar a checagem de permissões e capacitações, o sistema reduz o tempo gasto com tarefas administrativas e libera as equipes para focarem em atividades estratégicas. Além disso, a eliminação de registros em papel e controles paralelos diminui o retrabalho e aumenta a eficiência operacional.

##### Products & Services (Produtos e Serviços)

1. **Aplicação de IoT para o controle inteligente de acesso físico a áreas técnicas**  
A solução proposta para a TIC Trens utiliza a tecnologia IoT para automatizar o controle de acesso em ambientes restritos, integrando dispositivos físicos e sistemas digitais em uma única plataforma. Sensores, leitores RFID e autenticação biométrica são utilizados para registrar entradas e saídas em tempo real, garantindo que apenas colaboradores devidamente autorizados e capacitados possam acessar áreas técnicas. A aplicação se conecta diretamente ao banco de dados de capacitação e ao sistema de agendamento de atividades, permitindo a validação instantânea das permissões conforme as exigências de cada tarefa. Além disso, o sistema envia alertas para tentativas de acesso indevido e disponibiliza um painel simples para verificação de eventos registrados. Essa integração entre hardware e software oferece um controle preciso, seguro e eficiente, reduzindo riscos operacionais, melhorando a rastreabilidade e fortalecendo a gestão de segurança da empresa.

##### Gain Creators (Criadores de Ganho)

1. **Aprimoramento da segurança e conformidade nas operações**  
A solução IoT garante que apenas colaboradores devidamente qualificados e autorizados tenham acesso às áreas técnicas, reduzindo drasticamente a ocorrência de incidentes e falhas operacionais. Isso reforça a conformidade com normas de segurança e políticas internas, além de proporcionar maior controle e segurança às equipes de gestão e auditoria.

2. **Otimização do planejamento e coordenação das atividades técnicas**  
Com a integração de dados de agendamento, capacitação e acesso em um único sistema, a TIC Trens pode planejar as atividades de manutenção e implantação de maneira mais eficiente. Isso evita sobreposições de tarefas, reduz o tempo ocioso e melhora a produtividade das equipes de campo.

3. **Redução de custos operacionais e administrativos**  
A automatização dos processos de controle de acesso e verificação de capacitação reduz a necessidade de trabalho manual e a dependência de múltiplos sistemas. Isso gera economia de tempo e recursos, permitindo que as equipes se concentrem em tarefas de maior valor agregado.

4. **Tomada de decisão mais ágil e baseada em dados**  
Com relatórios em tempo real e indicadores de acesso, a empresa tem maior capacidade de ação em situações importantes, consegue antecipar riscos e tomar decisões mais embasadas. A visibilidade contínua sobre o fluxo de pessoas e atividades nas áreas técnicas aumenta o controle operacional e contribui para uma gestão mais estratégica e inteligente.

#### Conclusão

&nbsp;&nbsp;&nbsp;&nbsp;Em conclusão, a aplicação do Value Proposition Canvas ao contexto da TIC Trens evidencia a importância de alinhar a proposta de valor da solução IoT às reais necessidades operacionais e de segurança da empresa. A análise das dores e desafios enfrentados — como a falta de controle eficiente de acessos, os riscos trabalhistas e a dificuldade de rastreabilidade — permite compreender de forma clara os pontos críticos que comprometem a eficiência e a conformidade da organização. Com isso, a TIC Trens obtém ganhos tangíveis, como o aumento da segurança operacional, a redução de custos administrativos e a melhora significativa da conformidade regulatória. A integração entre controle de acesso, gestão de capacitação e rastreabilidade de operações reafirma a TIC Trens como exemplo de segurança industrial e demonstra como o uso estratégico de IoT pode transformar processos críticos em sistemas inteligentes, seguros e eficientes.

### 3.1.5. Matriz de Riscos (sprint 1)	

A matriz de riscos é uma ferramenta utilizada para identificar, qualificar e categorizar os riscos que podem ocorrer ao longo do projeto, classificando-os em Ameaças (riscos negativos) e Oportunidades (riscos positivos).

Os riscos identificados são posicionados na matriz conforme sua qualificação nos dois eixos principais:

- Eixo X (Impacto): varia entre Muito Baixo, Baixo, Médio, Alto e Muito Alto;

- Eixo Y (Probabilidade): representado pelos valores 10%, 30%, 50%, 70% e 90%.

A matriz é estruturada de forma espelhada, permitindo a visualização e comparação entre ameaças e oportunidades de maneira equilibrada e intuitiva.

<div align="center">
<sub>Imagem 04: Matriz de Risco</sub>
</div>
<div align="center">
<img src="../assets/documentação/matrizRisco.png">
</div>
<div align="center">
<sub>Fonte: Material produzido pelo Time DedSec, 2025.</sub>
</div> 

#### 3.1.5.1. Ameaças 

&nbsp;&nbsp;&nbsp;&nbsp; As ameaças representam os riscos negativos identificados, ou seja, aqueles que podem causar impactos adversos ou dificultar o andamento e a execução do projeto. Identificar essas ameaças antecipadamente é uma forma de proteger o projeto e garantir que ele siga o cronograma, orçamento e qualidade planejados.

- **1 - Risco de invasão por falha na segurança:**

    **Impacto:** Muito Alto.<br>
    **Probabilidade:** 10%.

    &nbsp;&nbsp;&nbsp;&nbsp; A invasão de terceiros aos ambientes de autênticação e proteção da solução por cópia do RFID ou até mesmo invasões no sistmea de segurança representa um risco muito alto para a solução, já que afeta completamente a credibilidade da equipe e confiança da parceira no projeto.
    <br>

- **2 - Dificuldade no planejamento para implementação por falta de estrutura:**

    **Impacto:** Médio.<br>
    **Probabilidade:** 10%.

    &nbsp;&nbsp;&nbsp;&nbsp; A empresa parceira necessita de segurança nas salas das estações e nos canteiros de obras que ainda não possuem um planejamento adequado ou uma planta definida para orientar a instalação e o mapeamento do local. Por esse motivo, a equipe pode enfrentar dificuldades durante o processo de planejamento e adaptação da solução às necessidades da empresa, devido à falta de estrutura prévia.
    <br>

- **3 - Custo de manutenção:**

    **Impacto:** Baixo.<br>
    **Probabilidade:** 10%.
    
   &nbsp;&nbsp;&nbsp;&nbsp;  Devido a grande quantidade de salas e múltiplas implementações em diferentes lugares, podem haver danos aos equipamentos, o que representa um risco por um alto custo de manutenção.
   <br>

- **4 - Perda de energia elétrica durante a operação:**


    **Impacto:** Muito Alto.<br>
    **Probabilidade:** 50%.

    &nbsp;&nbsp;&nbsp;&nbsp; A possível falta de energia elétrica durante as operações da empresa parceira pode comprometer o funcionamento contínuo da solução, afetando diretamente sua confiabilidade. Além disso, fatores ambientais e geográficos, como chuvas intensas, variações bruscas de temperatura e exposição prolongada a condições climáticas adversas, podem danificar os equipamentos, causar falhas operacionais e comprometer a segurança do sistema. Esses fatores representam um risco elevado à disponibilidade e à credibilidade da solução proposta.

    <br>

- **5 - Erro humano na permissão de acesso:**

    **Impacto:** Médio.<br>
    **Probabilidade:** 50%.


    &nbsp;&nbsp;&nbsp;&nbsp; Um ponto negativo para a solução está relacionado à possibilidade de erro humano durante o processo de concessão ou controle de acesso. Falhas como o cadastro incorreto de usuários, esquecimento de credenciais ou permissões atribuídas de forma indevida podem comprometer a segurança do sistema e permitir acessos não autorizados. Esse risco reforça a importância de implementar camadas adicionais de autenticação, registros de auditoria e treinamentos adequados aos responsáveis pela gestão dos acessos.
    <br>

&nbsp;&nbsp;&nbsp;&nbsp; As ameaças identificadas permitem prever possíveis riscos que podem influenciar negativamente o andamento da solução, possibilitando que a equipe adote medidas preventivas e estratégias de mitigação para reduzir seus impactos durante o desenvolvimento e a implementação do projeto.
<br>

#### 3.1.5.2. Oportunidades 

&nbsp;&nbsp;&nbsp;&nbsp; As oportunidades são situações ou condições favoráveis que, se aproveitadas, podem gerar benefícios ou vantagens para o projeto.
Elas funcionam como o “lado positivo” da análise de riscos: enquanto os riscos representam ameaças, as oportunidades representam possibilidades de ganho.

- **6 - Utilização de criptografia:** como diferencial competitivo

    **Impacto:** Muito Alto.<br>
    **Probabilidade:** 50%.

     &nbsp;&nbsp;&nbsp;&nbsp; A adoção de técnicas avançadas de criptografia como parte da solução IoT representa uma oportunidade de destaque no mercado, agregando valor e aumentando a confiança dos clientes em relação à segurança de dados e acessos.
     A utilização de uma criptografia pós-quântica permitiria elevar exponencialmente o nível de segurança da solução. Essa abordagem diferencia o produto frente a concorrentes e fortalece a imagem da empresa parceira como inovadora e comprometida com a proteção das informações sensíveis.
    <br>

- **7 - Implementação real da solução:**

    **Impacto:** Muito Alto.<br>
    **Probabilidade:** 10%.

    &nbsp;&nbsp;&nbsp;&nbsp; A aplicação prática da solução nas instalações reais da parceira TIC Trens oferece uma oportunidade de validação do projeto, permitindo testes em ambiente operacional e coleta de dados reais sobre desempenho, usabilidade e eficiência. Essa implementação pode gerar visibilidade institucional, ampliar o portfólio de soluções tecnológicas e abrir novas possibilidades de expansão para outras unidades ou empresas do mesmo setor.
    <br>

- **8 - Implementação de autenticação multifator:**


    **Impacto:** Alto.<br>
    **Probabilidade:** 70%.

    &nbsp;&nbsp;&nbsp;&nbsp; A inclusão de autenticação multifator combinando RFID, senha e outros métodos de autênticação via aplicativo fortalece significativamente a segurança do sistema, reduzindo as chances de acesso não autorizado. Além de proteger informações sensíveis, essa funcionalidade amplia o valor da solução e a adequa a padrões modernos de segurança digital, tornando-a mais atrativa para futuras aplicações corporativas.
    <br>

- **9 - Alteração da senha com o decorrer do tempo para evitar clonagem/fraude do RFID:**

    **Impacto:** Médio.<br>
    **Probabilidade:** 70%.

    &nbsp;&nbsp;&nbsp;&nbsp; A implementação de um sistema de atualização periódica de senhas associadas ao RFID contribui para a redução de vulnerabilidades e fraudes. Essa prática reforça a confiabilidade da solução, permitindo que o sistema se adapte continuamente a potenciais ameaças e mantenha a integridade do controle de acesso ao longo do tempo.
    <br>

- **10 - Criação de uma patente ou artigo científico do projeto:**

    **Impacto:** Alto.<br>
    **Probabilidade:** 30%.

    &nbsp;&nbsp;&nbsp;&nbsp; O desenvolvimento bem-sucedido da solução pode gerar oportunidades acadêmicas e comerciais, como a publicação de artigos científicos ou o registro de uma patente. Isso contribuiria para a visibilidade do grupo e da solução.
    <br>

&nbsp;&nbsp;&nbsp;&nbsp; As oportunidades identificadas permitem elevar o nível de qualidade e eficiência da solução, além de evidenciar cenários favoráveis que podem ser explorados estrategicamente. Com isso, a equipe consegue definir prioridades para o planejamento, desenvolvimento e execução do projeto, maximizando seus resultados e valor agregado.
<br>

#### 3.1.5.3. Conclusão

&nbsp;&nbsp;&nbsp;&nbsp; As ameaças levantadas possibilitam prever e identificar riscos que podem influenciar negativamente o andamento do projeto, como falhas de segurança, interrupções por falta de energia e erros humanos no processo de autenticação. Essa antecipação favorece a elaboração de planos de contingência e a definição de práticas preventivas para garantir maior estabilidade e confiabilidade do sistema IoT desenvolvido.

&nbsp;&nbsp;&nbsp;&nbsp; Por outro lado, as oportunidades destacadas representam caminhos de crescimento e inovação para o projeto, como a implementação de autenticação multifator, a aplicação de criptografia avançada e a possibilidade de criação de uma patente ou publicação científica. Esses fatores contribuem para aumentar a credibilidade, o valor tecnológico e o impacto social da solução proposta.

&nbsp;&nbsp;&nbsp;&nbsp; Dessa forma, a análise da matriz de riscos e oportunidades não apenas orienta as decisões da equipe durante o desenvolvimento, mas também fortalece a segurança e eficiência do projeto em parceria com a TIC Trens.

&nbsp;&nbsp;&nbsp;&nbsp; Segue o link para o design da Matriz de Risco: https://www.figma.com/design/lKAsWLCpfKZVKuKm9DAwO1/Untitled?node-id=0-1&t=mX89bk1b4YsXKFtA-1 

### 3.1.6. Política de Privacidade de acordo com a LGPD (sprint 1)	

_A Política de privacidade para o projeto de acordo com a LGPD deve ser escrita considerando o projeto que os alunos estão criando. Os pontos a seguir precisam ser apresentados. O aluno pode utilizar  o Gerador de Política de Privacidade (https://www.nuvemshop.com.br/ferramentas/gerador-politica-de-privacidade), criado pela Nuvemshop e, de acordo com a empresa, já adaptado a LGPD para ter uma prévia e ajustar de acordo com o seu projeto._

#### 3.1.6.1 Informações gerais sobre a empresa / organização

#### 3.1.6.2 Informações sobre o tratamento de dados

#### 3.1.6.3 Quais são os dados coletados

#### 3.1.6.4 Onde os dados são coletados 

#### 3.1.6.5 Para quais finalidades os dados serão utilizadas

#### 3.1.6.6 Onde os dados ficam armazenados 

#### 3.1.6.7 Qual o período de armazenamento dos dados (retenção)

#### 3.1.6.8 Uso de cookies e/ou tecnologias semelhantes

#### 3.1.6.9 Com quem esses dados são compartilhados (parceiros, fornecedores, subcontratados)

#### 3.1.6.10 Informações sobre medidas de segurança adotadas pela empresa

#### 3.1.6.11 Orientações sobre como a empresa/organização atende aos direitos dos usuários

#### 3.1.6.12 Informações sobre como o titular de dados pode solicitar e exercer os seus direitos

#### 3.1.6.13 Informações de contato do Data Protection Officer (DPO) ou encarregado de proteção de dados da organização


### 3.1.7. Bill of Material (BOM) (sprint 1)
_BOM (Bill of Material) pode ser definido como uma lista completa de materiais, que detalha todos os itens necessários para construir, fabricar ou reparar um produto. Deve-se preencher o template fornecido.




## 3.2. Domínio de Fundamentos de Experiência de Usuário 

### 3.2.1. Personas

A etapa de criação de personas é essencial para o alinhamento do projeto. Com as personas conseguimos identificar as dores que o projeto solucionará, as funções que deve contemplar e o impacto causado na vida do público-alvo, de forma a guiar o projeto numa direção organizada e alinhada. Isto posto, foi determinado que o projeto possuirá duas principais personas: um técnico de manutenção que irá interagir diretamente com a solução IoT desenvolvida e uma gestora de acesso, que terá seu trabalho facilitado pelo sistema. 

Carlos Mendes, 42 anos, é Técnico de Manutenção Eletromecânica com mais de 15 anos de experiência no setor ferroviário. Trabalha diariamente em houses, subestações e salas técnicas, onde realiza inspeções e manutenções em equipamentos elétricos e mecânicos. Para executar suas atividades, precisa acessar diferentes áreas restritas, o que hoje exige solicitações manuais e autorizações demoradas.
Sua principal necessidade é contar com um sistema de acesso ágil e seguro, que reduza a burocracia e elimine esperas desnecessárias antes de iniciar o trabalho em campo.

<div align="center">
<sub>Persona 1 - Técnico de manutenção</sub>
</div>
<div align="center">
<img src="../assets/documentação/Persona1.png">
</div>

Beatriz Nunes, 29 anos, é Analista de Gestão de Terceiros – Gestão de Acesso, com formação em Logística e mais de 5 anos de experiência no setor ferroviário. É responsável por monitorar a circulação de equipes e controlar acessos às áreas operacionais, garantindo a segurança das vias e a conformidade dos processos.
Sua principal necessidade é dispor de um sistema centralizado e confiável de monitoramento de acessos, que permita acompanhar em tempo real quem entrou, onde e quando. Além disso, deseja receber alertas automaticamente sobre tentativas de entrada não autorizadas.

<div align="center">
<sub>Persona 2 -  Gestora de acessos</sub>
</div>
<div align="center">
<img src="../assets/documentação/Persona2.png">
</div>

Para melhor visualização, acesse nosso [figma](https://www.figma.com/design/kGDeEGhxhv6GqoSpoG70At/Tic-Trens?node-id=0-1&t=Zh99GbnlH5k2zP99-1).

Portanto a criação de personas se mostra uma etapa imprescindível para o direcionamento e contiunuidade do projeto, de forma a ser um guia para conseguirmos chegar no resultado masi satisfatório para a Tic Trens.

### 3.2.2. Jornada do Usuário e Storyboard (sprint 2)	

_Coloque aqui seu Mapa de Jornada do Usuário:_
- _Ferramenta visual da sequência de interações do usuário._
- _Retrata sentimentos, obstáculos e satisfação ao longo de um processo._
- _Identifica oportunidades de melhoria na experiência._
- _Fazer pelo menos um mapa de jornada do usuário_

_Coloque aqui seu Storyboard:_
- _Ilustração sequencial da interação do usuário com a solução._
- _Enfatiza fluxo, interações e narrativa visual._
- _Destaca pontos de atrito ou oportunidades na experiência._
- _Criar ao menos um storyboard._

## 3.3. Solução Técnica	

_Nesta seção, detalhe a especificação da solução, de acordo com o disposto nas subseções._

### 3.3.1. Requisitos Funcionais (sprint 1)	

_Descreva quais são os requisitos funcionais e sua relação com as demandas e problemas de negócios (visão de funcionalidades). Evolua estes requisitos conforme o desenvolvimento do projeto._

_Atente-se as regras de negócios. Caso necessário, as aponte nos cenários dos requisitos funcionais._

| **RF#** | **Descrição** | **Regra de negócio** | 
|----------|----------|----------|
|RF01|Ex. O dispositivo deve permitir acionamento por botão liga e desliga|Ex. A solução deve funcionar apenas durante seu uso por operadores|
|RF02|Preencha aqui seus requisitos|Preencha aqui as regras de negócio relacionadas|

### 3.3.2. Requisitos Não Funcionais (sprint 2)	

_Descreva quais são os requisitos não funcionais e sua relação com aspectos de qualidade seguindo a norma ISO25010 (visão de aspectos de qualidade). Evolua estes requisitos conforme o desenvolvimento do projeto._

| **RNF#** | **Descrição** | **Aspecto de qualidade** | 
|----------|----------|----------|
|RNF01|Ex. O painel dashboard deve estar disponível 99% do tempo|Ex. Disponibilidade|
|RNF02|Preencha aqui seus requisitos|Preencha aqui o aspecto de qualidade|

### 3.3.3. Arquitetura da Solução (sprint 3)

_Vídeo de explicação sobre a arquitetura da solução: (coloque aqui o link do vídeo)_

_Descreva a arquitetura técnica da solução de forma detalhada (visão de arquitetura).

Justifique como a arquitetura suporta os requisitos funcionais e não funcionais.

O diagrama de arquitetura deve:_
- _Mostrar microcontroladores, incluindo descrições de sua função no sistema (por exemplo: "Irá processar o sinal dos sensores a cada X minutos")_
- _Mostrar sensores, incluindo descrição de função e especificações técnicas do tipo de informação que será coletada_
- _Mostrar apresentadores de informação (displays), incluindo descrição de que tipo de informação será apresentada (por exemplo, "Mostrar temperatura dos sensores")_
- _Mostrar atuadores, caso existam na solução, incluindo descrições do que irão acionar (por exemplo, "Ligar motor de irrigação durante x minutos")_
- _Mostrar o broker MQTT e o dashboard que é a interface do usuário_
- _Mostrar ligações entre os elementos (com fio ou sem fio) – incluindo conexões com sensores e atuadores, conexão com WiFi, entre outros_


### 3.3.4. Arquitetura do Protótipo(sprint 4)	

_Vídeo de explicação sobre a arquitetura do protótipo físico: (coloque aqui o link do vídeo)_

_Descreva as tecnologias utilizadas de forma detalhada (visão de tecnologia).

Descreva a arquitetura usando um diagrama de blocos similar à visão anterior, porém especificando as tecnologias utilizadas. O diagrama de arquitetura deve:_
- _Mostrar microcontroladores, incluindo descrições de sua função no sistema (por exemplo: "Irá processar o sinal dos sensores a cada X minutos")_
- _Mostrar sensores, incluindo descrição de função e especificações técnicas do tipo de informação que será coletada_
- _Mostrar apresentadores de informação (displays), incluindo descrição de que tipo de informação será apresentada (por exemplo, "Mostrar temperatura dos sensores")_
- _Mostrar atuadores, caso existam na solução, incluindo descrições do que irão acionar (por exemplo, "Ligar motor de irrigação durante x minutos")_
- _Mostrar o broker MQTT e o dashboard que é a interface do usuário_
- _Mostrar ligações entre os elementos (com fio ou sem fio) – incluindo conexões com sensores e atuadores, conexão com WiFi, entre outros._
_Faça uma tabela dos possíveis componentes utilizados. Todos os componentes devem estar presentes na arquitetura._

| **Componente** | **Descrição** | **Tipo** | 
|----------|----------|----------|
|E.g. ESP32 WROOM 32 Devkit|E.g. Trata-se de um microcontrolador amplamente usado na indústria e em projetos educacionais, que possui interfaces mais amigáveis para conexão de componentes diversos...|E.g. Microcontrolador|
|E.g. sensor XPTO|E.g. Este sensor mede o sinal de XYZ em unidades q/s, e possui tolerância de abcd...|E.g. Sensor|

### 3.3.5. Arquitetura Refinada da Solução (sprint 5)	

_Descreva a revisão da arquitetura técnica da solução de forma detalhada (visão de arquitetura). <br>

Justifique como a arquitetura suporta os requisitos funcionais e não funcionais. <br>

A revisão deverá incluir comentários sobre cada ponto levantado, mostrando como os ajustes foram realizados, além da descrição da arquitetura revisada._


## 3.4. Resultados	

_Nesta seção, detalhe os resultados obtidos com a implementação, de acordo com o disposto nas subseções._

### 3.4.1.Protótipo Inicial do Projeto usando o Simulador Wokwi (sprint 1)

_Preencha aqui o link para o protótipo inicial no Wokwi_

_Abaixo você deve registrar diversas situações de teste, indicando exemplos de leitura (entrada) e escrita (saída) apresentadas pelo seu sistema no simulador. Estes registros serão utilizados para testar seus componentes, portanto, descreva várias situações, incluindo não apenas casos de sucesso, mas também de possíveis falhas nas leituras de entradas e saídas. <br>
Siga as nomenclaturas e convenções já utilizadas anteriormente, e não se esqueça dos alinhamentos de negócios e experiência do usuário para pensar em situações representativas. Inclua figuras do simulador e descreva os testes realizados para ilustrar o funcionamento do protótipo simulado. A tabela a seguir serve como exemplo._

**#** | **Bloco** | **Componente de entrada** | **Leitura da entrada** | **Componente de saída** | **Leitura da saída** | **Descrição**
|----------|----------|----------|----------|----------|----------|----------|
|01|ex. medidor de umidade relativa do ar|ex. “sensor de umidade XPTO”| < 100 | ex. led amarelo | piscante em intervalo de 1s | quando a umidade está baixa, o led amarelo pisca

### 3.4.2. Protótipo Físico do Projeto (offline) (sprint 2)	

_Aqui você deve registrar diversas situações de teste, indicando exemplos de leitura (entrada) e escrita (saída) apresentadas pelo seu sistema físico. Estes registros serão utilizados para testar seus componentes, portanto, descreva várias situações, incluindo não apenas casos de sucesso, mas também de possíveis falhas nas leituras de entradas e saídas. <br>
Siga as nomenclaturas e convenções já utilizadas anteriormente, e não se esqueça dos alinhamentos de negócios e experiência do usuário para pensar em situações representativas. Inclua figuras do protótipo físico e descrições dos testes realizados para ilustrar o funcionamento do protótipo. A tabela a seguir serve como exemplo._

**#** | **Descrição** | **Pré-condição** | **Procedimento de teste** | **Pós-condição/Resultado esperado** | **Observações** (opcional)
|----------|----------|----------|----------|----------|----------|
|01|ex. Verificação de conexão de rede bem-sucedida. | ex. O dispositivo está desligado.| ex. Ligue o dispositivo, aguarde alguns segundos e verifique se ele estabelece uma conexão bem-sucedida com a rede Wi-Fi. | ex. O LED verde indicador de conexão acende de forma contínua, sinalizando uma conexão bem-sucedida à rede. |

### 3.4.3. Protótipo do Projeto com MQTT e I2C (sprint 3)	

_Aqui você deve registrar diversas situações de uso de seu sistema como um todo, indicando exemplos de ação do usuário e resposta do sistema, apontando como o ambiente deverá estar configurado para receber a ação e produzir a resposta. Estes registros serão utilizados para testar seu sistema, portanto, descreva várias situações, incluindo não apenas casos de sucesso, mas também de falha nos comportamentos do sistema. <br>
Siga as nomenclaturas e convenções já utilizadas anteriormente, e não se esqueça dos alinhamentos de negócios e experiência do usuário para pensar em situações representativas. Inclua figuras do protótipo físico e dashboards, além de descrições dos testes realizados para ilustrar o funcionamento do protótipo. A tabela a seguir serve como exemplo._

**#** | **Configuração do ambiente** | **Ação do usuário** | **Resposta esperada do sistema** 
|----------|----------|----------|----------|
|01|ex. precisa de um computador conectado na interface, dois ou mais dispositivos que simulem o posicionamento de um item X no espaço físico etc. | ex. usuário logado busca a localização do item X, que está ativo e operando normalmente | ex. interface do sistema acessa os dados da última localização registrada do item X e apresenta, constando local e horário de última atualização | 

### 3.4.4. Protótipo Físico do Projeto (online) (sprint 4)	

_Aqui você deve registrar diversas situações de uso de seu sistema como um todo, indicando exemplos de ação do usuário e resposta do sistema, apontando como o ambiente deverá estar configurado para receber a ação e produzir a resposta. Estes registros serão utilizados para testar seu sistema, portanto, descreva várias situações, incluindo não apenas casos de sucesso, mas também de falha nos comportamentos do sistema. <br>
**Desta vez, utilize diagramas de sequência UML para descrever os fluxos de teste do sistema.** <br>
Siga as nomenclaturas e convenções já utilizadas anteriormente, e não se esqueça dos alinhamentos de negócios e experiência do usuário para pensar em situações representativas. Inclua figuras do protótipo físico e dashboards, além de descrições dos testes realizados para ilustrar o funcionamento do protótipo._

### 3.4.5. Protótipo Final do Projeto (sprint 5)	

_Registre as situações de uso do sistema revisadas utilizando a modelagem UML para descrever os fluxos de teste. <br>
Também inclua figuras da versão final do protótipo físico e dashboards, além de descrições dos testes realizados para ilustrar o funcionamento do protótipo._

## <a name="c4"></a>4. Conclusões e Recomendações

_Escreva, de forma resumida, sobre os principais resultados do seu projeto e faça recomendações formais ao seu parceiro de projeto em relação ao uso dessa solução. Você pode aproveitar este espaço para comentar sobre possíveis materiais extras._

## <a name="c5"></a>5. Referências

**Fontes utilizadas na seção 3.1.1. Contexto da Indústria:**

**Sobre o Modelo de Concessão, Players e KPIs (Multas):**

GOVERNO DO BRASIL. ANTT. Manual de Fiscalização do Transporte Ferroviário. 4. ed. Brasília: ANTT, 2023. Disponível em: https://www.gov.br/antt/pt-br/assuntos/ferrovias/manuais-das-ferrovias/arquivos/manual-de-fiscalizacao-do-transporte-ferroviario-4a-edicao.pdf. Acesso em: 20 out. 2025.

MEIER, Ricardo. Governo confirma que CCR e Comporte disputarão concessão das linhas 11, 12 e 13 da CPTM. Metrô CPTM, 26 mar. 2025. Disponível em: https://www.metrocptm.com.br/governo-confirma-que-apenas-a-ccr-e-a-comporte-disputarao-concessao-das-linhas-11-12-e-13-da-cptm/. Acesso em: 20 out. 2025.

**Sobre as Tendências (Digitalização, IoT e Manutenção Preditiva):**

BLOG LYRA M2M. Como a IoT ajuda na manutenção preditiva em trens e linhas ferroviárias?. Lyra M2M, 9 jun. 2025. Disponível em: https://blog.lyram2m.com.br/como-a-iot-ajuda-na-manutencao-preditiva-em-trens-e-linhas-ferroviarias/. Acesso em: 20 out. 2025.

MODALCONNECTION. 3 tendências globais para o setor ferroviário. Intermodal Digital, 27 mar. 2025. Disponível em: https://modalconnection.com.br/eventos/ntexpo/3-tendencias-globais-para-o-setor-ferroviario/. Acesso em: 20 out. 2025.

**Sobre o Poder dos Fornecedores (Oligopólio):**

ALSTOM. Alstom celebra marco de 5 mil caixas produzidas no Brasil. Alstom (Press Release), 22 jul. 2024. Disponível em: https://www.alstom.com/pt/press-releases-news/2024/7/alstom-celebra-marco-de-5-mil-caixas-produzidas-no-brasil. Acesso em: 20 out. 2025.

**Sobre a Ameaça de Substitutos (Concorrentes SP-Campinas):**

BUSER. Ônibus de São Paulo - SP para Campinas - SP. Disponível em: https://www.buser.com.br/onibus/sao-paulo-sp/campinas-sp. Acesso em: 20 out. 2025.

VIAÇÃO COMETA. Passagem de Ônibus: Promoções Imperdíveis!. Disponível em: https://www.viacaocometa.com.br/. Acesso em: 20 out. 2025.


**Fontes utilizadas na seção 3.1.4. Value Proposition Canvas:**

**Value Proposition Canvas**

[2] RUSHIKEN, Amanda. (2023). Value Proposition Canvas: o que é e como funciona essa metodologia?. G4 Educação. Disponível em: <https://g4educacao.com/blog/value-proposition-canvas> Acesso em 21 out. 2025. <a name="foot2" id="foot2"></a>

**Sobre a pesquisa para as personas:**

TICTRENS. Vagas de emprego. Disponível em: https://tictrens.gupy.io/. Acesso em: 20 out. 2025

