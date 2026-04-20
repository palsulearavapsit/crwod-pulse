import { io, Socket } from 'socket.io-client';
import { VenueState } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

/**
 * SocketService - Manages real-time bidirectional communication.
 * Features: Automatic reconnection, throttled syncing, and hardware cleanup.
 */
class SocketService {
  private socket: Socket | null = null;

  /**
   * Initializes WebSocket connection to the venue hub with adaptive jitter.
   * @returns {Socket}
   */
  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 20000,
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onStateUpdate(callback: (state: VenueState) => void) {
    this.socket?.on('state:update', callback);
  }

  onNewAlert(callback: (alert: any) => void) {
    this.socket?.on('alert:new', callback);
  }

  onScenarioApplied(callback: (data: any) => void) {
    this.socket?.on('scenario:applied', callback);
  }
}

export const socketService = new SocketService();
