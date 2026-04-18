import { DataTypes } from 'sequelize';
import type { MigrationDefinition } from './index.js';

const migration: MigrationDefinition = {
  name: '001-create-characters',
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

    if (tableNames.has('characters')) {
      return;
    }

    await queryInterface.createTable('characters', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      apiId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      species: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      origin: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
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
