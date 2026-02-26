# DevConnect Backend 🚀

Backend da plataforma **DevConnect** - O LinkedIn para Desenvolvedores, com funcionalidades avançadas de IA para análise de compatibilidade job-developer.

## 📋 Tecnologias

- **Node.js** + **TypeScript**
- **Express** - Framework web
- **Prisma** - ORM para MySQL
- **MySQL** - Banco de dados
- **JWT** - Autenticação
- **Bcrypt** - Hash de passwords
- **Zod** - Validação de dados
- **Google Gemini AI** - Análise inteligente de compatibilidade

## 🚀 Como Começar

### Pré-requisitos

- Node.js 18+ instalado
- MySQL Workbench instalado e rodando
- Conta Google Cloud com Gemini API habilitada

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Banco de Dados MySQL

No MySQL Workbench, crie um banco de dados:

```sql
CREATE DATABASE devconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:

```env
# Substitua com suas credenciais do MySQL
DATABASE_URL="mysql://root:suasenha@localhost:3306/devconnect"

# Gere uma chave secreta forte
JWT_SECRET="sua-chave-secreta-super-segura"

# Obtenha sua API key em: https://makersuite.google.com/app/apikey
GEMINI_API_KEY="sua-api-key-do-gemini"

# Configurações do servidor
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

### 4. Criar Tabelas no Banco de Dados

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Criar migrations e aplicar schema
npm run prisma:migrate
```

### 5. Popular Banco com Dados de Teste (Opcional)

```bash
npm run prisma:seed
```

Isso criará:
- 2 empresas
- 3 desenvolvedores
- 3 vagas
- 3 candidaturas

**Credenciais de teste:**
- Empresa: `contato@technova.com` / `password123`
- Developer: `gabriel@example.com` / `password123`

### 6. Iniciar Servidor

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Modo produção
npm run build
npm start
```

O servidor estará rodando em: `http://localhost:3000`

## 📡 API Endpoints

### 🔐 Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Criar conta | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/auth/me` | Perfil autenticado | ✅ |

### 💼 Vagas

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/jobs` | Listar vagas | ❌ |
| GET | `/api/jobs/:id` | Detalhes da vaga | ❌ |
| POST | `/api/jobs` | Criar vaga | ✅ Company |
| PUT | `/api/jobs/:id` | Editar vaga | ✅ Company |
| DELETE | `/api/jobs/:id` | Remover vaga | ✅ Company |
| GET | `/api/jobs/:id/applications` | Ver candidatos | ✅ Company |

### 📝 Candidaturas

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/applications` | Candidatar-se | ✅ Developer |
| GET | `/api/applications/my` | Minhas candidaturas | ✅ Developer |
| GET | `/api/applications/:id` | Detalhes | ✅ |
| PUT | `/api/applications/:id/status` | Atualizar status | ✅ Company |
| DELETE | `/api/applications/:id` | Cancelar | ✅ Developer |

## 🤖 Funcionalidades de IA

### Análise Automática de Compatibilidade

Quando um desenvolvedor se candidata a uma vaga, o sistema automaticamente:

1. Analisa as skills do desenvolvedor vs requisitos da vaga
2. Gera um score de 0-100
3. Fornece uma explicação do score
4. Armazena na candidatura

### Geração de Descrições de Vaga

Empresas podem criar vagas com IA:

```json
POST /api/jobs
{
  "title": "Senior Cloud Architect",
  "location": "Remoto",
  "type": "FullTime",
  "salary": "R$ 20.000",
  "generateWithAI": true
}
```

A IA gerará automaticamente:
- Descrição completa da vaga
- Requisitos técnicos

## 📊 Exemplos de Requisições

### Criar Conta (Developer)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "username": "joaosilva",
    "email": "joao@example.com",
    "password": "senha123",
    "type": "developer",
    "bio": "Full Stack Developer",
    "skills": ["React", "Node.js", "TypeScript"]
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

Resposta:
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Criar Vaga (com IA)

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "title": "React Developer",
    "location": "Remoto",
    "type": "FullTime",
    "salary": "R$ 12.000",
    "generateWithAI": true
  }'
```

### Candidatar-se a Vaga

```bash
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "jobId": "clxxx...",
    "coverLetter": "Tenho grande interesse nesta vaga..."
  }'
```

## 🗄️ Schema do Banco de Dados

### Principais Tabelas

- **users** - Desenvolvedores e empresas
- **jobs** - Vagas de emprego
- **applications** - Candidaturas (com score de IA)
- **projects** - Posts do feed
- **comments** - Comentários em projetos
- **startup_projects** - Showcase de startups
- **dev_events** - Eventos para devs

## 🔒 Segurança

- ✅ Passwords hasheados com bcrypt
- ✅ JWT para autenticação stateless
- ✅ Rate limiting (100 req/15min)
- ✅ Helmet.js para headers de segurança
- ✅ Validação de inputs com Zod
- ✅ CORS configurado
- ✅ SQL Injection protegido (Prisma)

## 🛠️ Scripts Úteis

```bash
# Desenvolvimento
npm run dev              # Iniciar com hot reload

# Prisma
npm run prisma:generate  # Gerar cliente Prisma
npm run prisma:migrate   # Criar nova migration
npm run prisma:studio    # Abrir Prisma Studio (GUI)
npm run prisma:seed      # Popular banco com dados

# Produção
npm run build            # Build TypeScript
npm start                # Iniciar servidor
```

## 🐛 Debug

### Ver logs das queries do Prisma

No `.env`, adicione:

```env
DATABASE_URL="mysql://...?logging=true"
```

### Prisma Studio

Visualize e edite dados direto no navegador:

```bash
npm run prisma:studio
```

Abre em: `http://localhost:5555`

## 📦 Estrutura de Pastas

```
backend/
├── prisma/
│   ├── schema.prisma      # Schema do banco
│   └── seed.ts            # Dados iniciais
├── src/
│   ├── controllers/       # Lógica de negócio
│   ├── middleware/        # Auth, validação, erros
│   ├── routes/            # Definição de rotas
│   ├── services/          # Serviços (IA, email, etc)
│   ├── utils/             # Helpers (JWT, prisma)
│   └── server.ts          # Entry point
├── .env                   # Variáveis de ambiente
├── package.json
└── tsconfig.json
```

## 🚧 Próximas Features

- [ ] Sistema de mensagens em tempo real (Socket.io)
- [ ] Upload de imagens (AWS S3)
- [ ] Feed de projetos
- [ ] Sistema de notificações
- [ ] GitHub integration
- [ ] Testes automatizados
- [ ] Docker compose

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## 📝 Licença

MIT

## 👥 Autores

DevConnect Team

---

**Precisa de ajuda?** Abra uma issue no repositório!
