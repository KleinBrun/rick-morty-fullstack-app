import { logExecutionTime } from '../../decorators/logExecutionTime.js';
import { isAppError, toErrorMessage, type ServiceWarning } from '../errors.js';
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

export type CharacterSearchResult = {
  results: CharacterRecord[];
  warnings: ServiceWarning[];
};

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
  async execute(filters: CharacterSearchFilters = {}): Promise<CharacterSearchResult> {
    const cacheKey = buildCacheKey(filters);
    const cachedResults = await this.cache.get(cacheKey);

    if (cachedResults) {
      return {
        results: JSON.parse(cachedResults) as CharacterRecord[],
        warnings: [],
      };
    }

    let results = await this.repository.search(filters);
    const warnings: ServiceWarning[] = [];
    const hasActiveFilters = Object.values(filters).some((value) => Boolean(value?.trim()));

    if (hasActiveFilters && this.externalSource) {
      try {
        const importedCharacters = await this.externalSource.search(filters);
        const missingCharacters = importedCharacters.filter(
          (character) => !results.some((result) => result.apiId === character.apiId),
        );

        if (missingCharacters.length) {
          await this.repository.upsertMany(importedCharacters);
          await this.cache.deleteByPrefix('characters:');
          results = await this.repository.search(filters);
        }
      } catch (error) {
        const code = isAppError(error) ? error.code : 'EXTERNAL_API_UNAVAILABLE';
        const message = toErrorMessage(error);
        console.warn(`[characters.search] external source skipped code=${code} message=${message}`);
        warnings.push({
          code,
          message,
          source: 'rick-and-morty-api',
        });
      }
    }

    if (!hasActiveFilters) {
      results = results.slice(0, INITIAL_CHARACTERS_LIMIT);
    }

    await this.cache.set(cacheKey, JSON.stringify(results), 300);

    return { results, warnings };
  }
}

export class SearchDeletedCharactersUseCase {
  constructor(
    private readonly repository: CharacterRepositoryPort,
    private readonly cache: CacheStorePort,
  ) { }

  @logExecutionTime('characters.searchDeleted')
  async execute(filters: CharacterSearchFilters = {}): Promise<CharacterSearchResult> {
    const cacheKey = buildDeletedCacheKey(filters);
    const cachedResults = await this.cache.get(cacheKey);

    if (cachedResults) {
      return {
        results: JSON.parse(cachedResults) as CharacterRecord[],
        warnings: [],
      };
    }

    const results = await this.repository.searchDeleted(filters);
    await this.cache.set(cacheKey, JSON.stringify(results), 300);

    return { results, warnings: [] };
  }
}
