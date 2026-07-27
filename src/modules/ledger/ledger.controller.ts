import type { Request, Response } from 'express';
import * as ledgerService from './ledger.service.js';
import type { GetLedgerBlocksQuery } from './ledger.validation.js';
import { AppError, ErrorCodes } from '../../shared/http/errors.js';

export const getLedgerBlocks = async (req: Request, res: Response) => {
  const query = req.query as unknown as GetLedgerBlocksQuery;
  const { shipmentId, milestoneEvent, limit = 20, cursor } = query;
  const result = await ledgerService.getLedgerBlocksService({
    shipmentId,
    milestoneEvent,
    limit: Number(limit),
    cursor,
  });

  if (result.data.length === 0) {
    throw new AppError(404, 'No ledger blocks found', ErrorCodes.LEDGER_BLOCK_NOT_FOUND);
  }

  return res.status(200).json({
    data: result.data,
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
    total: result.total,
  });
};

export const getLedgerBlockById = async (req: Request, res: Response) => {
  const block = await ledgerService.getLedgerBlockByIdService(req.params.id);
  return res.status(200).json({ data: block });
};
