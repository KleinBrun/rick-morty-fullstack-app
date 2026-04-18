import { useMutation } from '@apollo/client/react';
import { useCallback, useMemo, useState } from 'react';
import { CharacterDetailPanel } from './components/CharacterDetailPanel';
import { CharacterFilters } from './components/CharacterFilters';
import { CharacterList } from './components/CharacterList';
import { CharacterListSkeleton } from './components/CharacterListSkeleton';
import { CharactersFeatureErrorState } from './components/CharactersFeatureErrorState';
import { RESTORE_CHARACTER, SOFT_DELETE_CHARACTER } from './graphql/queries';
import { useCharacterDetail } from './hooks/useCharacterDetail';
import { useCharacters } from './hooks/useCharacters';
import { useCharacterPreferences } from './hooks/useCharacterPreferences';
import type { CharactersFeatureProps } from './types/ui.types';
import { getActiveFilterCount, getVisibleCharacters, mergeDeletedCharacters } from './utils/characterView.utils';

export function CharactersFeature({ onBackToList, onSelectCharacter, selectedCharacterId, }: CharactersFeatureProps) {
  const [isAdvancedSearchVisible, setIsAdvancedSearchVisible] = useState(false);
  const [selectionClearedAfterDelete, setSelectionClearedAfterDelete] = useState(false);
  const {
    characters,
    clearFilters,
    deletedCharacters: persistedDeletedCharacters,
    error,
    filters,
    listMode,
    loading,
    refetchCharacters,
    setListMode,
    sortOrder,
    setSortOrder,
    updateFilter,
  } = useCharacters();

  const {
    addComment,
    commentsByCharacter,
    favoriteIds,
    hiddenCharacterIds,
    hiddenCharacters,
    isFavorite,
    softDeleteComment,
    toggleFavorite,
    toggleHiddenCharacter,
  } = useCharacterPreferences(selectedCharacterId ?? characters[0]?.id);

  const hiddenLookup = useMemo(() => new Set(hiddenCharacterIds), [hiddenCharacterIds]);
  const [softDeleteCharacter] = useMutation(SOFT_DELETE_CHARACTER);
  const [restoreCharacter] = useMutation(RESTORE_CHARACTER);
  const showMobileDetail = Boolean(selectedCharacterId);

  const deletedCharacters = useMemo(
    () => mergeDeletedCharacters(persistedDeletedCharacters, hiddenCharacters, sortOrder, filters),
    [filters, hiddenCharacters, persistedDeletedCharacters, sortOrder],
  );

  const visibleCharacters = useMemo(
    () =>
      getVisibleCharacters({
        characters,
        deletedCharacters,
        favoriteIds,
        hiddenCharacterIds,
        listMode,
      }),
    [characters, deletedCharacters, favoriteIds, hiddenCharacterIds, listMode],
  );

  const activeFilterCount = useMemo(
    () => getActiveFilterCount(filters, listMode, sortOrder),
    [filters, listMode, sortOrder],
  );

  const selectedCharacterSummary = useMemo(() => {
    if (selectedCharacterId) { return visibleCharacters.find((character) => character.id === selectedCharacterId) ?? null; }

    if (selectionClearedAfterDelete) { return null; }

    return visibleCharacters[0] ?? null;
  }, [selectedCharacterId, selectionClearedAfterDelete, visibleCharacters]);

  const { character: detailedCharacter, error: detailError } = useCharacterDetail(selectedCharacterSummary?.id);

  const selectedCharacter = useMemo(
    () => detailedCharacter?.id === selectedCharacterSummary?.id ? detailedCharacter : selectedCharacterSummary,
    [detailedCharacter, selectedCharacterSummary],
  );

  const isSelectedCharacterDeleted = selectedCharacter ? listMode === 'deleted' || hiddenLookup.has(selectedCharacter.id) : false;

  const handleSelectCharacter = useCallback(
    (id: string) => {
      setSelectionClearedAfterDelete(false);
      onSelectCharacter(id);
    },
    [onSelectCharacter],
  );

  const handleAddComment = useCallback(
    async (comment: string) => {
      if (!selectedCharacter) { return; }

      await addComment(selectedCharacter.id, comment);
    },
    [addComment, selectedCharacter],
  );

  const handleToggleFavorite = useCallback(
    async (characterId: string) => {
      await toggleFavorite(characterId);
    },
    [toggleFavorite],
  );

  const handleRestoreFromList = useCallback(async (characterId: string) => {
    const character = deletedCharacters.find((entry) => entry.id === characterId);

    await restoreCharacter({ variables: { id: characterId } });

    if (character && hiddenLookup.has(characterId)) { toggleHiddenCharacter(characterId, character); }

    await refetchCharacters();
    setSelectionClearedAfterDelete(true);
    onBackToList?.();
  }, [deletedCharacters, hiddenLookup, onBackToList, refetchCharacters, restoreCharacter, toggleHiddenCharacter]);

  const handleSoftDelete = useCallback(async () => {
    if (!selectedCharacter) {
      return;
    }

    const isCurrentlyDeleted = listMode === 'deleted' || hiddenLookup.has(selectedCharacter.id);

    if (isCurrentlyDeleted) {
      await restoreCharacter({ variables: { id: selectedCharacter.id } });

      if (hiddenLookup.has(selectedCharacter.id)) { toggleHiddenCharacter(selectedCharacter.id, selectedCharacter); }
    } else {
      if (isFavorite(selectedCharacter.id)) { await toggleFavorite(selectedCharacter.id); }

      await softDeleteCharacter({ variables: { id: selectedCharacter.id } });

      if (!hiddenLookup.has(selectedCharacter.id)) { toggleHiddenCharacter(selectedCharacter.id, selectedCharacter); }
    }

    await refetchCharacters();
    setSelectionClearedAfterDelete(true);
    onBackToList?.();
  }, [hiddenLookup, isFavorite, listMode, onBackToList, refetchCharacters, restoreCharacter, selectedCharacter, softDeleteCharacter, toggleFavorite, toggleHiddenCharacter]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    setListMode('all');
    setSortOrder('asc');
  }, [clearFilters, setSortOrder]);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  const handleSelectedCharacterToggleFavorite = useCallback(() => {
    if (!selectedCharacter) {
      return;
    }

    void handleToggleFavorite(selectedCharacter.id);
  }, [handleToggleFavorite, selectedCharacter]);

  const asideClassName = [
    showMobileDetail ? 'hidden' : 'block',
    'relative min-h-[100dvh] overflow-y-auto border-b border-slate-200/80 bg-white px-4 pb-5 pt-10 md:flex md:h-screen md:min-h-0 md:flex-col md:overflow-hidden md:border-r md:border-b-0 md:px-5 md:pb-0 md:pt-5 xl:px-6 2xl:px-7',
  ].join(' ');

  const titleClassName = ['mb-4', isAdvancedSearchVisible ? 'hidden md:block' : 'block'].join(' ');

  const mainClassName = [
    showMobileDetail ? 'block' : 'hidden',
    'min-h-[100dvh] overflow-y-auto bg-white px-4 pb-28 pt-10 scroll-pb-40 sm:min-h-[844px] sm:p-5 sm:pb-28 md:block md:h-screen md:min-h-0 md:overflow-y-auto md:bg-white md:p-6 md:pb-6 lg:p-7 xl:p-8 2xl:p-10',
  ].join(' ');

  if (error ?? detailError) {
    return <CharactersFeatureErrorState onReload={handleReload} />;
  }

  return (
    <div className="min-h-[100dvh] bg-[#dddddd] px-0 py-0 text-slate-900 md:h-screen md:overflow-hidden md:bg-[#efefef]">
      <div className="mx-auto min-h-[100dvh] w-full overflow-x-hidden bg-white md:grid md:h-screen md:min-h-0 md:overflow-hidden md:grid-cols-[320px_minmax(0,1fr)] md:border md:border-slate-200 md:bg-white xl:grid-cols-[360px_minmax(0,1fr)] 2xl:grid-cols-[400px_minmax(0,1fr)]">
        <aside className={asideClassName}>
          <div className={titleClassName}>
            <p className="text-[28px] font-bold tracking-tight text-slate-800 sm:text-xl lg:text-[18px]">Rick and Morty list</p>
          </div>

          <CharacterFilters
            activeFilterCount={activeFilterCount}
            filters={filters}
            hiddenCount={deletedCharacters.length}
            listMode={listMode}
            onAdvancedSearchVisibilityChange={setIsAdvancedSearchVisible}
            onClearFilters={handleClearFilters}
            onFilterChange={updateFilter}
            onListModeChange={setListMode}
            onSortOrderChange={setSortOrder}
            resultCount={visibleCharacters.length}
            sortOrder={sortOrder}
          />

          <div className="mt-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:min-h-0 md:flex-1 md:pb-0">
            {loading && !visibleCharacters.length ? (
              <CharacterListSkeleton />
            ) : (
              <CharacterList
                characters={visibleCharacters}
                favoriteIds={favoriteIds}
                listMode={listMode}
                onRestoreCharacter={handleRestoreFromList}
                onSelectCharacter={handleSelectCharacter}
                onToggleFavorite={handleToggleFavorite}
                selectedCharacterId={selectedCharacter?.id}
                showFavoriteActions={listMode !== 'deleted'}
                showRestoreActions={listMode === 'deleted'}
              />
            )}
          </div>
        </aside>

        <main className={mainClassName}>
          <CharacterDetailPanel
            character={selectedCharacter}
            comments={selectedCharacter ? commentsByCharacter[selectedCharacter.id] ?? [] : []}
            isDeleted={isSelectedCharacterDeleted}
            isFavorite={selectedCharacter ? isFavorite(selectedCharacter.id) : false}
            onAddComment={handleAddComment}
            onBackToList={onBackToList}
            onDeleteComment={softDeleteComment}
            onSoftDelete={handleSoftDelete}
            showFavoriteActions={!isSelectedCharacterDeleted}
            onToggleFavorite={handleSelectedCharacterToggleFavorite}
            showBackButton={showMobileDetail}
          />
        </main>
      </div>
    </div>
  );
}
