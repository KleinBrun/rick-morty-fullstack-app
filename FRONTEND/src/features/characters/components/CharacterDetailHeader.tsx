import type { CharacterDetailHeaderProps } from '../types/ui.types';

export function CharacterDetailHeader({
    character,
    isDeleted,
    isFavorite,
    onBackToList,
    onSoftDelete,
    onToggleFavorite,
    showBackButton = false,
    showFavoriteActions = true,
}: CharacterDetailHeaderProps) {
    return (
        <div className="space-y-4">
            {showBackButton ? (
                <button type="button" onClick={onBackToList} className="flex h-11 w-11 items-center justify-center rounded-full text-[#673FAC] transition hover:bg-[#EEE4FF] md:hidden" aria-label="Back to list" >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M20 12H8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M12 16 8 12l4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            ) : null}

            <div className="flex items-start gap-4 pt-1">
                <div className="relative">
                    <img src={character.image} alt={character.name} className="h-16 w-16 rounded-full object-cover ring-2 ring-[#EEE4FF] lg:h-20 lg:w-20" />
                    {showFavoriteActions && !isDeleted ? (
                        <span className={['absolute -right-1 bottom-0 flex h-7 w-7 items-center justify-center rounded-full', isFavorite ? 'bg-white/80 text-[#61D836] shadow-sm' : 'bg-slate-100/80 text-slate-300',].join(' ')}>
                            <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 20.5 10.55 19.18C5.4 14.5 2 11.41 2 7.63 2 4.54 4.42 2.25 7.3 2.25c1.63 0 3.19.77 4.2 1.97 1.01-1.2 2.57-1.97 4.2-1.97C18.58 2.25 21 4.54 21 7.63c0 3.78-3.4 6.87-8.55 11.55L12 20.5Z" fill="currentColor" />
                            </svg>
                        </span>
                    ) : null}
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">{character.name}</h1>

                    <div className="flex flex-wrap gap-2">
                        {showFavoriteActions && !isDeleted ? (
                            <button
                                type="button"
                                onClick={onToggleFavorite}
                                className={[
                                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                                    isFavorite
                                        ? 'bg-[#EEE4FF] text-[#673FAC] hover:bg-[#ddccff]'
                                        : 'bg-[#8757D1] text-white hover:bg-[#673FAC]',
                                ].join(' ')}
                            >
                                {isFavorite ? 'Remove favorite' : 'Add to favorites'}
                            </button>
                        ) : null}

                        <button
                            type="button"
                            onClick={onSoftDelete}
                            className={[
                                'rounded-full border px-4 py-2 text-sm font-semibold transition',
                                isDeleted
                                    ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                    : 'border-rose-200 text-rose-600 hover:bg-rose-50',
                            ].join(' ')}
                        >
                            {isDeleted ? 'Restore' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
