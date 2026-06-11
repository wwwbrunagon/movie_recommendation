# Backend Context

## Visão Geral

O backend da aplicação `movie_recommendation` é uma API REST construída com Express.js e TypeScript. Ele atua como camada de orquestração entre o frontend e dois principais recursos:

- Autenticação e gerenciamento de usuários com banco PostgreSQL via Prisma.
- Integração com a API externa do TMDB para busca de filmes, detalhes e créditos.

Essa documentação descreve a arquitetura, o fluxo de dados, as responsabilidades de cada camada e recomendações para estender o backend.

---

## Estrutura de Pastas Principal

- `src/app.ts` - configura o Express, middlewares e as rotas principais.
- `src/server.ts` - inicia o servidor, carrega variáveis de ambiente e define a porta.
- `src/routes/` - define as rotas de autenticação, usuário, filmes e saúde.
- `src/controller/` - implementa a lógica de recebimento de requisições e devassa respostas.
- `src/services/` - contém regras de negócio, chamadas à API externa e integração com repositórios.
- `src/repositories/` - abstrai o acesso ao banco de dados usando Prisma.
- `src/middlewares/` - valida token JWT, valida dados de request, e trata erros globalmente.
- `src/config/` - configuração de cliente Prisma.
- `src/utils/` - utilitários como geração de tokens JWT, tratamento de erros (AppError) e logger.
- `src/validators/` - valida esquemas de request com Zod.
- `src/constants/` - mensagens e códigos de erro reutilizáveis.
- `prisma/schema.prisma` - define o modelo do banco de dados.

---

## Fluxo de Requisição Geral

### 1. Inicialização do servidor

- `src/server.ts` carrega variáveis de ambiente com `dotenv.config()`.
- `src/app.ts` configura `cors`, `express.json()` e monta as rotas.
- O servidor escuta na porta `process.env.PORT || 3000`.

### 2. Recebendo a requisição

- O Express encaminha cada request para as rotas configuradas:
  - `/health`
  - `/auth`
  - `/users`
  - `/movies`

### 3. Validação de entrada

- Para rotas de autenticação e filmes, o middleware `validate` usa Zod para garantir que:
  - `register` recebe `name`, `email`, `password`
  - `login` recebe `email`, `password`
  - `search` recebe `query`
  - `:id` recebe id numérico válido
- Quando ocorre validação inválida, retorna `400` com `AUTH_MESSAGES.INVALID_REQUEST_DATA`.

### 4. Controle e serviço

- Os controllers são responsáveis por:
  - extrair dados do request
  - tratar erros de forma específica
  - chamar os services corretos
  - devolver resposta HTTP adequada

- Os services contêm a lógica de negócio real:
  - `AuthService` trata registro, login, hash de senha, access tokens e refresh sessions.
  - `TmdbService` encapsula chamadas ao TMDB com Axios.

### 5. Persistência e repositório

- `UserRepository` trabalha exclusivamente com o banco via `PrismaClient`.
- O repositório expõe métodos como `findByEmail` e `create`.
- Isso mantém o serviço desacoplado da camada de persistência.

### 6. Autorização

- O middleware `authMiddleware` verifica:
  - cabeçalho `Authorization`
  - esquema `Bearer`
  - token JWT válido
- Ele extrai `userId` do payload e adiciona em `req.user`.
- Rotas de usuário e filmes usam esse middleware para proteger endpoints.

### 7. Tratamento de erros

- Qualquer erro não capturado é automaticamente tratado pelo middleware global `error.middleware.ts`.
- Se um erro é lançado em um service ou controller, o middleware:
  - Detecta o tipo de erro (AppError, ZodError, PrismaError, etc.)
  - Mapeia para o status HTTP apropriado
  - Registra o erro com contexto (endpoint, userId)
  - Retorna resposta JSON padronizada com `success`, `message` e `code`

---

## Endpoints disponíveis

### Autenticação

- `POST /auth/register`
  - Campos: `name`, `email`, `password`
  - Fluxo: validação -> `AuthController.register` -> `AuthService.register` -> `UserRepository.create` -> cria refresh session -> gera access token JWT
  - Respostas:
    - `201` com `{ accessToken, user }` e cookie refresh HttpOnly
    - `409` se usuário já existe
    - `400` se dados inválidos

