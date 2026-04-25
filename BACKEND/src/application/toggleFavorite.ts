import type { CacheStorePort } from '../domain/ports/cacheStore.js';
import type { FavoriteRepositoryPort } from '../domain/ports/favoriteRepository.js';

export class ToggleFavoriteUseCase {
  constructor(
    private readonly repository: FavoriteRepositoryPort,
    private readonly cache: CacheStorePort,
  ) {}

  async execute(characterId: string): Promise<boolean> {
    const isFavorite = await this.repository.toggleByCharacterApiId(characterId);
    await this.cache.delete('favorites:all');
    await this.cache.deleteByPrefix('characters:');
    return isFavorite;
  }
}
