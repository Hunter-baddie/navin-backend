import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { AppError } from '../src/shared/http/errors.js';

const getLedgerBlocksServiceMock = jest.fn();

await jest.unstable_mockModule('../src/modules/ledger/ledger.service.js', () => ({
  getLedgerBlocksService: getLedgerBlocksServiceMock,
  getLedgerBlockByIdService: jest.fn(),
}));

const { getLedgerBlocks } = await import('../src/modules/ledger/ledger.controller.js');

describe('GET /api/ledger/blocks controller', () => {
  beforeEach(() => {
    getLedgerBlocksServiceMock.mockReset();
  });

  it('returns 200 with raw shape {data,nextCursor,hasMore,total}', async () => {
    getLedgerBlocksServiceMock.mockResolvedValue({
      data: [
        {
          _id: 'lb1',
          shipmentId: '507f1f77bcf86cd799439011',
          milestoneEvent: 'DELIVERED',
          blockNumber: 101,
          ledger: 101,
          verified: true,
        },
      ],
      nextCursor: 'lb1',
      hasMore: true,
      total: 2,
    });

    const req = {
      query: { limit: '1' },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await getLedgerBlocks(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: expect.any(Array),
      nextCursor: 'lb1',
      hasMore: true,
      total: 2,
    });
  });

  it('passes milestoneEvent filter to service', async () => {
    getLedgerBlocksServiceMock.mockResolvedValue({
      data: [{ _id: 'lb1', milestoneEvent: 'SETTLEMENT_COMPLETED' }],
      nextCursor: null,
      hasMore: false,
      total: 1,
    });

    const req = {
      query: { milestoneEvent: 'SETTLEMENT_COMPLETED', limit: '10' },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await getLedgerBlocks(req, res);

    expect(getLedgerBlocksServiceMock).toHaveBeenCalledWith(
      expect.objectContaining({ milestoneEvent: 'SETTLEMENT_COMPLETED' }),
    );
  });

  it('returns 200 with empty array when no ledger blocks match filters', async () => {
    getLedgerBlocksServiceMock.mockResolvedValue({
      data: [],
      nextCursor: null,
      hasMore: false,
      total: 0,
    });

    const req = { query: {} } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await getLedgerBlocks(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: [],
      nextCursor: null,
      hasMore: false,
      total: 0,
    });
  });
});
