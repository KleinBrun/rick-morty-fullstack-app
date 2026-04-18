import { memo } from 'react';
import { EmptyState } from '../../../shared/components/EmptyState';
import type { CharacterDetailPanelProps } from '../types/ui.types';
import { CharacterCommentsSection } from './CharacterCommentsSection';
import { CharacterDetailHeader } from './CharacterDetailHeader';

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-b border-slate-200 py-4 lg:py-5">
      <p className="text-xs font-semibold text-slate-700 lg:text-sm">{label}</p>
      <p className="mt-1 text-sm text-slate-500 lg:text-base">{value}</p>
    </div>
  );
}

function CharacterDetailPanelComponent({ character, comments, isDeleted = false, isFavorite, onAddComment, onBackToList, onDeleteComment, onSoftDelete, onToggleFavorite, showBackButton = false, showFavoriteActions = true, }: CharacterDetailPanelProps) {
  if (!character) { return (<EmptyState title="Select a character" description="Choose a profile from the list to see a bigger, clearer detail view here." variant="hero" />); }

  return (
    <div className="w-full max-w-none space-y-8 bg-white">
      <CharacterDetailHeader
        character={character}
        isDeleted={isDeleted}
        isFavorite={isFavorite}
        onBackToList={onBackToList}
        onSoftDelete={onSoftDelete}
        onToggleFavorite={onToggleFavorite}
        showBackButton={showBackButton}
        showFavoriteActions={showFavoriteActions}
      />

      <div className="w-full">
        <DetailRow label="Specie" value={character.species} />
        <DetailRow label="Status" value={character.status ?? 'Unknown'} />
        <DetailRow label="Gender" value={character.gender ?? 'Unknown'} />
        <DetailRow label="Occupation" value={character.type || 'Unknown'} />
      </div>

      <CharacterCommentsSection
        comments={comments}
        onAddComment={onAddComment}
        onDeleteComment={onDeleteComment}
        originName={character.origin?.name ?? 'Unknown'}
      />
    </div>
  );
}

export const CharacterDetailPanel = memo(CharacterDetailPanelComponent);

