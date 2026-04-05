import type { Request, Response, NextFunction } from 'express';
import type { ScoresService } from '../services/scores.service.js';

export class ScoresController {
  constructor(private service: ScoresService) {}

  createScore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, score, duration, moves } = req.body;
      const entry = this.service.createScore({ name, score, duration, moves });
      res.status(201).json(entry);
    } catch (error) {
      next(error);
    }
  };

  getScores = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const page = parseInt(req.query.page as string) || 1;
      const result = this.service.getTopScores(limit, page);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = this.service.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };
}
