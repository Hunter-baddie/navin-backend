import type { RequestHandler } from 'express';

import type { PollQuery } from './events.validation.js';
import { pollEventsSince } from './events.service.js';
import { sendResponse } from '../../shared/http/sendResponse.js';

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
