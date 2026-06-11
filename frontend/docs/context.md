# Frontend Context

## Visao Geral

O frontend da aplicacao `movie_recommendation` e uma SPA construida com React, TypeScript e Vite. Ele autentica usuarios contra o backend e permite buscar filmes, visualizar detalhes e consultar elenco usando endpoints protegidos.

O frontend conversa com a API propria da aplicacao, nao diretamente com o TMDB. O backend continua responsavel por autenticacao, autorizacao, padronizacao de respostas e integracao externa.

## Stack Principal

- `React 19`
- `TypeScript`
- `Vite`
- `React Router DOM`
- `TanStack React Query`
- `Axios`
- `React Hook Form`
- `Zod`
- `Zustand`
- `Tailwind CSS v4`

## Estrutura Atual

O frontend usa arquitetura feature-based incremental. Codigo de dominio fica dentro de `features/`; codigo transversal fica em `shared/`.

```text
src/
  assets/
  features/
    auth/
      constants/
      hooks/
      pages/
      schemas/
      services/
      store/
      types/
    movies/
      hooks/
      pages/
      services/
      types/
      utils/
  routes/
  shared/
    constants/
    providers/
    services/
  App.tsx
  main.tsx
  index.css
```

## Features

### Auth

Arquivos principais:

- [LoginPage.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/features/auth/pages/Login/LoginPage.tsx:1)
- [RegisterPage.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/features/auth/pages/Register/RegisterPage.tsx:1)
- [useLogin.ts](/Users/goat/Projects/movie_recommendation/frontend/src/features/auth/hooks/useLogin.ts:1)
- [useRegister.ts](/Users/goat/Projects/movie_recommendation/frontend/src/features/auth/hooks/useRegister.ts:1)
- [useAuth.ts](/Users/goat/Projects/movie_recommendation/frontend/src/features/auth/hooks/useAuth.ts:1)
- [auth.service.ts](/Users/goat/Projects/movie_recommendation/frontend/src/features/auth/services/auth.service.ts:1)
- [auth.schema.ts](/Users/goat/Projects/movie_recommendation/frontend/src/features/auth/schemas/auth.schema.ts:1)
- [auth.store.ts](/Users/goat/Projects/movie_recommendation/frontend/src/features/auth/store/auth.store.ts:1)

Responsabilidades:

- validar formularios de login e cadastro
- chamar `/auth/login`, `/auth/register`, `/auth/refresh` e `/auth/logout`
- manter access token e usuario apenas em memoria com Zustand
- restaurar sessao via refresh token em cookie HttpOnly
- expor estado de autenticacao para rotas e paginas

### Movies

Arquivos principais:

- [HomePage.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/features/movies/pages/Home/HomePage.tsx:1)
- [useMovieSearch.ts](/Users/goat/Projects/movie_recommendation/frontend/src/features/movies/hooks/useMovieSearch.ts:1)
- [useMovieDetails.ts](/Users/goat/Projects/movie_recommendation/frontend/src/features/movies/hooks/useMovieDetails.ts:1)
- [useMovieCredits.ts](/Users/goat/Projects/movie_recommendation/frontend/src/features/movies/hooks/useMovieCredits.ts:1)
- [movie.service.ts](/Users/goat/Projects/movie_recommendation/frontend/src/features/movies/services/movie.service.ts:1)
- [movie.types.ts](/Users/goat/Projects/movie_recommendation/frontend/src/features/movies/types/movie.types.ts:1)
- [movie-formatters.ts](/Users/goat/Projects/movie_recommendation/frontend/src/features/movies/utils/movie-formatters.ts:1)

Responsabilidades:

- buscar filmes em `/movies/search`
- carregar detalhes em `/movies/:id`
- carregar creditos em `/movies/:id/credits`
- manter tipos e helpers especificos do dominio de filmes

## Shared

Arquivos principais:

- [api.ts](/Users/goat/Projects/movie_recommendation/frontend/src/shared/services/api.ts:1)
- [routes.ts](/Users/goat/Projects/movie_recommendation/frontend/src/shared/constants/routes.ts:1)
- [QueryProvider.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/shared/providers/QueryProvider.tsx:1)

Responsabilidades:

- `api.ts`: configurar Axios, `baseURL`, `withCredentials`, access token em requests e refresh automatico em `401`
- `routes.ts`: centralizar caminhos usados pelo router e links
- `QueryProvider.tsx`: disponibilizar React Query para a aplicacao

## Bootstrap E Roteamento

- [main.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/main.tsx:1) monta o React no DOM.
- [App.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/App.tsx:1) inicializa bootstrap de sessao, aplica `QueryProvider` e renderiza `AppRouter`.
- [AppRouter.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/routes/AppRouter.tsx:1) define `/login`, `/register` e `/`.
- [ProtectedRoute.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/routes/ProtectedRoute.tsx:1) aguarda bootstrap de sessao e redireciona usuarios sem access token para `/login`.

## Contrato Com O Backend

Contratos HTTP de autenticacao:

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `POST /auth/logout`

`login`, `register` e `refresh` retornam `{ accessToken, user }`. O refresh token fica em cookie `HttpOnly`, enviado pelo browser com `withCredentials`, e nao deve ser acessado pelo JavaScript.

Contratos de filmes:

- `GET /movies/search`
- `GET /movies/:id`
- `GET /movies/:id/credits`

## Guia Para Novas Features

Ao criar uma nova feature, prefira:

```text
src/features/nome-da-feature/
  hooks/
  pages/
  services/
  types/
  schemas/
  constants/
  utils/
```

Crie somente as pastas necessarias. Codigo compartilhado por mais de uma feature deve ir para `shared/`; codigo usado por uma unica feature deve permanecer dentro dela.
