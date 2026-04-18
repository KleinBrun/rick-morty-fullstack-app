# Docker guide

## Related documentation

- Main overview and setup: [../README.md](../README.md)
- Architecture and system flow: [ARCHITECTURE.md](ARCHITECTURE.md)
- GraphQL reference: [GRAPHQL_API.md](GRAPHQL_API.md)
- Database model: [ERD.md](ERD.md)

---

## Goal

Run the full project with a single command, including:

- frontend
- backend
- PostgreSQL
- Redis

---

## Single command

From the project root:

```bash
docker compose up --build -d
```

To stop everything:

```bash
docker compose down
```

To stop and remove database volumes:

```bash
docker compose down -v
```

---

## Included services

| Service | Container | Host port | Docker internal IP | Purpose |
|---|---|---:|---|---|
| Frontend | testblossom-frontend | 8080 | 172.28.0.30 | Web UI |
| Backend | testblossom-backend | 4001 | 172.28.0.20 | GraphQL and health endpoints |
| PostgreSQL | testblossom-postgres | 5433 | 172.28.0.10 | Persistence |
| Redis | testblossom-redis | 6380 | 172.28.0.11 | Cache |

---

## Endpoints to test

### Frontend
- http://localhost:8080
- http://172.28.0.30

### Backend
- GraphQL: http://localhost:4001/graphql
- Health: http://localhost:4001/health
- Internal Docker IP: http://172.28.0.20:4000/graphql

### PostgreSQL
- Local host: localhost
- Port: 5433
- Database: rickandmorty
- User: postgres
- Password: postgres
- Internal IP: 172.28.0.10
- Connection string: postgresql://postgres:postgres@localhost:5433/rickandmorty

### Redis
- Local host: localhost
- Port: 6380
- Password: not used
- Internal IP: 172.28.0.11

---

## Functional smoke test with Docker

1. Run docker compose up --build -d.
2. Open the frontend at http://localhost:8080.
3. Confirm backend health at http://localhost:4001/health.
4. Open the characters list.
5. Filter by name, status, or species.
6. Change sort order between A-Z and Z-A.
7. Mark favorites and validate the Starred section.
8. Open a character and save a comment.
9. Reload the page and confirm persistence.
10. Delete a character, go to Deleted, and restore it.

---

## Useful logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
docker compose logs -f redis
```

---

## Technical notes

- The frontend is served through Nginx.
- The backend connects to PostgreSQL using the service name postgres.
- Redis is configured as an optional cache within the stack.
- The main characters experience is intentionally seeded with up to 15 records for the challenge scope.
- All orchestration is centralized in [../docker-compose.yml](../docker-compose.yml).

## Quick summary

- Frontend: http://localhost:8080
- Backend: http://localhost:4001/graphql
- PostgreSQL host/port/user/password: localhost / 5433 / postgres / postgres
- Redis host/port: localhost / 6380
