# Backend Context

## Visão geral

O backend do projeto `movie_recommendation` é uma API REST em Node.js com TypeScript e Express. Hoje ele atua principalmente em dois eixos:

- autenticação de usuários com PostgreSQL e Prisma;
- integração com a API do TMDB para busca de filmes, detalhes e créditos.

O backend já possui autenticação com access token JWT e refresh token persistido em sessão, DTOs e mappers por domínio, validação com Zod, configuração central validada em startup, tratamento global de erros e shutdown gracioso do servidor.

Importante: no estado atual, o backend ainda não implementa um motor de recomendação propriamente dito. O nome do projeto sugere esse objetivo, mas a implementação disponível hoje está focada em autenticação e consulta ao TMDB.

---

## Status atual do projeto

### Já implementado

- API Express com TypeScript.
- CORS configurado com `CLIENT_ORIGIN` e `credentials: true`.
- Parser de JSON e cookies habilitados.
- Rotas principais:
  - `/health`
  - `/auth`
  - `/users`
  - `/movies`
- Autenticação com:
  - registro;
  - login;
  - refresh de sessão;
  - logout;
  - cookie HttpOnly para refresh token.
- Proteção de rotas com middleware de JWT.
- Persistência de usuários e sessões de refresh com Prisma.
- Integração com TMDB para:
  - buscar filmes;
  - consultar detalhes;
  - consultar créditos.
- DTOs e mappers para `Auth`, `Users` e `Movies`.
- Respostas normalizadas de filmes, em vez de repasse bruto do payload do TMDB.
- Validação de entrada com Zod e reaproveitamento do payload parseado em `req.validated`.
- Configuração central com fail-fast para `CLIENT_ORIGIN`, `JWT_SECRET`, `TMDB_BASE_URL` e `TMDB_API_KEY`.
- Middleware global de erro com mapeamento de:
  - `AppError`;
  - `ZodError`;
  - erros Prisma;
  - erros genéricos.
- Testes unitários com Vitest para validators, mappers, services, config e middlewares.
- Graceful shutdown no processo do servidor.

### Ainda não implementado

- Motor de recomendação de filmes.
- Cache de respostas do TMDB.
- Rate limiting.
- Versionamento de API.
- Testes de integração mais amplos no backend.

---

## Stack atual

- Node.js
- TypeScript
- Express 5
- Prisma
- PostgreSQL
- Zod
- JWT
- bcrypt
- Axios
- Vitest

Scripts relevantes em `backend/package.json`:

- `npm run dev`: desenvolvimento com `tsx watch`
- `npm run build`: compila TypeScript
- `npm run test`: executa a suíte Vitest
- `npm run start`: executa o build em `dist/server.js`
- `npm run prisma:migrate`: aplica migrations
- `npm run prisma:generate`: gera o client Prisma

---

## Estrutura principal

- `src/app.ts` - configura Express, CORS, cookies, rotas e middleware global de erro.
- `src/server.ts` - inicia o processo HTTP, trata falhas do processo e faz shutdown gracioso.
- `src/bootstrap/start-server.ts` - sobe o servidor apenas após a configuração validada.
- `src/config/app-config.ts` - centraliza e valida variáveis críticas da aplicação.
- `src/routes/` - declara endpoints de auth, users, movies e health.
- `src/controller/` - adapta request HTTP para chamadas de serviço e monta respostas.
- `src/services/` - concentra regras de negócio e integrações externas.
- `src/modules/` - define DTOs, tipos externos e mappers por domínio.
- `src/repositories/` - abstrai acesso ao banco via Prisma.
- `src/middlewares/` - autenticação, validação, verificação de origem e tratamento de erro.
- `src/validators/` - schemas Zod para body, params e query.
- `src/constants/` - mensagens e códigos de erro reutilizáveis.
- `src/utils/` - helpers de erro, logger, JWT, refresh token e cookies.
- `prisma/schema.prisma` - modelo de dados e relacionamentos.

---

## Fluxo de requisição

Fluxo típico:

```text
Request
  -> Route
  -> Middleware(s)
  -> Controller
  -> Service
  -> Repository / API externa
  -> Controller
  -> Response
```

