import { Router } from 'express';
import type { ScoresController } from '../controllers/scores.controller.js';
import { createScoreRoutes } from './scores.js';

export function createRoutes(scoresController: ScoresController): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  router.use('/scores', createScoreRoutes(scoresController));

  return router;
}
