# Gestão Financeira — PDM

Aplicativo de controle financeiro pessoal desenvolvido com **Expo/React Native** (frontend) e **Express + Prisma + MySQL** (backend).

```
Atividade_02_PDM/
├── frontend/   → app React Native (Expo)
├── backend/    → API REST (Node.js + Express + Prisma + MySQL)
└── README.md   → este arquivo
```

---

## Pré-requisitos

- [Node.js LTS](https://nodejs.org)
- MySQL Server instalado localmente (usuário `root`)
- MySQL Workbench (ou DBeaver) para inspecionar o banco
- Expo Go no celular **ou** emulador Android/iOS configurado

---

## 1. Iniciar o MySQL

O serviço MySQL precisa estar rodando antes de qualquer coisa.

**Windows — pelo terminal (como Administrador):**
```powershell
Start-Service MySQL80
```

**Windows — pela interface:**
Pressione `Win + R` → digite `services.msc` → ache **MySQL80** → botão direito → **Iniciar**.

Para verificar se está rodando:
```powershell
Get-Service MySQL80
```
O `Status` deve aparecer como `Running`.

---

## 2. Configurar o banco de dados

Com o MySQL rodando, abra o **MySQL Workbench** e execute:

```sql
CREATE DATABASE gestao_financeira CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 2. Subir o backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

A API ficará disponível em `http://localhost:3000`.

> Para inspecionar o banco visualmente: `npm run prisma:studio` (abre em `http://localhost:5555`)

### Variáveis de ambiente (backend/.env)(uso do professor - senha que vc configurou para seu MYsql)

```env
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/gestao_financeira"
PORT=3000
```

---
### Variáveis de ambiente (se mudar de rede, vc deve fazer este passo!)(frontend/.env)

```env
# Emulador Android (padrão)
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000

# Device físico — descubra o IP da máquina com `ipconfig` e troque:
# EXPO_PUBLIC_API_URL=http://192.168.x.x:3000

# iOS Simulator ou Web:
# EXPO_PUBLIC_API_URL=http://localhost:3000
```

## 3. Subir o frontend

```bash
cd frontend
npm install
npx expo start
```

Escaneie o QR Code com o **Expo Go** ou pressione `a` para abrir no emulador Android.

> Sempre reinicie o `expo start` após alterar o `.env`.

### Abrindo no navegador (`w`)

Ao pressionar `w` o app abre no Chrome. Se ele **pular a tela de login** e entrar direto em uma conta, é porque o browser salvou um token de sessão anterior no `localStorage`. Para limpar:

1. Abra o **DevTools** (`F12`) → aba **Application**
2. No painel esquerdo, expanda **Local storage** e clique na URL do app (ex: `http://localhost:8081`)
3. Apague as linhas `@pdm_token` e `@pdm_user` (selecione cada uma e pressione **Delete**)

**Ou mais rápido:** ainda na aba Application, clique em **Storage** (no painel esquerdo) → botão **"Clear site data"** — isso limpa tudo de uma vez.

Após limpar, recarregue a página e a tela de login aparecerá normalmente.

---

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/categories` | Lista categorias |
| POST | `/categories` | Cria categoria |
| PUT | `/categories/:id` | Atualiza categoria |
| DELETE | `/categories/:id` | Remove categoria (bloqueia padrões) |
| GET | `/transactions` | Lista transações (com categoria expandida) |
| POST | `/transactions` | Cria transação |
| PUT | `/transactions/:id` | Atualiza transação |
| DELETE | `/transactions/:id` | Remove transação |

---

## Usuário de teste (pré-cadastrado pelo seed)

Ao rodar `npm run prisma:seed` um usuário de teste é criado automaticamente com transações distribuídas ao longo de 2026:

| Campo | Valor |
|-------|-------|
| **E-mail** | `test@gmail.com` |
| **Senha** | `teste` |

### Saldos por mês (2026)

| Mês | Resultado |
|-----|-----------|
| Janeiro | ✅ Positivo (+R$ 1.650,00) |
| Fevereiro | ✅ Positivo (+R$ 2.100,00) |
| Março | ❌ Negativo (−R$ 1.600,00) |
| Abril | ✅ Positivo (+R$ 1.550,00) |
| Maio | ❌ Negativo (−R$ 500,00) |

> O seed é seguro para rodar mais de uma vez — ele ignora o usuário se já existir.

---

## Rodar tudo em paralelo (dois terminais)

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npx expo start
```
