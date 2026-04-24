import { useEffect, useMemo, useState, useCallback } from 'react';
import { useQuery } from '@apollo/client/react';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import type { SortOrder } from '../../../types/common';
import { GET_CHARACTERS, GET_DELETED_CHARACTERS } from '../graphql/queries';
import type { CharacterFilters, CharactersQueryResponse } from '../types/character.types';
import type { CharacterViewMode } from '../types/ui.types';
import { sortCharactersByName } from '../utils/characterView.utils';

const DEFAULT_FILTERS: CharacterFilters = {
  name: '',
  status: '',
  species: '',
  gender: '',
};

function getValidSortOrder(value: string | null): SortOrder {
  return value === 'desc' ? 'desc' : 'asc';
}

function getValidListMode(value: string | null): CharacterViewMode {
  return value === 'starred' || value === 'others' || value === 'deleted' ? value : 'all';
}

function getInitialFilters(searchParams: URLSearchParams): CharacterFilters {
  return {
    name: searchParams.get('name') ?? '',
    status: searchParams.get('status') ?? '',
    species: searchParams.get('species') ?? '',
    gender: searchParams.get('gender') ?? '',
  };
}

function sanitizeFilters(filters: CharacterFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value.trim().length > 0),
  );
}

export function useCharacters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<CharacterFilters>(() => getInitialFilters(searchParams));
  const [sortOrder, setSortOrder] = useState<SortOrder>(() => getValidSortOrder(searchParams.get('sort')));
  const [listMode, setListMode] = useState<CharacterViewMode>(() => getValidListMode(searchParams.get('mode')));
  const debouncedName = useDebouncedValue(filters.name, 350);

  useEffect(() => {
    const nextParams = new URLSearchParams();

    const trimmedName = filters.name.trim();
    const trimmedStatus = filters.status.trim();
    const trimmedSpecies = filters.species.trim();
    const trimmedGender = filters.gender.trim();

    if (trimmedName) {
      nextParams.set('name', trimmedName);
    }

    if (trimmedStatus) { nextParams.set('status', trimmedStatus); }

    if (trimmedSpecies) { nextParams.set('species', trimmedSpecies); }

    if (trimmedGender) { nextParams.set('gender', trimmedGender); }

    if (listMode !== 'all') { nextParams.set('mode', listMode); }

    if (sortOrder !== 'asc') { nextParams.set('sort', sortOrder); }

    if (nextParams.toString() !== searchParams.toString()) { setSearchParams(nextParams, { replace: true }); }
  }, [filters, listMode, searchParams, setSearchParams, sortOrder]);
  const queryFilters = useMemo(
    () => {
      const normalizedFilters = {
        ...filters,
        name: debouncedName,
        species: filters.species ? filters.species.trim().toLowerCase() : '',
      };
      return sanitizeFilters(normalizedFilters);
    },
    [debouncedName, filters],
  );

  const shouldShowDeleted = listMode === 'deleted';

  const { data, loading, error, refetch } = useQuery<CharactersQueryResponse>(GET_CHARACTERS, {
    variables: { filter: queryFilters, },
    skip: shouldShowDeleted,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: deletedData,
    loading: deletedLoading,
    error: deletedError,
    refetch: refetchDeleted,
  } = useQuery<CharactersQueryResponse>(GET_DELETED_CHARACTERS, {
    variables: {
      filter: queryFilters,
    },
    skip: !shouldShowDeleted,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const characters = useMemo(
    () => sortCharactersByName(data?.characters?.results ?? [], sortOrder),
    [data?.characters?.results, sortOrder],
  );

  const deletedCharacters = useMemo(
    () => sortCharactersByName(deletedData?.deletedCharacters?.results ?? [], sortOrder),
    [deletedData?.deletedCharacters?.results, sortOrder],
  );

  const updateFilter = useCallback(<K extends keyof CharacterFilters>(key: K, value: CharacterFilters[K]) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    characters,
    clearFilters,
    deletedCharacters,
    error: error ?? deletedError,
    filters,
    listMode,
    loading: loading || deletedLoading,
    refetchCharacters: useCallback(async () => {
      if (shouldShowDeleted) {
        await refetchDeleted({ filter: queryFilters });
        return;
      }

      await refetch({ filter: queryFilters });
    }, [queryFilters, refetch, refetchDeleted, shouldShowDeleted]),
    setListMode,
    sortOrder,
    setSortOrder,
    updateFilter,
  };
}
