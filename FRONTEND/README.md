# Frontend

Frontend en React + Vite para la exploración de personajes, filtros, favoritos, comentarios y vistas de borrado lógico.

## Formas de ejecución

### Recomendado
Usar todo el stack con Docker desde la raíz del proyecto:

```bash
docker compose up --build -d
```

Frontend disponible en:

- http://localhost:8080

### Manual

```bash
npm install
npm run dev
npm run test:run
npm run build
```

## API esperada

### Con Docker

```text
http://localhost:4001/graphql
```

### Manual

```text
http://localhost:4000/graphql
```

Si necesitas otra URL, crea un archivo .env con:

```env
VITE_GRAPHQL_URL=http://localhost:4001/graphql
```

## Documentación principal

La guía completa del proyecto está en:

- [../README.md](../README.md)
- [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- [../docs/DOCKER.md](../docs/DOCKER.md)

