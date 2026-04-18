import type { ExternalCharacterSourcePort } from '../application/ports/externalCharacterSource.js';
import type { CharacterRepositoryPort } from '../application/ports/characterRepository.js';
import type { CharacterSearchFilters, CharacterSeed } from '../domain/character.js';

const API_URL = 'https://rickandmortyapi.com/graphql';

const charactersQuery = `
    query LoadCharacters($page: Int!, $filter: FilterCharacter) {
        characters(page: $page, filter: $filter) {
        results {
            id
            name
            status
            species
            gender
            image
            origin {
            name
            }
        }
        }
    }
`;

const characterDetailQuery = `
    query LoadCharacterById($id: ID!) {
        character(id: $id) {
        id
        name
        status
        species
        gender
        image
        origin {
            name
        }
        }
    }
`;

type RickAndMortyApiCharacter = {
    id: string;
    name: string;
    status: string;
    species: string;
    gender: string;
    image: string;
    origin: { name: string };
};

type RickAndMortyApiResponse = {
    data?: {
        characters?: {
            results?: RickAndMortyApiCharacter[];
        };
        character?: RickAndMortyApiCharacter | null;
    };
};

function mapApiCharacter(character: RickAndMortyApiCharacter): CharacterSeed {
    return {
        apiId: Number(character.id),
        name: character.name,
        status: character.status,
        species: character.species,
        gender: character.gender,
        origin: character.origin.name,
        image: character.image,
    };
}

function buildApiFilter(filters: CharacterSearchFilters = {}) {
    return {
        name: filters.name?.trim() || undefined,
        status: filters.status?.trim() || undefined,
        species: filters.species?.trim() || undefined,
        gender: filters.gender?.trim() || undefined,
    };
}

export async function fetchCharactersFromApi(filters: CharacterSearchFilters = {}, limit = 15): Promise<CharacterSeed[]> {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: charactersQuery,
            variables: { page: 1, filter: buildApiFilter(filters) },
        }),
    });

    if (!response.ok) {
        throw new Error(`Unable to fetch characters: ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as RickAndMortyApiResponse;
    const results = payload.data?.characters?.results ?? [];

    return results
        .slice(0, limit)
        .map(mapApiCharacter)
        .filter((character) => {
            const originFilter = filters.origin?.trim().toLowerCase();
            return originFilter ? character.origin.toLowerCase().includes(originFilter) : true;
        });
}

export async function fetchCharacterByIdFromApi(id: string): Promise<CharacterSeed | null> {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: characterDetailQuery,
            variables: { id },
        }),
    });

    if (!response.ok) {
        throw new Error(`Unable to fetch character detail: ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as RickAndMortyApiResponse;
    const character = payload.data?.character;

    return character ? mapApiCharacter(character) : null;
}

export const publicCharacterSource: ExternalCharacterSourcePort = {
    async search(filters = {}) {
        return fetchCharactersFromApi(filters, 15);
    },
    async getById(id: string) {
        return fetchCharacterByIdFromApi(id);
    },
};

export async function syncCharactersFromApi(repository: CharacterRepositoryPort, limit = 15) {
    const characters = await fetchCharactersFromApi({}, limit);
    await repository.upsertMany(characters);
    console.log(`[sync] inserted or updated ${characters.length} characters`);
}

export async function syncCharactersOnFirstStart(repository: CharacterRepositoryPort, limit = 15) {
    const existingCharacters = await repository.count();

    if (existingCharacters > 0) {
        console.log(`[sync] database already has ${existingCharacters} characters`);
        return;
    }

    console.log('[sync] first startup detected, loading initial characters');
    await syncCharactersFromApi(repository, limit);
}