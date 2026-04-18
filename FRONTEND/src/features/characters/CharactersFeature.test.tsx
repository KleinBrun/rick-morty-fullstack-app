import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing/react';
import type { MockedResponse } from '@apollo/client/testing';
import { describe, expect, it, vi } from 'vitest';
import { CharactersFeature } from './CharactersFeature';
import {
    ADD_COMMENT,
    GET_CHARACTER_PANEL_DATA,
    GET_CHARACTERS,
    GET_DELETED_CHARACTERS,
    GET_FAVORITE_CHARACTER_IDS,
    RESTORE_CHARACTER,
    SOFT_DELETE_CHARACTER,
    TOGGLE_FAVORITE,
} from './graphql/queries';

const apiCharacters = [
    {
        id: '1',
        name: 'Rick Sanchez',
        image: 'rick.png',
        species: 'Human',
        status: 'Alive',
        gender: 'Male',
        type: 'Scientist',
        origin: { name: 'Earth' },
        __typename: 'Character',
    },
    {
        id: '2',
        name: 'Morty Smith',
        image: 'morty.png',
        species: 'Human',
        status: 'Alive',
        gender: 'Male',
        type: 'Student',
        origin: { name: 'Earth' },
        __typename: 'Character',
    },
    {
        id: '3',
        name: 'Zeep Xanflorp',
        image: 'zeep.png',
        species: 'Alien',
        status: 'Alive',
        gender: 'Male',
        type: 'Scientist',
        origin: { name: 'Miniverse' },
        __typename: 'Character',
    },
];

const importedCharacter = {
    id: '80',
    name: "80's Snake",
    image: 'snake.png',
    species: 'Alien',
    status: 'Alive',
    gender: 'Male',
    type: 'Snake',
    origin: { name: 'Snake Planet' },
    __typename: 'Character',
};

function createCharactersMocks(): MockedResponse[] {
    return [
        {
            request: {
                query: GET_CHARACTERS,
                variables: { filter: {}, },
            },
            result: {
                data: {
                    characters: {
                        results: apiCharacters.map((character) => ({
                            id: character.id,
                            name: character.name,
                            image: character.image,
                            species: character.species,
                            __typename: 'Character',
                        })),
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
                        results: [
                            {
                                id: '2',
                                name: 'Morty Smith',
                                image: 'morty.png',
                                species: 'Human',
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
                query: GET_FAVORITE_CHARACTER_IDS,
            },
            result: {
                data: {
                    favoriteCharacterIds: ['1'],
                },
            },
        },
        {
            request: {
                query: GET_FAVORITE_CHARACTER_IDS,
            },
            result: {
                data: {
                    favoriteCharacterIds: ['1', '3'],
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
                    character: apiCharacters[0],
                    comments: [],
                },
            },
        },
        {
            request: {
                query: GET_CHARACTER_PANEL_DATA,
                variables: { id: '2' },
            },
            result: {
                data: {
                    character: apiCharacters[1],
                    comments: [],
                },
            },
        },
        {
            request: {
                query: GET_CHARACTER_PANEL_DATA,
                variables: { id: '2' },
            },
            result: {
                data: {
                    character: apiCharacters[1],
                    comments: [
                        {
                            id: '100',
                            content: 'Great strategist',
                            createdAt: '2026-04-16T20:00:00.000Z',
                            __typename: 'Comment',
                        },
                    ],
                },
            },
        },
        {
            request: {
                query: GET_CHARACTER_PANEL_DATA,
                variables: { id: '3' },
            },
            result: {
                data: {
                    character: apiCharacters[2],
                    comments: [],
                },
            },
        },
        {
            request: {
                query: ADD_COMMENT,
                variables: { characterId: '2', content: 'Great strategist' },
            },
            result: {
                data: {
                    addComment: {
                        id: '100',
                        content: 'Great strategist',
                        createdAt: '2026-04-16T20:00:00.000Z',
                        __typename: 'Comment',
                    },
                },
            },
        },
        {
            request: {
                query: SOFT_DELETE_CHARACTER,
                variables: { id: '2' },
            },
            result: {
                data: {
                    softDeleteCharacter: true,
                },
            },
        },
        {
            request: {
                query: RESTORE_CHARACTER,
                variables: { id: '2' },
            },
            result: {
                data: {
                    restoreCharacter: true,
                },
            },
        },
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
                        results: apiCharacters.filter((character) => character.id !== '2').map((character) => ({
                            id: character.id,
                            name: character.name,
                            image: character.image,
                            species: character.species,
                            __typename: 'Character',
                        })),
                        __typename: 'CharactersPayload',
                    },
                },
            },
        },
        {
            request: {
                query: SOFT_DELETE_CHARACTER,
                variables: { id: '3' },
            },
            result: {
                data: {
                    softDeleteCharacter: true,
                },
            },
        },
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
                        results: apiCharacters.filter((character) => character.id !== '3').map((character) => ({
                            id: character.id,
                            name: character.name,
                            image: character.image,
                            species: character.species,
                            __typename: 'Character',
                        })),
                        __typename: 'CharactersPayload',
                    },
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
                query: TOGGLE_FAVORITE,
                variables: { characterId: '3' },
            },
            result: {
                data: {
                    toggleFavorite: true,
                },
            },
        },

    ];
}

