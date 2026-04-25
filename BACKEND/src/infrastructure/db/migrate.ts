import { sequelize } from './sequelize.js';
import { runMigrations } from './runMigrations.js';

try {
  await sequelize.authenticate();
  await runMigrations(sequelize);
  console.log('[db] migration command completed successfully');
} finally {
  await sequelize.close();
}
