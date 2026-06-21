# Backend Architecture Guide

## Objetivo

Este documento descreve a arquitetura atual do backend com base no código implementado hoje. Ele cobre estrutura de pastas, responsabilidades por camada, fluxos principais, decisões de autenticação e pontos de extensão.

---

## Stack atual

- Node.js + TypeScript
- Express 5
- Prisma + PostgreSQL
- Zod para validação
- JWT para access token
- Refresh token opaco persistido no banco
- Axios para integração com TMDB

Scripts principais em `backend/package.json`:

- `npm run dev`: desenvolvimento com `tsx watch`
- `npm run build`: build TypeScript
- `npm run start`: executa `dist/server.js`
- `npm run prisma:migrate`: cria/aplica migrations
- `npm run prisma:generate`: gera cliente Prisma

---

## Estrutura de pastas

```text
backend/
  src/
    app.ts
    server.ts
    config/
      prisma.ts
    constants/
      auth-errors.ts
      auth-messages.ts
      movie-errors.ts
      session.ts
      user-errors.ts
    controller/
      auth.controller.ts
      movie.controller.ts
      user.controller.ts
    middlewares/
      auth.middleware.ts
      error.middleware.ts
      validate.middleware.ts
      verify-origin.middleware.ts
    repositories/
      refresh-session.repository.ts
      user.repository.ts
    routes/
      auth.routes.ts
      health.routes.ts
      movie.routes.ts
      user.routes.ts
    services/
      auth.service.ts
      tmdb.service.ts
      user.service.ts
    types/
      express.d.ts
    utils/
      app-error.ts
      async-handler.ts
      auth-cookie.ts
      jwt.ts
      logger.ts
      refresh-token.ts
    validators/
      auth.validator.ts
      movie.validator.ts
      user.validator.ts
  prisma/
    schema.prisma
    migrations/
  docs/
    architecture.md
    context.md
```

---

## Visão de alto nível

Fluxo padrão de uma request:

```text
Request
  -> Route
  -> Middleware(s)
  -> Controller
  -> Service
  -> Repository / External API
  -> Controller
  -> Response
```

Separação atual:

- `routes`: define endpoints e encadeamento de middlewares.
- `middlewares`: autenticação, validação, verificação de origem e tratamento global de erros.
- `controller`: traduz HTTP para chamadas de serviço e monta resposta.
- `services`: concentra regra de negócio.
- `repositories`: acesso ao banco via Prisma.
- `utils`: infraestrutura compartilhada de autenticação, erro, logging e helpers.

---

## Bootstrap da aplicação

### `src/app.ts`

Responsável por montar a aplicação Express:

- configura `cors` com `origin: process.env.CLIENT_ORIGIN`
- habilita `credentials: true`
- registra `express.json()`
- registra `cookie-parser`
- monta rotas:
  - `/health`
  - `/auth`
  - `/users`
  - `/movies`
- registra `errorMiddleware` por último

### `src/server.ts`

Responsável pelo ciclo de vida do processo:

- carrega variáveis com `import 'dotenv/config'`
- sobe servidor HTTP na porta `process.env.PORT || 3000`
- trata `server.on('error')`
- trata `uncaughtException`
- trata `unhandledRejection`
- implementa graceful shutdown em `SIGTERM`
- usa `logError` e `AppError` em falhas de encerramento

Esse arquivo já vai além de um bootstrap mínimo: ele também concentra política de encerramento seguro do processo.

---

## Camadas e responsabilidades

### Routes

Arquivos atuais:

- `auth.routes.ts`
- `health.routes.ts`
- `movie.routes.ts`
- `user.routes.ts`

Responsabilidades:

- declarar endpoints
- aplicar middlewares
- aplicar validação
- envolver handlers com `asyncHandler`

As rotas não contêm regra de negócio.

### Controllers

Arquivos atuais:

- `AuthController`
- `MovieController`
- `UserController`

Responsabilidades:

- ler dados de `req.body`, `req.params`, `req.query`, `req.cookies`
- chamar services
- lançar `AppError` quando faltar contexto HTTP obrigatório
- montar resposta HTTP

Exemplos:

- `AuthController.register/login` definem cookie HttpOnly de refresh token
- `AuthController.refresh/logout` leem cookie atual
- `UserController.me` depende de `req.user.userId`
- `MovieController` apenas converte/parsa inputs e delega ao TMDB service

### Services

Arquivos atuais:

- `auth.service.ts`
- `tmdb.service.ts`
- `user.service.ts`

Responsabilidades:

- concentrar regra de negócio
- orquestrar repositórios
- encapsular integração externa
- lançar erros de domínio/operação via `AppError`

Casos atuais:

- `AuthService`
  - registro
  - login
  - refresh session rotation
  - logout
  - geração de access token
  - criação de refresh session persistida
- `UserService`
  - busca perfil do usuário autenticado
- `TmdbService`
  - busca filmes
  - detalhes
  - créditos
  - tradução de falhas Axios para `AppError`

### Repositories

Arquivos atuais:

