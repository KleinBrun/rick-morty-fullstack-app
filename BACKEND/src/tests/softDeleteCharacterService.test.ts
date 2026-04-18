import { beforeEach, describe, expect, it } from 'vitest';
import { RestoreCharacterUseCase } from '../application/use-cases/restoreCharacter.js';
import { SoftDeleteCharacterUseCase } from '../application/use-cases/softDeleteCharacter.js';
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
    id: 6,
    apiId: 6,
    name: 'Abadango Cluster Princess',
    status: 'Alive',
    species: 'Alien',
    gender: 'Female',
    origin: 'Abadango',
    image: 'abadango.png',
  },
];

class InMemoryCharacterRepository implements CharacterRepositoryPort {
  private characters: CharacterRecord[] = [];
  private deletedIds = new Set<number>();

  setCharacters(characters: CharacterRecord[]) {
    this.characters = [...characters];
    this.deletedIds.clear();
  }

  async search(filters: CharacterSearchFilters = {}) {
    return this.characters.filter((character) => {
      if (this.deletedIds.has(character.apiId)) {
        return false;
      }

      return Object.entries(filters).every(([key, value]) => {
        if (!value?.trim()) {
          return true;
        }

        const currentValue = String(character[key as keyof CharacterSearchFilters] ?? '').toLowerCase();
        return currentValue.includes(value.trim().toLowerCase());
      });
    });
  }

  async searchDeleted(filters: CharacterSearchFilters = {}) {
    return this.characters.filter((character) => {
      if (!this.deletedIds.has(character.apiId)) {
        return false;
      }

      return Object.entries(filters).every(([key, value]) => {
        if (!value?.trim()) {
          return true;
        }

        const currentValue = String(character[key as keyof CharacterSearchFilters] ?? '').toLowerCase();
        return currentValue.includes(value.trim().toLowerCase());
      });
    });
  }

  async findByApiId(apiId: string | number) {
    const normalizedId = Number(apiId);

    if (this.deletedIds.has(normalizedId)) {
      return null;
    }

    return this.characters.find((character) => character.apiId === normalizedId) ?? null;
  }

  async count() {
    return this.characters.length;
  }

  async upsertMany(characters: CharacterSeed[]) {
    this.characters = characters.map((character, index) => ({
      id: index + 1,
      ...character,
    }));
  }

  async softDeleteByApiId(apiId: string | number) {
    this.deletedIds.add(Number(apiId));
    return true;
  }

  async restoreByApiId(apiId: string | number) {
    this.deletedIds.delete(Number(apiId));
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

describe('SoftDeleteCharacterUseCase', () => {
  beforeEach(() => {
    repository.setCharacters(baseCharacters);
    cacheStore.clear();
    cacheStore.set('character:6', JSON.stringify(baseCharacters[1]));
    cacheStore.set('characters:name=abadango', JSON.stringify([baseCharacters[1]]));
  });

  it('soft deletes, restores, and invalidates the related cache', async () => {
    // Verifica el ciclo completo de eliminar/restaurar sin dejar cache vieja.
    const deleteUseCase = new SoftDeleteCharacterUseCase(repository, cache);
    const restoreUseCase = new RestoreCharacterUseCase(repository, cache);

    const deleted = await deleteUseCase.execute('6');

    expect(deleted).toBe(true);
    expect(await repository.findByApiId(6)).toBeNull();
    expect(cacheStore.has('character:6')).toBe(false);
    expect(cacheStore.has('characters:name=abadango')).toBe(false);

    cacheStore.set('character:6', JSON.stringify(baseCharacters[1]));
    cacheStore.set('characters:all', JSON.stringify([]));

    const restored = await restoreUseCase.execute('6');

    expect(restored).toBe(true);
    expect(await repository.findByApiId(6)).not.toBeNull();
    expect(cacheStore.has('character:6')).toBe(false);
    expect(cacheStore.has('characters:all')).toBe(false);
  });
});
