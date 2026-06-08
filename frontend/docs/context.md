# Frontend Context

## Visão Geral

O frontend da aplicação `movie_recommendation` é uma SPA construída com React, TypeScript e Vite. Ele tem duas responsabilidades centrais no estado atual do projeto:

- autenticar o usuário contra o backend
- permitir busca de filmes, visualização de detalhes e consulta de elenco usando endpoints protegidos

O frontend conversa com uma API própria, não diretamente com o TMDB. Isso significa que toda autenticação, autorização, padronização de mensagens e proteção de rotas depende do backend da aplicação.

Esta documentação serve como:

- mapa de arquitetura do frontend
- guia de onboarding para novas pessoas no projeto
- referência de fluxo de dados e responsabilidades
- base para implementação de futuras features sem quebrar padrões já adotados

---

## Stack e bibliotecas principais

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

### Responsabilidade de cada biblioteca

- `React`: composição da UI por componentes e gerenciamento de estado local
- `TypeScript`: tipagem estática dos contratos, props, services e hooks
- `Vite`: bundling, dev server e leitura de variáveis `import.meta.env`
- `React Router DOM`: definição de rotas públicas e protegidas
- `React Query`: cache, loading, retry implícito, tracking de requisições e sincronização com a API
- `Axios`: client HTTP centralizado com interceptors
- `React Hook Form`: gerenciamento eficiente de formulários
- `Zod`: validação declarativa dos schemas de formulário
- `Zustand`: estado global de autenticação com persistência
- `Tailwind`: styling utilitário

---

## Estrutura de pastas

### Estrutura principal de `frontend/src`

- `App.tsx`
  - entrypoint da árvore React da aplicação
- `main.tsx`
  - bootstrap do React no DOM
- `index.css`
  - importa o Tailwind
- `assets/`
  - arquivos estáticos visuais
- `constants/`
  - rotas e mensagens reutilizáveis
- `hooks/`
  - hooks de domínio e integração com React Query/Zustand
- `pages/`
  - páginas de rota
- `providers/`
  - providers globais da aplicação
- `routes/`
  - definição do roteamento e proteção de acesso
- `schemas/`
  - schemas Zod dos formulários
- `services/`
  - camada de comunicação HTTP com o backend
- `store/`
  - estado global de autenticação
- `types/`
  - contratos TypeScript da aplicação

### Filosofia da estrutura atual

A organização é orientada por responsabilidade:

- `pages` cuidam do fluxo visual
- `hooks` encapsulam comportamento reutilizável
- `services` sabem chamar a API
- `types` descrevem contratos
- `store` cuida do estado global persistente
- `schemas` validam entrada local antes do submit

Essa separação funciona bem para o porte atual do projeto. Se o app crescer, uma evolução natural seria introduzir organização por feature, por exemplo:

- `features/auth/...`
- `features/movies/...`

Hoje ainda não é obrigatório, porque a base é pequena e legível.

---

## Inicialização da aplicação

### `main.tsx`

Arquivo: [main.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/main.tsx:1)

Responsabilidade:

- importar CSS global
- criar a root React
- renderizar o componente `App`

### `App.tsx`

Arquivo: [App.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/App.tsx:1)

Responsabilidade:

- envolver a aplicação com `QueryProvider`
- delegar o roteamento para `AppRouter`

Fluxo:

1. `main.tsx` monta `App`
2. `App` monta `QueryProvider`
3. `QueryProvider` injeta o `QueryClient`
4. `AppRouter` define as páginas e regras de navegação

---

## Provider global

### `QueryProvider`

Arquivo: [QueryProvider.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/providers/QueryProvider.tsx:1)

Responsabilidade:

- criar uma instância única de `QueryClient`
- disponibilizar React Query para toda a árvore

Decisão atual:

- o `QueryClient` está com configuração padrão

Consequências:

- simples para manter
- suficiente para o estágio atual
- não há customização explícita de `staleTime`, `gcTime`, `retry` ou `refetchOnWindowFocus`