- `user.repository.ts`
- `refresh-session.repository.ts`

Responsabilidades:

- isolar acesso ao Prisma
- expor operações de persistência por agregado

Casos atuais:

- `UserRepository`
  - `findByEmail`
  - `findById`
  - `findProfileById`
  - `create`
- `RefreshSessionRepository`
  - `create`
  - `findValidByTokenHash`
  - `revoke`

### Middlewares

Arquivos atuais:

- `auth.middleware.ts`
- `validate.middleware.ts`
- `verify-origin.middleware.ts`
- `error.middleware.ts`

Responsabilidades:

- autenticar requests
- validar payload/params/query
- bloquear origens inválidas em rotas sensíveis a cookie
- padronizar resposta de erro

---

## Fluxos principais

## 1. Registro

Endpoint: `POST /auth/register`

Fluxo:

1. `validate(registerSchema, 'body')`
2. `verifyOriginMiddleware`
3. `AuthController.register`
4. `AuthService.register`
5. `UserRepository.findByEmail`
6. `bcrypt.hash(password, 10)`
7. `UserRepository.create`
8. `RefreshSessionRepository.create`
9. `generateAccessToken(user.id)`
10. `setRefreshTokenCookie(res, refreshToken)`
11. resposta `201`

Resposta:

```json
{
  "accessToken": "...",
  "user": {
    "id": "...",
    "name": "...",
    "email": "..."
  }
}
```

O refresh token não vai no body. Ele é enviado apenas por cookie HttpOnly.

## 2. Login

Endpoint: `POST /auth/login`

Fluxo:

1. `validate(loginSchema, 'body')`
2. `verifyOriginMiddleware`
3. `AuthController.login`
4. `AuthService.login`
5. `UserRepository.findByEmail`
6. `bcrypt.compare(password, user.password)`
7. `RefreshSessionRepository.create`
8. `generateAccessToken`
9. `setRefreshTokenCookie`
10. resposta `200`

## 3. Refresh de sessão

Endpoint: `POST /auth/refresh`

Fluxo:

1. `verifyOriginMiddleware`
2. `AuthController.refresh`
3. lê cookie `refreshToken`
4. `AuthService.refresh`
5. `hashRefreshToken(refreshToken)`
6. `RefreshSessionRepository.findValidByTokenHash`
7. revoga a sessão atual
8. cria nova sessão
9. gera novo access token
10. sobrescreve cookie de refresh
11. resposta `200`

Comportamento importante:

- o backend usa rotação de refresh token
- apenas o hash do refresh token é salvo no banco
- sessão inválida, expirada ou revogada retorna `401`

## 4. Logout

Endpoint: `POST /auth/logout`

Fluxo:

1. `verifyOriginMiddleware`
2. `AuthController.logout`
3. se houver cookie, tenta localizar sessão
4. revoga sessão encontrada
5. limpa cookie com `clearRefreshTokenCookie`
6. resposta `204`

## 5. Perfil do usuário autenticado

Endpoint: `GET /users/me`

Fluxo:

1. `authMiddleware`
2. `UserController.me`
3. lê `req.user.userId`
4. `UserService.getProfile`
5. `UserRepository.findProfileById`
6. resposta `200`

## 6. Busca e detalhes de filmes

Endpoints:

- `GET /movies/search`
- `GET /movies/:id`
- `GET /movies/:id/credits`

Fluxo:

1. `authMiddleware`
2. `validate(...)`
3. `MovieController`
4. `TmdbService`
5. chamada Axios ao TMDB
6. resposta `200`

---

## Autenticação e sessão

### Access token

- formato: JWT
- payload usado hoje: `{ userId }`
- geração em `src/utils/jwt.ts`
- expiração configurada em `ACCESS_TOKEN_EXPIRES_IN = '15m'`

Uso:

- enviado pelo cliente em `Authorization: Bearer <token>`
- validado em `authMiddleware`
- resultado anexado em `req.user`

### Refresh token

- gerado por `crypto.randomBytes(64).toString('hex')`
- persistido apenas como hash SHA-256
- TTL configurado em `REFRESH_TOKEN_TTL_DAYS = 7`
- armazenado em cookie:
  - `httpOnly: true`
  - `sameSite: 'lax'`
  - `path: '/auth'`
  - `secure` apenas em produção

### Verificação de origem

`verifyOriginMiddleware` protege as rotas de auth baseadas em cookie:

- compara `Origin` ou `Referer` com `CLIENT_ORIGIN`
- quando `CLIENT_ORIGIN` não está configurado, o middleware não bloqueia
- quando a origem difere, retorna `403 INVALID_ORIGIN`

---

## Validação

Validação centralizada com Zod:

- `auth.validator.ts`
  - `registerSchema`
  - `loginSchema`
- `movie.validator.ts`
  - `searchMoviesSchema`
  - `movieIdSchema`
- `user.validator.ts`
  - schemas de atualização e troca de senha já existem, mas ainda não estão conectados a rotas

`validate.middleware.ts`:

