export const graphqlSwaggerDocument = {
    openapi: '3.0.3',
    info: {
        title: 'Test Blossom GraphQL API',
        version: '1.0.0',
        description:
            'This backend is GraphQL-first. In Swagger you will see only /health and one main POST /graphql route, because all business operations travel through the same GraphQL endpoint. Open the examples selector inside /graphql to test listing, detail, favorites, comments, delete, and restore flows.',
    },
    servers: [
        { url: 'http://localhost:4001', description: 'Docker' },
        { url: 'http://localhost:4000', description: 'local' },
    ],
    tags: [     
        { name: 'Characters', description: 'Character listing and detail operations' },
    ],
    paths: {
        '/health': {
            get: {
                tags: ['Characters'],
                summary: 'Health check',
                description: 'Returns the current health state of the backend.',
                responses: {
                    '200': {
                        description: 'Service is up',
                        content: {
                            'application/json': {
                                example: {
                                    status: 'ok',
                                },
                            },
                        },
                    },
                },
            },
        },
        '/graphql': {
            post: {
                tags: ['Characters'],
                summary: 'GraphQL endpoint with all app operations',
                description:
                    'GraphQL uses a single HTTP route. Use the example dropdown below to try characters, deletedCharacters, characterById, favoriteCharacterIds, comments, toggleFavorite, addComment, softDeleteComment, softDeleteCharacter, and restoreCharacter.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    query: {
                                        type: 'string',
                                        description: 'GraphQL operation string',
                                        example: '{ health }',
                                    },
                                    variables: {
                                        type: 'object',
                                        description: 'Optional variables object for the operation',
                                        additionalProperties: true,
                                        nullable: true,
                                    },
                                },
                                required: ['query'],
                            },
                            examples: {
                                health: {
                                    summary: 'Health query',
                                    value: {
                                        query: '{ health }',
                                    },
                                },
                                characters: {
                                    summary: 'List characters with optional filters',
                                    value: {
                                        query:
                                            'query GetCharacters($filter: FilterCharacter) { characters(filter: $filter) { results { id name image species status gender origin { name } } } }',
                                        variables: {
                                            filter: {
                                                name: 'rick',
                                                status: 'Alive',
                                                species: 'Human',
                                                gender: 'Male',
                                                origin: 'Earth',
                                            },
                                        },
                                    },
                                },
                                deletedCharacters: {
                                    summary: 'List deleted characters with optional filters',
                                    value: {
                                        query:
                                            'query GetDeletedCharacters($filter: FilterCharacter) { deletedCharacters(filter: $filter) { results { id name status species gender origin { name } } } }',
                                        variables: {
                                            filter: {
                                                name: 'morty',
                                            },
                                        },
                                    },
                                },
                                characterById: {
                                    summary: 'Get character detail by id',
                                    value: {
                                        query:
                                            'query GetCharacter($id: ID!) { character(id: $id) { id name image species status gender type origin { name } } }',
                                        variables: {
                                            id: '1',
                                        },
                                    },
                                },
                                favoriteIds: {
                                    summary: 'Get favorite character ids',
                                    value: {
                                        query: '{ favoriteCharacterIds }',
                                    },
                                },
                                comments: {
                                    summary: 'Get comments by character id',
                                    value: {
                                        query:
                                            'query GetComments($characterId: ID!) { comments(characterId: $characterId) { id content createdAt } }',
                                        variables: {
                                            characterId: '1',
                                        },
                                    },
                                },
                                toggleFavorite: {
                                    summary: 'Add or remove favorite',
                                    value: {
                                        query: 'mutation ToggleFavorite($characterId: ID!) { toggleFavorite(characterId: $characterId) }',
                                        variables: {
                                            characterId: '1',
                                        },
                                    },
                                },
                                addComment: {
                                    summary: 'Create comment for a character',
                                    value: {
                                        query:
                                            'mutation AddComment($characterId: ID!, $content: String!) { addComment(characterId: $characterId, content: $content) { id content createdAt } }',
                                        variables: {
                                            characterId: '1',
                                            content: 'Muy buen personaje',
                                        },
                                    },
                                },
                                deleteComment: {
                                    summary: 'Soft delete comment by id',
                                    value: {
                                        query: 'mutation DeleteComment($id: ID!) { softDeleteComment(id: $id) }',
                                        variables: {
                                            id: '1',
                                        },
                                    },
                                },
                                deleteCharacter: {
                                    summary: 'Soft delete character by id',
                                    value: {
                                        query: 'mutation DeleteCharacter($id: ID!) { softDeleteCharacter(id: $id) }',
                                        variables: {
                                            id: '1',
                                        },
                                    },
                                },
                                restoreCharacter: {
                                    summary: 'Restore character by id',
                                    value: {
                                        query: 'mutation RestoreCharacter($id: ID!) { restoreCharacter(id: $id) }',
                                        variables: {
                                            id: '1',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'GraphQL response payload',
                        content: {
                            'application/json': {
                                examples: {
                                    health: {
                                        summary: 'Health response',
                                        value: {
                                            data: {
                                                health: 'ok',
                                            },
                                        },
                                    },
                                    characters: {
                                        summary: 'Characters response',
                                        value: {
                                            data: {
                                                characters: {
                                                    results: [
                                                        {
                                                            id: '1',
                                                            name: 'Rick Sanchez',
                                                            species: 'Human',
                                                            status: 'Alive',
                                                            gender: 'Male',
                                                            image: 'https://...',
                                                            origin: {
                                                                name: 'Earth (C-137)',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                        },
                                    },
                                    deletedCharacters: {
                                        summary: 'Deleted characters response',
                                        value: {
                                            data: {
                                                deletedCharacters: {
                                                    results: [
                                                        {
                                                            id: '2',
                                                            name: 'Morty Smith',
                                                            species: 'Human',
                                                            status: 'Alive',
                                                            gender: 'Male',
                                                            origin: {
                                                                name: 'Earth (C-137)',
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                        },
                                    },
                                    favoriteIds: {
                                        summary: 'Favorite ids response',
                                        value: {
                                            data: {
                                                favoriteCharacterIds: ['1', '3', '8'],
                                            },
                                        },
                                    },
                                    comments: {
                                        summary: 'Comments response',
                                        value: {
                                            data: {
                                                comments: [
                                                    {
                                                        id: '1',
                                                        content: 'Muy buen personaje',
                                                        createdAt: '2026-04-17T15:30:00.000Z',
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                    mutationSuccess: {
                                        summary: 'Successful mutation response',
                                        value: {
                                            data: {
                                                toggleFavorite: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            FilterCharacter: {
                type: 'object',
                properties: {
                    name: { type: 'string', example: 'rick' },
                    status: { type: 'string', example: 'Alive' },
                    species: { type: 'string', example: 'Human' },
                    gender: { type: 'string', example: 'Male' },
                    origin: { type: 'string', example: 'Earth' },
                },
            },
            Character: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: '1' },
                    name: { type: 'string', example: 'Rick Sanchez' },
                    image: { type: 'string', example: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg' },
                    species: { type: 'string', example: 'Human' },
                    status: { type: 'string', example: 'Alive' },
                    gender: { type: 'string', example: 'Male' },
                    type: { type: 'string', example: 'Unknown' },
                    origin: {
                        type: 'object',
                        properties: {
                            name: { type: 'string', example: 'Earth (C-137)' },
                        },
                    },
                },
            },
            Comment: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: '1' },
                    content: { type: 'string', example: 'Muy buen personaje' },
                    createdAt: { type: 'string', example: '2026-04-17T15:30:00.000Z' },
                },
            },
        },
    },
};

export function renderSwaggerUiHtml(swaggerJsonUrl = '/swagger.json') {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Test Blossom Swagger</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body {
        margin: 0;
        background: #f8fafc;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '${swaggerJsonUrl}',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis],
        });
      };
    </script>
  </body>
</html>`;
}