Possíveis evoluções:

- definir defaults de cache por domínio
- desabilitar retry em casos específicos
- padronizar tratamento de erro global com `QueryCache` e `MutationCache`

---

## Configuração de ambiente

### Variáveis utilizadas

Arquivo: [frontend/.env](/Users/goat/Projects/movie_recommendation/frontend/.env:1)

Atualmente o frontend depende de:

- `VITE_API_URL`

Exemplo:

```env
VITE_API_URL=http://localhost:3000
```

### Como funciona

O Axios usa:

```ts
baseURL: import.meta.env.VITE_API_URL
```

Isso significa que:

- o frontend nunca deve hardcodar URL de backend dentro de componentes
- cada ambiente pode apontar para uma API diferente
- variáveis precisam começar com `VITE_` para ficarem disponíveis no browser via Vite

### Implicações importantes

- a variável é resolvida no build
- se a API mudar, o frontend precisa ser rebuildado com o novo valor
- se o backend estiver em outro domínio, o backend precisa liberar `CORS`

---

## Roteamento

### Arquivo principal

Arquivo: [AppRouter.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/routes/AppRouter.tsx:1)

Rotas existentes:

- `/login` -> `LoginPage`
- `/register` -> `RegisterPage`
- `/` -> `HomePage` protegida por `ProtectedRoute`

### `ROUTES`

Arquivo: [routes.ts](/Users/goat/Projects/movie_recommendation/frontend/src/constants/routes.ts:1)

Constantes:

- `HOME`
- `LOGIN`
- `REGISTER`

Benefícios:

- evita strings repetidas
- reduz erro de digitação em navegação e proteção de rotas

### `ProtectedRoute`

Arquivo: [ProtectedRoute.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/routes/ProtectedRoute.tsx:1)

Responsabilidade:

- bloquear acesso a rotas privadas se não houver token no store
- redirecionar para login com `replace`

Funcionamento:

1. lê `token` via `useAuth()`
2. se não existir token, navega para `ROUTES.LOGIN`
3. se existir token, renderiza `<Outlet />`

Observação importante:

- a proteção atual é baseada apenas na presença do token local
- não há validação prévia de expiração do token no frontend
- a invalidação real ocorre quando a API responde `401`

---

## Estado global de autenticação

### `useAuthStore`

Arquivo: [auth.store.ts](/Users/goat/Projects/movie_recommendation/frontend/src/store/auth.store.ts:1)

Tecnologia:

- `Zustand`
- middleware `persist`

Estado persistido:

- `token: string | null`
- `user: User | null`

Ações:

- `login(token, user)`
- `logout()`

Persistência:

- chave `auth-storage`
- persiste automaticamente em `localStorage`

### `auth.helpers.ts`

Arquivo: [auth.helpers.ts](/Users/goat/Projects/movie_recommendation/frontend/src/store/auth.helpers.ts:1)

Responsabilidade:

- expor acesso ao token fora de componentes React
- expor `logout()` fora de componentes React

Isso é necessário para os interceptors do Axios, que não podem usar hooks React diretamente.

### `useAuth`

Arquivo: [useAuth.ts](/Users/goat/Projects/movie_recommendation/frontend/src/hooks/useAuth.ts:1)

Responsabilidade:

- facilitar consumo do store dentro da UI
- fornecer `isAuthenticated`

Estado retornado:

- todos os campos do store
- `isAuthenticated`, derivado de `!!store.token`

---

## Camada HTTP

### `api.ts`

Arquivo: [api.ts](/Users/goat/Projects/movie_recommendation/frontend/src/services/api.ts:1)

Esse é o client HTTP central da aplicação.

Responsabilidades:

- criar a instância do Axios com `baseURL`
- injetar o token JWT em toda request autenticada
- reagir a `401` limpando a sessão local

### Request interceptor

Antes de cada request:

1. chama `getAccessToken()`
2. se existir token, adiciona:

```ts
Authorization: Bearer <token>
```

### Response interceptor

