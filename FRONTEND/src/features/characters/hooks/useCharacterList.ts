import type { CharacterListProps } from '../types/ui.types';
import { useMemo } from 'react';

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

export function useCharacterList({ characters, favoriteIds, listMode }: Pick<CharacterListProps, 'characters' | 'favoriteIds' | 'listMode'>) {
    const favoriteLookup = useMemo(() => new Set(favoriteIds), [favoriteIds]);
    const favoriteCharacters = useMemo(() => characters.filter((character) => favoriteLookup.has(character.id)), [characters, favoriteLookup]);
    const regularCharacters = useMemo(() => characters.filter((character) => !favoriteLookup.has(character.id)), [characters, favoriteLookup]);
    const emptyStateCopy = useMemo(() => getEmptyStateCopy(listMode), [listMode]);
    return {
        favoriteCharacters,
        regularCharacters,
        emptyStateCopy,
        favoriteLookup,
    };
}
