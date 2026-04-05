import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { SqliteScoreRepository } from './repositories/sqlite.repository.js';
import { ScoresService } from './services/scores.service.js';
import { ScoresController } from './controllers/scores.controller.js';
import { createRoutes } from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp(dbPath?: string) {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: '1kb' }));

  const repository = new SqliteScoreRepository(dbPath);
  const service = new ScoresService(repository);
  const controller = new ScoresController(service);

  app.use('/api', createRoutes(controller));
  app.use(errorHandler);

  return { app, repository };
}