Quando a API retorna `401`:

1. chama `logout()`
2. limpa token e usuário do store persistido

Isso faz com que o usuário perca a sessão local e, ao navegar ou renderizar rota protegida, volte ao login.

### Observação arquitetural

Esse ponto é importante: autenticação de rotas privadas depende de duas camadas trabalhando juntas:

- `ProtectedRoute` protege por presença de token local
- Axios invalida sessão local quando backend responde `401`

---

## Camada de serviços

### `auth.service.ts`

Arquivo: [auth.service.ts](/Users/goat/Projects/movie_recommendation/frontend/src/services/auth.service.ts:1)

Responsabilidade:

- chamar `/auth/login`
- chamar `/auth/register`

Essa camada não faz transformação complexa. Ela apenas encapsula a request e devolve `response.data`.

### `movie.service.ts`

Arquivo: [movie.service.ts](/Users/goat/Projects/movie_recommendation/frontend/src/services/movie.service.ts:1)

Responsabilidade:

- chamar `/movies/search`
- chamar `/movies/:id`
- chamar `/movies/:id/credits`

Observações:

- todos esses endpoints dependem do token no header
- o service também é fino, deixando tratamento visual para hooks e páginas

---

## Hooks de integração

### Hooks de autenticação

#### `useLogin`

Arquivo: [useLogin.ts](/Users/goat/Projects/movie_recommendation/frontend/src/hooks/useLogin.ts:1)

Usa `useMutation` para login.

Responsabilidade:

- expor `mutateAsync`
- expor estados como `isPending`

#### `useRegister`

Arquivo: [useRegister.ts](/Users/goat/Projects/movie_recommendation/frontend/src/hooks/useRegister.ts:1)

Usa `useMutation` para cadastro.

Responsabilidade:

- encapsular a mutation de criação de conta

### Hooks de filmes

#### `useMovieSearch`

Arquivo: [useMovieSearch.ts](/Users/goat/Projects/movie_recommendation/frontend/src/hooks/useMovieSearch.ts:1)

Usa `useQuery`.

Comportamento:

- query key: `['movies', 'search', query]`
- só roda quando `query.trim().length > 0`

#### `useMovieDetails`

Arquivo: [useMovieDetails.ts](/Users/goat/Projects/movie_recommendation/frontend/src/hooks/useMovieDetails.ts:1)

Usa `useQuery`.

Comportamento:

- query key: `['movies', 'details', movieId]`
- só roda quando `movieId !== null`

#### `useMovieCredits`

Arquivo: [useMovieCredits.ts](/Users/goat/Projects/movie_recommendation/frontend/src/hooks/useMovieCredits.ts:1)

Usa `useQuery`.

Comportamento:

- query key: `['movies', 'credits', movieId]`
- só roda quando `movieId !== null`

### Padrão de design adotado

Hoje os hooks:

- chamam diretamente os services
- retornam o objeto padrão do React Query
- não fazem transformação pesada de resposta

Isso é bom para simplicidade, mas conforme o app crescer pode valer a pena:

- normalizar dados no hook
- centralizar query keys em um arquivo dedicado
- encapsular mensagens de erro por domínio

---

## Schemas e validação de formulários

### `auth.schema.ts`

Arquivo: [auth.schema.ts](/Users/goat/Projects/movie_recommendation/frontend/src/schemas/auth.schema.ts:1)

Schemas atuais:

- `loginSchema`
- `registerSchema`

Validações atuais:

- email válido
- senha mínima de 6 caracteres
- nome mínimo de 3 caracteres
- confirmação de senha igual à senha

Tipos derivados:

- `LoginFormData`
- `RegisterFormData`

### Papel do schema no fluxo

Os schemas são usados com:

- `react-hook-form`
- `zodResolver`

Benefícios:

- validação antes do request
- mensagens consistentes por campo
- tipos inferidos automaticamente

### Observação importante

Atualmente as mensagens do schema estão em inglês em alguns pontos, enquanto a UI e o backend já usam textos em português. Isso é um ponto conhecido para padronização futura.

