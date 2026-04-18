import { memo } from 'react';
import type { CharacterFiltersProps } from '../types/ui.types';
import { CharacterFiltersPanel } from './CharacterFiltersPanel';
import { useCharacterFilters } from '../hooks/useCharacterFilters';

function CharacterFiltersComponent(props: CharacterFiltersProps) {
    const hook = useCharacterFilters(props);
    return (
        <CharacterFiltersPanel
            {...props}
            draftGender={hook.draftGender}
            draftListMode={hook.draftListMode}
            draftSortOrder={hook.draftSortOrder}
            draftSpecies={hook.draftSpecies}
            draftStatus={hook.draftStatus}
            setDraftGender={hook.setDraftGender}
            setDraftListMode={hook.setDraftListMode}
            setDraftSortOrder={hook.setDraftSortOrder}
            setDraftSpecies={hook.setDraftSpecies}
            setDraftStatus={hook.setDraftStatus}
            filtersContainerRef={hook.filtersContainerRef}
            isFilterButtonDisabled={hook.isFilterButtonDisabled}
            isPanelOpen={hook.isPanelOpen}
            showAdvancedHeader={hook.showAdvancedHeader}
            onOpenPanel={hook.openPanel}
            onClosePanel={hook.closePanel}
            onDismissAdvancedSearch={hook.dismissAdvancedSearch}
            onApplyFilters={hook.applyFilters}
        />
    );
}

export const CharacterFilters = memo(CharacterFiltersComponent);


