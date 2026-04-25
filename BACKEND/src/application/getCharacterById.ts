import type { CharacterRecord } from '../domain/character.js';
import { isAppError, toErrorMessage } from './errors.js';
import type { CacheStorePort } from '../domain/ports/cacheStore.js';
import type { CharacterRepositoryPort } from '../domain/ports/characterRepository.js';
import type { ExternalCharacterSourcePort } from '../domain/ports/externalCharacterSource.js';

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
      try {
        const importedCharacter = await this.externalSource.getById(id);

        if (importedCharacter) {
          await this.repository.upsertMany([importedCharacter]);
          result = await this.repository.findByApiId(id, true);
        }
      } catch (error) {
        const code = isAppError(error) ? error.code : 'EXTERNAL_API_UNAVAILABLE';
        console.warn(`[characters.getById] external source skipped code=${code} id=${id} message=${toErrorMessage(error)}`);
      }
    }

    if (result) {
      await this.cache.set(cacheKey, JSON.stringify(result), 300);
    }

    return result;
  }
}
