import { gql } from '@apollo/client';

export const GET_CHARACTERS = gql`
  query GetFilteredCharacters($filter: FilterCharacter) {
    characters(filter: $filter) {
      results {
        id
        name
        image
        species
      }
      warnings {
        code
        message
        source
      }
    }
  }
`;

export const GET_DELETED_CHARACTERS = gql`
  query GetFilteredDeletedCharacters($filter: FilterCharacter) {
    deletedCharacters(filter: $filter) {
      results {
        id
        name
        image
        species
      }
      warnings {
        code
        message
        source
      }
    }
  }
`;

export const GET_CHARACTER_PANEL_DATA = gql`
  query GetCharacterPanelData($id: ID!) {
    character(id: $id) {
      id
      name
      image
      species
      status
      gender
      type
      origin {
        name
      }
    }
    comments(characterId: $id) {
      id
      content
      createdAt
    }
  }
`;

export const GET_FAVORITE_CHARACTER_IDS = gql`
  query GetFavoriteCharacterIds {
    favoriteCharacterIds
  }
`;

export const GET_CHARACTER_COMMENTS = gql`
  query GetCharacterComments($characterId: ID!) {
    comments(characterId: $characterId) {
      id
      content
      createdAt
    }
  }
`;

export const TOGGLE_FAVORITE = gql`
  mutation ToggleFavorite($characterId: ID!) {
    toggleFavorite(characterId: $characterId)
  }
`;

export const ADD_COMMENT = gql`
  mutation AddComment($characterId: ID!, $content: String!) {
    addComment(characterId: $characterId, content: $content) {
      id
      content
      createdAt
    }
  }
`;

export const SOFT_DELETE_COMMENT = gql`
  mutation SoftDeleteComment($id: ID!) {
    softDeleteComment(id: $id)
  }
`;

export const SOFT_DELETE_CHARACTER = gql`
  mutation SoftDeleteCharacter($id: ID!) {
    softDeleteCharacter(id: $id)
  }
`;

export const RESTORE_CHARACTER = gql`
  mutation RestoreCharacter($id: ID!) {
    restoreCharacter(id: $id)
  }
`;
