### Movie Recommendation System

A Movie Recommendation System is a very engaging full stack development project that utilizes conceptually rich techniques to recommend movies as per the user’s likings. It is a well rounded project as it deals with both front end and back end development which makes it good for capturing and learning advanced features.

In working on this project, you will be using HTML, CSS, JavaScript, and front end frameworks such as React.js or Vue.js for increased website interactivity. For the back end, Node.js works wonderfully with Express.js to process user requests and API interactions. The logic to make accurate recommendations can be done using ML models or even through APIs like TMDB (The Movie Database) where movie data can easily be retrieved. User preferences, watch history, and ratings will be saved using a database like PostgreSQL.

[Source: Sharpener](https://www.sharpener.tech/blog/full-stack-development-project-ideas/)

### Tech Skills:

- Frontend:
  - React
  - TypeScript
  - Vite
  - React Router
  - TanStack Query
  - Zustand
  - TailwindCSS
    cc
- Backend:
  - Node.js
  - Express
  - TypeScript
  - Prisma
  - PostgreSQL
  - JWT Authentication

- Infrastructure
  - Docker
  - Vercel
  - AWS

- External APIs
  - TMDB API

### Features:

- Integration with third-party APIs (e.g., OMDB API)
- Movie search
- User rating system

#

### Backend:

```
backend/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── config/
│   │   └── prisma.ts
│   │
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── middlewares/
│   ├── validators/
│   ├── routes/
│   ├── types/
│   └── utils/
│
├── .env
├── package.json
├── tsconfig.json
└── docker-compose.yml
```

### Running the Project Locally

#### Prerequisites

Make sure the following tools are installed:

- Node.js
- Docker
- PostgreSQL (via Docker)
- Prisma CLI

Verify installations:

```bash
node -v
npm -v
docker -v
```

---

#### 1. Start PostgreSQL

Start the database container:

```bash
docker compose up -d
```

Verify that PostgreSQL is running:

```bash
docker ps
```

Expected output:

```txt
postgres
0.0.0.0:5432->5432/tcp
```

---

#### 2. Configure Environment Variables

Create a `.env` file in the backend root directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/movie_db"
JWT_SECRET="your_secret_key"
PORT=3000
```

Adjust the values according to your local setup.

---

#### 3. Install Dependencies

```bash
npm install
```

---

#### 4. Run Prisma Migrations

Create and apply database tables:

```bash
npx prisma migrate dev
```

Verify migration status:

```bash
npx prisma migrate status
```

---

#### 5. Test Database Connection

Confirm Prisma can connect to PostgreSQL:

```bash
npx prisma db pull
```

If successful, Prisma will introspect the database schema without errors.

---

#### 6. Start the Backend Server

```bash
npm run dev
```

Expected output:

```txt
Server running on port 3000
```

---

#### 7. Inspect the Database

Launch Prisma Studio:

```bash
npx prisma studio
```

Open:

```txt
http://localhost:5555
```

You can view and edit database records directly from the browser.

---

### API Testing

#### Register a User

```bash
curl -X POST http://localhost:3000/auth/register \
-H "Content-Type: application/json" \
-d '{
  "name": "Bruna",
  "email": "bruna@email.com",
  "password": "123456"
}'
```

Expected response:

```json
{
	"id": "...",
	"email": "bruna@email.com"
}
```

---

#### Verify User Creation

Using Prisma Studio or a SQL client:

```sql
SELECT * FROM "User";
```

---

#### Login

```bash
curl -X POST http://localhost:3000/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "bruna@email.com",
  "password": "123456"
}'
```

Expected response:

```json
{
	"token": "eyJ..."
}
```

Copy the JWT token for authenticated requests.

---

#### Access a Protected Route

Example:

```bash
curl http://localhost:3000/users/me \
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:

```json
{
	"id": "...",
	"email": "bruna@email.com"
}
```

---

### Test Unauthorized Access

Request a protected endpoint without a token:

```bash
curl http://localhost:3000/users/me
```

Expected response:

```json
{
	"message": "Unauthorized"
}
```

Expected status code:

```txt
401
```

---

### Development Checklist

Before starting development, verify the following:

```bash
docker ps
```

```bash
npx prisma migrate status
```

```bash
npm run dev
```

```bash
npx prisma studio
```

```bash
curl -X POST http://localhost:3000/auth/login ...
```

If all commands execute successfully, the local environment is ready for development and testing.

#

#

### Frontend:

```
frontend/
└── src/
    ├── components/
    ├── pages/
    │   ├── Login/
    │   ├── Register/
    │   └── Home/
    ├── routes/
    ├── services/
    ├── store/
    ├── hooks/
    ├── types/
    ├── layouts/
    └── App.tsx
```

#

#### Development order:

- ✅ Setup Backend Express + TypeScript
- ✅ PostgreSQL + Prisma
  - Model User
  - Register
  - Login
  - Bcrypt
  - JWT
  - Middleware de autenticação
  - /users/me
  - Error constants
  - Zod Validators
- ✅ Autenticação JWT
- ✅ Integração com TMDB
- Setup Frontend React + Vite
- Login e Cadastro
- Busca de Filmes
- Página de Detalhes
- Sistema de Avaliações
- Favoritos
- Watchlist
- Sistema de Recomendação
- Testes
- Docker
- Deploy Vercel
