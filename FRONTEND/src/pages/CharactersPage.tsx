import { useNavigate, useParams } from 'react-router-dom';
import { CharactersFeature } from '../features/characters/CharactersFeature';

export function CharactersPage() {
  const navigate = useNavigate();
  const { characterId } = useParams();

  const handleSelectCharacter = (id: string) => { navigate(`/character/${id}`); };

  const handleBackToList = () => { navigate('/'); };

  return (
    <CharactersFeature
      selectedCharacterId={characterId}
      onBackToList={handleBackToList}
      onSelectCharacter={handleSelectCharacter}
    />
  );
}
