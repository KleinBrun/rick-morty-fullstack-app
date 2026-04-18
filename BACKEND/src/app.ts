import cors, { type CorsOptions } from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { createHandler } from 'graphql-http/lib/use/express';
import { AddCommentUseCase } from './application/use-cases/addComment.js';
import { GetCharacterByIdUseCase } from './application/use-cases/getCharacterById.js';
import { GetCharacterCommentsUseCase } from './application/use-cases/getCharacterComments.js';
import { GetFavoriteCharacterIdsUseCase } from './application/use-cases/getFavoriteCharacterIds.js';
import { RestoreCharacterUseCase } from './application/use-cases/restoreCharacter.js';
import { SearchCharactersUseCase, SearchDeletedCharactersUseCase } from './application/use-cases/searchCharacters.js';
import { SoftDeleteCharacterUseCase } from './application/use-cases/softDeleteCharacter.js';
import { SoftDeleteCommentUseCase } from './application/use-cases/softDeleteComment.js';
import { ToggleFavoriteUseCase } from './application/use-cases/toggleFavorite.js';
import { redisCache } from './cache/redisClient.js';
import { startCharacterSyncCron } from './cron/characterSyncCron.js';
import { CharacterModel, CommentModel, FavoriteModel, initDatabase } from './db/sequelize.js';
import { schema, createRoot } from './graphql/schema.js';
import { requestLogger } from './middleware/requestLogger.js';
import { graphqlSwaggerDocument, renderSwaggerUiHtml } from './docs/swagger.js';
import { env } from './config/env.js';
import { CharacterRepository } from './repositories/characterRepository.js';
import { CommentRepository } from './repositories/commentRepository.js';
import { FavoriteRepository } from './repositories/favoriteRepository.js';
import { publicCharacterSource } from './services/characterBootstrapService.js';

export async function createApp() {
  await initDatabase();
  await redisCache.connect();

  const repository = new CharacterRepository(CharacterModel);
  const commentRepository = new CommentRepository(CommentModel, CharacterModel);
  const favoriteRepository = new FavoriteRepository(FavoriteModel, CharacterModel);
  await startCharacterSyncCron(repository);

  const searchCharacters = new SearchCharactersUseCase(repository, redisCache, publicCharacterSource);
  const searchDeletedCharacters = new SearchDeletedCharactersUseCase(repository, redisCache);
  const getCharacterById = new GetCharacterByIdUseCase(repository, redisCache, publicCharacterSource);
  const softDeleteCharacter = new SoftDeleteCharacterUseCase(repository, redisCache, favoriteRepository);
  const restoreCharacter = new RestoreCharacterUseCase(repository, redisCache);
  const getFavoriteCharacterIds = new GetFavoriteCharacterIdsUseCase(favoriteRepository, redisCache);
  const toggleFavorite = new ToggleFavoriteUseCase(favoriteRepository, redisCache);
  const getCharacterComments = new GetCharacterCommentsUseCase(commentRepository, redisCache);
  const addComment = new AddCommentUseCase(commentRepository, redisCache);
  const softDeleteComment = new SoftDeleteCommentUseCase(commentRepository, redisCache);
  const app = express();
  const allowedOrigins = new Set(env.corsOrigins);
  const corsOptions: CorsOptions = {
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
  };
  const apiLimiter = rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMaxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' },
  });

  app.disable('x-powered-by');
  app.use(cors(corsOptions));
  app.use(express.json({ limit: env.requestBodyLimit }));
  app.use(requestLogger);
  app.use(apiLimiter);

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.get('/swagger.json', (_request, response) => {
    response.json(graphqlSwaggerDocument);
  });

  app.get(['/swagger', '/api-docs'], (_request, response) => {
    response.type('html').send(renderSwaggerUiHtml('/swagger.json'));
  });

  app.all(
    '/graphql',
    createHandler({
      schema,
      rootValue: createRoot(
        searchCharacters,
        searchDeletedCharacters,
        getCharacterById,
        softDeleteCharacter,
        restoreCharacter,
        getFavoriteCharacterIds,
        toggleFavorite,
        getCharacterComments,
        addComment,
        softDeleteComment,
      ),
    }),
  );

  return app;
}