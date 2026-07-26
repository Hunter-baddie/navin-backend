import { ShipmentStatus } from './shipments.model.js';
import { Request, Response } from 'express';
import {
  getShipmentsService,
  getShipmentByIdService,
  getShipmentTimelineService,
  createShipmentService,
  patchShipmentService,
  updateShipmentStatusService,
  uploadShipmentProofService,
  createDisputeService,
  deleteShipmentService,
  getShipmentEtaService,
  exportShipmentsService,
  shipmentsToCSV,
  uploadShipmentDocumentService,
  uploadShipmentPhotoService,
  DOCUMENT_UPLOAD_CONSTRAINTS,
  PHOTO_UPLOAD_CONSTRAINTS,
} from './shipments.service.js';
import { sendResponse } from '../../shared/http/sendResponse.js';
import type {
  GetShipmentsQuery,
  ExportShipmentsQuery,
  ShipmentTimelineQuery,
} from './shipments.validation.js';
import { AppError, ErrorCodes } from '../../shared/http/errors.js';

export const getShipments = async (req: Request, res: Response) => {
  const query = req.query as unknown as GetShipmentsQuery;
  const {
    status,
    priority,
    page = 1,
    limit = 20,
    origin,
    destination,
    trackingNumber,
    q,
    from,
    to,
    sortBy,
    sortOrder,
  } = query;
  // Build explicit filters object to avoid unvalidated query parameters
  const filters: Record<string, unknown> = {};
  if (req.user?.organizationId) {
    filters.organizationId = req.user.organizationId;
  }
  const {
    data,
    page: currentPage,
    limit: currentLimit,
    total,
  } = await getShipmentsService({
    status,
    page: Number(page),
    limit: Number(limit),
    origin,
    destination,
    trackingNumber,
    q,
    from,
    to,
    priority,
    sortBy,
    sortOrder,
    filters,
  });

  sendResponse(res, 200, true, 'Shipments retrieved', data, {
    page: currentPage,
    limit: currentLimit,
    total,
  });
};

export const getShipmentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const shipment = await getShipmentByIdService(id, {
    organizationId: req.user?.organizationId,
    role: req.user?.role,
  });
  sendResponse(res, 200, true, 'Shipment retrieved', shipment);
};

export const getShipmentTimeline = async (req: Request, res: Response) => {
  const { id } = req.params;
  const query = req.query as unknown as ShipmentTimelineQuery;
  const { cursor, limit = 20 } = query;
  const { data, nextCursor, hasMore } = await getShipmentTimelineService(id, {
    cursor,
    limit: Number(limit),
    organizationId: req.user?.organizationId,
    role: req.user?.role,
  });
  sendResponse(res, 200, true, 'Shipment timeline retrieved', data, { nextCursor, hasMore });
};

export const createShipment = async (req: Request, res: Response) => {
  const shipment = await createShipmentService(req.body);
  sendResponse(res, 201, true, 'Shipment created', shipment);
};

export const patchShipment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { offChainMetadata } = req.body;
  const shipment = await patchShipmentService(id, offChainMetadata);
  if (!shipment) {
    sendResponse(res, 404, false, 'Shipment not found', null);
    return;
  }
  sendResponse(res, 200, true, 'Shipment updated', shipment);
};

export const patchShipmentStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || typeof status !== 'string') {
    sendResponse(res, 400, false, 'Missing status', null);
    return;
  }

  if (!Object.values(ShipmentStatus).includes(status as ShipmentStatus)) {
    sendResponse(res, 400, false, 'Invalid status value', null);
    return;
  }

  const user = req.user;

  const updated = await updateShipmentStatusService(id, status as ShipmentStatus, {
    userId: user?.userId,
  });
  if (!updated) {
    sendResponse(res, 404, false, 'Shipment not found', null);
    return;
  }
  sendResponse(res, 200, true, 'Shipment status updated', updated);
};

