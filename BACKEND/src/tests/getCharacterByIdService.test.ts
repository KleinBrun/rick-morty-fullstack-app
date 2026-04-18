import { beforeEach, describe, expect, it } from 'vitest';
import { GetCharacterByIdUseCase } from '../application/use-cases/getCharacterById.js';
import type { CharacterRepositoryPort } from '../application/ports/characterRepository.js';
import type { CharacterRecord, CharacterSeed } from '../domain/character.js';

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
];

class InMemoryCharacterRepository implements CharacterRepositoryPort {
  private characters: CharacterRecord[] = [];

  setCharacters(characters: CharacterRecord[]) {
    this.characters = [...characters];
  }

  async search() {
    return this.characters;
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
    const nextRecords = characters.map((character, index) => ({
      id: this.characters.length + index + 1,
      ...character,
    }));

    this.characters = [...this.characters, ...nextRecords];
  }

  async softDeleteByApiId() {
    return true;
  }

  async restoreByApiId() {
    return true;
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

describe('GetCharacterByIdUseCase', () => {
  beforeEach(() => {
    cacheStore.clear();
    repository.setCharacters(baseCharacters);
  });

  it('loads the character from the public API when it does not exist locally', async () => {
    const externalSource = {
      async search() {
        return [];
      },
      async getById() {
        return {
          apiId: 6,
          name: 'Abadango Cluster Princess',
          status: 'Alive',
          species: 'Alien',
          gender: 'Female',
          origin: 'Abadango',
          image: 'abadango.png',
        };
      },
    };

    const useCase = new GetCharacterByIdUseCase(repository, cache, externalSource);
    const result = await useCase.execute('6');

    expect(result?.name).toBe('Abadango Cluster Princess');
    expect(await repository.findByApiId(6)).not.toBeNull();
  });
});
