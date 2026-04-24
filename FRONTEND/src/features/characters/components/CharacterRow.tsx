import { memo } from 'react';
import type { CharacterRowProps } from '../types/ui.types';

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M10 17.2c-.2 0-.4-.07-.55-.2C5.26 13.31 2.5 10.83 2.5 7.58 2.5 5.31 4.16 3.7 6.35 3.7c1.4 0 2.62.73 3.65 2.1 1.03-1.37 2.25-2.1 3.65-2.1 2.19 0 3.85 1.61 3.85 3.88 0 3.25-2.76 5.73-6.95 9.42-.15.13-.35.2-.55.2Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartButton({ isFavorite, onClick }: { isFavorite: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex h-7 w-7 items-center justify-center rounded-full transition-all lg:h-9 lg:w-9',
        isFavorite
          ? 'bg-white/65 text-[#61D836]'
          : 'bg-transparent text-slate-300 hover:bg-slate-100/60 hover:text-slate-400',
      ].join(' ')}
      aria-label={isFavorite ? 'Remove favorite' : 'Add favorite'}
    >
      <HeartIcon filled={isFavorite} />
    </button>
  );
}

function RestoreButton({ onClick, name }: { onClick: () => void; name: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700 transition hover:bg-emerald-100 lg:text-xs"
      aria-label={`Quick restore ${name}`}
    >
      Restore
    </button>
  );
}

function CharacterRowComponent({
  character,
  isFavorite,
  isSelected,
  onSelect,
  onToggleFavorite,
  onRestoreCharacter,
  showFavoriteActions = true,
  showRestoreAction = false,
}: CharacterRowProps) {
  return (
    <div className="px-1 lg:px-2">
      <div className="mx-1 border-t border-slate-200 lg:mx-1.5" />
      <div
        className={[
          'flex items-center gap-2 rounded-md px-1 py-2 transition lg:px-1.5 lg:py-2',
          isSelected ? 'lg:bg-[#EEE4FF]' : 'lg:hover:bg-slate-50',
        ].join(' ')}
      >
        <button type="button" onClick={() => onSelect(character.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <img
            src={character.image}
            alt={character.name}
            className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 lg:h-10 lg:w-10"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-800 lg:text-sm">{character.name}</p>
            <p className="truncate text-[11px] text-slate-500 lg:text-xs">{character.species}</p>
          </div>
        </button>

        {showRestoreAction ? (
          <RestoreButton onClick={() => onRestoreCharacter?.(character.id)} name={character.name} />
        ) : null}
        {showFavoriteActions ? <HeartButton isFavorite={isFavorite} onClick={() => onToggleFavorite(character.id, character)} /> : null}
      </div>
    </div>
  );
}

export const CharacterRow = memo(CharacterRowComponent);
