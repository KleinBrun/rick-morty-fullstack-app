# GraphQL API documentation

## Related documentation

- Main overview and setup: [../README.md](../README.md)
- Architecture and data flow: [ARCHITECTURE.md](ARCHITECTURE.md)
- Docker environment: [DOCKER.md](DOCKER.md)
- Database model: [ERD.md](ERD.md)

---

## Base routes

### Docker
- GraphQL: http://localhost:4001/graphql
- Swagger UI: http://localhost:4001/swagger
- Health: http://localhost:4001/health

### Manual
- GraphQL: http://localhost:4000/graphql
- Swagger UI: http://localhost:4000/swagger
- Health: http://localhost:4000/health

---

## API summary

Although the backend uses GraphQL rather than REST, this guide summarizes the API in a practical format for testing and technical handoff.

> Note: the main characters query returns up to 15 records in the current challenge scope.

### Content-Type

```http
Content-Type: application/json
```

### Method

```http
POST /graphql
```

---

## Queries

### 1. Health

Checks whether the API is alive.

```json
{
  "query": "{ health }"
}
```

Expected response:

```json
{
  "data": {
    "health": "ok"
  }
}
```

### 2. List characters

```json
{
  "query": "query GetCharacters($filter: FilterCharacter) { characters(filter: $filter) { results { id name image species status gender origin { name } } } }",
  "variables": {
    "filter": {
      "name": "rick"
    }
  }
}
```

### 3. List deleted characters

```json
{
  "query": "query GetDeletedCharacters($filter: FilterCharacter) { deletedCharacters(filter: $filter) { results { id name image species status gender origin { name } } } }",
  "variables": {
    "filter": {}
  }
}
```

### 4. Get character by ID

```json
{
  "query": "query GetCharacter($id: ID!) { character(id: $id) { id name image species status gender type origin { name } } }",
  "variables": {
    "id": "1"
  }
}
```

### 5. Get favorite IDs

```json
{
  "query": "{ favoriteCharacterIds }"
}
```

### 6. Get comments for a character

```json
{
  "query": "query GetComments($characterId: ID!) { comments(characterId: $characterId) { id content createdAt } }",
  "variables": {
    "characterId": "1"
  }
}
```

---

## Mutations

### 1. Toggle favorite

```json
{
  "query": "mutation ToggleFavorite($characterId: ID!) { toggleFavorite(characterId: $characterId) }",
  "variables": {
    "characterId": "1"
  }
}
```

### 2. Add comment

```json
{
  "query": "mutation AddComment($characterId: ID!, $content: String!) { addComment(characterId: $characterId, content: $content) { id content createdAt } }",
  "variables": {
    "characterId": "1",
    "content": "Great character"
  }
}
```

### 3. Delete comment

```json
{
  "query": "mutation DeleteComment($id: ID!) { softDeleteComment(id: $id) }",
  "variables": {
    "id": "1"
  }
}
```

### 4. Soft delete a character

```json
{
  "query": "mutation DeleteCharacter($id: ID!) { softDeleteCharacter(id: $id) }",
  "variables": {
    "id": "1"
  }
}
```

### 5. Restore a character

```json
{
  "query": "mutation RestoreCharacter($id: ID!) { restoreCharacter(id: $id) }",
  "variables": {
    "id": "1"
  }
}
```

---

## How to test with Postman

1. Create a POST request.
2. URL:
   - Docker: http://localhost:4001/graphql
   - Manual: http://localhost:4000/graphql
3. Header:
   - Content-Type: application/json
4. Body → raw → JSON.
5. Paste any of the examples above.

---

## Relevant project endpoints

- Docker frontend: http://localhost:8080
- Docker backend GraphQL: http://localhost:4001/graphql
- Docker backend health: http://localhost:4001/health
- Docker PostgreSQL: localhost:5433
- Docker Redis: localhost:6380
