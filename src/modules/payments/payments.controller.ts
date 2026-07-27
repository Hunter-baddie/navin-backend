import type { Request, Response } from 'express';
import * as paymentsService from './payments.service.js';
import { getSettlementSummaryService } from './settlements.summary.service.js';
import { sendResponse } from '../../shared/http/sendResponse.js';
import { asyncHandler } from '../../shared/http/asyncHandler.js';

export const createPaymentController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const payment = await paymentsService.createPaymentService({
      ...req.body,
      organizationId: req.user?.organizationId ?? '',
    });
    sendResponse(res, 201, true, 'Payment created successfully', payment);
  }
);

export const getPaymentController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const payment = await paymentsService.getPaymentByIdService(req.params.id);
    sendResponse(res, 200, true, 'Settlement retrieved successfully', payment);
  }
);

export const getPaymentsController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as import('./payments.validation.js').GetPaymentsQuery;
    const result = await paymentsService.getPaymentsService({
      organizationId: req.user?.organizationId ?? '',
      status: query.status,
      shipmentId: query.shipmentId,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      limit: query.limit,
      cursor: query.cursor,
      page: query.page,
    });

    // Build meta based on pagination mode
    const meta: Record<string, unknown> = { total: result.total };

    if (query.page !== undefined) {
      // Offset-based pagination
      meta.page = query.page;
      meta.limit = query.limit;
    } else {
      // Cursor-based pagination
      meta.hasMore = result.hasMore;
      meta.nextCursor = result.nextCursor;
    }

    sendResponse(res, 200, true, 'Payments retrieved successfully', result.data, meta);
  }
);

export const updatePaymentStatusController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const payment = await paymentsService.updatePaymentStatusService(req.params.id, req.body);
    sendResponse(res, 200, true, 'Payment status updated successfully', payment);
  }
);

/**
 * GET /api/settlements/:id — full settlement detail including escrowRelease.
 */
export const getSettlementByIdController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const settlement = await paymentsService.getPaymentByIdService(req.params.id);
    sendResponse(res, 200, true, 'Settlement retrieved successfully', settlement);
  }
);

/**
 * POST /api/settlements/:id/dispute — transition status to DISPUTED.
 * Restricted to ADMIN / MANAGER at route level.
 */
export const disputeSettlementController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const settlement = await paymentsService.disputeSettlementService(req.params.id, req.body);
    sendResponse(res, 200, true, 'Settlement disputed successfully', settlement);
  }
);

/**
 * GET /api/settlements/summary — aggregated totals + sparkline.
 */
export const getSettlementSummaryController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const period = (req.query as Record<string, string>).period ?? 'week';
    const summary = await getSettlementSummaryService(req.user?.organizationId ?? '', period);
    sendResponse(res, 200, true, 'Settlement summary retrieved successfully', summary);
  }
);
