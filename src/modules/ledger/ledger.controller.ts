import type { Request, Response } from 'express';
import * as ledgerService from './ledger.service.js';
import { sendResponse } from '../../shared/http/sendResponse.js';
import type { GetLedgerBlocksQuery } from './ledger.validation.js';

export const getLedgerBlocks = async (req: Request, res: Response) => {
  const query = req.query as unknown as GetLedgerBlocksQuery;
  const { shipmentId, eventType, limit = 20, cursor } = query;
  const result = await ledgerService.getLedgerBlocksService({
    shipmentId,
    eventType,
    limit: Number(limit),
    cursor,
  });
  sendResponse(res, 200, true, 'Ledger blocks retrieved', result.data, {
    total: result.total,
    hasMore: result.hasMore,
    nextCursor: result.nextCursor,
  });
};

export const getLedgerBlockById = async (req: Request, res: Response) => {
  const block = await ledgerService.getLedgerBlockByIdService(req.params.id);
  sendResponse(res, 200, true, 'Ledger block retrieved', block);
};
