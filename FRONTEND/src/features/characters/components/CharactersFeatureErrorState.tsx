import { memo } from 'react';

type CharactersFeatureErrorStateProps = {
  onReload: () => void;
};

function CharactersFeatureErrorStateComponent({ onReload }: CharactersFeatureErrorStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] p-6">
      <div className="max-w-md rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
        <h1 className="text-xl font-bold text-slate-900">We couldn’t load the characters</h1>
        <p className="mt-2 text-sm text-slate-500">
          Check that the API is running and try again in a moment.
        </p>
        <button
          type="button"
          onClick={onReload}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Reload
        </button>
      </div>
    </div>
  );
}

export const CharactersFeatureErrorState = memo(CharactersFeatureErrorStateComponent);
