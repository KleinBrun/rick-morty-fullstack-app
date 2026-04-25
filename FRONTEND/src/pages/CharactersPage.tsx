import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CharactersFeature } from '../features/characters/CharactersFeature';

export function CharactersPage() {
  const navigate = useNavigate();
  const { characterId } = useParams();

  const handleSelectCharacter = useCallback((id: string) => { navigate(`/character/${id}`); }, [navigate]);

  const handleBackToList = useCallback(() => { navigate('/'); }, [navigate]);

  return (
    <CharactersFeature
      selectedCharacterId={characterId}
      onBackToList={handleBackToList}
      onSelectCharacter={handleSelectCharacter}
    />
  );
}
