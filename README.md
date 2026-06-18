# Task Manager — Escritório

## Configuração inicial

### 1. Banco de dados (Supabase)
1. Crie conta em supabase.com
2. Crie um novo projeto
3. Vá em **SQL Editor** e execute o conteúdo de `backend/src/schema.sql`
4. Copie a **Connection string** em Settings → Database

### 2. E-mail (Resend)
1. Crie conta em resend.com
2. Gere uma API Key
3. (Opcional) Adicione e verifique seu domínio

### 3. Backend
```bash
cd backend
cp .env.example .env
# Edite o .env com suas credenciais
npm install
npm start
```

### 4. Frontend
```bash
cd frontend
cp .env.example .env
# Se o backend não for localhost:3001, edite REACT_APP_API_URL
npm install
npm start
```

### 5. Criar primeiro usuário (admin)
Faça uma requisição POST para `http://localhost:3001/api/auth/register`:
```json
{
  "name": "Seu Nome",
  "email": "seu@email.com",
  "password": "suasenha",
  "role": "admin"
}
```
Ou use o Postman / Insomnia.

## Deploy em produção
- **Frontend**: conecte a pasta `frontend` no Vercel (deploy automático)
- **Backend**: conecte a pasta `backend` no Railway
- Configure as variáveis de ambiente nos painéis de cada serviço

## Funcionalidades
- Dashboard com métricas em tempo real
- Criar, editar, concluir e excluir tarefas
- Prazos com alertas automáticos
- Categorias coloridas
- Atribuição de tarefas para membros da equipe
- Notificações no app e por e-mail
- Relatórios: linha do tempo, por usuário, por categoria
- Login seguro por usuário (JWT)