---

## Tipos compartilhados

### Tipos de autenticação

Arquivo: [auth.types.ts](/Users/goat/Projects/movie_recommendation/frontend/src/types/auth.types.ts:1)

Tipos:

- `LoginRequest`
- `RegisterRequest`
- `AuthResponse`

### Tipos de usuário

Arquivo: [user.types.ts](/Users/goat/Projects/movie_recommendation/frontend/src/types/user.types.ts:1)

Tipo:

- `User`

### Tipos de filmes

Arquivo: [movie.types.ts](/Users/goat/Projects/movie_recommendation/frontend/src/types/movie.types.ts:1)

Tipos:

- `MovieSearchItem`
- `MovieSearchResponse`
- `MovieGenre`
- `MovieDetails`
- `MovieCastMember`
- `MovieCreditsResponse`

Esses tipos modelam o contrato esperado do backend e, indiretamente, o subset de retorno do TMDB repassado pela API.

---

## Fluxo de autenticação

### 1. Login

Página: [LoginPage.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/pages/Login/LoginPage.tsx:1)

Fluxo:

1. usuário preenche email e senha
2. `react-hook-form` valida com `loginSchema`
3. `onSubmit` normaliza o email com `trim().toLowerCase()`
4. chama `mutateAsync` de `useLogin`
5. em sucesso:
   - salva `token` e `user` no Zustand
   - navega para `ROUTES.HOME`
6. em erro:
   - tenta usar `error.response.data.message` do backend
   - cai em fallback local se necessário
   - grava mensagem em `errors.root`

Boas práticas já aplicadas:

- `noValidate` no `<form>`
- `aria-invalid`
- `aria-describedby`
- `role="alert"`
- prevenção de submit duplicado via `isPending`
- limpeza do erro global ao editar campos

### 2. Cadastro

Página: [RegisterPage.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/pages/Register/RegisterPage.tsx:1)

Fluxo:

1. usuário preenche nome, email, senha e confirmação
2. validação local é feita com `registerSchema`
3. `onSubmit` normaliza `name` e `email`
4. chama `mutateAsync` de `useRegister`
5. em sucesso:
   - salva `token` e `user`
   - navega direto para `HOME`
6. em erro:
   - prioriza `error.response.data.message`
   - usa fallback local por status quando necessário

### 3. Persistência de sessão

Após login ou cadastro:

- token e usuário ficam salvos em `auth-storage`
- refresh de página não remove a sessão

### 4. Expiração ou invalidação

Se o backend responder `401`:

- Axios executa `logout()`
- estado auth é limpo
- rotas protegidas passam a redirecionar para login

---

## Fluxo da Home e dos filmes

Página: [HomePage.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/pages/Home/HomePage.tsx:1)

### Objetivo da tela

A Home hoje é a principal área autenticada da aplicação e reúne:

- identificação do usuário logado
- ação de logout
- formulário de busca de filmes
- listagem de resultados
- painel lateral com detalhes e elenco

### Estado local da tela

Estados usados:

- `searchInput`
  - controla o valor digitado no input
- `searchQuery`
  - representa a busca efetivamente submetida
- `selectedMovieId`
  - guarda o filme atualmente selecionado

### Fluxo de busca

1. usuário digita no input
2. `searchInput` é atualizado
3. no submit:
   - valor é normalizado com `trim()`
   - `searchQuery` recebe esse valor
   - `selectedMovieId` volta para `null`
4. `useMovieSearch(searchQuery)` dispara a query
5. resultados são renderizados em lista

### Fluxo de seleção de filme

1. usuário clica em um item da lista
2. `selectedMovieId` é atualizado
3. `useMovieDetails(selectedMovieId)` busca detalhes
4. `useMovieCredits(selectedMovieId)` busca créditos
5. o painel lateral mostra pôster, metadados, gêneros, sinopse e elenco

### Decisões importantes da Home