- recebe um `ZodObject`
- valida `body`, `params` ou `query`
- em caso de falha, delega o `ZodError` ao `errorMiddleware`

Observação relevante: hoje o middleware valida, mas não substitui `req[source]` pelo valor parseado/sanitizado. O código só usa o resultado para aprovar ou reprovar a request.

---

## Tratamento de erro

### `AppError`

Classe base para erros operacionais da aplicação:

- `badRequest`
- `unauthorized`
- `forbidden`
- `notFound`
- `conflict`
- `unprocessableEntity`
- `internalServerError`
- `serviceUnavailable`

### `errorMiddleware`

Centraliza resposta de erro para:

- `AppError`
- `ZodError`
- erros do Prisma
- `Error` genérico
- erros desconhecidos

Formato padrão de resposta:

```json
{
  "success": false,
  "message": "Validation error",
  "code": "VALIDATION_ERROR",
  "errors": {
    "field": ["message"]
  }
}
```

Mapeamentos implementados:

- `P2025` -> `404`
- `P2002` -> `409`
- `P2014` -> `400`
- `P2003` -> `400`
- `P2013` -> `400`

### Logging

`src/utils/logger.ts` registra:

- timestamp
- tipo do erro
- status/code quando disponível
- contexto como endpoint e userId
- stack trace

Observação importante: existe uma função `sanitizeError`, mas ela não é usada hoje dentro de `logError`. Portanto, a sanitização está prevista no arquivo, mas não está efetivamente integrada ao fluxo atual de logging.

---

## Modelo de dados atual

Arquivo: `backend/prisma/schema.prisma`

### `User`

- `id`
- `name`
- `email` único
- `password`
- `createdAt`
- `updatedAt`
- relação com `refreshSessions`

### `RefreshSession`

- `id`
- `userId`
- `tokenHash` único
- `expiresAt`
- `revokedAt`
- `createdAt`
- `updatedAt`

Regras importantes do modelo:

- um usuário pode ter várias refresh sessions
- logout e refresh revogam sessão por `revokedAt`
- a busca de sessão válida exige:
  - `tokenHash` correspondente
  - `revokedAt = null`
  - `expiresAt > now`

---

## Endpoints atuais

### Health

- `GET /health`

Resposta:

```json
{
  "status": "ok"
}
```

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### Users

- `GET /users/me`

### Movies

- `GET /movies/search?query=<texto>`
- `GET /movies/:id`
- `GET /movies/:id/credits`

---

## Convenções do projeto

### Naming

- arquivos em `kebab-case` com sufixos por papel:
  - `*.controller.ts`
  - `*.service.ts`
  - `*.repository.ts`
  - `*.middleware.ts`
  - `*.validator.ts`
- classes em `PascalCase`
- funções e variáveis em `camelCase`
- constantes exportadas em `UPPER_SNAKE_CASE` quando representam valores fixos

### Organização

- controller não acessa banco diretamente
- service não depende de `req`/`res`
- repository fala com Prisma
- rota só compõe pipeline
- erro operacional conhecido deve usar `AppError`
- handlers assíncronos devem ser envolvidos por `asyncHandler`

---

## Lacunas e status real do projeto

Pontos já implementados:

- autenticação com access token + refresh token
- persistência de refresh sessions
- proteção de rotas privadas
- integração com TMDB
- middleware global de erros
- graceful shutdown básico

Pontos parcialmente preparados ou ainda não conectados:

- `user.validator.ts` existe, mas não há rotas de update profile / change password
- `auth-errors.ts`, `movie-errors.ts` e `user-errors.ts` existem, mas o projeto ainda usa códigos hardcoded em vários `AppError`
- `sanitizeError` existe no logger, mas não participa do logging efetivo

Pontos de atenção técnicos:

- `TmdbService` retorna payload bruto do TMDB; não existe camada de normalização
- `validate.middleware.ts` não reaproveita o valor parseado pelo Zod
- `health.routes.ts` está funcional, mas fora do padrão de formatação predominante do restante do backend

---

## Recomendações de evolução

Próximos passos coerentes com a arquitetura atual:

1. Conectar rotas de atualização de perfil e troca de senha usando `user.validator.ts`.
2. Centralizar códigos de erro para reduzir strings hardcoded nos services/controllers.
3. Aplicar sanitização real no logger antes de persistir ou imprimir contexto sensível.
4. Considerar extração de um client TMDB dedicado se a integração crescer.
5. Adicionar testes para:
   - `AuthService`
   - `authMiddleware`
   - `errorMiddleware`
   - `verifyOriginMiddleware`
6. Avaliar invalidação global de sessões por usuário, se necessário para segurança operacional.

---

## Resumo

O backend atual segue um desenho de camadas claro:

```text
Route -> Middleware -> Controller -> Service -> Repository/External API
```

O estado real do projeto já inclui autenticação completa com rotação de refresh token, integração com TMDB, tratamento global de erros e persistência via Prisma. O principal trabalho restante não é estrutural; é consolidar consistência, cobertura e evolução de endpoints já antecipados pelo código.
