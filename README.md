# Technical challenge for Blossom – Fullstack Developer role

This document focuses only on how to run the application, with Docker as the recommended option for evaluation.

## Additional documentation

- Architecture and data flow: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Docker details and service orchestration: [docs/DOCKER.md](docs/DOCKER.md)
- GraphQL queries and mutations reference: [docs/GRAPHQL_API.md](docs/GRAPHQL_API.md)
- Relational model and persistence design: [docs/ERD.md](docs/ERD.md)

---

## 1. Requirements

### To run with Docker
- Docker Desktop

### To run manually
- Node.js 20 or higher
- npm
- PostgreSQL
- Redis optional

---

## 2. Recommended: run the application with Docker

This is the fastest way to evaluate the full project.

From the project root, run:

```bash
docker compose up --build -d
```

To stop the environment:

```bash
docker compose down
```

### Docker URLs

- Frontend: http://localhost:8080
- GraphQL API: http://localhost:4001/graphql
- Swagger: http://localhost:4001/swagger
- Health: http://localhost:4001/health
- PostgreSQL: localhost:5433
- Redis: localhost:6380

### Docker database credentials

- Database: rickandmorty
- User: postgres
- Password: postgres

---

## 3. Run the application manually

### Step 1. Install dependencies

Backend:

```bash
cd BACKEND
npm install
```

Frontend:

```bash
cd FRONTEND
npm install
```

### Step 2. Create the database

Create a PostgreSQL database named:

```text
rickandmorty
```

### Step 3. Configure the backend

Copy the environment file:

```bash
cd BACKEND
copy .env.example .env
```

Expected default values:

```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rickandmorty
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false
REDIS_URL=redis://127.0.0.1:6379
```

### Step 4. Start the backend

```bash
cd BACKEND
npm run db:migrate
npm run dev
```

The backend will be available at:

- http://localhost:4000/graphql
- http://localhost:4000/swagger
- http://localhost:4000/health

### Step 5. Start the frontend

```bash
cd FRONTEND
npm run dev
```

The frontend will be available at:

- http://localhost:5173

---

For API examples, architecture details, and the database model, use the linked documents above.
