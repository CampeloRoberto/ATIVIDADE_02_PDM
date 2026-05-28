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

## Testando a API com o Postman

A pasta `postman/` contém uma collection pronta para importar no Postman com todos os endpoints configurados e autenticação automática.

### Como importar

1. Abra o Postman
2. Clique em **Import** (canto superior esquerdo)
3. Selecione o arquivo `postman/collection.json`
4. A collection **"Gestão Financeira API"** aparecerá no painel esquerdo

### Como usar

Execute os requests **na ordem numérica das pastas**:

| Ordem | Pasta / Request | O que acontece |
|-------|----------------|----------------|
| 1 | Health Check | Confirma que a API está no ar |
| 2 | Auth → Login | Salva o `{{token}}` automaticamente |
| 3.1 | Categories → Listar | Salva o `{{defaultCategoryId}}` da categoria *income* |
| 3.2 | Categories → Criar | Salva o `{{categoryId}}` da nova categoria |
| 3.3 | Categories → Atualizar | Usa `{{categoryId}}` salvo |
| 3.4 | Categories → Excluir criada | Espera `204 No Content` |
| 3.5 | Categories → Excluir padrão | Espera `400` — categorias padrão são protegidas |
| 4.1 | Transactions → Criar | Usa `{{defaultCategoryId}}`; salva `{{transactionId}}` |
| 4.2 | Transactions → Listar | Retorna transações com category expandida |
| 4.3 | Transactions → Excluir | Espera `204 No Content` |
| 4.4 | Transactions → Validar erros | Espera `400` com `details` do Zod |

> As variáveis `{{token}}`, `{{categoryId}}`, `{{defaultCategoryId}}` e `{{transactionId}}` são preenchidas automaticamente pelos scripts de **Test** de cada request — não é necessário copiar e colar IDs manualmente.

> A variável `{{baseUrl}}` está definida como `http://localhost:3000` na própria collection. Para alterar, clique nos três pontos da collection → **Edit** → aba **Variables**.

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
