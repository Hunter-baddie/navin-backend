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
import { asyncHandler } from '../../shared/http/asyncHandler.js';
import { requireSseAuth } from '../../shared/middleware/requireSseAuth.js';
import { streamEventsController } from './events.controller.js';

export const eventsRouter = Router();

eventsRouter.get('/', requireSseAuth, asyncHandler(streamEventsController));
