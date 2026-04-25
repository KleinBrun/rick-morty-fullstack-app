import { beforeEach, describe, expect, it } from 'vitest';
import { AppError } from '../application/errors.js';
import { SearchCharactersUseCase } from '../application/use-cases/searchCharacters.js';
import type { CharacterRepositoryPort } from '../application/ports/characterRepository.js';
import type { CharacterRecord, CharacterSearchFilters, CharacterSeed } from '../domain/character.js';

const baseCharacters: CharacterRecord[] = [
  {
    id: 1,
    apiId: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    gender: 'Male',
    origin: 'Earth',
    image: 'rick.png',
  },
  {
    id: 2,
    apiId: 2,
    name: 'Morty Smith',
    status: 'Alive',
    species: 'Human',
    gender: 'Male',
    origin: 'Earth',
    image: 'morty.png',
  },
  {
    id: 3,
    apiId: 3,
    name: 'Birdperson',
    status: 'Dead',
    species: 'Alien',
    gender: 'Male',
    origin: 'Bird World',
    image: 'birdperson.png',
  },
  {
    id: 4,
    apiId: 4,
    name: 'Beth Smith',
    status: 'Alive',
    species: 'Human',
    gender: 'Female',
    origin: 'Earth',
    image: 'beth.png',
  },
];

const EXACT_MATCH_FIELDS: Array<keyof CharacterSearchFilters> = ['status', 'species', 'gender'];

function matchesFilter(character: CharacterRecord, filters: CharacterSearchFilters) {
  return Object.entries(filters).every(([key, value]) => {
    if (!value?.trim()) {
      return true;
    }

    const fieldName = key as keyof CharacterSearchFilters;
    const fieldValue = String(character[fieldName] ?? '').toLowerCase();
    const normalizedValue = value.trim().toLowerCase();

    return EXACT_MATCH_FIELDS.includes(fieldName)
      ? fieldValue === normalizedValue
      : fieldValue.includes(normalizedValue);
  });
}

class InMemoryCharacterRepository implements CharacterRepositoryPort {
  private characters: CharacterRecord[] = [];

  setCharacters(characters: CharacterRecord[]) {
    this.characters = [...characters];
  }

  async search(filters: CharacterSearchFilters = {}) {
    return this.characters
      .filter((character) => matchesFilter(character, filters))
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  async searchDeleted() {
    return [];
  }

  async findByApiId(apiId: string | number) {
    return this.characters.find((character) => character.apiId === Number(apiId)) ?? null;
  }

  async count() {
    return this.characters.length;
  }

  async upsertMany(characters: CharacterSeed[]) {
    const charactersByApiId = new Map(this.characters.map((character) => [character.apiId, character]));

    for (const character of characters) {
      const existing = charactersByApiId.get(character.apiId);
      charactersByApiId.set(character.apiId, {
        id: existing?.id ?? charactersByApiId.size + 1,
        ...character,
      });
    }

    this.characters = [...charactersByApiId.values()];
  }

  async softDeleteByApiId() {
    return true;
  }

  async restoreByApiId() {
    return true;
  }
}

class FailingSearchRepository extends InMemoryCharacterRepository {
  override async search(): Promise<CharacterRecord[]> {
    throw new AppError('DATABASE_UNAVAILABLE', 'Database operation failed: characters.search');
  }
}

const repository = new InMemoryCharacterRepository();
const cacheStore = new Map<string, string>();
const cache = {
  async get(key: string) {
    return cacheStore.get(key) ?? null;
  },
  async set(key: string, value: string) {
    cacheStore.set(key, value);
  },
  async delete(key: string) {
    cacheStore.delete(key);
  },
  async deleteByPrefix(prefix: string) {
    for (const key of [...cacheStore.keys()]) {
      if (key.startsWith(prefix)) {
        cacheStore.delete(key);
      }
    }
  },
};
const useCase = new SearchCharactersUseCase(repository, cache);

describe('SearchCharactersUseCase', () => {
  beforeEach(() => {
    cacheStore.clear();
    repository.setCharacters(baseCharacters);
  });

  it('limits the initial unfiltered list to 15 characters when the repository contains more records', async () => {
    repository.setCharacters(
      Array.from({ length: 18 }, (_, index) => ({
        id: index + 1,
        apiId: index + 1,
        name: `Character ${String(index + 1).padStart(2, '0')}`,
        status: 'Alive',
        species: 'Human',
        gender: 'Male',
        origin: 'Earth',
        image: `character-${index + 1}.png`,
      })),
    );

    const results = await useCase.execute();

    expect(results.results).toHaveLength(15);
    expect(results.results[0]?.name).toBe('Character 01');
    expect(results.results[14]?.name).toBe('Character 15');
    expect(results.warnings).toEqual([]);
  });

  it('filters characters by multiple criteria at the same time', async () => {
    const results = await useCase.execute({
      name: 'rick',
      status: 'alive',
      species: 'human',
      gender: 'male',
      origin: 'earth',
    });

    expect(results.results).toHaveLength(1);
    expect(results.results[0]?.name).toBe('Rick Sanchez');
    expect(results.warnings).toEqual([]);
  });

  it('merges public API matches when the local filter only returns a partial result set', async () => {
    const externalSource = {
      async search() {
        return [
          {
            apiId: 30,
            name: 'Zeep Xanflorp',
            status: 'Alive',
            species: 'Alien',
            gender: 'Male',
            origin: 'Miniverse',
            image: 'zeep.png',
          },
        ];
      },
      async getById() {
        return null;
      },
    };

    const useCaseWithFallback = new SearchCharactersUseCase(repository, cache, externalSource);
    const results = await useCaseWithFallback.execute({ name: 'z' });

    expect(results.results.map((character) => character.name)).toEqual([
      'Rick Sanchez',
      'Zeep Xanflorp',
    ]);
    expect(results.warnings).toEqual([]);
    expect(await repository.findByApiId(30)).not.toBeNull();
  });

  it('keeps returning database results when the public API is unavailable', async () => {
    const externalSource = {
      async search() {
        throw new AppError('EXTERNAL_API_UNAVAILABLE', 'Rick and Morty API is down');
      },
      async getById() {
        return null;
      },
    };

    const useCaseWithUnavailableApi = new SearchCharactersUseCase(repository, cache, externalSource);
    const results = await useCaseWithUnavailableApi.execute({ name: 'rick' });

    expect(results.results.map((character) => character.name)).toEqual(['Rick Sanchez']);
    expect(results.warnings).toEqual([
      {
        code: 'EXTERNAL_API_UNAVAILABLE',
        message: 'Rick and Morty API is down',
        source: 'rick-and-morty-api',
      },
    ]);
  });

  it('surfaces database failures with a database-specific error code', async () => {
    const failingRepository = new FailingSearchRepository();

    const useCaseWithFailingDb = new SearchCharactersUseCase(failingRepository, cache);

    await expect(useCaseWithFailingDb.execute({ name: 'rick' })).rejects.toMatchObject({
      code: 'DATABASE_UNAVAILABLE',
    });
  });
});
