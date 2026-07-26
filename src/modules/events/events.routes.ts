import { Router } from 'express';

import { requireAuth } from '../../shared/middleware/requireAuth.js';
import { validateRequest } from '../../shared/validation/validate.js';
import { asyncHandler } from '../../shared/http/asyncHandler.js';

import { PollQuerySchema } from './events.validation.js';
import { pollEventsController } from './events.controller.js';

export const eventsRouter = Router();

eventsRouter.get(
  '/poll',
  requireAuth,
  validateRequest({ query: PollQuerySchema }),
  asyncHandler(pollEventsController)
);
