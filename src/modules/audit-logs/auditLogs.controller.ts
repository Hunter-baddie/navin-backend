import type { Request, Response } from 'express';
import { sendResponse } from '../../shared/http/sendResponse.js';
import type { ActivityQuery, AuditLogsQuery } from './auditLogs.validation.js';
import { getActivityService, getAuditLogsService } from './auditLogs.service.js';

/**
 * GET /api/activity
 * Returns a paginated activity feed accessible to ADMIN, MANAGER, and VIEWER roles.
 * Pagination is before-based: pass `before` as an ISO 8601 date string to fetch
 * events older than that timestamp.
 */
export const getActivity = async (req: Request, res: Response) => {
  const query = req.query as unknown as ActivityQuery;

  const result = await getActivityService({
    before: query.before,
    limit: query.limit ?? 20,
    userId: query.userId,
    action: query.action,
    resource: query.resource,
  });

  sendResponse(res, 200, true, 'Activity retrieved', result.data, {
    limit: query.limit ?? 20,
    total: result.total,
    hasMore: result.hasMore,
    before: result.before,
  });
};

/**
 * GET /api/audit-logs  (legacy — ADMIN / SUPER_ADMIN only)
 * Retained for backward compatibility. Prefer /api/activity for new integrations.
 */
export const getAuditLogs = async (req: Request, res: Response) => {
  const query = req.query as unknown as AuditLogsQuery;

  const result = await getAuditLogsService({
    cursor: query.cursor,
    limit: query.limit ?? 20,
    userId: query.userId,
    action: query.action,
    resource: query.resource,
    from: query.from,
    to: query.to,
  });

  sendResponse(res, 200, true, 'Audit logs retrieved', result.data, {
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
    total: result.total,
  });
};