export const uploadShipmentProof = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { recipientSignatureName, notes } = req.body as {
    recipientSignatureName?: string;
    notes?: string;
  };
  const file = req.file;

  if (!file) {
    throw new AppError(400, 'No file uploaded', ErrorCodes.BAD_REQUEST);
  }

  const shipment = await uploadShipmentProofService(id, file, {
    recipientSignatureName,
    notes,
  });

  sendResponse(res, 200, true, 'Proof uploaded', shipment);
};

type DocumentBody = {
  type:
    | 'BILL_OF_LADING'
    | 'CUSTOMS_DECLARATION'
    | 'INSURANCE_CERTIFICATE'
    | 'PACKING_LIST'
    | 'INVOICE'
    | 'OTHER';
};

export const uploadShipmentDocument = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type } = req.body as DocumentBody;
  const file = req.file;

  if (!file) {
    throw new AppError(400, 'No file uploaded', ErrorCodes.BAD_REQUEST);
  }

  if (!DOCUMENT_UPLOAD_CONSTRAINTS.mimeTypes.includes(file.mimetype)) {
    throw new AppError(
      415,
      `Invalid MIME type. Allowed: ${DOCUMENT_UPLOAD_CONSTRAINTS.mimeTypes.join(', ')}`,
      ErrorCodes.INVALID_MIME_TYPE
    );
  }

  if (file.size > DOCUMENT_UPLOAD_CONSTRAINTS.maxSize) {
    throw new AppError(
      413,
      `File too large. Maximum size is ${DOCUMENT_UPLOAD_CONSTRAINTS.maxSize / (1024 * 1024)}MB`,
      ErrorCodes.FILE_TOO_LARGE
    );
  }

  const document = await uploadShipmentDocumentService(id, file, type, req.user?.userId);
  sendResponse(res, 201, true, 'Document uploaded', document);
};

export const uploadShipmentPhoto = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { caption } = req.body as { caption?: string };
  const file = req.file;

  if (!file) {
    throw new AppError(400, 'No file uploaded', ErrorCodes.BAD_REQUEST);
  }

  if (!PHOTO_UPLOAD_CONSTRAINTS.mimeTypes.includes(file.mimetype)) {
    throw new AppError(
      415,
      `Invalid MIME type. Allowed: ${PHOTO_UPLOAD_CONSTRAINTS.mimeTypes.join(', ')}`,
      ErrorCodes.INVALID_MIME_TYPE
    );
  }

  if (file.size > PHOTO_UPLOAD_CONSTRAINTS.maxSize) {
    throw new AppError(
      413,
      `File too large. Maximum size is ${PHOTO_UPLOAD_CONSTRAINTS.maxSize / (1024 * 1024)}MB`,
      ErrorCodes.FILE_TOO_LARGE
    );
  }

  const photo = await uploadShipmentPhotoService(id, file, caption, req.user?.userId);
  sendResponse(res, 201, true, 'Photo uploaded', photo);
};

export const createDispute = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type, description } = req.body as { type: string; description: string };
  const file = req.file;

  const dispute = await createDisputeService(id, file, { type, description });
  sendResponse(res, 201, true, 'Dispute created', dispute);
};

export const exportShipments = async (req: Request, res: Response) => {
  const query = req.query as unknown as ExportShipmentsQuery;
  const { format = 'json', status, origin, destination, startDate, endDate } = query;
  const organizationId = req.user?.organizationId;

  const shipments = await exportShipmentsService({
    organizationId,
    status,
    origin,
    destination,
    startDate,
    endDate,
  });

  const dateStr = new Date().toISOString().slice(0, 10);

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="shipments-export-${dateStr}.csv"`);
    res.status(200).send(shipmentsToCSV(shipments));
    return;
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="shipments-export-${dateStr}.json"`);
  res.status(200).json(shipments);
};

export const deleteShipment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const shipment = await deleteShipmentService(id);

  if (!shipment) {
    sendResponse(res, 404, false, 'Shipment not found', null);
    return;
  }

  sendResponse(res, 200, true, 'Shipment deleted successfully', shipment);
};

export const getShipmentEta = async (req: Request, res: Response) => {
  const { id } = req.params;
  const eta = await getShipmentEtaService(id);
  sendResponse(res, 200, true, 'Shipment ETA retrieved', eta);
};
