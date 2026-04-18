import type { ReactNode } from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing/react';
import type { MockedResponse } from '@apollo/client/testing';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { GET_CHARACTERS, GET_DELETED_CHARACTERS } from '../graphql/queries';
import { useCharacters } from './useCharacters';

const charactersMock: MockedResponse[] = [
  {
    request: {
      query: GET_CHARACTERS,
      variables: {
        filter: {},
      },
    },
    result: {
      data: {
        characters: {
          results: [
            {
              id: '2',
              name: 'Summer Smith',
              image: 'summer.png',
              species: 'Human',
              status: 'Alive',
              gender: 'Female',
              type: '',
              origin: { name: 'Earth' },
              __typename: 'Character',
            },
            {
              id: '1',
              name: 'Beth Smith',
              image: 'beth.png',
              species: 'Human',
              status: 'Alive',
              gender: 'Female',
              type: '',
              origin: { name: 'Earth' },
              __typename: 'Character',
            },
          ],
          __typename: 'CharactersPayload',
        },
      },
    },
  },
  {
    request: {
      query: GET_DELETED_CHARACTERS,
      variables: {
        filter: {},
      },
    },
    result: {
      data: {
        deletedCharacters: {
          results: [],
          __typename: 'CharactersPayload',
        },
      },
    },
  },
  {
    request: {
      query: GET_CHARACTERS,
      variables: {
        filter: {
          name: 'rick',
          species: 'human',
        },
      },
    },
    result: {
      data: {
        characters: {
          results: [],
          __typename: 'CharactersPayload',
        },
      },
    },
  },
  {
    request: {
      query: GET_DELETED_CHARACTERS,
      variables: {
        filter: {
          name: 'rick',
          species: 'human',
        },
      },
    },
    result: {
      data: {
        deletedCharacters: {
          results: [],
          __typename: 'CharactersPayload',
        },
      },
    },
  },
];

function createWrapper(mocks: MockedResponse[], initialEntry = '/') {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialEntry]}>
        <MockedProvider mocks={mocks}>{children}</MockedProvider>
      </MemoryRouter>
    );
  };
}

describe('useCharacters', () => {
  it('loads characters sorted ascending by default and descending when requested', async () => {
    // Prueba el orden principal de la lista desde el hook.
    const { result } = renderHook(() => useCharacters(), {
      wrapper: createWrapper(charactersMock),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.characters.map((character) => character.name)).toEqual([
      'Beth Smith',
      'Summer Smith',
    ]);

    act(() => {
      result.current.setSortOrder('desc');
    });

    expect(result.current.characters.map((character) => character.name)).toEqual([
      'Summer Smith',
      'Beth Smith',
    ]);
  });

});
