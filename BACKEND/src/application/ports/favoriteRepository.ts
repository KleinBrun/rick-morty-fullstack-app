export interface FavoriteRepositoryPort {
  listActiveCharacterIds(): Promise<string[]>;
  toggleByCharacterApiId(apiId: string | number): Promise<boolean>;
  removeByCharacterApiId(apiId: string | number): Promise<void>;
}
