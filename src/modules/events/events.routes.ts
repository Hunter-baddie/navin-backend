import { Router } from 'express';
import { asyncHandler } from '../../shared/http/asyncHandler.js';
import { requireSseAuth } from '../../shared/middleware/requireSseAuth.js';
import { streamEventsController } from './events.controller.js';

export const eventsRouter = Router();

eventsRouter.get('/', requireSseAuth, asyncHandler(streamEventsController));