- `POST /auth/login`
  - Campos: `email`, `password`
  - Fluxo: validação -> `AuthController.login` -> `AuthService.login` -> verifica senha bcrypt -> cria refresh session -> gera access token JWT
  - Respostas:
    - `200` com `{ accessToken, user }` e cookie refresh HttpOnly
    - `401` se credenciais inválidas
    - `400` se dados inválidos

### Usuário

- `GET /users/me`
  - Protegido por `authMiddleware`
  - Fluxo: `UserController.me` -> busca usuário por `userId` no Prisma -> retorna perfil
  - Respostas:
    - `200` com dados do usuário
    - `401` se token ausente/inválido
    - `404` se usuário não for encontrado

### Filmes

- `GET /movies/search`
  - Protegido por `authMiddleware`
  - Param: `query`
  - Validação de query string com Zod
  - Chama `TmdbService.searchMovies`

- `GET /movies/:id`
  - Protegido por `authMiddleware`
  - Param: `id`
  - Retorna detalhes do filme via `TmdbService.getMovieDetails`

- `GET /movies/:id/credits`
  - Protegido por `authMiddleware`
  - Param: `id`
  - Retorna créditos do filme via `TmdbService.getMovieCredits`

---

## Modelo de dados

Arquivo: `prisma/schema.prisma`

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Observações:

- O modelo atual é simples e pensado para cadastro padrão de usuário.
- A senha é armazenada em hash bcrypt.
- A aplicação usa PostgreSQL via `DATABASE_URL`.

---

## Camada de autenticação

### Access token e refresh token

- A utilidade `generateAccessToken` em `src/utils/jwt.ts` assina um access token curto com `userId`.
- O refresh token e opaco, armazenado no browser como cookie `HttpOnly` e persistido no banco apenas como hash em `RefreshSession`.
- `POST /auth/refresh` rotaciona a sessao de refresh e retorna novo `{ accessToken, user }`.
- `POST /auth/logout` revoga a sessao atual e limpa o cookie.
- O `JWT_SECRET` deve estar presente nas variáveis de ambiente.
- O middleware valida o token e adiciona o identificador do usuário na requisição.

### Senha

- O `AuthService` utiliza `bcrypt.hash(password, 10)` ao registrar.
- Ao logar, `bcrypt.compare(password, user.password)` é usado para validação.

---

## Validação de dados

- Utiliza `zod` para garantir padronização de entradas.
- A validação fica centralizada em `src/validators/*.ts`.
- O middleware `validate` recebe um schema e a fonte (`body`, `params`, `query`) para analisar o request.
- Erros retornam `400` e `errors` detalhados quando necessário.

---

## Erros e mensagens

- Os códigos de erro são definidos em `src/constants/*.ts`.
- As mensagens de frontend são tratadas em `AUTH_MESSAGES` e usadas em respostas de erro.
- Isso facilita tradução e manutenção futura.

---

## Tratamento global de erros

### Middleware de erro centralizado

O backend implementa um middleware global de tratamento de erros em `src/middlewares/error.middleware.ts` que padroniza todas as respostas de erro.

#### Características principais

- **Classe AppError**: customização de erro em `src/utils/app-error.ts`
  - Estende `Error` com propriedades `statusCode`, `errorCode`, `isOperational`
  - Métodos estáticos: `badRequest()`, `unauthorized()`, `notFound()`, `conflict()`, `internalServerError()`, etc.
  - Garante consistência na estrutura de erros em toda a aplicação

- **Logger próprio**: `src/utils/logger.ts`
  - Função `logError(error, context)` que loga erros com contexto (endpoint, userId)
  - Diferencia tipos de erro (AppError, SyntaxError, TypeError, desconhecidos)
  - Sanitiza dados sensíveis (passwords, tokens) antes de logar

- **Middleware error.middleware.ts**
  - Registrado como **último middleware** em `src/app.ts` (após todas as rotas)
  - Captura e trata todos os tipos de erro:
    - `AppError`: usa statusCode e errorCode definidos
    - `ZodError`: retorna `400 VALIDATION_ERROR` com detalhes dos campos
    - `PrismaError`: mapeia códigos específicos para status HTTP apropriados
      - P2025 → `404 NOT_FOUND` (record não encontrado)
      - P2002 → `409 CONFLICT` (violação de unique constraint)
      - P2014 → `400 BAD_REQUEST` (violação de relação obrigatória)
      - P2003 → `400 BAD_REQUEST` (foreign key constraint falhou)
    - Erros desconhecidos → `500 INTERNAL_SERVER_ERROR`

