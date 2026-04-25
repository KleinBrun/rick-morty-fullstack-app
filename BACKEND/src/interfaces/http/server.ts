import { createApp } from './app.js';
import { env } from '../../config/env.js';

async function bootstrap() {
  try {
    const app = await createApp();

    app.listen(env.port, () => {
      console.log(`[server] running at http://localhost:${env.port}/graphql`);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[server] startup failed: ${message}`);
    process.exit(1);
  }
}

await bootstrap();