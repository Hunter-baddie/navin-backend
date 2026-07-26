import { Types } from 'mongoose';
import { LedgerBlock, type ILedgerBlock } from './ledger.model.js';
import { MilestoneEvent } from '../../shared/types/shipment.js';
import { paginateCursor } from '../../shared/utils/pagination.js';

export interface LedgerBlockInput {
  shipmentId: string | Types.ObjectId;
  eventType: MilestoneEvent;
  transactionHash?: string;
  actor?: string;
  metadata?: Record<string, unknown>;
}

export async function createLedgerBlock(input: LedgerBlockInput): Promise<ILedgerBlock> {
  return LedgerBlock.create({
    shipmentId: new Types.ObjectId(input.shipmentId),
    eventType: input.eventType,
    ...(input.transactionHash && { transactionHash: input.transactionHash }),
    ...(input.actor && { actor: input.actor }),
    ...(input.metadata && { metadata: input.metadata }),
  });
}

export interface LedgerBlocksPage {
  data: ILedgerBlock[];
  total: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export async function getLedgerBlocks(filters?: {
  shipmentId?: string;
  eventType?: MilestoneEvent;
  limit?: number;
  cursor?: string;
}): Promise<LedgerBlocksPage> {
  const limit = filters?.limit ?? 20;
  const query: Record<string, unknown> = {};

  if (filters?.shipmentId) {
    query.shipmentId = new Types.ObjectId(filters.shipmentId);
  }

  if (filters?.eventType) {
    query.eventType = filters.eventType;
  }

  if (filters?.cursor) {
    query._id = { $lt: new Types.ObjectId(filters.cursor) };
  }

  const [data, total] = await Promise.all([
    LedgerBlock.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean(),
    LedgerBlock.countDocuments({
      ...(filters?.shipmentId ? { shipmentId: new Types.ObjectId(filters.shipmentId) } : {}),
      ...(filters?.eventType ? { eventType: filters.eventType } : {}),
    }),
  ]);

  return paginateCursor(data, limit);
}

export async function getLedgerBlockById(id: string): Promise<ILedgerBlock | null> {
  return LedgerBlock.findById(id).lean();
}