- a busca só roda após submit, não a cada tecla
- detalhes e créditos são queries separadas
- a tela usa dados derivados simples com `useMemo` apenas para `castPreview`
- há fallback para pôster ausente usando `placehold.co`

### Estados de UI tratados

- busca ainda não iniciada
- loading de busca
- erro na busca
- zero resultados
- filme não selecionado
- loading de detalhes
- erro de detalhes/créditos
- ausência de elenco

### Limitações atuais

- não há debounce
- não há paginação
- não há favoritos
- não há cache configurado manualmente
- não há skeletons
- a tela depende de URLs externas de imagem diretamente
- detalhes e créditos não são combinados em um hook de view-model

---

## Mensagens e tratamento de erro

### `AUTH_MESSAGES`

Arquivo: [authMessages.ts](/Users/goat/Projects/movie_recommendation/frontend/src/constants/authMessages.ts:1)

Responsabilidade:

- concentrar mensagens de erro de autenticação
- reduzir duplicação entre login e cadastro

Mensagens atuais:

- credenciais inválidas
- usuário já existente
- dados inválidos
- indisponibilidade de login
- indisponibilidade de cadastro

### Estratégia atual de erro

Nos fluxos de auth:

1. tentar usar `response.data.message` enviada pelo backend
2. se não houver mensagem útil, cair em fallback local

Nos fluxos de filmes:

- a Home usa mensagens visuais simples e genéricas
- ainda não existe constante dedicada para erros de filmes

### Recomendação futura

Se o domínio de filmes crescer, vale criar:

- `frontend/src/constants/movieMessages.ts`

Para manter paridade com a forma como auth já está estruturado.

---

## Styling e UI

### Base visual

- Tailwind via `@import 'tailwindcss';`
- layout simples baseado em `border`, `rounded`, `spacing` e `bg-white`

### Características do design atual

- visual minimalista
- sem design system formal
- sem biblioteca de componentes
- formulários e cards construídos inline nas páginas

### Impacto disso

Pontos positivos:

- velocidade de desenvolvimento
- baixa complexidade de abstração

Pontos de atenção:

- repetição de estilos entre formulários
- ausência de componentes comuns como `Button`, `Input`, `FormField`, `EmptyState`, `ErrorState`
- maior risco de inconsistência visual conforme o app crescer

### Evolução recomendada

Se novas features entrarem em sequência, uma próxima etapa saudável é extrair:

- `components/ui/Button.tsx`
- `components/ui/Input.tsx`
- `components/feedback/ErrorMessage.tsx`
- `components/layout/AuthCard.tsx`

---

## Convenções e padrões observados

### Padrões já usados

- componentes de página exportados como função nomeada
- services finos e diretos
- hooks de query por caso de uso
- schemas e types separados
- rotas centralizadas em constantes
- store de auth desacoplado de components

### Convenções implícitas importantes

- o backend é a fonte da verdade para mensagens de erro sempre que possível
- o token nunca é passado manualmente nos componentes
- acesso a endpoints protegidos sempre deve usar `api.ts`
- páginas devem usar hooks e services, não `axios` cru

---

## Como adicionar novas features sem quebrar o padrão

### Exemplo: nova feature de favoritos

Passo recomendado:

1. criar tipos em `src/types/favorite.types.ts`
2. criar service em `src/services/favorite.service.ts`
3. criar hooks como:
   - `useFavorites`
   - `useAddFavorite`
   - `useRemoveFavorite`
4. criar página ou seção visual em `pages/Home` ou componentes dedicados
5. se houver formulário, criar schema em `src/schemas`
6. se houver mensagens padronizadas, criar constantes em `src/constants`

### Exemplo: página de perfil

Passo recomendado:

1. adicionar rota em `AppRouter`
2. proteger com `ProtectedRoute` se necessário
3. usar `useAuth()` para dados básicos
4. se dados precisarem ser atualizados no backend, criar service + hook + types

### Exemplo: melhoria da busca de filmes

Evoluções naturais:

