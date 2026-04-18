import type { CacheStorePort } from '../ports/cacheStore.js';
import type { FavoriteRepositoryPort } from '../ports/favoriteRepository.js';

const FAVORITES_CACHE_KEY = 'favorites:all';

export class GetFavoriteCharacterIdsUseCase {
  constructor(
    private readonly repository: FavoriteRepositoryPort,
    private readonly cache: CacheStorePort,
  ) { }

  async execute(): Promise<string[]> {
    const cached = await this.cache.get(FAVORITES_CACHE_KEY);

    if (cached) { return JSON.parse(cached) as string[]; }

    const favoriteIds = await this.repository.listActiveCharacterIds();
    await this.cache.set(FAVORITES_CACHE_KEY, JSON.stringify(favoriteIds), 300);

    return favoriteIds;
  }
}
