import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class Character extends Model<InferAttributes<Character>, InferCreationAttributes<Character>> {
  declare id: CreationOptional<number>;
  declare apiId: number;
  declare name: string;
  declare status: string;
  declare species: string;
  declare gender: string;
  declare origin: string;
  declare image: string;
  declare deletedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export type CharacterAttributes = {
  id: number;
  apiId: number;
  name: string;
  status: string;
  species: string;
  gender: string;
  origin: string;
  image: string;
};

export type CharacterCreationAttributes = Omit<CharacterAttributes, 'id'>;

export function defineCharacterModel(sequelize: Sequelize) {
  if (sequelize.models.Character) {
    return sequelize.models.Character as typeof Character;
  }

  Character.init(
    {
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
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: 'characters',
      modelName: 'Character',
    },
  );

  return Character;
}