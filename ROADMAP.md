# Roadmap do Projeto: SaaS Feira de Ciências com IA

Este documento descreve o estado atual do projeto e os próximos passos planejados para o desenvolvimento.

## 🚀 Estado Atual (O que já foi feito)

### Autenticação e Usuário
- [x] Integração com Firebase Auth (Login/Cadastro).
- [x] Fluxo de aprovação de usuários (`Waiting Approval`).
- [x] Perfil de usuário básico.

### Núcleo da Aplicação (Dashboard e Projetos)
- [x] Dashboard principal para visualização de projetos.
- [x] Gerador de Projetos utilizando IA (Google Gemini/Vertex AI).
- [x] Sistema de classificação de intenção para comandos de IA.
- [x] Gerenciamento de Tarefas e Materiais dentro de cada projeto.

### Colaboração e Social
- [x] Sistema de Convites para membros e professores.
- [x] Gerenciamento de equipe (Membros e cargos).
- [x] Chat em tempo real para comunicação da equipe do projeto.

### Interface e UX
- [x] Sistema de notificações visual (Toasts).
- [x] Design responsivo utilizando Tailwind CSS 4.0.
- [x] Feedback visual para ações do usuário (salvamento, erros, etc.).
- [x] Implementação de alternar tema do site (Claro/Escuro) e salvar preferência no localStorage.
- [x] Implementação de sistema de comentários do professor (Feedback do Orientador).
- [x] Feedback visual para progresso de tarefas e materiais no dashboard.



## 🛠️ Próximos Passos (Roadmap)

### Fase 1: Refinamento e Segurança
- [ ] Implementação de Controle de Acesso Baseado em Funções (RBAC) - Distinguir melhor entre Estudantes e Orientadores.
- [x] Refatoração das variáveis de ambiente para evitar exposição de chaves sensíveis (preparação para repositório público).
- [ ] Validar se a API sempre verifica os tokens de autenticação do firebase e verificar se o usuário que faz a solicitação é realmente o proprietário do projeto.
- [ ] Implementação de logs de auditoria para ações críticas.

### Fase 2: Funcionalidades Avançadas de IA
- [ ] Feedback automático da IA sobre o progresso do projeto.
- [ ] Sugestões de materiais e referências bibliográficas baseadas no tema do projeto.
- [ ] Chatbot de auxílio metodológico (passo a passo científico).

### Fase 3: Exportação e Apresentação
- [ ] Geração de relatórios em PDF com o resumo do projeto.
- [ ] Exportação de cronogramas e listas de materiais.
- [x] Landing page institucional para o SaaS.

### Fase 4: Infraestrutura e Produção
- [ ] Configuração de CI/CD via GitHub Actions.
- [ ] Deploy em produção (Firebase Hosting).
- [ ] Monitoramento de erros e performance (Sentry/Google Cloud Monitoring).

---
*Última atualização: 30 de Abril de 2026*
