import type { ReactNode, RefObject } from 'react';
import type { SortOrder } from '../../../types/common';
import type { Character, CharacterComment, CharacterFilters } from './character.types';

export type CharacterViewMode = 'all' | 'starred' | 'others' | 'deleted';
export type CharacterSpeciesFilter = 'all' | 'human' | 'alien' | 'animal';
export type CharacterStatusFilter = 'all' | 'alive' | 'dead' | 'unknown';
export type CharacterGenderFilter = 'all' | 'female' | 'male' | 'genderless' | 'unknown';

export type CharactersFeatureProps = {
    onBackToList?: () => void;
    onSelectCharacter: (id: string) => void;
    selectedCharacterId?: string;
};

export type FilterChipProps = {
    active: boolean;
    label: string;
    onClick: () => void;
};

export type FilterGroupProps = {
    children: ReactNode;
    columns: string;
    title: string;
};

export type CharacterCommentsSectionProps = {
    comments: CharacterComment[];
    onAddComment: (comment: string) => void;
    onDeleteComment: (commentId: string) => void;
    originName: string;
};

export type CharacterRowProps = {
    character: Character;
    isFavorite: boolean;
    isSelected: boolean;
    onSelect: (characterId: string) => void;
    onToggleFavorite: (characterId: string, character: Character) => void;
    onRestoreCharacter?: (characterId: string) => void;
    showFavoriteActions?: boolean;
    showRestoreAction?: boolean;
};

export type CharacterListProps = {
    characters: Character[];
    favoriteIds: string[];
    listMode: CharacterViewMode;
    onRestoreCharacter?: (characterId: string) => void;
    onSelectCharacter: (characterId: string) => void;
    onToggleFavorite: (characterId: string, character: Character) => void;
    selectedCharacterId?: string;
    showFavoriteActions?: boolean;
    showRestoreActions?: boolean;
};

export type CharacterDetailHeaderProps = {
    character: Character;
    isDeleted: boolean;
    isFavorite: boolean;
    onBackToList?: () => void;
    onSoftDelete: () => void;
    onToggleFavorite: () => void;
    showBackButton?: boolean;
    showFavoriteActions?: boolean;
};

export type CharacterDetailPanelProps = {
    character: Character | null;
    comments: CharacterComment[];
    isDeleted?: boolean;
    isFavorite: boolean;
    onAddComment: (comment: string) => void;
    onBackToList?: () => void;
    onDeleteComment: (commentId: string) => void;
    onSoftDelete: () => void;
    onToggleFavorite: () => void;
    showBackButton?: boolean;
    showFavoriteActions?: boolean;
};

export type CharacterFiltersProps = {
    activeFilterCount: number;
    filters: CharacterFilters;
    hiddenCount: number;
    listMode: CharacterViewMode;
    onAdvancedSearchVisibilityChange?: (visible: boolean) => void;
    onClearFilters: () => void;
    onFilterChange: <K extends keyof CharacterFilters>(key: K, value: CharacterFilters[K]) => void;
    onListModeChange: (mode: CharacterViewMode) => void;
    onSortOrderChange: (order: SortOrder) => void;
    resultCount: number;
    sortOrder: SortOrder;
};

export type CharacterFiltersPanelProps = {
    activeFilterCount: number;
    draftGender: CharacterGenderFilter;
    draftListMode: CharacterViewMode;
    draftSortOrder: SortOrder;
    draftSpecies: CharacterSpeciesFilter;
    draftStatus: CharacterStatusFilter;
    filters: CharacterFilters;
    filtersContainerRef: RefObject<HTMLDivElement | null>;
    hiddenCount: number;
    isFilterButtonDisabled: boolean;
    isPanelOpen: boolean;
    onApplyFilters: () => void;
    onClearFilters: () => void;
    onClosePanel: () => void;
    onDismissAdvancedSearch: () => void;
    onFilterChange: <K extends keyof CharacterFilters>(key: K, value: CharacterFilters[K]) => void;
    onOpenPanel: () => void;
    resultCount: number;
    setDraftGender: (value: CharacterGenderFilter) => void;
    setDraftListMode: (mode: CharacterViewMode) => void;
    setDraftSortOrder: (order: SortOrder) => void;
    setDraftSpecies: (value: CharacterSpeciesFilter) => void;
    setDraftStatus: (value: CharacterStatusFilter) => void;
    showAdvancedHeader: boolean;
};
