# 🌊 Onda do Bem — API Backend (Kotlin + Spring Boot 3)

Backend RESTful desenvolvido em **Kotlin** com **Spring Boot 3**, perfeitamente alinhado aos contratos e modelos TypeScript do aplicativo mobile Onda do Bem.

---

## 🛠 Stack Tecnológica

- **Linguagem:** Kotlin 2.x
- **Runtime:** Java 21 LTS
- **Framework:** Spring Boot 3 (Web, Data JPA, Security, Validation)
- **Autenticação:** JWT (JJWT 0.12) com Access Token (24h) e Refresh Token (7 dias)
- **Banco de Dados:**
  - **Dev/Local:** H2 Database em memória (pronto para rodar sem dependências externas)
  - **Produção:** PostgreSQL (configurável via variáveis de ambiente)
- **Console H2:** [http://localhost:8080/h2-console](http://localhost:8080/h2-console) (JDBC URL: `jdbc:h2:mem:ondadobemdb`, usuário: `sa`, senha em branco)

---

## 🚀 Como Executar o Backend

### 1. Iniciar o Servidor
Abra o terminal na pasta `backend` e execute:

```powershell
# Windows (PowerShell)
.\gradlew.bat bootRun

# Linux / macOS
./gradlew bootRun
```

O servidor iniciará em `http://localhost:8080`.

---

## 📱 Conectando com o Aplicativo Mobile

No projeto mobile `Onda-do-bem`, configure no arquivo `.env`:

```env
# Para emulador Android:
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api

# Para simulador iOS ou Web:
EXPO_PUBLIC_API_URL=http://localhost:8080/api

# Para celular físico via Expo Go (substitua pelo IP do seu PC na rede Wi-Fi):
EXPO_PUBLIC_API_URL=http://192.168.1.XX:8080/api
```

---

## 🔑 Credenciais de Teste Pré-cadastradas

O servidor inicializa com 3 usuários com publicações e métricas reais:

| Nome | E-mail | Senha | Perfil |
| :--- | :--- | :--- | :--- |
| **Lucas Silva** | `lucas.silva@ondadobem.org` | `senha123` | Guardião da Terra (Nível 4) |
| **Marina Costa** | `marina.costa@ondadobem.org` | `senha123` | Líder Sustentável (Nível 5) |
| **Pedro Almeida** | `pedro.almeida@ondadobem.org` | `senha123` | Semeador do Futuro (Nível 3) |

---

## 📡 Endpoints da API

### Autenticação (`/api/auth`)
- `POST /api/auth/register` — Cadastro de usuário
- `POST /api/auth/login` — Login retornando tokens JWT
- `POST /api/auth/refresh` — Renovação do token de acesso
- `GET /api/auth/me` — Dados do usuário logado (requer Bearer token)
- `POST /api/auth/logout` — Logout

### Publicações & Feed (`/api/posts`)
- `GET /api/posts` — Feed paginado com filtros `category`, `search`, `page`, `limit`
- `GET /api/posts/{id}` — Detalhes da publicação com comentários
- `POST /api/posts` — Criar publicação (requer Bearer token)
- `POST /api/posts/{id}/like` — Curtir/descurtir publicação
- `GET /api/posts/{id}/comments` — Listar comentários de um post
- `POST /api/posts/{id}/comments` — Adicionar comentário (requer Bearer token)

### Usuários & Perfil (`/api/users`)
- `GET /api/users/{id}` — Visualizar perfil público
- `GET /api/users/me` — Visualizar perfil próprio
- `PUT /api/users/me` — Atualizar perfil (displayName, bio, localidade)

### Impacto Comunitário (`/api/impact`)
- `GET /api/impact/summary` — Resumo agregado de impacto global
- `GET /api/impact/community` — Totais de ações e score
- `GET /api/impact/user/{id}` — Métricas de impacto de um usuário específico

---

## 🐘 Como Conectar ao PostgreSQL

Para apontar para um banco PostgreSQL (local ou em nuvem como Supabase/Neon), defina as variáveis de ambiente:

```powershell
$env:DATABASE_URL="jdbc:postgresql://host:5432/nomedobanco"
$env:DATABASE_USERNAME="postgres"
$env:DATABASE_PASSWORD="suasenha"
$env:DATABASE_DRIVER="org.postgresql.Driver"
$env:DATABASE_DIALECT="org.hibernate.dialect.PostgreSQLDialect"

.\gradlew.bat bootRun
```
