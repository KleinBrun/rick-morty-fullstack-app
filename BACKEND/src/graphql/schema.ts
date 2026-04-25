import { buildSchema, GraphQLError } from 'graphql';
import { isAppError, toErrorMessage } from '../application/errors.js';
import type { CharacterSearchResult } from '../application/use-cases/searchCharacters.js';
import type { CharacterSearchFilters, CharacterRecord } from '../domain/character.js';
import type { CharacterCommentRecord } from '../domain/comment.js';

type SearchCharactersEntry = {
  execute: (filters?: CharacterSearchFilters) => Promise<CharacterSearchResult>;
};

type GetCharacterByIdEntry = {
  execute: (id: string) => Promise<CharacterRecord | null>;
};

type SearchDeletedCharactersEntry = {
  execute: (filters?: CharacterSearchFilters) => Promise<CharacterSearchResult>;
};

type SoftDeleteCharacterEntry = {
  execute: (id: string) => Promise<boolean>;
};

type RestoreCharacterEntry = {
  execute: (id: string) => Promise<boolean>;
};

type GetFavoriteCharacterIdsEntry = {
  execute: () => Promise<string[]>;
};

type ToggleFavoriteEntry = {
  execute: (characterId: string) => Promise<boolean>;
};

type GetCharacterCommentsEntry = {
  execute: (characterId: string) => Promise<CharacterCommentRecord[]>;
};

type AddCommentEntry = {
  execute: (characterId: string, content: string) => Promise<CharacterCommentRecord | null>;
};

type SoftDeleteCommentEntry = {
  execute: (commentId: string) => Promise<boolean>;
};
export const schema = buildSchema(`
  type Origin {
    name: String!
  }

  type Character {
    id: ID!
    name: String!
    image: String!
    species: String!
    status: String!
    gender: String!
    type: String!
    origin: Origin!
  }

  type Comment {
    id: ID!
    content: String!
    createdAt: String!
  }

  type ServiceWarning {
    code: String!
    message: String!
    source: String!
  }

  type CharactersPayload {
    results: [Character!]!
    warnings: [ServiceWarning!]!
  }

  input FilterCharacter {
    name: String
    status: String
    species: String
    gender: String
    origin: String
  }

  type Query {
    health: String!
    characters(filter: FilterCharacter): CharactersPayload!
    deletedCharacters(filter: FilterCharacter): CharactersPayload!
    character(id: ID!): Character
    favoriteCharacterIds: [ID!]!
    comments(characterId: ID!): [Comment!]!
  }

  type Mutation {
    softDeleteCharacter(id: ID!): Boolean!
    restoreCharacter(id: ID!): Boolean!
    toggleFavorite(characterId: ID!): Boolean!
    addComment(characterId: ID!, content: String!): Comment
    softDeleteComment(id: ID!): Boolean!
  }
`);

export function createRoot(
  searchCharacters: SearchCharactersEntry,
  searchDeletedCharacters: SearchDeletedCharactersEntry,
  getCharacterById: GetCharacterByIdEntry,
  softDeleteCharacter: SoftDeleteCharacterEntry,
  restoreCharacter: RestoreCharacterEntry,
  getFavoriteCharacterIds: GetFavoriteCharacterIdsEntry,
  toggleFavorite: ToggleFavoriteEntry,
  getCharacterComments: GetCharacterCommentsEntry,
  addComment: AddCommentEntry,
  softDeleteComment: SoftDeleteCommentEntry,
) {
  const throwGraphqlError = (error: unknown) => {
    if (isAppError(error)) {
      console.error(`[graphql] code=${error.code} message=${error.message}`);
      throw new GraphQLError(error.message, {
        extensions: {
          code: error.code,
          details: error.details,
        },
      });
    }

    console.error(`[graphql] code=INTERNAL_SERVER_ERROR message=${toErrorMessage(error)}`);
    throw new GraphQLError('Internal server error', {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  };

  const mapCharacter = (character: CharacterRecord) => ({
    id: String(character.apiId),
    name: character.name,
    image: character.image,
    species: character.species,
    status: character.status,
    gender: character.gender,
    type: 'Unknown',
    origin: { name: character.origin },
  });

  const mapComment = (comment: CharacterCommentRecord) => ({
    id: String(comment.id),
    content: comment.content,
    createdAt: new Date(comment.createdAt).toISOString(),
  });
  return {
    health: () => 'ok',
    characters: async ({ filter }: { filter?: CharacterSearchFilters }) => {
      try {
        const result = await searchCharacters.execute(filter ?? {});

        return {
          results: result.results.map(mapCharacter),
          warnings: result.warnings,
        };
      } catch (error) {
        throwGraphqlError(error);
      }
    },
    deletedCharacters: async ({ filter }: { filter?: CharacterSearchFilters }) => {
      try {
        const result = await searchDeletedCharacters.execute(filter ?? {});

        return {
          results: result.results.map(mapCharacter),
          warnings: result.warnings,
        };
      } catch (error) {
        throwGraphqlError(error);
      }
    },
    character: async ({ id }: { id: string }) => {
      try {
        const result = await getCharacterById.execute(id);
        return result ? mapCharacter(result) : null;
      } catch (error) {
        throwGraphqlError(error);
      }
    },
    favoriteCharacterIds: async () => {
      try {
        return await getFavoriteCharacterIds.execute();
      } catch (error) {
        throwGraphqlError(error);
      }
    },
    comments: async ({ characterId }: { characterId: string }) => {
      try {
        const results = await getCharacterComments.execute(characterId);
        return results.map(mapComment);
      } catch (error) {
        throwGraphqlError(error);
      }
    },
    softDeleteCharacter: async ({ id }: { id: string }) => {
      try {
        return await softDeleteCharacter.execute(id);
      } catch (error) {
        throwGraphqlError(error);
      }
    },
    restoreCharacter: async ({ id }: { id: string }) => {
      try {
        return await restoreCharacter.execute(id);
      } catch (error) {
        throwGraphqlError(error);
      }
    },
    toggleFavorite: async ({ characterId }: { characterId: string }) => {
      try {
        return await toggleFavorite.execute(characterId);
      } catch (error) {
        throwGraphqlError(error);
      }
    },
    addComment: async ({ characterId, content }: { characterId: string; content: string }) => {
      try {
        const result = await addComment.execute(characterId, content);
        return result ? mapComment(result) : null;
      } catch (error) {
        throwGraphqlError(error);
      }
    },
    softDeleteComment: async ({ id }: { id: string }) => {
      try {
        return await softDeleteComment.execute(id);
      } catch (error) {
        throwGraphqlError(error);
      }
    },
  };
}
