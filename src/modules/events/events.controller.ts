import type { RequestHandler } from 'express';

import type { PollQuery } from './events.validation.js';
import { pollEventsSince, subscribeUserToEvents } from './events.service.js';
import { sendResponse } from '../../shared/http/sendResponse.js';
import { AppError, ErrorCodes } from '../../shared/http/errors.js';

/**
 * GET /api/events/poll
 *
 * Returns RealtimeEvent[] for all events that occurred after the `since`
 * query-string timestamp.  Returns an empty array when no new events exist.
 *
 * The `since` field has already been coerced to a Date by the Zod schema.
 */
export const pollEventsController: RequestHandler = async (req, res) => {
  const { since } = req.query as unknown as PollQuery;
  const events = await pollEventsSince(since);
  sendResponse(res, 200, true, 'Events retrieved', events);
};

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
