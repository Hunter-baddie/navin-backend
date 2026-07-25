import { Request, Response } from 'express';
import { sendResponse } from '../../shared/http/sendResponse.js';
import { AppError, ErrorCodes } from '../../shared/http/errors.js';
import type { CreateTemplateInput, UpdateTemplateInput } from './shipment-templates.validation.js';
import {
  createTemplateService,
  getTemplatesService,
  getTemplateByIdService,
  updateTemplateService,
  deleteTemplateService,
} from './shipment-templates.service.js';

export const getTemplates = async (req: Request, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) {
    throw new AppError(403, 'Organization context required', ErrorCodes.FORBIDDEN);
  }
  const templates = await getTemplatesService(organizationId);
  sendResponse(res, 200, true, 'Templates retrieved', templates);
};

export const getTemplateById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user?.organizationId;
  if (!organizationId) {
    throw new AppError(403, 'Organization context required', ErrorCodes.FORBIDDEN);
  }
  const template = await getTemplateByIdService(id, organizationId);
  sendResponse(res, 200, true, 'Template retrieved', template);
};

export const createTemplate = async (req: Request, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) {
    throw new AppError(403, 'Organization context required', ErrorCodes.FORBIDDEN);
  }
  const body = req.body as CreateTemplateInput;
  const template = await createTemplateService(organizationId, body);
  sendResponse(res, 201, true, 'Template created', template);
};

export const updateTemplate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user?.organizationId;
  if (!organizationId) {
    throw new AppError(403, 'Organization context required', ErrorCodes.FORBIDDEN);
  }
  const body = req.body as UpdateTemplateInput;
  const template = await updateTemplateService(id, organizationId, body);
  sendResponse(res, 200, true, 'Template updated', template);
};

export const deleteTemplate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user?.organizationId;
  if (!organizationId) {
    throw new AppError(403, 'Organization context required', ErrorCodes.FORBIDDEN);
  }
  const template = await deleteTemplateService(id, organizationId);
  sendResponse(res, 200, true, 'Template deleted', template);
};