- debounce no campo de busca
- paginação usando `page` do backend
- persistência de última busca
- caching por termo pesquisado com tuning de `staleTime`
- componente de card de filme reutilizável

---

## Débitos técnicos e oportunidades de melhoria

### 1. Mensagens de validação do schema

Atualmente parte do schema ainda está em inglês.

Impacto:

- experiência inconsistente
- documentação e UX ficam parcialmente desalinhadas

### 2. Ausência de componentes reutilizáveis

Hoje login e cadastro repetem bastante estrutura.

Impacto:

- manutenção mais cara se o design mudar

### 3. Query keys não centralizadas

Hoje as keys estão inline nos hooks.

Impacto:

- ok para projeto pequeno
- menos robusto se múltiplas features precisarem invalidar cache

### 4. Tratamento de erro de filmes ainda genérico

Hoje os erros da Home são mensagens locais simples.

Impacto:

- boa simplicidade agora
- pouca granularidade para debugging e UX futura

### 5. HomePage está concentrando bastante responsabilidade

A Home já contém:

- header autenticado
- formulário de busca
- listagem
- painel de detalhes
- renderização de elenco

Impacto:

- ainda administrável
- candidata natural a extração de subcomponentes quando crescer

### 6. Ausência de testes

Atualmente não há cobertura automatizada visível no frontend.

Recomendações:

- testes de formulário de login/cadastro
- testes de navegação protegida
- testes de renderização da Home para estados principais

---

## Guia prático de leitura do frontend

Para entender rapidamente a aplicação, a sequência mais útil é:

1. [App.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/App.tsx:1)
2. [AppRouter.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/routes/AppRouter.tsx:1)
3. [auth.store.ts](/Users/goat/Projects/movie_recommendation/frontend/src/store/auth.store.ts:1)
4. [api.ts](/Users/goat/Projects/movie_recommendation/frontend/src/services/api.ts:1)
5. [LoginPage.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/pages/Login/LoginPage.tsx:1)
6. [RegisterPage.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/pages/Register/RegisterPage.tsx:1)
7. [HomePage.tsx](/Users/goat/Projects/movie_recommendation/frontend/src/pages/Home/HomePage.tsx:1)
8. `services`, `hooks` e `types` relacionados

Essa ordem ajuda a enxergar:

- inicialização
- navegação
- sessão do usuário
- comunicação com API
- experiência pública
- experiência autenticada

---

## Fluxo resumido de ponta a ponta

### Login

1. usuário acessa `/login`
2. preenche formulário
3. frontend valida com Zod
4. frontend envia `POST /auth/login`
5. backend responde com `token` e `user`
6. frontend persiste sessão com Zustand
7. frontend navega para `/`
8. `ProtectedRoute` permite acesso

### Cadastro

1. usuário acessa `/register`
2. preenche formulário
3. frontend valida com Zod
4. frontend envia `POST /auth/register`
5. backend cria usuário e devolve `token` e `user`
6. frontend persiste sessão
7. frontend navega para `/`

### Busca de filmes

1. usuário autenticado acessa `/`
2. digita termo e envia formulário
3. frontend chama `GET /movies/search?query=...`
4. usuário seleciona um filme
5. frontend chama:
   - `GET /movies/:id`
   - `GET /movies/:id/credits`
6. UI renderiza detalhes e elenco

---

## Observações finais

O frontend atual tem uma base limpa e funcional para um projeto pequeno a médio em fase inicial. A arquitetura já separa bem:

- UI
- estado global
- integração HTTP
- hooks de domínio
- tipos
- validação

Isso torna a aplicação um bom ponto de partida para evoluções como favoritos, perfil de usuário, recomendações, paginação, filtros e refino de UX.

Para futuras features, a orientação mais segura é:

- manter chamadas HTTP dentro de `services`
- manter React Query como camada principal de dados remotos
- manter autenticação centralizada no store + interceptors
- evitar lógica de negócio pesada dentro das páginas
- extrair componentes quando a repetição aparecer de forma clara
