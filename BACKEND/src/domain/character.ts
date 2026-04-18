export type CharacterRecord = {
  id: number;
  apiId: number;
  name: string;
  status: string;
  species: string;
  gender: string;
  origin: string;
  image: string;
};

export type CharacterSeed = Omit<CharacterRecord, 'id'>;

export type CharacterSearchFilters = Partial<Pick<CharacterSeed, 'name' | 'status' | 'species' | 'gender' | 'origin'>
>;

export const FILTERABLE_CHARACTER_FIELDS: Array<keyof CharacterSearchFilters> = ['name', 'status', 'species', 'gender', 'origin',];