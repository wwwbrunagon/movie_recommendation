# Frontend Architecture

## Objetivo

Este documento descreve a arquitetura feature-based do frontend, os fluxos principais e as convencoes para evoluir a aplicacao sem voltar para pastas globais por camada.

## Visao Arquitetural

O frontend separa codigo em dois grupos:

- `features/`: dominios de produto, como `auth` e `movies`
- `shared/`: infraestrutura e contratos transversais usados por mais de uma feature

Cada feature pode conter suas proprias paginas, hooks, services, schemas, types, constantes, store e helpers. Isso reduz acoplamento entre dominios e facilita encontrar tudo que pertence a um fluxo.

## Estrutura

```text
src/
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
```

## Diagrama De Camadas

```mermaid
flowchart TD
    UI[Feature Pages]
    Hooks[Feature Hooks]
    Store[Feature Store]
    Services[Feature Services]
    API[Shared Axios API]
    Backend[Backend API]
    Schemas[Feature Schemas]
    Types[Feature Types]
    Shared[Shared Constants/Providers]

    UI --> Hooks
    UI --> Schemas
    UI --> Types
    UI --> Shared
    Hooks --> Services
    Hooks --> Store
    Hooks --> Types
    Services --> API
    API --> Backend
    Store --> API
```

Regras praticas:

- paginas nao chamam o backend diretamente
- hooks conectam UI, React Query, services e store
- services usam somente o client HTTP compartilhado
- tipos e schemas ficam na feature quando pertencem a um dominio especifico
- `shared/` deve ser pequeno e realmente transversal

## Fluxos Principais

### Bootstrap

```mermaid
flowchart LR
    Main[main.tsx] --> App[App.tsx]
    App --> QueryProvider[shared/providers/QueryProvider]
    QueryProvider --> Router[routes/AppRouter]
    Router --> FeaturePages[features/*/pages]
```

### Autenticacao

```mermaid
sequenceDiagram
    participant U as Usuario
    participant P as Auth Page
    participant H as Auth Hook
    participant S as Auth Service
    participant A as Shared API
    participant B as Backend
    participant Z as Auth Store
    participant R as Router

    U->>P: Preenche formulario
    P->>P: Valida com Zod + React Hook Form
    P->>H: mutateAsync(payload)
    H->>S: login/register
    S->>A: POST /auth/login ou /auth/register
    A->>B: Request HTTP
    B-->>A: token + user
    A-->>S: response.data
    S-->>H: AuthResponse
    H-->>P: sucesso
    P->>Z: login(token, user)
    P->>R: navigate("/")
```

### Filmes

```mermaid
sequenceDiagram
    participant U as Usuario
    participant P as HomePage
    participant H as Movie Hooks
    participant S as Movie Service
    participant A as Shared API
    participant B as Backend

    U->>P: Busca filme
    P->>H: useMovieSearch(query)
    H->>S: searchMovies(query)
    S->>A: GET /movies/search
    A->>B: Request autenticada
    B-->>A: resultados
    A-->>S: response.data
    S-->>H: MovieSearchResponse
    H-->>P: resultados

    U->>P: Seleciona filme
    P->>H: useMovieDetails/useMovieCredits
    H->>S: getMovieDetails/getMovieCredits
    S->>A: GET /movies/:id e /movies/:id/credits
    A->>B: Requests autenticadas
    B-->>A: detalhes e creditos
    A-->>S: response.data
    S-->>H: dados do filme
    H-->>P: detalhes e elenco
```

## Convencoes

- Use `PascalCase` para componentes e paginas.
- Use `camelCase` para funcoes, hooks e variaveis.
- Hooks devem comecar com `use`.
- Services devem expor funcoes orientadas a caso de uso, como `login`, `register`, `searchMovies`.
- Arquivos compartilhados so devem entrar em `shared/` quando mais de uma feature precisar deles.
- Nao crie aliases de import sem uma decisao explicita de projeto; mantenha imports relativos por enquanto.

## Evolucao

Para adicionar uma feature, crie `src/features/<feature-name>/` e inclua apenas as pastas necessarias. Se uma nova feature precisar de endpoints no backend, primeiro preserve os contratos REST existentes e documente qualquer mudanca de payload ou rota antes de atualizar os consumers do frontend.
