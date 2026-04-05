import rateLimit from 'express-rate-limit';
import { config } from '../config.js';

export const scoreSubmissionLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { error: 'Too many score submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
