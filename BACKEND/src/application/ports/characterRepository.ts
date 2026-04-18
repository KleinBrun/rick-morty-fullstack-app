import type { CharacterRecord, CharacterSearchFilters, CharacterSeed } from '../../domain/character.js';

export interface CharacterRepositoryPort {
  search(filters?: CharacterSearchFilters): Promise<CharacterRecord[]>;
  searchDeleted(filters?: CharacterSearchFilters): Promise<CharacterRecord[]>;
  findByApiId(apiId: string | number, includeDeleted?: boolean): Promise<CharacterRecord | null>;
  count(): Promise<number>;
  upsertMany(characters: CharacterSeed[]): Promise<void>;
  softDeleteByApiId(apiId: string | number): Promise<boolean>;
  restoreByApiId(apiId: string | number): Promise<boolean>;
}
