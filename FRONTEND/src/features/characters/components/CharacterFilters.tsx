import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { SortOrder } from '../../../types/common';
import type {
    CharacterFiltersProps,
    CharacterGenderFilter,
    CharacterSpeciesFilter,
    CharacterStatusFilter,
    CharacterViewMode,
} from '../types/ui.types';
import { CharacterFiltersPanel } from './CharacterFiltersPanel';

function getSpeciesValue(value: string): CharacterSpeciesFilter {
    const normalizedValue = value.toLowerCase();
    return normalizedValue === 'human' || normalizedValue === 'alien' || normalizedValue === 'animal'
        ? normalizedValue
        : 'all';
}

function getStatusValue(value: string): CharacterStatusFilter {
    const normalizedValue = value.toLowerCase();
    return normalizedValue === 'alive' || normalizedValue === 'dead' || normalizedValue === 'unknown'
        ? normalizedValue
        : 'all';
}

function getGenderValue(value: string): CharacterGenderFilter {
    const normalizedValue = value.toLowerCase();
    return normalizedValue === 'female' ||
        normalizedValue === 'male' ||
        normalizedValue === 'genderless' ||
        normalizedValue === 'unknown'
        ? normalizedValue
        : 'all';
}

function CharacterFiltersComponent({
    activeFilterCount,
    filters,
    hiddenCount,
    listMode,
    onAdvancedSearchVisibilityChange,
    onClearFilters,
    onFilterChange,
    onListModeChange,
    onSortOrderChange,
    resultCount,
    sortOrder,
}: CharacterFiltersProps) {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [showAdvancedHeader, setShowAdvancedHeader] = useState(false);
    const filtersContainerRef = useRef<HTMLDivElement | null>(null);

    const appliedSpecies = useMemo(() => getSpeciesValue(filters.species), [filters.species]);
    const appliedStatus = useMemo(() => getStatusValue(filters.status), [filters.status]);
    const appliedGender = useMemo(() => getGenderValue(filters.gender), [filters.gender]);

    const [draftListMode, setDraftListMode] = useState<CharacterViewMode>(listMode);
    const [draftSpecies, setDraftSpecies] = useState<CharacterSpeciesFilter>(appliedSpecies);
    const [draftStatus, setDraftStatus] = useState<CharacterStatusFilter>(appliedStatus);
    const [draftGender, setDraftGender] = useState<CharacterGenderFilter>(appliedGender);
    const [draftSortOrder, setDraftSortOrder] = useState<SortOrder>(sortOrder);

    useEffect(() => {
        setShowAdvancedHeader(activeFilterCount > 0);
    }, [activeFilterCount]);

    useEffect(() => {
        if (!isPanelOpen) {
            setDraftListMode(listMode);
            setDraftSpecies(appliedSpecies);
            setDraftStatus(appliedStatus);
            setDraftGender(appliedGender);
            setDraftSortOrder(sortOrder);
        }
    }, [appliedGender, appliedSpecies, appliedStatus, isPanelOpen, listMode, sortOrder]);

    useEffect(() => {
        onAdvancedSearchVisibilityChange?.(showAdvancedHeader && !isPanelOpen);
    }, [isPanelOpen, onAdvancedSearchVisibilityChange, showAdvancedHeader]);

    useEffect(() => {
        if (!isPanelOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            if (!filtersContainerRef.current?.contains(event.target as Node)) {
                setIsPanelOpen(false);
                setShowAdvancedHeader(activeFilterCount > 0);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [activeFilterCount, isPanelOpen]);

    const openPanel = () => {
        setDraftListMode(listMode);
        setDraftSpecies(appliedSpecies);
        setDraftStatus(appliedStatus);
        setDraftGender(appliedGender);
        setDraftSortOrder(sortOrder);
        setIsPanelOpen(true);
    };

    const closePanel = () => {
        setIsPanelOpen(false);
        setShowAdvancedHeader(activeFilterCount > 0);
    };

    const dismissAdvancedSearch = () => {
        setIsPanelOpen(false);
        setShowAdvancedHeader(false);
    };

    const applyFilters = () => {
        onListModeChange(draftListMode);
        onFilterChange('species', draftSpecies === 'all' ? '' : draftSpecies);
        onFilterChange('status', draftStatus === 'all' ? '' : draftStatus);
        onFilterChange('gender', draftGender === 'all' ? '' : draftGender);
        onSortOrderChange(draftSortOrder);
        setIsPanelOpen(false);
        setShowAdvancedHeader(
            Boolean(filters.name.trim()) ||
            draftListMode !== 'all' ||
            draftSpecies !== 'all' ||
            draftStatus !== 'all' ||
            draftGender !== 'all' ||
            draftSortOrder !== 'asc',
        );
    };

    const isFilterButtonDisabled = draftListMode === listMode && draftSpecies === appliedSpecies && draftStatus === appliedStatus && draftGender === appliedGender && draftSortOrder === sortOrder;

    return (
        <CharacterFiltersPanel
            activeFilterCount={activeFilterCount}
            draftGender={draftGender}
            draftListMode={draftListMode}
            draftSortOrder={draftSortOrder}
            draftSpecies={draftSpecies}
            draftStatus={draftStatus}
            filters={filters}
            filtersContainerRef={filtersContainerRef}
            hiddenCount={hiddenCount}
            isFilterButtonDisabled={isFilterButtonDisabled}
            isPanelOpen={isPanelOpen}
            onApplyFilters={applyFilters}
            onClearFilters={onClearFilters}
            onClosePanel={closePanel}
            onDismissAdvancedSearch={dismissAdvancedSearch}
            onFilterChange={onFilterChange}
            onOpenPanel={openPanel}
            resultCount={resultCount}
            setDraftGender={setDraftGender}
            setDraftListMode={setDraftListMode}
            setDraftSortOrder={setDraftSortOrder}
            setDraftSpecies={setDraftSpecies}
            setDraftStatus={setDraftStatus}
            showAdvancedHeader={showAdvancedHeader}
        />
    );
}

export const CharacterFilters = memo(CharacterFiltersComponent);


