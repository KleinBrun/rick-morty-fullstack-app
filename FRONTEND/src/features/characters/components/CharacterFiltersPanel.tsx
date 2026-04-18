import type { CharacterFiltersPanelProps } from '../types/ui.types';
import { FilterChip, FilterGroup } from './FilterChipGroup';

function FilterIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 4V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 4V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M18 4V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="6" cy="17" r="2" stroke="currentColor" strokeWidth="2" fill="white" />
            <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="2" fill="white" />
            <circle cx="18" cy="13" r="2" stroke="currentColor" strokeWidth="2" fill="white" />
        </svg>
    );
}

function BackArrowIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 12H8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M12 16 8 12l4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function CharacterFiltersPanel({
    activeFilterCount,
    draftGender,
    draftListMode,
    draftSortOrder,
    draftSpecies,
    draftStatus,
    filters,
    filtersContainerRef,
    hiddenCount,
    isFilterButtonDisabled,
    isPanelOpen,
    onApplyFilters,
    onClearFilters,
    onClosePanel,
    onDismissAdvancedSearch,
    onFilterChange,
    onOpenPanel,
    resultCount,
    setDraftGender,
    setDraftListMode,
    setDraftSortOrder,
    setDraftSpecies,
    setDraftStatus,
    showAdvancedHeader,
}: CharacterFiltersPanelProps) {
    return (
        <div className="space-y-3">
            {showAdvancedHeader && !isPanelOpen ? (
                <div className="pt-2 lg:hidden">
                    <div className="mb-3 border-t border-slate-200 py-3">
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={onDismissAdvancedSearch}
                                className="flex h-10 w-10 items-center justify-center text-[#673FAC]"
                                aria-label="Back to search"
                            >
                                <BackArrowIcon />
                            </button>
                            <p className="text-[13px] font-semibold text-slate-800">Advanced search</p>
                            <button
                                type="button"
                                onClick={onDismissAdvancedSearch}
                                className="text-xs font-semibold text-[#673FAC]"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            <div ref={filtersContainerRef} className={showAdvancedHeader ? 'relative hidden lg:block' : 'relative'}>
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
                        <path d="M20 20l-4.2-4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </span>

                <input
                    type="search"
                    inputMode="search"
                    enterKeyHint="search"
                    value={filters.name}
                    onChange={(event) => onFilterChange('name', event.target.value)}
                    onFocus={(event) => {
                        const scrollSearchIntoView = () => {
                            event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        };

                        scrollSearchIntoView();
                        window.setTimeout(scrollSearchIntoView, 200);
                        window.setTimeout(scrollSearchIntoView, 450);
                    }}
                    placeholder="Search or filter results"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-base text-slate-700 outline-none transition focus:border-[#8757D1] focus:bg-white md:py-2 md:text-sm lg:py-3 lg:text-[12px]"
                />

                <button
                    type="button"
                    onClick={isPanelOpen ? onClosePanel : onOpenPanel}
                    className={[
                        'absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md transition lg:h-8 lg:w-8',
                        isPanelOpen
                            ? 'bg-[#673FAC] text-white'
                            : 'bg-slate-50 text-[#673FAC] hover:bg-[#673FAC] hover:text-white',
                    ].join(' ')}
                    aria-label="Toggle filters"
                >
                    <FilterIcon />
                </button>

                {isPanelOpen ? (
                    <div className="fixed inset-0 z-50 bg-white lg:absolute lg:left-0 lg:right-0 lg:top-[calc(100%+6px)] lg:inset-auto lg:bg-transparent lg:pt-0">
                        <div className="flex h-[100dvh] flex-col rounded-b-2xl bg-white lg:h-auto lg:rounded-2xl lg:border lg:border-slate-200 lg:shadow-lg">
                            <div className="shrink-0 border-y border-slate-200 px-4 py-2 lg:hidden">
                                <div className="flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={onDismissAdvancedSearch}
                                        className="flex h-10 w-10 items-center justify-center text-[#673FAC]"
                                        aria-label="Back"
                                    >
                                        <BackArrowIcon />
                                    </button>
                                    <p className="text-[13px] font-semibold text-slate-800">Filters</p>
                                    <span className="block h-10 w-10" aria-hidden="true" />
                                </div>
                            </div>

                            <div className="space-y-2 px-4 pt-1 pb-2 lg:px-4 lg:pt-1">
                                <FilterGroup title="Characters" columns="grid-cols-4">
                                    <FilterChip active={draftListMode === 'all'} label="All" onClick={() => setDraftListMode('all')} />
                                    <FilterChip active={draftListMode === 'starred'} label="Starred" onClick={() => setDraftListMode('starred')} />
                                    <FilterChip active={draftListMode === 'others'} label="Others" onClick={() => setDraftListMode('others')} />
                                    <FilterChip active={draftListMode === 'deleted'} label="Deleted" onClick={() => setDraftListMode('deleted')} />
                                </FilterGroup>

                                <FilterGroup title="Specie" columns="grid-cols-4">
                                    <FilterChip active={draftSpecies === 'all'} label="All" onClick={() => setDraftSpecies('all')} />
                                    <FilterChip active={draftSpecies === 'human'} label="Human" onClick={() => setDraftSpecies('human')} />
                                    <FilterChip active={draftSpecies === 'alien'} label="Alien" onClick={() => setDraftSpecies('alien')} />
                                    <FilterChip active={draftSpecies === 'animal'} label="Animal" onClick={() => setDraftSpecies('animal')} />
                                </FilterGroup>

                                <FilterGroup title="Status" columns="grid-cols-2 lg:grid-cols-3">
                                    <FilterChip active={draftStatus === 'all'} label="All" onClick={() => setDraftStatus('all')} />
                                    <FilterChip active={draftStatus === 'alive'} label="Alive" onClick={() => setDraftStatus('alive')} />
                                    <FilterChip active={draftStatus === 'dead'} label="Dead" onClick={() => setDraftStatus('dead')} />
                                    <FilterChip active={draftStatus === 'unknown'} label="Unknown" onClick={() => setDraftStatus('unknown')} />
                                </FilterGroup>

                                <FilterGroup title="Gender" columns="grid-cols-2 lg:grid-cols-3">
                                    <FilterChip active={draftGender === 'all'} label="All" onClick={() => setDraftGender('all')} />
                                    <FilterChip active={draftGender === 'female'} label="Female" onClick={() => setDraftGender('female')} />
                                    <FilterChip active={draftGender === 'male'} label="Male" onClick={() => setDraftGender('male')} />
                                    <FilterChip active={draftGender === 'genderless'} label="Genderless" onClick={() => setDraftGender('genderless')} />
                                    <FilterChip active={draftGender === 'unknown'} label="Unknown" onClick={() => setDraftGender('unknown')} />
                                </FilterGroup>

                                <FilterGroup title="Order" columns="grid-cols-2">
                                    <FilterChip active={draftSortOrder === 'asc'} label="A-Z" onClick={() => setDraftSortOrder('asc')} />
                                    <FilterChip active={draftSortOrder === 'desc'} label="Z-A" onClick={() => setDraftSortOrder('desc')} />
                                </FilterGroup>
                            </div>

                            <div className="mt-auto shrink-0 rounded-b-2xl bg-white px-4 py-2 lg:border-t lg:border-slate-100 lg:px-4 lg:py-2">
                                <button
                                    type="button"
                                    onClick={onApplyFilters}
                                    disabled={isFilterButtonDisabled}
                                    className={[
                                        'w-full rounded-md px-3 py-1.5 text-[9px] font-semibold transition lg:py-1.5 lg:text-[10px]',
                                        isFilterButtonDisabled
                                            ? 'bg-slate-100 text-slate-400'
                                            : 'bg-[#8757D1] text-white hover:bg-[#673FAC]',
                                    ].join(' ')}
                                >
                                    Filter
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            {activeFilterCount > 0 || hiddenCount > 0 ? (
                <div className="border-y border-slate-200 py-3 lg:border-y-0 lg:py-0">
                    <div className="flex items-center justify-between gap-2 text-[9px] lg:text-[11px]">
                        <span className="font-semibold text-[#8757D1]">{resultCount} Results</span>

                        <div className="flex flex-wrap items-center justify-end gap-2">
                            {activeFilterCount > 0 ? (
                                <button
                                    type="button"
                                    onClick={onClearFilters}
                                    className="rounded-full border border-slate-200 px-2 py-0.5 font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Clear filters
                                </button>
                            ) : null}

                            {activeFilterCount > 0 ? (
                                <span className="rounded-full bg-[#EAF8DF] px-2 py-0.5 font-semibold text-[#61D836]">
                                    {activeFilterCount} Filter{activeFilterCount > 1 ? 's' : ''}
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
