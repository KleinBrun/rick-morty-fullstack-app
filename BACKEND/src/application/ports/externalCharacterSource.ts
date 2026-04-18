import type { CharacterSearchFilters, CharacterSeed } from '../../domain/character.js';

export interface ExternalCharacterSourcePort {
  search(filters?: CharacterSearchFilters): Promise<CharacterSeed[]>;
  getById(apiId: string): Promise<CharacterSeed | null>;
}
