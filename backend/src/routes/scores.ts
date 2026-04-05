import { Router } from 'express';
import type { ScoresController } from '../controllers/scores.controller.js';
import { scoreSubmissionLimiter } from '../middleware/rate-limiter.js';

export function createScoreRoutes(controller: ScoresController): Router {
  const router = Router();

  router.post('/', scoreSubmissionLimiter, controller.createScore);
  router.get('/', controller.getScores);
  router.get('/stats', controller.getStats);

  return router;
}
