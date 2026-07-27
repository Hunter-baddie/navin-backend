import type { Response } from 'express';
import { registerSseClient } from '../../infra/sse/sseHub.js';

/**
 * Opens a user-scoped SSE stream. The connection stays open until the client disconnects.
 */
export function subscribeUserToEvents(userId: string, res: Response): void {
  registerSseClient(userId, res);
}
