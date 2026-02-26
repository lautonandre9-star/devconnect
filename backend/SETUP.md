# 🚀 Setup Rápido - DevConnect Backend

## Checklist de Instalação

### ✅ 1. Pré-requisitos
- [ ] Node.js 18+ instalado
- [ ] MySQL instalado e rodando (via MySQL Workbench)
- [ ] Conta Google Cloud com Gemini API

### ✅ 2. Configurar MySQL

Abra o MySQL Workbench e execute:

```sql
CREATE DATABASE devconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### ✅ 3. Instalar Dependências

```bash
npm install
```

### ✅ 4. Configurar .env

Copie e edite o arquivo de configuração:

```bash
cp .env.example .env
```

**Edite o `.env` com suas credenciais:**

```env
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/devconnect"
JWT_SECRET="cole-uma-chave-aleatoria-segura-aqui"
GEMINI_API_KEY="sua-api-key-do-gemini"
```

**Como obter Gemini API Key:**
1. Acesse: https://makersuite.google.com/app/apikey
2. Clique em "Create API Key"
3. Copie e cole no `.env`

### ✅ 5. Configurar Banco de Dados

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Criar tabelas
npm run prisma:migrate
```

Quando pedir nome da migration, digite: `init`

### ✅ 6. (Opcional) Popular com Dados de Teste

```bash
npm run prisma:seed
```

**Credenciais criadas:**
- 👔 Empresa: `contato@technova.com` / `password123`
- 👨‍💻 Dev: `gabriel@example.com` / `password123`

### ✅ 7. Iniciar Servidor

```bash
npm run dev
```

**Pronto! 🎉**

Servidor rodando em: http://localhost:3000
Health check: http://localhost:3000/health

---

## 🧪 Testar se está funcionando

### Teste 1: Health Check

```bash
curl http://localhost:3000/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "...",
  "environment": "development"
}
```

### Teste 2: Criar Conta

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste User",
    "username": "testeuser",
    "email": "teste@example.com",
    "password": "senha123",
    "type": "developer",
    "skills": ["JavaScript", "React"]
  }'
```

### Teste 3: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

Copie o `token` da resposta para usar nos próximos testes!

### Teste 4: Listar Vagas

```bash
curl http://localhost:3000/api/jobs
```

---

## 🐛 Problemas Comuns

### Erro: "connect ECONNREFUSED"
**Problema:** MySQL não está rodando  
**Solução:** Inicie o MySQL via MySQL Workbench

### Erro: "Access denied for user"
**Problema:** Credenciais erradas no .env  
**Solução:** Verifique user e senha no `DATABASE_URL`

### Erro: "Database 'devconnect' does not exist"
**Problema:** Banco não foi criado  
**Solução:** Execute o CREATE DATABASE no MySQL Workbench

### Erro: "GEMINI_API_KEY is not defined"
**Problema:** Falta a API key do Gemini  
**Solução:** Configure no .env (feature de IA não funcionará sem isso)

### Erro ao rodar migrations
**Problema:** Schema anterior conflitante  
**Solução:**
```bash
# Limpar e recriar
rm -rf prisma/migrations
npm run prisma:migrate
```

---

## 📊 Ferramentas Úteis

### Prisma Studio (GUI para o banco)

```bash
npm run prisma:studio
```

Abre interface visual em: http://localhost:5555

### Ver Logs do Banco

Adicione no `.env`:
```env
DATABASE_URL="mysql://user:pass@localhost:3306/devconnect?logging=true"
```

---

## 🎯 Próximos Passos

1. ✅ Backend rodando
2. 🔜 Conectar com o Frontend
3. 🔜 Testar features de IA
4. 🔜 Adicionar mais endpoints conforme necessário

**Bom desenvolvimento! 🚀**
