# 🏗️ Arquitetura do DevConnect Backend

## 📐 Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    (React + TypeScript)                          │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST API
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      EXPRESS SERVER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Middleware Layer                                        │  │
│  │  • CORS                                                  │  │
│  │  • Helmet (Security)                                     │  │
│  │  • Rate Limiting                                         │  │
│  │  • JWT Authentication                                    │  │
│  │  • Error Handling                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Routes Layer                                            │  │
│  │  /api/auth    → AuthController                          │  │
│  │  /api/jobs    → JobController                           │  │
│  │  /api/applications → ApplicationController              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Controllers Layer                                       │  │
│  │  • Business Logic                                        │  │
│  │  • Request/Response Handling                             │  │
│  │  • Data Validation (Zod)                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Services Layer                                          │  │
│  │  • AI Service (Gemini)                                   │  │
│  │  • Email Service (Future)                                │  │
│  │  • Storage Service (Future)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ Prisma ORM
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      MySQL DATABASE                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tables:                                                 │  │
│  │  • users (developers + companies)                        │  │
│  │  • jobs                                                  │  │
│  │  • applications (+ AI scores)                            │  │
│  │  • projects                                              │  │
│  │  • comments                                              │  │
│  │  • startup_projects                                      │  │
│  │  • dev_events                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE GEMINI AI                              │
│  • Job-Developer Match Analysis                                 │
│  • Job Description Generation                                   │
│  • Resume Improvement Tips                                      │
│  • Interview Questions Generation                               │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Dados - Exemplo: Candidatura

```
1. Developer se candidata
   │
   ├─> POST /api/applications
   │   Body: { jobId, coverLetter }
   │   Headers: { Authorization: Bearer JWT }
   │
2. Auth Middleware
   │
   ├─> Valida JWT
   ├─> Busca user no banco
   ├─> Adiciona req.user
   │
3. Validation Middleware
   │
   ├─> Valida dados com Zod
   │
4. Application Controller
   │
   ├─> Busca Job no banco
   ├─> Busca Developer skills
   │
5. AI Service
   │
   ├─> Chama Gemini API
   ├─> Analisa compatibilidade
   ├─> Retorna { score, reason }
   │
6. Prisma ORM
   │
   ├─> INSERT into applications
   │   com aiScore e aiReasoning
   │
7. Response
   │
   └─> 201 Created
       Body: { application, aiScore: 85, ... }
```

## 📁 Estrutura de Arquivos Detalhada

```
devconnect-backend/
│
├── 📄 package.json           # Dependências e scripts
├── 📄 tsconfig.json          # Configuração TypeScript
├── 📄 .env.example           # Template de variáveis
├── 📄 .env                   # Variáveis de ambiente (criar)
├── 📄 README.md              # Documentação completa
├── 📄 SETUP.md               # Guia de instalação rápida
│
├── 📁 prisma/
│   ├── 📄 schema.prisma      # Schema do banco de dados
│   └── 📄 seed.ts            # Dados iniciais para testes
│
└── 📁 src/
    │
    ├── 📄 server.ts          # Entry point da aplicação
    │
    ├── 📁 controllers/       # Lógica de negócio
    │   ├── authController.ts      # Register, Login, GetMe
    │   ├── jobController.ts       # CRUD de vagas
    │   └── applicationController.ts # CRUD de candidaturas
    │
    ├── 📁 middleware/        # Interceptadores
    │   ├── auth.ts           # requireAuth, requireCompany
    │   ├── errorHandler.ts   # Tratamento centralizado de erros
    │   └── validation.ts     # Validação de dados (Zod)
    │
    ├── 📁 routes/            # Definição de rotas
    │   ├── auth.routes.ts
    │   ├── job.routes.ts
    │   └── application.routes.ts
    │
    ├── 📁 services/          # Serviços externos
    │   └── aiService.ts      # Integração com Gemini
    │
    ├── 📁 utils/             # Utilitários
    │   ├── prisma.ts         # Cliente Prisma configurado
    │   └── jwt.ts            # Geração/validação de tokens
    │
    └── 📁 types/             # Types TypeScript (future)
```

## 🔐 Fluxo de Autenticação

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       │ POST /api/auth/login
       │ { email, password }
       │
       ▼
┌──────────────────────┐
│  Auth Controller     │
│  1. Busca user       │
│  2. Compara hash     │
│  3. Gera JWT         │
└──────┬───────────────┘
       │
       │ Response:
       │ { token, user }
       │
       ▼
┌─────────────┐
│   Cliente   │
│ Guarda token│
└─────────────┘
       │
       │ Próximas requisições:
       │ Header: Authorization: Bearer TOKEN
       │
       ▼
