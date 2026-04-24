import type { SortOrder } from '../../../types/common';
import type { Character, CharacterFilters } from '../types/character.types';
import type { CharacterViewMode } from '../types/ui.types';

export const CHARACTER_SKELETON_KEYS = [
  'character-skeleton-1',
  'character-skeleton-2',
  'character-skeleton-3',
  'character-skeleton-4',
  'character-skeleton-5',
  'character-skeleton-6',
] as const;

function compareCharacterNames(left: Character, right: Character) {
  return left.name.localeCompare(right.name);
}

export function sortCharactersByName(characters: Character[], sortOrder: SortOrder) {
  return [...characters].sort((left, right) => {
    const value = compareCharacterNames(left, right);
    return sortOrder === 'asc' ? value : -value;
  });
}

function matchesFilterValue(value: string | undefined, filterValue: string, { exact = false }: { exact?: boolean } = {}) {
  const normalizedFilter = filterValue.trim().toLowerCase();

  if (!normalizedFilter) {
    return true;
  }

  const normalizedValue = (value ?? 'unknown').trim().toLowerCase();
  return exact ? normalizedValue === normalizedFilter : normalizedValue.includes(normalizedFilter);
}

function matchesCharacterFilters(character: Character, filters: CharacterFilters) {
  return matchesFilterValue(character.name, filters.name)
    && matchesFilterValue(character.status, filters.status, { exact: true })
    && matchesFilterValue(character.species, filters.species, { exact: true })
    && matchesFilterValue(character.gender, filters.gender, { exact: true });
}

export function mergeDeletedCharacters(
  persistedDeletedCharacters: Character[],
  hiddenCharacters: Character[],
  sortOrder: SortOrder,
  filters: CharacterFilters,
) {
  const charactersById = new Map<string, Character>();

  for (const character of persistedDeletedCharacters) {
    charactersById.set(character.id, character);
  }

  for (const character of hiddenCharacters.filter((character) => matchesCharacterFilters(character, filters))) {
    charactersById.set(character.id, character);
  }

  return sortCharactersByName([...charactersById.values()], sortOrder);
}

export function getVisibleCharacters({
  characters,
  deletedCharacters,
  favoriteCharacters,
  favoriteIds,
  hiddenCharacterIds,
  listMode,
}: {
  characters: Character[];
  deletedCharacters: Character[];
  favoriteCharacters: Character[];
  favoriteIds: string[];
  hiddenCharacterIds: string[];
  listMode: CharacterViewMode;
}) {
  if (listMode === 'deleted') {
    return deletedCharacters;
  }

  const hiddenLookup = new Set(hiddenCharacterIds);
  const favoriteLookup = new Set(favoriteIds);
  const activeCharacters = characters.filter((character) => !hiddenLookup.has(character.id));
  const visibleCharactersById = new Map<string, Character>();

  for (const character of activeCharacters) {
    visibleCharactersById.set(character.id, character);
  }

  if (listMode === 'starred') {
    for (const character of favoriteCharacters) {
      if (favoriteLookup.has(character.id) && !hiddenLookup.has(character.id)) {
        visibleCharactersById.set(character.id, character);
      }
    }

    return [...visibleCharactersById.values()].filter((character) => favoriteLookup.has(character.id));
  }

  if (listMode === 'others') {
    return activeCharacters.filter((character) => !favoriteLookup.has(character.id));
  }

  for (const character of favoriteCharacters) {
    if (favoriteLookup.has(character.id) && !hiddenLookup.has(character.id)) {
      visibleCharactersById.set(character.id, character);
    }
  }

  return [...visibleCharactersById.values()];
}

export function getActiveFilterCount(
  filters: CharacterFilters,
  listMode: CharacterViewMode,
  sortOrder: SortOrder,
) {
  const filledFilters = Object.values(filters).filter((value) => value.trim().length > 0).length;
  const extraModeFilter = listMode === 'all' ? 0 : 1;
  const extraSortFilter = sortOrder === 'asc' ? 0 : 1;

  return filledFilters + extraModeFilter + extraSortFilter;
}
