import type { CacheStorePort } from '../domain/ports/cacheStore.js';
import type { CharacterRepositoryPort } from '../domain/ports/characterRepository.js';
import type { FavoriteRepositoryPort } from '../domain/ports/favoriteRepository.js';

export class SoftDeleteCharacterUseCase {
  constructor(
    private readonly repository: CharacterRepositoryPort,
    private readonly cache: CacheStorePort,
    private readonly favoriteRepository?: FavoriteRepositoryPort,
  ) {}

  async execute(id: string): Promise<boolean> {
    const wasDeleted = await this.repository.softDeleteByApiId(id);

    if (!wasDeleted) {
      return false;
    }

    if (this.favoriteRepository) {
      await this.favoriteRepository.removeByCharacterApiId(id);
      await this.cache.delete('favorites:all');
    }

    await this.cache.delete(`character:${id}`);
    await this.cache.deleteByPrefix('characters:');

    return true;
  }
}
