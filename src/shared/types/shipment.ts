import { ShipmentStatus } from '../constants/index.js';

export { ShipmentStatus };

export interface IMilestone {
  name: string;
  timestamp: Date;
  description?: string;
  userId?: string;
  walletAddress?: string;
}

export interface IDeliveryProof {
  url: string;
  recipientSignatureName: string;
  uploadedAt: Date;
}

export type DisputeType = "WRONG_GOODS" | "DAMAGED" | "NOT_DELIVERED" | "PAYMENT_DISAGREEMENT" | "OTHER";
export type DisputeStatus = "PENDING" | "ESCROWED" | "RELEASED" | "DISPUTED" | "FAILED";

export interface IDispute {
  referenceNumber: string;
  status: DisputeStatus;
  type: DisputeType;
  description: string;
  evidenceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IShipment {
  _id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  enterpriseId: string;
  logisticsId: string;
  status: ShipmentStatus;
  milestones: IMilestone[];
  offChainMetadata?: Record<string, unknown>;
  stellarTokenId?: string;
  stellarTxHash?: string;
  deliveryProof?: IDeliveryProof;
  priority?: "URGENT" | "STANDARD" | "ECONOMY";
  expectedDelivery?: Date;
  disputes: IDispute[];
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
