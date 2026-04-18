import { io, Socket } from 'socket.io-client';
import { VenueState } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io(SOCKET_URL);
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
