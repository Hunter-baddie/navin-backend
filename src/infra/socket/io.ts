import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

import { config } from '../../config/index.js';
import { socketAuth } from '../../shared/middleware/socketAuth.js';
import {
  joinShipmentRoom,
  leaveAllShipmentRoomsOnDisconnect,
  leaveShipmentRoom,
  shipmentRoomName,
} from './shipmentRooms.js';
import type {
  TelemetryUpdatePayload,
  AnomalyAlertPayload,
  StatusUpdatePayload,
  SettlementStatusPayload,
  NotificationPayload,
} from '../../shared/types/socketEvents.js';
import { logger } from '../../shared/logger/logger.js';

let io: Server | null = null;

/** Tracks connected sockets: socket.id → userId */
const activeUsers = new Map<string, string>();

export function getActiveUsers(): ReadonlyMap<string, string> {
  return activeUsers;
}

export function initSocketIO(httpServer: HttpServer): Server {
  const allowedOrigins = config.allowedOrigins;

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : false,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on('connection', socket => {
    if (socket.user?.userId) {
      activeUsers.set(socket.id, socket.user.userId);
    }

    leaveAllShipmentRoomsOnDisconnect(socket);

    socket.on('disconnecting', reason => {
      logger.info(
        {
          socketId: socket.id,
          reason,
          rooms: [...socket.rooms],
        },
        `[Socket] Disconnecting: ${socket.id} | Reason: ${reason} | Rooms: ${[...socket.rooms].join(', ')}`
      );
    });

    socket.on('disconnect', reason => {
      logger.info({ socketId: socket.id, reason }, 'Socket client disconnected');
      activeUsers.delete(socket.id);
    });

    socket.on('join_shipment', async (shipmentId: string) => {
      await joinShipmentRoom(socket, shipmentId);
    });

    socket.on('leave_shipment', async (shipmentId: string) => {
      await leaveShipmentRoom(socket, shipmentId);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

export function closeSocketIO(): Promise<void> {
  return new Promise(resolve => {
    if (io) {
      io.close(() => resolve());
      io = null;
    } else {
      resolve();
    }
  });
}

/**
 * Emits `anomaly:detected` to the shipment room.
 * @param {string} shipmentId - Target shipment room.
 * @param {AnomalyAlertPayload} anomaly - Anomaly event payload.
 */
export function emitAnomalyDetected(shipmentId: string, anomaly: AnomalyAlertPayload): void {
  getIO().to(shipmentRoomName(shipmentId)).emit('anomaly:detected', anomaly);
}

/**
 * Emits `location:update` to the shipment room.
 * @param {string} shipmentId - Target shipment room.
 * @param {TelemetryUpdatePayload} telemetry - Telemetry/location payload.
 */
export function emitTelemetryUpdate(shipmentId: string, telemetry: TelemetryUpdatePayload): void {
  getIO().to(shipmentRoomName(shipmentId)).emit('location:update', telemetry);
}

/**
 * Emits `shipment:status` to the shipment room.
 * @param {string} shipmentId - Target shipment room.
 * @param {StatusUpdatePayload} statusData - Status change payload.
 */
export function emitStatusUpdate(shipmentId: string, statusData: StatusUpdatePayload): void {
  getIO().to(shipmentRoomName(shipmentId)).emit('shipment:status', statusData);
}

/**
 * Emits `settlement:status` to the shipment room.
 * Replaces the former `payment_status_changed` event.
 * @param {string} shipmentId - Target shipment room.
 * @param {SettlementStatusPayload} settlementData - Settlement status payload including optional txHash.
 */
export function emitPaymentStatusChange(
  shipmentId: string,
  settlementData: SettlementStatusPayload,
): void {
  getIO().to(shipmentRoomName(shipmentId)).emit('settlement:status', settlementData);
}

/**
 * Emits `notification:new` to a user-scoped room (userId or organizationId).
 * The caller is responsible for ensuring the recipient is in the correct room.
 * @param {string} recipientId - userId or organizationId used as room key.
 * @param {NotificationPayload} notification - Notification payload.
 */
export function emitNotificationNew(recipientId: string, notification: NotificationPayload): void {
  getIO().to(recipientId).emit('notification:new', notification);
}
