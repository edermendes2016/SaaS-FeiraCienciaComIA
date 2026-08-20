# 🔬 Feira de Ciências com IA (SaaS)

> Plataforma inteligente para ideação, estruturação, acompanhamento e orientação de projetos para feiras de ciências escolares e acadêmicas utilizando Inteligência Artificial.

---

## 💡 Sobre o Projeto e Proposta

O **Feira de Ciências com IA** é um SaaS educacional desenvolvido para transformar a forma como alunos e professores interagem no desenvolvimento de projetos científicos. 

Muitas vezes, estudantes enfrentam bloqueios na hora de definir um tema, formular hipóteses ou estruturar o cronograma e a lista de materiais necessários. Ao mesmo tempo, os professores/orientadores precisam de ferramentas eficientes para acompanhar o progresso de múltiplos grupos e fornecer feedbacks em tempo real.

A proposta deste projeto é unir a metodologia científica ao poder da **Inteligência Artificial Generativa (Google Gemini)**, proporcionando:
- **Auxílio guiado na ideação:** geração de temas viáveis e adequados à faixa etária/nível escolar.
- **Estruturação automática:** divisão em hipótese, metodologia, lista de materiais e tarefas passo a passo.
- **Ambiente colaborativo em tempo real:** comunicação entre os membros do grupo e orientadores.

---

## ✨ Principais Funcionalidades

- 🤖 **Gerador de Projetos com IA:** Criação assistida de propostas científicas completas (resumo, objetivos, hipótese e materiais) a partir de interesses ou temas livres.
- 🎯 **Classificador de Intenções:** Processamento em linguagem natural para sugestão de materiais, adição de tarefas e refinamento metodológico.
- 📋 **Gestão de Tarefas e Materiais:** Checklist interativo com indicador de progresso em tempo real e divisão por etapas do projeto.
- 👥 **Colaboração e Gestão de Equipe:** Sistema de convites para estudantes e orientadores com papéis e permissões dedicadas.
- 💬 **Comunicação Integrada:** Chat da equipe em tempo real e área exclusiva para feedbacks do orientador.
- 🌗 **Interface Moderna:** Tema Claro/Escuro (Dark Mode), feedback visual com notificações toast e design responsivo com Tailwind CSS 4.0.
- 🔒 **Segurança e Controle:** Autenticação via Firebase Auth, regras granulares de segurança no Firestore e fluxo de aprovação de usuários.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [Angular 21](https://angular.dev/) (Standalone Components, Signals, Reactive Forms)
- **Estilização:** [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Inteligência Artificial:** [Google Gemini API](https://ai.google.dev/)
- **Backend as a Service:** [Firebase](https://firebase.google.com/) (Authentication, Cloud Firestore, Firebase Hosting)
- **Testes Unitários:** [Vitest](https://vitest.dev/)

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 20 ou superior)
- [npm](https://www.npmjs.com/)
- Um projeto configurado no [Firebase Console](https://console.firebase.google.com/)

### 1. Clonar o Repositório
```bash
git clone https://github.com/edermendes2016/SaaS-FeiraCienciaComIA.git
cd SaaS-FeiraCienciaComIA
```

### 2. Instalar as Dependências
```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente
Copie o arquivo de exemplo [.env.example](.env.example) para `.env`:
```bash
cp .env.example .env
```

Preencha as variáveis no `.env` com as credenciais do seu projeto Firebase:
```env
FIREBASE_API_KEY=sua_api_key_aqui
FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu-project-id
FIREBASE_STORAGE_BUCKET=seu-storage-bucket.appspot.com
FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
FIREBASE_APP_ID=seu_app_id
FIREBASE_MEASUREMENT_ID=seu_measurement_id
```

### 4. Executar em Desenvolvimento
```bash
npm start
```
O script irá configurar os arquivos de ambiente automaticamente e iniciar o servidor na porta `http://localhost:4200/`.

### 5. Build para Produção
```bash
npm run build
```
Os arquivos otimizados serão gerados no diretório `dist/`.

---

## 📄 Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.
