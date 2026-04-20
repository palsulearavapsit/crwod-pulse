import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { socketService } from '../services/socket';
import { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  emit: (event: string, data: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let mounted = true;
    const s = socketService.connect();
    
    s.on('connect', () => {
      if (mounted) setConnected(true);
    });

    s.on('disconnect', () => {
      if (mounted) setConnected(false);
    });

    setSocket(s);

    return () => {
      mounted = false;
      socketService.disconnect();
    };
  }, []);

  const emit = useCallback((event: string, data: any) => {
    if (socket?.connected) {
      socket.emit(event, data);
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, connected, emit }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

