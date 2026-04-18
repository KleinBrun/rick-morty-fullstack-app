import { memo } from 'react';
import { CHARACTER_SKELETON_KEYS } from '../utils/characterView.utils';

function CharacterListSkeletonComponent() {
  return (
    <div className="space-y-3">
      {CHARACTER_SKELETON_KEYS.map((key) => (
        <div key={key} className="h-14 animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}

export const CharacterListSkeleton = memo(CharacterListSkeletonComponent);