describe('CharactersFeature integrations', () => {
    it('lets the user save a comment in the selected character detail', async () => {
        // Prueba el flujo principal de comentar desde la UI.
        render(
            <MockedProvider mocks={createCharactersMocks()}>
                <MemoryRouter>
                    <CharactersFeature onSelectCharacter={vi.fn()} />
                </MemoryRouter>
            </MockedProvider>,
        );

        await screen.findByText('Rick Sanchez');

        const commentField = screen.getByPlaceholderText('Write a note about this character');
        fireEvent.change(commentField, { target: { value: 'Great strategist' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save comment' }));

        await waitFor(() => {
            expect(screen.getByText('Great strategist')).toBeInTheDocument();
        });
    });

    it('shows newly favorited imported characters after clearing the search input', async () => {
        const importedFavoriteMocks: MockedResponse[] = [
            {
                request: {
                    query: GET_CHARACTERS,
                    variables: { filter: {}, },
                },
                result: {
                    data: {
                        characters: {
                            results: apiCharacters.map((character) => ({
                                id: character.id,
                                name: character.name,
                                image: character.image,
                                species: character.species,
                                __typename: 'Character',
                            })),
                            __typename: 'CharactersPayload',
                        },
                    },
                },
            },
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
                    query: GET_CHARACTER_PANEL_DATA,
                    variables: { id: '1' },
                },
                result: {
                    data: {
                        character: apiCharacters[0],
                        comments: [],
                    },
                },
            },
            {
                request: {
                    query: GET_CHARACTER_PANEL_DATA,
                    variables: { id: '2' },
                },
                result: {
                    data: {
                        character: apiCharacters[1],
                        comments: [],
                    },
                },
            },
            {
                request: {
                    query: GET_CHARACTERS,
                    variables: { filter: { name: '80' }, },
                },
                result: {
                    data: {
                        characters: {
                            results: [{
                                id: importedCharacter.id,
                                name: importedCharacter.name,
                                image: importedCharacter.image,
                                species: importedCharacter.species,
                                __typename: 'Character',
                            }],
                            __typename: 'CharactersPayload',
                        },
                    },
                },
            },
            {
                request: {
                    query: GET_CHARACTER_PANEL_DATA,
                    variables: { id: '80' },
                },
                result: {
                    data: {
                        character: importedCharacter,
                        comments: [],
                    },
                },
            },
            {
                request: {
                    query: TOGGLE_FAVORITE,
                    variables: { characterId: '80' },
                },
                result: {
                    data: {
                        toggleFavorite: true,
                    },
                },
            },
            {
                request: {
                    query: GET_CHARACTERS,
                    variables: { filter: {}, },
                },
                result: {
                    data: {
                        characters: {
                            results: [...apiCharacters, importedCharacter].map((character) => ({
                                id: character.id,
                                name: character.name,
                                image: character.image,
                                species: character.species,
                                __typename: 'Character',
                            })),
                            __typename: 'CharactersPayload',
                        },
                    },
                },
            },
        ];

        render(
            <MockedProvider mocks={importedFavoriteMocks}>
                <MemoryRouter>
                    <CharactersFeature onSelectCharacter={vi.fn()} />
                </MemoryRouter>
            </MockedProvider>,
        );

        await screen.findByText('Rick Sanchez');

        fireEvent.change(screen.getByPlaceholderText('Search or filter results'), {
            target: { value: '80' },
        });

        await waitFor(() => {
            expect(screen.getAllByText("80's Snake").length).toBeGreaterThan(0);
        });

        fireEvent.click(screen.getByRole('button', { name: 'Add favorite' }));
        fireEvent.change(screen.getByPlaceholderText('Search or filter results'), {
            target: { value: '' },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Toggle filters' }));
        fireEvent.click(screen.getByRole('button', { name: 'Starred' }));
        fireEvent.click(screen.getByRole('button', { name: 'Filter' }));

        await waitFor(() => {
            expect(screen.getByText('Starred characters (1)')).toBeInTheDocument();
            expect(screen.getAllByText("80's Snake").length).toBeGreaterThan(0);
        });
    });

    it('keeps deleted species filters stable after deleting different character types', async () => {
        const deletedFilterMocks: MockedResponse[] = [
            {
                request: {
                    query: GET_CHARACTERS,
                    variables: { filter: {}, },
                },
                result: {
                    data: {
                        characters: {
                            results: apiCharacters.map((character) => ({
                                id: character.id,
                                name: character.name,
                                image: character.image,
                                species: character.species,
                                __typename: 'Character',
                            })),
                            __typename: 'CharactersPayload',
                        },
                    },
                },
            },
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
                    query: GET_CHARACTER_PANEL_DATA,
                    variables: { id: '1' },
                },
                result: {
                    data: {
                        character: apiCharacters[0],
                        comments: [],
                    },
                },
            },
            {
                request: {
                    query: GET_CHARACTER_PANEL_DATA,
                    variables: { id: '2' },
                },
                result: {
                    data: {
                        character: apiCharacters[1],
                        comments: [],
                    },
                },
            },
            {
                request: {
                    query: GET_CHARACTER_PANEL_DATA,
                    variables: { id: '3' },
                },
                result: {
                    data: {
                        character: apiCharacters[2],
                        comments: [],
                    },
                },
            },
            {
                request: {
                    query: SOFT_DELETE_CHARACTER,
                    variables: { id: '2' },
                },
                result: {
                    data: {
                        softDeleteCharacter: true,
                    },
                },
            },
            {
                request: {
                    query: GET_CHARACTERS,
                    variables: { filter: {}, },
                },
                result: {
                    data: {
                        characters: {
                            results: apiCharacters.filter((character) => character.id !== '2').map((character) => ({
                                id: character.id,
                                name: character.name,
                                image: character.image,
                                species: character.species,
                                __typename: 'Character',
                            })),
                            __typename: 'CharactersPayload',
                        },
                    },
                },
            },
            {
                request: {
                    query: SOFT_DELETE_CHARACTER,
                    variables: { id: '3' },
                },
                result: {
                    data: {
                        softDeleteCharacter: true,
                    },
                },
            },
            {
                request: {
                    query: GET_CHARACTERS,
                    variables: { filter: {}, },
                },
                result: {
                    data: {
                        characters: {
                            results: apiCharacters.filter((character) => character.id === '1').map((character) => ({
                                id: character.id,
                                name: character.name,
                                image: character.image,
                                species: character.species,
                                __typename: 'Character',
                            })),
                            __typename: 'CharactersPayload',
                        },
                    },
                },
            },
            {
                request: {
                    query: GET_DELETED_CHARACTERS,
                    variables: {
                        filter: { species: 'alien' },
                    },
                },
                result: {
                    data: {
                        deletedCharacters: {
                            results: [{
                                id: '3',
                                name: 'Zeep Xanflorp',
                                image: 'zeep.png',
                                species: 'Alien',
                                __typename: 'Character',
                            }],
                            __typename: 'CharactersPayload',
                        },
                    },
                },
            },
        ];

        render(
            <MockedProvider mocks={deletedFilterMocks}>
                <MemoryRouter>
                    <CharactersFeature onSelectCharacter={vi.fn()} />
                </MemoryRouter>
            </MockedProvider>,
        );

        await screen.findByText('Rick Sanchez');

        fireEvent.click(screen.getByRole('button', { name: /Morty Smith Human/i }));
        fireEvent.click(await screen.findByRole('button', { name: 'Delete' }));

        await waitFor(() => {
            expect(screen.queryByText('Morty Smith')).not.toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /Zeep Xanflorp Alien/i }));
        fireEvent.click(await screen.findByRole('button', { name: 'Delete' }));

        fireEvent.click(screen.getByRole('button', { name: 'Toggle filters' }));
        fireEvent.click(screen.getByRole('button', { name: 'Deleted' }));
        fireEvent.click(screen.getByRole('button', { name: 'Alien' }));
        fireEvent.click(screen.getByRole('button', { name: 'Filter' }));

        await waitFor(() => {
            expect(screen.getAllByText('Zeep Xanflorp').length).toBeGreaterThan(0);
            expect(screen.queryByText('Morty Smith')).not.toBeInTheDocument();
        });
    });

});
