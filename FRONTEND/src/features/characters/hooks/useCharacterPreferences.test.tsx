import { act, renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing/react';
import type { MockedResponse } from '@apollo/client/testing';
import { describe, expect, it } from 'vitest';
import { useCharacterPreferences } from './useCharacterPreferences';
import {
  GET_CHARACTER_PANEL_DATA,
  GET_FAVORITE_CHARACTER_IDS,
  TOGGLE_FAVORITE,
} from '../graphql/queries';
import type { Character } from '../types/character.types';

const mockCharacter: Character = {
  id: '1',
  name: 'Rick Sanchez',
  image: 'https://rick.test/image.png',
  species: 'Human',
  status: 'Alive',
  gender: 'Male',
  type: 'Scientist',
  origin: { name: 'Earth' },
};

describe('useCharacterPreferences', () => {
  it('updates favorite ids locally after toggling without needing an extra fetch', async () => {
    const toggleOnlyMocks: MockedResponse[] = [
      {
        request: {
          query: GET_FAVORITE_CHARACTER_IDS,
        },
        result: {
          data: {
            favoriteCharacterIds: [],
          },
        },
      },
      {
        request: {
          query: TOGGLE_FAVORITE,
          variables: { characterId: '1' },
        },
        result: {
          data: {
            toggleFavorite: true,
          },
        },
      },
      {
        request: {
          query: GET_CHARACTER_PANEL_DATA,
          variables: { id: '1' },
        },
        result: {
          data: {
            character: mockCharacter,
            comments: [],
          },
        },
      },
    ];

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MockedProvider mocks={toggleOnlyMocks}>{children}</MockedProvider>
    );

    const { result } = renderHook(() => useCharacterPreferences(mockCharacter.id), { wrapper });

    await waitFor(() => {
      expect(result.current.favoriteIds).toEqual([]);
    });

    await act(async () => {
      await result.current.toggleFavorite('1', mockCharacter);
    });

    await waitFor(() => {
      expect(result.current.favoriteIds).toEqual(['1']);
      expect(result.current.favoriteCharacters).toEqual([mockCharacter]);
      expect(result.current.isFavorite('1')).toBe(true);
    });
  });
});
