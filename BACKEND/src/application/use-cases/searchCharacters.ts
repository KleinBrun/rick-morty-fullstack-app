import { logExecutionTime } from '../../decorators/logExecutionTime.js';
import type { CharacterRecord, CharacterSearchFilters } from '../../domain/character.js';
import type { CacheStorePort } from '../ports/cacheStore.js';
import type { CharacterRepositoryPort } from '../ports/characterRepository.js';
import type { ExternalCharacterSourcePort } from '../ports/externalCharacterSource.js';

function normalizeFilterEntries(filters: CharacterSearchFilters) {
  return Object.entries(filters)
    .filter(([, value]) => Boolean(value?.trim()))
    .map(([key, value]) => [key, value?.trim().toLowerCase()])
    .sort(([left], [right]) => left.localeCompare(right));
}

function buildCacheKey(filters: CharacterSearchFilters) {
  const normalizedEntries = normalizeFilterEntries(filters);

  if (!normalizedEntries.length) {
    return 'characters:all';
  }

  return `characters:${normalizedEntries.map(([key, value]) => `${key}=${value}`).join('&')}`;
}

const INITIAL_CHARACTERS_LIMIT = 15;

function buildDeletedCacheKey(filters: CharacterSearchFilters) {
  const normalizedEntries = normalizeFilterEntries(filters);

  if (!normalizedEntries.length) {
    return 'characters:deleted:all';
  }

  return `characters:deleted:${normalizedEntries.map(([key, value]) => `${key}=${value}`).join('&')}`;
}

export class SearchCharactersUseCase {
  constructor(
    private readonly repository: CharacterRepositoryPort,
    private readonly cache: CacheStorePort,
    private readonly externalSource?: ExternalCharacterSourcePort,
  ) { }

  @logExecutionTime('characters.search')
  async execute(filters: CharacterSearchFilters = {}): Promise<CharacterRecord[]> {
    const cacheKey = buildCacheKey(filters);
    const cachedResults = await this.cache.get(cacheKey);

    if (cachedResults) {
      return JSON.parse(cachedResults) as CharacterRecord[];
    }

    let results = await this.repository.search(filters);
    const hasActiveFilters = Object.values(filters).some((value) => Boolean(value?.trim()));

    if (hasActiveFilters && this.externalSource) {
      const importedCharacters = await this.externalSource.search(filters);
      const missingCharacters = importedCharacters.filter(
        (character) => !results.some((result) => result.apiId === character.apiId),
      );

      if (missingCharacters.length) {
        await this.repository.upsertMany(importedCharacters);
        await this.cache.deleteByPrefix('characters:');
        results = await this.repository.search(filters);
      }
    }

    if (!hasActiveFilters) {
      results = results.slice(0, INITIAL_CHARACTERS_LIMIT);
    }

    await this.cache.set(cacheKey, JSON.stringify(results), 300);

    return results;
  }
}

export class SearchDeletedCharactersUseCase {
  constructor(
    private readonly repository: CharacterRepositoryPort,
    private readonly cache: CacheStorePort,
  ) { }

  @logExecutionTime('characters.searchDeleted')
  async execute(filters: CharacterSearchFilters = {}): Promise<CharacterRecord[]> {
    const cacheKey = buildDeletedCacheKey(filters);
    const cachedResults = await this.cache.get(cacheKey);

    if (cachedResults) {
      return JSON.parse(cachedResults) as CharacterRecord[];
    }

    const results = await this.repository.searchDeleted(filters);
    await this.cache.set(cacheKey, JSON.stringify(results), 300);

    return results;
  }
}
