import { createSequelizeInstance } from './databaseConfig.js';
import { defineCharacterModel } from './models/character.js';
import { defineCommentModel } from './models/comment.js';
import { defineFavoriteModel } from './models/favorite.js';
import { runMigrations } from './runMigrations.js';

export const sequelize = createSequelizeInstance();

export const CharacterModel = defineCharacterModel(sequelize);
export const CommentModel = defineCommentModel(sequelize);
export const FavoriteModel = defineFavoriteModel(sequelize);

CharacterModel.hasMany(CommentModel, {
    foreignKey: 'characterId',
    as: 'comments',
});
CommentModel.belongsTo(CharacterModel, {
    foreignKey: 'characterId',
    as: 'character',
});

CharacterModel.hasOne(FavoriteModel, {
    foreignKey: 'characterId',
    as: 'favorite',
});
FavoriteModel.belongsTo(CharacterModel, {
    foreignKey: 'characterId',
    as: 'character',
});

export async function initDatabase() {
    await sequelize.authenticate();
    await runMigrations(sequelize);
    console.log('[db] schema ready via Sequelize migrations');
}