import type { QueryInterface } from 'sequelize';
import createCharactersMigration from './001-create-characters.js';
import createCommentsMigration from './002-create-comments.js';
import createFavoritesMigration from './003-create-favorites.js';

export type MigrationDefinition = {
    name: string;
    up: (queryInterface: QueryInterface) => Promise<void>;
};

export const migrations: MigrationDefinition[] = [
    createCharactersMigration,
    createCommentsMigration,
    createFavoritesMigration,
];
