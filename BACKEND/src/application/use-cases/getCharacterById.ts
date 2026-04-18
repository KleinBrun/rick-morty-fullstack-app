import type { CharacterRecord } from '../../domain/character.js';
import type { CacheStorePort } from '../ports/cacheStore.js';
import type { CharacterRepositoryPort } from '../ports/characterRepository.js';
import type { ExternalCharacterSourcePort } from '../ports/externalCharacterSource.js';

export class GetCharacterByIdUseCase {
  constructor(
    private readonly repository: CharacterRepositoryPort,
    private readonly cache: CacheStorePort,
    private readonly externalSource?: ExternalCharacterSourcePort,
  ) { }

  async execute(id: string): Promise<CharacterRecord | null> {
    const cacheKey = `character:${id}`;
    const cachedResult = await this.cache.get(cacheKey);

    if (cachedResult) { return JSON.parse(cachedResult) as CharacterRecord; }

    let result = await this.repository.findByApiId(id, true);

    if (!result && this.externalSource) {
      const importedCharacter = await this.externalSource.getById(id);

      if (importedCharacter) {
        await this.repository.upsertMany([importedCharacter]);
        result = await this.repository.findByApiId(id, true);
      }
    }

    if (result) {
      await this.cache.set(cacheKey, JSON.stringify(result), 300);
    }

    return result;
  }
}