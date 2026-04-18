import cron from 'node-cron';
import type { CharacterRepositoryPort } from '../application/ports/characterRepository.js';
import { syncCharactersFromApi, syncCharactersOnFirstStart } from '../services/characterBootstrapService.js';

let hasStarted = false;

export async function startCharacterSyncCron(repository: CharacterRepositoryPort) {
  if (hasStarted) { return; }

  await syncCharactersOnFirstStart(repository, 15);

  cron.schedule('0 */12 * * *', async () => {
    console.log('[cron] updating characters from the Rick and Morty API');

    try {
      await syncCharactersFromApi(repository, 15);
    } catch (error) {
      console.error('[cron] character update failed');
      console.error(error);
    }
  });

  hasStarted = true;
  console.log('[cron] character update scheduled every 12 hours');
}