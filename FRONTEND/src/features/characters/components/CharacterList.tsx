import { memo } from 'react';
import { EmptyState } from '../../../shared/components/EmptyState';
import type { CharacterListProps } from '../types/ui.types';
import { CharacterRow } from './CharacterRow';

function getEmptyStateCopy(listMode: CharacterListProps['listMode']) {
    switch (listMode) {
        case 'deleted':
            return {
                title: 'No deleted characters',
                description: 'Deleted items will appear here so you can restore them quickly.',
            };
        case 'starred':
            return {
                title: 'No starred characters yet',
                description: 'Use the heart icon to keep your favorite characters close at hand.',
            };
        case 'others':
            return {
                title: 'No other characters match',
                description: 'Try clearing the filters or switching back to the full list.',
            };
        default:
            return {
                title: 'No characters found',
                description: 'Adjust the filters to explore more results.',
            };
    }
}

function CharacterSection({ characters, favoriteIds, onRestoreCharacter, onSelectCharacter, onToggleFavorite, selectedCharacterId, showFavoriteActions = true, showRestoreActions = false, title, }: Omit<CharacterListProps, 'listMode'> & { title: string }) {
    if (!characters.length) {
        return null;
    }

    const favoriteLookup = new Set(favoriteIds);

    return (
        <section className="space-y-2">
            <div className="pb-1">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
            </div>

            <div className="space-y-0">
                {characters.map((character) => (
                    <CharacterRow
                        key={character.id}
                        character={character}
                        isFavorite={favoriteLookup.has(character.id)}
                        isSelected={selectedCharacterId === character.id}
                        onRestoreCharacter={onRestoreCharacter}
                        onSelect={onSelectCharacter}
                        onToggleFavorite={onToggleFavorite}
                        showFavoriteActions={showFavoriteActions}
                        showRestoreAction={showRestoreActions}
                    />
                ))}
            </div>
        </section>
    );
}

function CharacterListComponent({ characters, favoriteIds, listMode, onRestoreCharacter, onSelectCharacter, onToggleFavorite, selectedCharacterId, showFavoriteActions = true, showRestoreActions = false, }: CharacterListProps) {
    if (!characters.length) {
        const emptyStateCopy = getEmptyStateCopy(listMode);

        return (<EmptyState title={emptyStateCopy.title} description={emptyStateCopy.description} />);
    }

    const favoriteLookup = new Set(favoriteIds);
    const favoriteCharacters = characters.filter((character) => favoriteLookup.has(character.id));
    const regularCharacters = characters.filter((character) => !favoriteLookup.has(character.id));

    return (
        <div className="space-y-4">
            <CharacterSection
                title={`Starred characters (${favoriteCharacters.length})`}
                characters={favoriteCharacters}
                favoriteIds={favoriteIds}
                onRestoreCharacter={onRestoreCharacter}
                onSelectCharacter={onSelectCharacter}
                onToggleFavorite={onToggleFavorite}
                selectedCharacterId={selectedCharacterId}
                showFavoriteActions={showFavoriteActions}
                showRestoreActions={showRestoreActions}
            />

            <CharacterSection
                title={`Characters (${regularCharacters.length})`}
                characters={regularCharacters}
                favoriteIds={favoriteIds}
                onRestoreCharacter={onRestoreCharacter}
                onSelectCharacter={onSelectCharacter}
                onToggleFavorite={onToggleFavorite}
                selectedCharacterId={selectedCharacterId}
                showFavoriteActions={showFavoriteActions}
                showRestoreActions={showRestoreActions}
            />
        </div>
    );
}

export const CharacterList = memo(CharacterListComponent);

