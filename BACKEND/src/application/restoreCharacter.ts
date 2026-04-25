import type { CacheStorePort } from '../domain/ports/cacheStore.js';
import type { CharacterRepositoryPort } from '../domain/ports/characterRepository.js';

export class RestoreCharacterUseCase {
  constructor(
    private readonly repository: CharacterRepositoryPort,
    private readonly cache: CacheStorePort,
  ) {}

  async execute(id: string): Promise<boolean> {
    const wasRestored = await this.repository.restoreByApiId(id);

    if (!wasRestored) { return false; }

    await this.cache.delete(`character:${id}`);
    await this.cache.deleteByPrefix('characters:');

    return true;
  }
}
