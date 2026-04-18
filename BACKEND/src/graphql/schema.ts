import { buildSchema } from 'graphql';
import type { CharacterSearchFilters, CharacterRecord } from '../domain/character.js';
import type { CharacterCommentRecord } from '../domain/comment.js';

type SearchCharactersEntry = {
  execute: (filters?: CharacterSearchFilters) => Promise<CharacterRecord[]>;
};

type GetCharacterByIdEntry = {
  execute: (id: string) => Promise<CharacterRecord | null>;
};

type SearchDeletedCharactersEntry = {
  execute: (filters?: CharacterSearchFilters) => Promise<CharacterRecord[]>;
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

  type CharactersPayload {
    results: [Character!]!
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
      const results = await searchCharacters.execute(filter ?? {});

      return {
        results: results.map(mapCharacter),
      };
    },
    deletedCharacters: async ({ filter }: { filter?: CharacterSearchFilters }) => {
      const results = await searchDeletedCharacters.execute(filter ?? {});

      return {
        results: results.map(mapCharacter),
      };
    },
    character: async ({ id }: { id: string }) => {
      const result = await getCharacterById.execute(id);
      return result ? mapCharacter(result) : null;
    },
    favoriteCharacterIds: async () => {
      return getFavoriteCharacterIds.execute();
    },
    comments: async ({ characterId }: { characterId: string }) => {
      const results = await getCharacterComments.execute(characterId);
      return results.map(mapComment);
    },
    softDeleteCharacter: async ({ id }: { id: string }) => {
      return softDeleteCharacter.execute(id);
    },
    restoreCharacter: async ({ id }: { id: string }) => {
      return restoreCharacter.execute(id);
    },
    toggleFavorite: async ({ characterId }: { characterId: string }) => {
      return toggleFavorite.execute(characterId);
    },
    addComment: async ({ characterId, content }: { characterId: string; content: string }) => {
      const result = await addComment.execute(characterId, content);
      return result ? mapComment(result) : null;
    },
    softDeleteComment: async ({ id }: { id: string }) => {
      return softDeleteComment.execute(id);
    },
  };
}