┌──────────────────────┐
│ Auth Middleware      │
│ 1. Extrai token      │
│ 2. Verifica JWT      │
│ 3. Busca user        │
│ 4. Adiciona req.user │
└──────────────────────┘
```

## 🤖 Integração com IA (Gemini)

### Quando a IA é Acionada?

```
Trigger 1: Developer se candidata a vaga
│
├─> POST /api/applications
│
└─> AI Service: analyzeJobMatch()
    │
    ├─> Input:
    │   • Job: title, requirements, description
    │   • Dev: name, skills, bio
    │
    ├─> Prompt para Gemini:
    │   "Analise a compatibilidade técnica..."
    │
    ├─> Output:
    │   { score: 85, reason: "..." }
    │
    └─> Salvo em applications table

Trigger 2: Company cria vaga com generateWithAI=true
│
├─> POST /api/jobs { generateWithAI: true }
│
└─> AI Service: generateJobDescription()
    │
    └─> AI Service: generateJobRequirements()
```

## 🔒 Camadas de Segurança

```
Layer 1: Network
├─> CORS (origens permitidas)
├─> Helmet (headers HTTP seguros)
└─> Rate Limiting (100 req/15min)

Layer 2: Authentication
├─> JWT com expiração
├─> Bcrypt para passwords
└─> Token validation em cada request

Layer 3: Authorization
├─> requireAuth (logged in?)
├─> requireCompany (is company?)
└─> requireDeveloper (is developer?)

Layer 4: Data Validation
├─> Zod schemas
├─> Type checking
└─> SQL Injection protected (Prisma)

Layer 5: Business Logic
├─> Ownership checks
├─> Status validations
└─> Duplicate prevention
```

## 📊 Modelo de Dados Simplificado

```
┌─────────────────┐
│     User        │
├─────────────────┤
│ id (PK)         │
│ type (enum)     │◄───────┐
│ name            │        │
│ username        │        │
│ email           │        │
│ password (hash) │        │
│ skills (JSON)   │        │
└─────────────────┘        │
        │                  │
        │ 1:N              │ 1:N
        │                  │
        ▼                  │
┌─────────────────┐        │
│      Job        │        │
├─────────────────┤        │
│ id (PK)         │        │
│ companyId (FK)  │────────┘
│ title           │
│ description     │
│ requirements    │
│ type (enum)     │
└─────────────────┘
        │
        │ 1:N
        │
        ▼
┌─────────────────┐
│  Application    │
├─────────────────┤
│ id (PK)         │
│ jobId (FK)      │
│ developerId(FK) │
│ status (enum)   │
│ aiScore         │◄─── Gemini AI
│ aiReasoning     │
└─────────────────┘
```

## 🚀 Performance e Escalabilidade

### Otimizações Implementadas

```
✅ Database
├─> Indexes em campos frequentes
├─> JSON para arrays (skills, requirements)
└─> Cascade deletes configurados

✅ API
├─> Paginação (page, limit)
├─> Lazy loading (include only needed)
└─> Caching potential (Redis - future)

✅ Code
├─> TypeScript para type safety
├─> Async/await para não bloquear
└─> Error handling centralizado
```

### Bottlenecks Potenciais e Soluções

```
Problem: Muitas queries no banco
Solution: Eager loading com include, caching

Problem: AI requests lentas
Solution: Queue system (Bull), background jobs

Problem: Large response payloads
Solution: Pagination, field selection, compression

Problem: Concurrent applications
Solution: Database transactions, unique constraints
```

## 🧪 Como Testar Cada Camada

### 1. Testar Database
```bash
npm run prisma:studio
# Visualizar/editar dados
```

### 2. Testar Auth
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -d '{"email":"...", "password":"..."}'
```

### 3. Testar Authorization
```bash
# Sem token (deve falhar)
curl http://localhost:3000/api/applications/my

# Com token (deve funcionar)
curl http://localhost:3000/api/applications/my \
  -H "Authorization: Bearer TOKEN"
```

### 4. Testar IA
```bash
# Candidatar-se (trigger AI)
curl -X POST http://localhost:3000/api/applications \
  -H "Authorization: Bearer TOKEN" \
  -d '{"jobId":"..."}'
  
# Verificar aiScore no response
```

## 📈 Métricas para Monitorar

```
Performance:
├─> Response time médio
├─> Database query time
└─> AI request time

Reliability:
├─> Error rate (%)
├─> Uptime (%)
└─> Failed AI requests

Business:
├─> Applications created
├─> Jobs posted
├─> AI matches > 80%
└─> Average AI score
```

---

**Esta arquitetura foi desenhada para:**
- ✅ Escalabilidade horizontal
- ✅ Manutenibilidade
- ✅ Type safety
- ✅ Testabilidade
- ✅ Segurança

**Pronto para produção com:**
- Docker containerization
- Environment-based configs
- Logging system
- Monitoring setup
