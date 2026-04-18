import { Sequelize } from 'sequelize';
import { env } from '../config/env.js';

export function createSequelizeInstance() {
  const dialectOptions = env.dbSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : undefined;

  if (env.dbUrl) {
    return new Sequelize(env.dbUrl, {
      dialect: 'postgres',
      dialectOptions,
      logging: false,
    });
  }

  return new Sequelize({
    dialect: 'postgres',
    host: env.dbHost,
    port: env.dbPort,
    database: env.dbName,
    username: env.dbUser,
    password: env.dbPassword,
    dialectOptions,
    logging: false,
  });
}