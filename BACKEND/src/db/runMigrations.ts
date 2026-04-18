import { DataTypes, QueryTypes, type Sequelize } from 'sequelize';
import { migrations } from './migrations/index.js';

const MIGRATION_TABLE = 'sequelize_migrations';

type MigrationRow = {
  name: string;
};

function normalizeTableName(table: unknown) {
  if (typeof table === 'string') {
    return table;
  }

  if (table && typeof table === 'object' && 'tableName' in table) {
    return String(table.tableName);
  }

  return String(table);
}

async function ensureMigrationTable(sequelize: Sequelize) {
  const queryInterface = sequelize.getQueryInterface();
  const tables = await queryInterface.showAllTables();
  const tableNames = new Set(tables.map(normalizeTableName));

  if (tableNames.has(MIGRATION_TABLE)) {
    return;
  }

  await queryInterface.createTable(MIGRATION_TABLE, {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    runAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
}

export async function runMigrations(sequelize: Sequelize) {
  await ensureMigrationTable(sequelize);

  const appliedRows = await sequelize.query<MigrationRow>(`SELECT name FROM ${MIGRATION_TABLE}`, {
    type: QueryTypes.SELECT,
  });

  const appliedMigrationNames = new Set(appliedRows.map((row) => row.name));
  let hasRunAnyMigration = false;

  for (const migration of migrations) {
    if (appliedMigrationNames.has(migration.name)) {
      continue;
    }

    await migration.up(sequelize.getQueryInterface());
    await sequelize.getQueryInterface().bulkInsert(MIGRATION_TABLE, [
      {
        name: migration.name,
        runAt: new Date(),
      },
    ]);

    hasRunAnyMigration = true;
    console.log(`[db] migration applied: ${migration.name}`);
  }

  if (!hasRunAnyMigration) {
    console.log('[db] migrations already up to date');
  }
}
