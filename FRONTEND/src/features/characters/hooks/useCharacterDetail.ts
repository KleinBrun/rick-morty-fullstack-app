import { useQuery } from '@apollo/client/react';
import { GET_CHARACTER_PANEL_DATA } from '../graphql/queries';
import type { Character, CharacterPanelQueryResponse } from '../types/character.types';

export function useCharacterDetail(characterId?: string) {
    const { data, error, loading } = useQuery<CharacterPanelQueryResponse>(GET_CHARACTER_PANEL_DATA, {
        variables: { id: characterId },
        skip: !characterId,
    });

    return {
        character: (data?.character as Character | null | undefined) ?? null,
        error,
        loading,
    };
}