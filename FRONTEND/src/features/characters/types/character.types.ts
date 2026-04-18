export type CharacterFilters = {
  name: string;
  status: string;
  species: string;
  gender: string;
};

export type CharacterComment = {
  id: string;
  content: string;
  createdAt: string;
};

export type Character = {
  id: string;
  name: string;
  image: string;
  species: string;
  status?: string;
  gender?: string;
  type?: string;
  origin?: {
    name: string;
  };
};

export type CharactersPayload = {
  results: Character[];
} | null;

export type CharactersQueryResponse = {
  characters?: CharactersPayload;
  deletedCharacters?: CharactersPayload;
};

export type CharacterDetailQueryResponse = {
  character: Character | null;
};

export type FavoriteCharacterIdsQueryResponse = {
  favoriteCharacterIds: string[];
};

export type CharacterCommentsQueryResponse = {
  comments: CharacterComment[];
};

export type CharacterPanelQueryResponse = CharacterDetailQueryResponse & CharacterCommentsQueryResponse;
