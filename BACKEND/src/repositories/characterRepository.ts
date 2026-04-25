import { Op, col, fn, where, type WhereOptions } from 'sequelize';
import { toDatabaseError } from '../application/errors.js';
import type { CharacterRepositoryPort } from '../application/ports/characterRepository.js';
import { Character } from '../db/models/character.js';
import {
  FILTERABLE_CHARACTER_FIELDS,
  type CharacterRecord,
  type CharacterSearchFilters,
  type CharacterSeed,
} from '../domain/character.js';

const EXACT_MATCH_FIELDS: Array<keyof CharacterSearchFilters> = ['status', 'species', 'gender'];

function matchIgnoreCase(fieldName: keyof CharacterSearchFilters, rawValue: string, exact = false) {
  return where(fn('LOWER', col(fieldName)), exact
    ? {
        [Op.eq]: rawValue.trim().toLowerCase(),
      }
    : {
        [Op.like]: `%${rawValue.trim().toLowerCase()}%`,
      });
}

function buildSearchConditions(filters: CharacterSearchFilters) {
  return FILTERABLE_CHARACTER_FIELDS.flatMap((fieldName) => {
    const value = filters[fieldName]?.trim();
    return value ? [matchIgnoreCase(fieldName, value, EXACT_MATCH_FIELDS.includes(fieldName))] : [];
  }) as WhereOptions[];
}

function normalizeCharacter(record: CharacterRecord & Record<string, unknown>): CharacterRecord {
  return {
    id: Number(record.id),
    apiId: Number(record.apiId),
    name: String(record.name),
    status: String(record.status),
    species: String(record.species),
    gender: String(record.gender),
    origin: String(record.origin),
    image: String(record.image),
  };
}

export class CharacterRepository implements CharacterRepositoryPort {
  constructor(private readonly model: typeof Character) {}

  async search(filters: CharacterSearchFilters = {}): Promise<CharacterRecord[]> {
    try {
      const conditions = buildSearchConditions(filters);
      const records = await this.model.findAll({
        where: {
          deletedAt: null,
          ...(conditions.length ? { [Op.and]: conditions } : {}),
        },
        order: [['name', 'ASC']],
      });

      return records.map((record) => normalizeCharacter(record.get({ plain: true }) as CharacterRecord & Record<string, unknown>));
    } catch (error) {
      throw toDatabaseError('characters.search', error);
    }
  }

  async searchDeleted(filters: CharacterSearchFilters = {}): Promise<CharacterRecord[]> {
    try {
      const conditions = buildSearchConditions(filters);
      const records = await this.model.findAll({
        where: {
          [Op.and]: [
            { deletedAt: { [Op.not]: null } },
            ...(conditions.length ? conditions : []),
          ],
        },
        order: [['name', 'ASC']],
      });

      return records.map((record) => normalizeCharacter(record.get({ plain: true }) as CharacterRecord & Record<string, unknown>));
    } catch (error) {
      throw toDatabaseError('characters.searchDeleted', error);
    }
  }

  async findByApiId(apiId: string | number, includeDeleted = false): Promise<CharacterRecord | null> {
    try {
      const record = await this.model.findOne({
        where: includeDeleted
          ? { apiId: Number(apiId) }
          : { apiId: Number(apiId), deletedAt: null },
      });

      if (!record) {
        return null;
      }

      return normalizeCharacter(record.get({ plain: true }) as CharacterRecord & Record<string, unknown>);
    } catch (error) {
      throw toDatabaseError('characters.findByApiId', error);
    }
  }

  async count() {
    try {
      return await this.model.count();
    } catch (error) {
      throw toDatabaseError('characters.count', error);
    }
  }

  async upsertMany(characters: CharacterSeed[]) {
    try {
      for (const character of characters) {
        await this.model.upsert(character);
      }
    } catch (error) {
      throw toDatabaseError('characters.upsertMany', error);
    }
  }

  async softDeleteByApiId(apiId: string | number) {
    try {
      const [affectedRows] = await this.model.update(
        { deletedAt: new Date() },
        {
          where: {
            apiId: Number(apiId),
            deletedAt: null,
          },
        },
      );

      return affectedRows > 0;
    } catch (error) {
      throw toDatabaseError('characters.softDeleteByApiId', error);
    }
  }

  async restoreByApiId(apiId: string | number) {
    try {
      const [affectedRows] = await this.model.update(
        { deletedAt: null },
        {
          where: {
            apiId: Number(apiId),
          },
        },
      );

      return affectedRows > 0;
    } catch (error) {
      throw toDatabaseError('characters.restoreByApiId', error);
    }
  }
}
