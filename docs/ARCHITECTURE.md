# Architecture in one page

## Related documentation

- Main overview and setup: [../README.md](../README.md)
- Docker environment and ports: [DOCKER.md](DOCKER.md)
- GraphQL contract and examples: [GRAPHQL_API.md](GRAPHQL_API.md)
- Database model: [ERD.md](ERD.md)

---

## Overview

The solution is organized as a full-stack application with a React frontend and a GraphQL backend running on Express. The main goal was to keep the user experience simple while building an interview-defensible architecture with explicit responsibilities, real persistence, and a clear data flow.

## Technology stack

- Frontend: React 18, TypeScript, Vite, TailwindCSS, Apollo Client
- Backend: Node.js, Express, GraphQL, Sequelize
- Database: PostgreSQL
- Cache: Redis
- Containers: Docker
- Testing: Vitest

## Applied principles

- SOLID, especially SRP for focused responsibilities
- DRY to avoid unnecessary duplication
- KISS to keep the solution simple and understandable
- Clarity and maintainability over accidental complexity

## Technical decisions

- GraphQL was chosen to avoid overfetching and to keep the client queries flexible.
- Redis was added as an optional cache to improve read performance.
- Docker was prioritized as the main evaluation path to make the environment reproducible.
- The frontend uses a feature-based structure so the UI can scale without mixing concerns.
- Sequelize migrations provide controlled and traceable database evolution.

---

## Main layers

### 1. Frontend
The frontend displays the list, detail view, and filter controls. It also handles route navigation and keeps filters and sorting in the URL so the experience survives page reloads.

Responsibilities:

- render views and empty states
- handle filters, sorting, and selection
- consume GraphQL queries and mutations
- avoid storing sensitive business rules in local storage

### 2. GraphQL API
The API is the single entry point between the UI and the server. It exposes queries for characters, favorites, and comments, plus mutations for favorite toggle, comments, soft delete, and restore.

Responsibilities:

- expose a stable contract to the frontend
- delegate work to use cases
- keep the frontend coupled to a single data interface

### 3. Use cases and repositories
This is where business logic lives. Use cases orchestrate searches, persistence, cache invalidation, and restoration behavior.

Responsibilities:

- decide where each piece of data should be read from
- apply rules such as removing favorites when a character is deleted
- invalidate or refresh cache when data changes

### 4. Redis
Redis works as an optional cache using a cache-aside strategy.

Responsibilities:

- answer frequent reads quickly
- reduce load on PostgreSQL and the public API
- degrade gracefully if Redis is not available

### 5. PostgreSQL
This is the main source of truth for the system.

Responsibilities:

- persist synced characters
- persist favorites
- persist comments
- persist soft delete state

### 6. Rick and Morty public API
This external API is used for bootstrap and as a fallback when the backend needs data that is not yet stored locally.

---

## End-to-end flow

### Main flow

1. The user interacts with the frontend.
2. React triggers a query or mutation through Apollo Client.
3. The GraphQL API receives the operation.
4. The use case first tries to resolve the request from Redis.
5. If there is no cache hit, it queries PostgreSQL.
6. If the record does not exist locally and the use case allows it, the backend queries the public API.
7. The result is normalized and persisted in PostgreSQL.
8. The backend updates Redis.
9. GraphQL responds to the frontend.
10. The UI refreshes with consistent persisted data.

### For mutations

When the user toggles a favorite, adds a comment, deletes, or restores a character:

- PostgreSQL is updated
- related cache keys are invalidated
- the next read returns consistent data

---

## Design decisions

### What lives in the backend

Responsibilities that must persist between sessions were moved to the backend:

- favorites
- comments
- deletion state

This avoids browser-side inconsistencies and makes the demo more robust.

### What stays in the frontend

Only visual interaction state and navigation remain on the client side:

- selected panel
- visible filters
- active sort order
- current view state

### Challenge scope note

The main characters listing is intentionally limited to 15 records in this challenge scope, which keeps the initial dataset simple while still demonstrating filtering, persistence, favorites, and restoration flows.

---

## Benefits of this architecture

- easy to explain and defend in an interview
- clearly separates UI, business logic, persistence, and cache
- tolerates Redis downtime without breaking the service
- allows the API to scale without rewriting the frontend
- makes favorites, comments, and soft deletes truly persistent

---

## Short interview summary

“The frontend consumes a single GraphQL API. That API delegates to use cases that first try Redis, then PostgreSQL, and, when needed, the Rick and Morty public API. The result is then persisted, cached, and returned. This keeps the UI simple, preserves important business logic in the backend, and allows the system to keep working even without Redis.”