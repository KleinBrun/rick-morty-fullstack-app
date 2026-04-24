import { useMutation, useQuery } from '@apollo/client/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ADD_COMMENT,
  GET_CHARACTER_PANEL_DATA,
  GET_FAVORITE_CHARACTER_IDS,
  SOFT_DELETE_COMMENT,
  TOGGLE_FAVORITE,
} from '../graphql/queries';
import type {
  Character,
  CharacterComment,
  CharacterPanelQueryResponse,
  FavoriteCharacterIdsQueryResponse,
} from '../types/character.types';

function clearLegacyPreferenceStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem('rm:favorites');
    window.localStorage.removeItem('rm:comments');
    window.localStorage.removeItem('rm:hidden');
    window.localStorage.removeItem('rm:hidden-characters');
  } catch {
    // Ignore storage access issues.
  }
}

export function useCharacterPreferences(selectedCharacterId?: string) {
  const [hiddenCharacterIds, setHiddenCharacterIds] = useState<string[]>([]);
  const [hiddenCharactersById, setHiddenCharactersById] = useState<Record<string, Character>>({});
  const [favoriteCharactersById, setFavoriteCharactersById] = useState<Record<string, Character>>({});

  const { data: favoritesData, client } = useQuery<FavoriteCharacterIdsQueryResponse>(GET_FAVORITE_CHARACTER_IDS);

  const { data: commentsData, refetch: refetchCharacterPanel } = useQuery<CharacterPanelQueryResponse>(GET_CHARACTER_PANEL_DATA, {
    variables: { id: selectedCharacterId },
    skip: !selectedCharacterId,
  });

  const [toggleFavoriteMutation] = useMutation<{ toggleFavorite: boolean }>(TOGGLE_FAVORITE);
  const [addCommentMutation] = useMutation(ADD_COMMENT);
  const [softDeleteCommentMutation] = useMutation(SOFT_DELETE_COMMENT);

  useEffect(() => {
    clearLegacyPreferenceStorage();
  }, []);

  const favoriteIds = favoritesData?.favoriteCharacterIds ?? [];
  const favoriteLookup = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const hiddenLookup = useMemo(() => new Set(hiddenCharacterIds), [hiddenCharacterIds]);
  const hiddenCharacters = useMemo(() => Object.values(hiddenCharactersById), [hiddenCharactersById]);
  const favoriteCharacters = useMemo(() => Object.values(favoriteCharactersById), [favoriteCharactersById]);

  const commentsByCharacter = useMemo<Record<string, CharacterComment[]>>(() => {
    if (!selectedCharacterId) {
      return {};
    }

    return {
      [selectedCharacterId]: commentsData?.comments ?? [],
    };
  }, [commentsData?.comments, selectedCharacterId]);

  const toggleFavorite = useCallback(async (characterId: string, character?: Character) => {
    const { data } = await toggleFavoriteMutation({ variables: { characterId } });
    const isNowFavorite = data?.toggleFavorite;

    if (typeof isNowFavorite !== 'boolean') {
      return;
    }

    const currentFavorites = client.readQuery<FavoriteCharacterIdsQueryResponse>({
      query: GET_FAVORITE_CHARACTER_IDS,
    });

    const currentIds = currentFavorites?.favoriteCharacterIds ?? [];
    const nextIds = isNowFavorite
      ? [...new Set([...currentIds, characterId])]
      : currentIds.filter((id) => id !== characterId);

    client.writeQuery<FavoriteCharacterIdsQueryResponse>({
      query: GET_FAVORITE_CHARACTER_IDS,
      data: {
        favoriteCharacterIds: nextIds,
      },
    });

    setFavoriteCharactersById((currentCharacters) => {
      if (!isNowFavorite) {
        const { [characterId]: _removed, ...remainingCharacters } = currentCharacters;
        return remainingCharacters;
      }

      if (!character) {
        return currentCharacters;
      }

      return {
        ...currentCharacters,
        [characterId]: character,
      };
    });
  }, [client, toggleFavoriteMutation]);

  const addComment = useCallback(async (characterId: string, comment: string) => {
    const trimmedComment = comment.trim();

    if (!trimmedComment) {
      return;
    }

    await addCommentMutation({
      variables: {
        characterId,
        content: trimmedComment,
      },
    });

    if (selectedCharacterId === characterId) {
      await refetchCharacterPanel();
    }
  }, [addCommentMutation, refetchCharacterPanel, selectedCharacterId]);

  const softDeleteComment = useCallback(async (commentId: string) => {
    await softDeleteCommentMutation({ variables: { id: commentId } });

    if (selectedCharacterId) {
      await refetchCharacterPanel();
    }
  }, [refetchCharacterPanel, selectedCharacterId, softDeleteCommentMutation]);

  const toggleHiddenCharacter = useCallback((characterId: string, character?: Character) => {
    const isCurrentlyHidden = hiddenLookup.has(characterId);

    setHiddenCharacterIds((currentIds) =>
      isCurrentlyHidden ? currentIds.filter((id) => id !== characterId) : [...currentIds, characterId],
    );

    setHiddenCharactersById((currentCharacters) => {
      if (isCurrentlyHidden) {
        const { [characterId]: _removed, ...remainingCharacters } = currentCharacters;
        return remainingCharacters;
      }

      if (!character) {
        return currentCharacters;
      }

      return {
        ...currentCharacters,
        [characterId]: character,
      };
    });
  }, [hiddenLookup]);

  const restoreHiddenCharacters = useCallback(() => {
    setHiddenCharacterIds([]);
    setHiddenCharactersById({});
  }, []);

  return {
    addComment,
    commentsByCharacter,
    favoriteIds,
    favoriteCharacters,
    hiddenCharacterIds,
    hiddenCharacters,
    isFavorite: useCallback((characterId: string) => favoriteLookup.has(characterId), [favoriteLookup]),
    isHidden: useCallback((characterId: string) => hiddenLookup.has(characterId), [hiddenLookup]),
    restoreHiddenCharacters,
    softDeleteComment,
    toggleFavorite,
    toggleHiddenCharacter,
  };
}