#### Formato de resposta padrão

Todas as respostas de erro seguem o formato:

```json
{
	"success": false,
	"message": "Descrição do erro",
	"code": "ERROR_CODE",
	"errors": { "field": ["Mensagem de erro"] }
}
```

Exemplo de erro de validação:

```json
{
	"success": false,
	"message": "Validation error",
	"code": "VALIDATION_ERROR",
	"errors": {
		"email": ["Invalid email format"],
		"password": ["String must contain at least 8 character(s)"]
	}
}
```

#### Tratamento de erros não capturados

O arquivo `src/server.ts` implementa listeners para erros não esperados:

- `uncaughtException`: erros síncronos não capturados em try-catch
- `unhandledRejection`: promises rejeitadas sem `.catch()` ou try-catch
- Ambos triggam logging automático e finalizam o processo gracefully

#### Fluxo de tratamento de erro

```text
[Request] -> [Route/Middleware] -> [Erro thrown]
                                      |
                                      v
                        [error.middleware.ts]
                                      |
                    ___________________+___________________
                   |                   |                   |
              [AppError?]      [ZodError?]         [PrismaError?]
                   |                   |                   |
            [usar statusCode]  [map para 400]     [mapear código]
                   |                   |                   |
                   |___________________|___________________|
                                       |
                                       v
                         [logError com contexto]
                                       |
                                       v
                      [Response JSON com formato padrão]
```

---

## Variáveis de ambiente necessárias

O backend depende de variáveis de ambiente para configuração segura:

- `PORT` - porta em que o servidor irá rodar (padrão `3000`).
- `DATABASE_URL` - string de conexão do PostgreSQL.
- `JWT_SECRET` - segredo para assinar/verificar JWT.
- `TMDB_BASE_URL` - URL base da API do TMDB.
- `TMDB_API_KEY` - chave de API do TMDB.

---

## Extensibilidade e futuras features

### Adicionar novos recursos de filme

- Criar rota em `src/routes/movie.routes.ts`.
- Implementar método no `MovieController`.
- Adicionar função correspondente em `src/services/tmdb.service.ts`.
- Se houver persistência, criar repositório dedicado e modelo Prisma.
- Reutilizar o middleware `authMiddleware` quando o endpoint exigir autenticação.

### Adicionar novos recursos de usuário

- Criar controladores e rotas adicionais em `src/controller` e `src/routes`.
- Evitar lógica de banco nos controllers; mantenha-a em services/repositories.
- Usar `req.user?.userId` sempre que precisar identificar o usuário autenticado.

### Melhorias de arquitetura

- Implementar `Controller -> Service -> Repository` como padrão em novos módulos.
- Manter mensagens de erro e constantes centralizadas em `src/constants`.
- Adicionar testes unitários para services e middlewares.
- Manter o tratamento global de erros para evitar repetição de try/catch em controllers.
- Separar integrações com APIs externas em clients dedicados, se o backend crescer.

---

## Guia de desenvolvimento

1. Rodar migrations do Prisma sempre que o modelo mudar:
   - `npx prisma migrate dev`
2. Gerar cliente Prisma após mudanças no schema:
   - `npx prisma generate`
3. Iniciar servidor em desenvolvimento:
   - `npm run dev`
4. Validar novos endpoints com requests direcionados ou testes automatizados.

---

## Padrões técnicos adotados

- `Express.js` para roteamento HTTP.
- `TypeScript` para tipagem estática.
- `Zod` para validação de schema.
- `Prisma` para ORM e acesso ao PostgreSQL.
- `bcrypt` para hashing seguro de senha.
- `jsonwebtoken` para autenticação JWT.
- `Axios` para consumo de API externa TMDB.

---

## Observações finais

O backend atual é um bom ponto de partida para uma aplicação de recomendação de filmes, com foco em autenticação segura e integração externa. A separação entre rotas, controllers, services e repositório torna o código legível e fácil de estender. Para novas features, siga o fluxo estabelecido e mantenha a responsabilidade de cada camada bem delimitada.
