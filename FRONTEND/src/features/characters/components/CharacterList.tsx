import { memo } from 'react';
import { EmptyState } from '../../../shared/components/EmptyState';
import type { CharacterListProps } from '../types/ui.types';
import { CharacterRow } from './CharacterRow';
import { useCharacterList } from '../hooks/useCharacterList';

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

function CharacterListComponent(props: CharacterListProps) {
    const { characters, favoriteIds, listMode, onRestoreCharacter, onSelectCharacter, onToggleFavorite, selectedCharacterId, showFavoriteActions = true, showRestoreActions = false } = props;
    const { favoriteCharacters, regularCharacters, emptyStateCopy } = useCharacterList({ characters, favoriteIds, listMode });
    if (!characters.length) {
        return (<EmptyState title={emptyStateCopy.title} description={emptyStateCopy.description} />);
    }
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

