import type { ExternalCharacterSourcePort } from '../../domain/ports/externalCharacterSource.js';
import type { CharacterRepositoryPort } from '../../domain/ports/characterRepository.js';
import { AppError, toExternalApiError } from '../../application/errors.js';
import type { CharacterSearchFilters, CharacterSeed } from '../../domain/character.js';

const API_URL = 'https://rickandmortyapi.com/api/character';

type RickAndMortyApiCharacter = {
    id: string;
    name: string;
    status: string;
    species: string;
    gender: string;
    image: string;
    origin: { name: string };
};

type RickAndMortyApiSearchResponse = {
    results?: RickAndMortyApiCharacter[];
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

function buildApiUrl(filters: CharacterSearchFilters = {}) {
    const url = new URL(API_URL);
    url.searchParams.set('page', '1');

    const supportedFilters = {
        name: filters.name?.trim(),
        status: filters.status?.trim(),
        species: filters.species?.trim(),
        gender: filters.gender?.trim(),
    };

    Object.entries(supportedFilters).forEach(([key, value]) => {
        if (value) {
            url.searchParams.set(key, value);
        }
    });

    return url;
}

export async function fetchCharactersFromApi(filters: CharacterSearchFilters = {}, limit = 15): Promise<CharacterSeed[]> {
    let response: Response;

    try {
        response = await fetch(buildApiUrl(filters));
    } catch (error) {
        throw toExternalApiError('characters.search', error);
    }

    if (response.status === 404) {
        return [];
    }

    if (!response.ok) {
        throw new AppError('EXTERNAL_API_UNAVAILABLE', `Rick and Morty API returned ${response.status} ${response.statusText}`, {
            details: { status: response.status, statusText: response.statusText },
        });
    }

    const payload = (await response.json()) as RickAndMortyApiSearchResponse;
    const results = payload.results ?? [];

    return results
        .slice(0, limit)
        .map(mapApiCharacter)
        .filter((character) => {
            const originFilter = filters.origin?.trim().toLowerCase();
            return originFilter ? character.origin.toLowerCase().includes(originFilter) : true;
        });
}

export async function fetchCharacterByIdFromApi(id: string): Promise<CharacterSeed | null> {
    let response: Response;

    try {
        response = await fetch(`${API_URL}/${id}`);
    } catch (error) {
        throw toExternalApiError('characters.getById', error);
    }

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new AppError('EXTERNAL_API_UNAVAILABLE', `Rick and Morty API returned ${response.status} ${response.statusText}`, {
            details: { id, status: response.status, statusText: response.statusText },
        });
    }

    const character = (await response.json()) as RickAndMortyApiCharacter;
    return mapApiCharacter(character);
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
