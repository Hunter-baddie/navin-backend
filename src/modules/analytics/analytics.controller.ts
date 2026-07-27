import type { RequestHandler } from 'express';

import type { PerformanceQuery } from './analytics.validation.js';
import { getAnalyticsPerformance } from './analytics.service.js';
import { sendResponse } from '../../shared/http/sendResponse.js';

/**
 * Returns performance analytics for the requested date range.
 * Requires auth and ADMIN / MANAGER.
 *
 * @param req.query.startDate - Range start (UTC ISO 8601).
 * @param req.query.endDate - Range end (UTC ISO 8601, must be >= startDate).
 * @param req.query.granularity - Optional bucket size: `daily` | `weekly` | `monthly`.
 * @returns HTTP 200 with envelope `{ success, message, data }` containing the performance dashboard.
 * @throws {AppError} 401 ERR_AUTH_INVALID — when JWT auth fails.
 * @throws {AppError} 403 ERR_PERMISSION_DENIED — when the caller lacks ADMIN / MANAGER.
 * @throws {AppError} 400 VALIDATION_ERROR — when query validation fails.
 */
export const getPerformanceController: RequestHandler = async (req, res) => {
  const query = req.query as unknown as PerformanceQuery;
  const dashboard = await getAnalyticsPerformance(query);
  sendResponse(res, 200, true, 'Analytics retrieved', dashboard);
};