Responsabilidades por camada:

- `routes`: define endpoints e middlewares.
- `middlewares`: valida, autentica, expõe payload parseado em `req.validated` e normaliza erros.
- `controllers`: extraem dados HTTP e payload validado, validam contexto HTTP e chamam services.
- `services`: concentram regras de negócio e orquestração.
- `repositories`: fazem persistência com Prisma.
- `modules`: estabilizam contratos de entrada e saída por domínio.
- `utils`: dão suporte a autenticação, logs e tratamento de falhas.

---

## Inicialização da aplicação

### `src/app.ts`

Responsável por montar a aplicação Express:

- configura `cors` com `origin` vindo de `app-config`;
- habilita `credentials: true`;
- registra `express.json()`;
- registra `cookie-parser`;
- monta as rotas;
- registra o middleware global de erro por último.

### `src/server.ts`

Responsável pelo ciclo de vida do processo:

- carrega variáveis com `dotenv/config`;
- valida configuração crítica antes de abrir a porta;
- inicia o servidor pela camada `bootstrap/start-server`;
- trata `server.on('error')`;
- trata `uncaughtException`;
- trata `unhandledRejection`;
- implementa shutdown gracioso em `SIGTERM`;
- usa `AppError` e `logError` para registrar falhas de encerramento.

---

## Rotas disponíveis

### Auth

- `POST /auth/register`
  - Body: `name`, `email`, `password`
  - Fluxo: validação -> `AuthController.register` -> `AuthService.register` -> cria usuário -> cria sessão de refresh -> gera access token
  - Respostas:
    - `201` com `{ accessToken, user }` e cookie HttpOnly
    - `409` se o usuário já existir
    - `400` em dados inválidos

- `POST /auth/login`
  - Body: `email`, `password`
  - Fluxo: validação -> `AuthController.login` -> `AuthService.login` -> valida senha -> cria sessão -> gera access token
  - Respostas:
    - `200` com `{ accessToken, user }` e cookie HttpOnly
    - `401` em credenciais inválidas
    - `400` em dados inválidos

- `POST /auth/refresh`
  - Lê o refresh token do cookie
  - Rotaciona a sessão e devolve novo access token
  - `401` se o refresh token não existir ou for inválido

- `POST /auth/logout`
  - Revoga a sessão atual, se existir
  - Limpa o cookie de refresh token
  - Resposta `204`

### Users

- `GET /users/me`
  - Protegida por `authMiddleware`
  - Retorna o perfil do usuário autenticado
  - `401` se o token não existir ou for inválido
  - `404` se o usuário não for encontrado

### Movies

- `GET /movies/search?query=...`
  - Protegida por `authMiddleware`
  - Valida `query` com Zod
  - Consulta o TMDB e normaliza a resposta em DTOs de filme

- `GET /movies/:id`
  - Protegida por `authMiddleware`
  - Valida `id` numérico
  - Retorna detalhes do filme em DTO normalizado

- `GET /movies/:id/credits`
  - Protegida por `authMiddleware`
  - Valida `id` numérico
  - Retorna créditos em DTO normalizado

### Health

- `GET /health`
  - Endpoint simples para verificar disponibilidade da API

---

## Modelo de dados

Arquivo: `prisma/schema.prisma`

```prisma
model User {
  id              String           @id @default(uuid())
  name            String
  email           String           @unique
  password        String
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  refreshSessions RefreshSession[]
}

model RefreshSession {
  id        String   @id @default(uuid())
  userId    String
  tokenHash String   @unique
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}
```

Observações:

- A senha do usuário é armazenada com hash bcrypt.
- Refresh tokens não são armazenados em texto puro, apenas o hash.
- A relação `User -> RefreshSession` permite rotação e revogação de sessões.

---

## Autenticação

### Access token

- Gerado em `src/utils/jwt.ts`.
- Carrega `userId`.
- Usa `JWT_SECRET` vindo da configuração central validada.
- É usado pelo `authMiddleware` para proteger rotas.

### Refresh token

