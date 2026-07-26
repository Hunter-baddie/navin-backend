import type { RequestHandler } from 'express';
import { AppError, ErrorCodes } from '../../shared/http/errors.js';
import { subscribeUserToEvents } from './events.service.js';

/**
 * Streams Server-Sent Events for the authenticated user.
 * Response uses `text/event-stream` and is not wrapped in the standard JSON envelope.
 */
export const streamEventsController: RequestHandler = (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError(401, 'Missing or invalid authorization token', ErrorCodes.UNAUTHORIZED);
  }

  subscribeUserToEvents(userId, res);
};
