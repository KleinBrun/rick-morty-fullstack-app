import { DataTypes } from 'sequelize';
import type { MigrationDefinition } from './index.js';

const migration: MigrationDefinition = {
  name: '003-create-favorites',
  async up(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const tableNames = new Set(
      tables.map((table) => {
        if (typeof table === 'string') {
          return table;
        }

        if (table && typeof table === 'object') {
          const candidate = table as { tableName?: string };
          return candidate.tableName ? String(candidate.tableName) : String(table);
        }

        return String(table);
      }),
    );

    if (tableNames.has('favorites')) {
      return;
    }

    await queryInterface.createTable('favorites', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      characterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'characters',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
  },
};

export default migration;