- Gerado como token opaco.
- Armazenado em cookie `HttpOnly`.
- Persistido no banco apenas como hash.
- Rotacionado em cada `POST /auth/refresh`.

### Fluxo

- `register` e `login` criam uma sessão autenticada completa.
- `refresh` invalida a sessão anterior e cria uma nova.
- `logout` revoga a sessão atual.

### Senha

- `bcrypt.hash(password, 10)` no registro.
- `bcrypt.compare(password, user.password)` no login.

---

## Validação

- Zod é usado para validar entrada de dados.
- Os schemas ficam em `src/validators/*.ts`.
- O middleware `validate` recebe o schema e a fonte do dado:
  - `body`
  - `params`
  - `query`
- O resultado parseado é salvo em `req.validated` em vez de sobrescrever `req.body`, `req.query` ou `req.params`.

Schemas atuais:

- `registerSchema`
- `loginSchema`
- `searchMoviesSchema`
- `movieIdSchema`
- `updateProfileSchema`
- `changePasswordSchema`

Observação:

- Alguns schemas ainda existem de forma antecipada, mas nem todos estão ligados a rotas implementadas.

---

## Erros e logs

### `AppError`

- Usado para erros de domínio e operação.
- Mantém `statusCode`, `errorCode` e `isOperational`.

### `errorMiddleware`

- Trata erros de forma centralizada.
- Converte:
  - `AppError` em resposta padronizada;
  - `ZodError` em `400 VALIDATION_ERROR`;
  - erros Prisma em respostas adequadas;
  - erros desconhecidos em `500`.

### Logger

- `src/utils/logger.ts` registra contexto da falha.
- O middleware inclui endpoint e `userId` quando disponíveis.

Formato de erro padrão:

```json
{
  "success": false,
  "message": "Descrição do erro",
  "code": "ERROR_CODE",
  "errors": {
    "field": ["Mensagem de erro"]
  }
}
```

---

## Integração com TMDB

O `TmdbService` encapsula as chamadas ao TMDB via Axios.

Comportamento atual:

- usa `TMDB_BASE_URL` e `TMDB_API_KEY` já validados pela configuração central;
- adiciona `language: 'en-US'` às requisições;
- converte erro `404` em `MOVIE_NOT_FOUND`;
- converte outros erros de Axios em `TMDB_SERVICE_UNAVAILABLE`.

Endpoints consumidos internamente:

- `/search/movie`
- `/movie/:id`
- `/movie/:id/credits`

Observações importantes:

- As respostas do TMDB são adaptadas por mappers e expostas em DTOs estáveis.
- O backend falha no startup se configuração crítica como `TMDB_BASE_URL`, `TMDB_API_KEY`, `JWT_SECRET` ou `CLIENT_ORIGIN` estiver ausente ou inválida.

---

## Recomendações de melhoria

### 1. Criar serviços dedicados por domínio

Se o projeto começar a evoluir para recomendação real, vale separar melhor:

- `RecommendationService`
- `MovieCatalogService`
- `UserPreferenceService`

Isso evita que `TmdbService` vire uma classe muito genérica.

### 2. Implementar um motor de recomendação

O projeto ainda não tem recomendação como feature real. Possíveis caminhos:

- recomendar por filmes buscados recentemente;
- recomendar por gêneros favoritos;
- recomendar por histórico de interação;
- armazenar preferências do usuário;
- calcular ranking local ou em background.

### 3. Adicionar paginação e filtros

Principalmente para buscas e listas futuras:

- `page`
- `limit`
- ordenação
- filtro por gênero, idioma ou ano

### 4. Cache para chamadas externas

O TMDB pode ser cacheado por curto período para reduzir latência e dependência externa.

### 5. Cobertura de testes

Prioridades:

- testes de integração para auth e movies;
- testes de middlewares restantes;
- testes de erro em cenários reais de borda.

### 6. Versionamento de API

Se a API crescer, `v1` ajuda a evoluir sem quebrar o frontend.

Exemplo:

- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/movies`

---

## Próximos passos naturais

- definir o primeiro escopo real de recomendação;
- introduzir cache e filtros adicionais para TMDB;
- ampliar testes do backend.
