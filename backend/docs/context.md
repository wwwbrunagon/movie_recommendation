# Backend Context

## Visão geral

O backend do projeto `movie_recommendation` é uma API REST em Node.js com TypeScript e Express. Hoje ele atua principalmente em dois eixos:

- autenticação de usuários com PostgreSQL e Prisma;
- integração com a API do TMDB para busca de filmes, detalhes e créditos.

O backend já possui uma base sólida de autenticação com access token JWT e refresh token persistido em sessão, além de validação com Zod, tratamento global de erros e shutdown gracioso do servidor.

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
- Validação de entrada com Zod.
- Middleware global de erro com mapeamento de:
  - `AppError`;
  - `ZodError`;
  - erros Prisma;
  - erros genéricos.
- Graceful shutdown no processo do servidor.

### Ainda não implementado

- Camada de DTOs para entrada e saída de dados.
- Motor de recomendação de filmes.
- Paginação padronizada nas respostas do TMDB.
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

Scripts relevantes em `backend/package.json`:

- `npm run dev`: desenvolvimento com `tsx watch`
- `npm run build`: compila TypeScript
- `npm run start`: executa o build em `dist/server.js`
- `npm run prisma:migrate`: aplica migrations
- `npm run prisma:generate`: gera o client Prisma

---

## Estrutura principal

- `src/app.ts` - configura Express, CORS, cookies, rotas e middleware global de erro.
- `src/server.ts` - sobe o servidor HTTP, trata falhas do processo e faz shutdown gracioso.
- `src/routes/` - declara endpoints de auth, users, movies e health.
- `src/controller/` - adapta request HTTP para chamadas de serviço e monta respostas.
- `src/services/` - concentra regras de negócio e integrações externas.
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
- `middlewares`: valida, autentica e normaliza erros.
- `controllers`: extraem dados do `req`, validam contexto HTTP e chamam services.
- `services`: concentram regras de negócio e orquestração.
- `repositories`: fazem persistência com Prisma.
- `utils`: dão suporte a autenticação, logs e tratamento de falhas.

---

## Inicialização da aplicação

### `src/app.ts`

Responsável por montar a aplicação Express:

- configura `cors` com `origin: process.env.CLIENT_ORIGIN`;
- habilita `credentials: true`;
- registra `express.json()`;
- registra `cookie-parser`;
- monta as rotas;
- registra o middleware global de erro por último.

### `src/server.ts`

Responsável pelo ciclo de vida do processo:

- carrega variáveis com `dotenv/config`;
- inicia o servidor na porta `process.env.PORT || 3000`;
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
  - Rotaciona a sessão e devolve novo access token e novo refresh token
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
  - Valida o `query` com Zod
  - Consulta o TMDB

- `GET /movies/:id`
  - Protegida por `authMiddleware`
  - Valida `id` numérico
  - Retorna detalhes do filme

- `GET /movies/:id/credits`
  - Protegida por `authMiddleware`
  - Valida `id` numérico
  - Retorna créditos do filme

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
- Usado pelo `authMiddleware` para proteger rotas.

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

- exige `TMDB_BASE_URL` e `TMDB_API_KEY`;
- adiciona `language: 'en-US'` às requisições;
- converte erro `404` em `MOVIE_NOT_FOUND`;
- converte outros erros de Axios em `TMDB_SERVICE_UNAVAILABLE`.

Endpoints consumidos internamente:

- `/search/movie`
- `/movie/:id`
- `/movie/:id/credits`

Observação importante:

- As respostas do TMDB ainda são repassadas em formato bruto para o frontend. Isso funciona, mas deixa a API mais acoplada ao contrato externo.

---

## Recomendações de melhoria

### 1. Introduzir DTOs

Essa é a melhoria mais relevante para o momento.

Hoje os controllers e services trabalham diretamente com `req.body`, `req.query`, `req.params` e com objetos brutos retornados de Prisma e TMDB. Criar DTOs ajudaria a:

- separar contrato HTTP da lógica interna;
- padronizar payloads de entrada e saída;
- reduzir acoplamento com Prisma e TMDB;
- facilitar refatorações futuras;
- deixar os testes mais previsíveis.

Sugestão prática:

- criar `dto/` ou `schemas/` por domínio;
- usar DTOs de entrada para mapear request -> service;
- usar DTOs de saída para responder ao frontend sem vazar campos sensíveis.

Exemplos úteis:

- `RegisterUserDto`
- `LoginUserDto`
- `UserProfileDto`
- `MovieSummaryDto`
- `MovieDetailsDto`
- `MovieCreditsDto`

### 2. Normalizar respostas de filmes

Hoje o TMDB retorna payload completo. Vale criar uma camada de adaptação para devolver só o que o frontend realmente usa.

Benefícios:

- resposta menor;
- contrato mais estável;
- menos dependência do formato do provedor externo.

### 3. Criar serviços dedicados por domínio

Se o projeto começar a evoluir para recomendação real, vale separar melhor:

- `RecommendationService`
- `MovieCatalogService`
- `UserPreferenceService`

Isso evita que `TmdbService` vire uma classe muito genérica.

### 4. Implementar um motor de recomendação

O projeto ainda não tem recomendação como feature real. Possíveis caminhos:

- recomendar por filmes buscados recentemente;
- recomendar por gêneros favoritos;
- recomendar por histórico de interação;
- armazenar preferências do usuário;
- calcular ranking local ou em background.

### 5. Adicionar paginação e filtros

Principalmente para buscas e listas futuras:

- `page`
- `limit`
- ordenação
- filtro por gênero, idioma ou ano

### 6. Cache para chamadas externas

O TMDB pode ser cacheado por curto período para reduzir latência e dependência externa.

### 7. Cobertura de testes

Prioridades:

- service tests;
- controller tests;
- integration tests para auth e movies;
- testes do middleware de erro.

### 8. Versionamento de API

Se a API crescer, `v1` ajuda a evoluir sem quebrar o frontend.

Exemplo:

- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/movies`

---

## Próximos passos naturais

- consolidar DTOs e mappers;
- definir o primeiro escopo real de recomendação;
- padronizar as respostas da API de filmes;
- ampliar testes do backend.
