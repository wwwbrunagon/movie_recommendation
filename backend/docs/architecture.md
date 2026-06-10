# Backend Architecture Guide

## Objetivo

Este documento descreve a arquitetura do backend, padrões de nomeação, estrutura de pastas e fluxos principais. Ele serve como referência para novos desenvolvedores e para a implementação de futuras features.

---

## Estrutura de pastas

```
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
      user-errors.ts
    controller/
      auth.controller.ts
      movie.controller.ts
      user.controller.ts
    middlewares/
      auth.middleware.ts
      validate.middleware.ts
    repositories/
      user.repository.ts
    routes/
      auth.routes.ts
      health.routes.ts
      movie.routes.ts
      user.routes.ts
    services/
      auth.service.ts
      tmdb.service.ts
    types/
      express.d.ts
    utils/
      jwt.ts
    validators/
      auth.validator.ts
      movie.validator.ts
  prisma/
    schema.prisma
    migrations/
  docs/
    architecture.md
    context.md
```

### Descrição das camadas

- `src/app.ts`
  - Configura o Express e monta middlewares e rotas.
- `src/server.ts`
  - Inicializa o servidor usando `app` e carrega `dotenv`.
- `src/config/prisma.ts`
  - Cria e exporta a instância `PrismaClient`.
- `src/constants/`
  - Armazena strings e códigos de erro reutilizáveis.
- `src/routes/`
  - Define endpoints e associa middlewares/validadores.
- `src/controller/`
  - Processa requisições, trata erros e chama services.
- `src/services/`
  - Contém lógica de negócio e integrações externas.
- `src/repositories/`
  - Faz persistência no banco e abstrai Prisma.
- `src/middlewares/`
  - Contém validação de request e proteção por token.
- `src/validators/`
  - Define schemas Zod para request body, params e query.
- `src/utils/`
  - Utilitários gerais como geração de JWT.

---

## Padrões de naming

- Arquivos:
  - Use `kebab-case` para arquivos e pastas.
  - Exemplo: `auth.controller.ts`, `movie.routes.ts`.
- Classes e instâncias:
  - Classes com `PascalCase` e sufixo claro: `AuthController`, `TmdbService`, `UserRepository`.
  - Instâncias com `camelCase`: `authController`, `userRepository`.
- Funções e variáveis:
  - Use `camelCase` para funções e variáveis.
  - Exemplo: `generateToken`, `authMiddleware`, `searchMoviesSchema`.
- Constantes exportadas:
  - Use `UPPER_SNAKE_CASE` para valores fixos ou erros.
  - Para objetos constantes utilitárias use `camelCase` com `as const` quando necessário.

### Convenções específicas

- Controllers:
  - nome final `Controller`, por exemplo `UserController`.
  - métodos devem refletir ações do endpoint: `register`, `login`, `me`, `searchMovies`.
- Services:
  - nome final `Service`, por exemplo `AuthService`.
  - expor métodos que representam casos de uso de negócio.
- Repositories:
  - nome final `Repository` e foco exclusivo em acesso a dados.
- Middlewares:
  - nome final `middleware` e exportado como função.
- Rotas:
  - cada arquivo define um `Router` e exporta padrão ou nomeado.
  - endpoints devem ser curtos e sem lógica de negócio.

---

## Fluxo de requisição

### Visão geral do fluxo

```text
Request -> Route -> Middleware -> Controller -> Service -> Repository/External API -> Controller -> Response
```

### Diagrama detalhado

```text
[Client]
   |
   | HTTP request
   v
[Express app] -- app.use('/auth', authRoutes)
   |
   v
[authRoutes] --- validate(registerSchema) ---> [AuthController.register]

[AuthController] --> AuthService.register --> UserRepository.findByEmail
                                                   --> bcrypt.hash
                                                   --> UserRepository.create
                                                   --> generateToken
   |
   v
[Response 201 { token, user }]
```

---

## Fluxo de autenticação

### Registro

1. `POST /auth/register`
2. `validate(registerSchema, 'body')`
3. `AuthController.register`
   - valida manual de `name`, `email`, `password`
4. `AuthService.register`
   - verifica se usuário já existe
   - criptografa senha com `bcrypt.hash(..., 10)`
   - cria usuário via `UserRepository.create`
   - gera JWT com `generateToken(user.id)`
5. retorna `201` com token e dados do usuário

### Login

1. `POST /auth/login`
2. `validate(loginSchema, 'body')`
3. `AuthController.login`
4. `AuthService.login`
   - busca usuário por email
   - compara senha com `bcrypt.compare`
   - gera token JWT
5. retorna `200` com token e dados do usuário

### Protegendo rotas

- `authMiddleware` valida cabeçalho `Authorization: Bearer <token>`.
- verificação de `JWT_SECRET` em ambiente.
- usa `jwt.verify` para extrair `userId`.
- adiciona `req.user = { userId }`.
- se inválido, retorna `401`.

---

## Fluxo de integração com TMDB

### Busca de filmes

1. `GET /movies/search?query=<texto>`
2. `authMiddleware`
3. `validate(searchMoviesSchema, 'query')`
4. `MovieController.searchMovies`
5. `TmdbService.searchMovies(query)`
6. Axios chama `TMDB_BASE_URL/search/movie` com `api_key` e `language`
7. responde com payload do TMDB

### Detalhes de filme

1. `GET /movies/:id`
2. `authMiddleware`
3. `validate(movieIdSchema, 'params')`
4. `MovieController.getMovieDetails`
5. `TmdbService.getMovieDetails(movieId)`
6. retorna dados do TMDB

### Créditos de filme

1. `GET /movies/:id/credits`
2. `authMiddleware`
3. `validate(movieIdSchema, 'params')`
4. `MovieController.getMovieCredits`
5. `TmdbService.getMovieCredits(movieId)`
6. retorna dados do TMDB

---

## Guia de patterns e boas práticas

### Separe responsabilidades

- Controllers não devem acessar banco diretamente.
- Services não devem manipular objetos `req`/`res`.
- Repositories devem ser a única camada que fala com Prisma.

### Tratamento de erro

- Controllers devem deixar erros subirem para o middleware global.
- Use `AppError` para erros operacionais conhecidos.
- Use `asyncHandler` nas rotas para encaminhar falhas async ao `errorMiddleware`.
- O `errorMiddleware` centraliza status HTTP, formato da resposta e logging.

### Novas features

- Adicione novos módulos seguindo a mesma hierarquia:
  - `routes/`
  - `controller/`
  - `services/`
  - `repositories/` (quando precisar de banco)
- Reutilize `validate` e `authMiddleware` sempre que possível.
- Crie constantes de erro e mensagens em `src/constants/`.

### Naming e organização

- Não use abreviações inseguras em nomes de arquivos.
- Prefira nomes explícitos: `userController.ts`, `tmdb.service.ts`.
- Para middleware, nomeie com sufixo `.middleware.ts`.
- Para validators, use `*.validator.ts`.

---

## Recomendações para evolução

- Adicionar `src/middlewares/error.middleware.ts` para tratamento global de erros.
- Criar `src/services/user.service.ts` se houver mais lógica de usuário além de `me`.
- Separar cliente TMDB em `src/clients/tmdb.client.ts` se novas integrações surgirem.
- Adicionar testes unitários/mocks para services, controllers e middlewares.
- Implementar logs estruturados e monitoramento de métricas.

---

## Resumo

Este backend segue um padrão clássico de camadas:

- Roteamento → Middleware → Controller → Service → Repository/Client

Manter essa separação e as convenções de naming garante facilidade de manutenção, testes e escalabilidade.
