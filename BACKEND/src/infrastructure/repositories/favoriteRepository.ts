import type { FavoriteRepositoryPort } from '../../domain/ports/favoriteRepository.js';
import { Character } from '../db/models/character.js';
import { Favorite } from '../db/models/favorite.js';

export class FavoriteRepository implements FavoriteRepositoryPort {
  constructor(
    private readonly favoriteModel: typeof Favorite,
    private readonly characterModel: typeof Character,
  ) {}

  async listActiveCharacterIds(): Promise<string[]> {
    const favorites = await this.favoriteModel.findAll({
      include: [
        {
          model: this.characterModel,
          as: 'character',
          where: { deletedAt: null },
          attributes: ['apiId'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    return favorites
      .map((favorite) => {
        const character = favorite.get('character') as Character | undefined;
        return character ? String(character.apiId) : null;
      })
      .filter((value): value is string => Boolean(value));
  }

  async toggleByCharacterApiId(apiId: string | number): Promise<boolean> {
    const character = await this.characterModel.findOne({
      where: {
        apiId: Number(apiId),
        deletedAt: null,
      },
    });

    if (!character) {
      return false;
    }

    const existingFavorite = await this.favoriteModel.findOne({
      where: { characterId: character.id },
    });

    if (existingFavorite) {
      await existingFavorite.destroy();
      return false;
    }

    await this.favoriteModel.create({ characterId: character.id });
    return true;
  }

  async removeByCharacterApiId(apiId: string | number): Promise<void> {
    const character = await this.characterModel.findOne({
      where: {
        apiId: Number(apiId),
      },
    });

    if (!character) {
      return;
    }

    await this.favoriteModel.destroy({
      where: { characterId: character.id },
    });
  }
}
