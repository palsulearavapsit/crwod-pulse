import { render, screen, act } from '@testing-library/react';
import { SocketProvider, useSocket } from '../context/SocketContext';
import { socketService } from '../services/socket';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

// Mock the socket service
vi.mock('../services/socket', () => ({
  socketService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
}));

const TestComponent = () => {
  const { connected } = useSocket();
  return <div data-testid="connection-status">{connected ? 'Connected' : 'Disconnected'}</div>;
};

describe('SocketContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children and provides socket state', () => {
    const mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
      connected: false,
    };
    (socketService.connect as any).mockReturnValue(mockSocket);

    render(
      <SocketProvider>
        <TestComponent />
      </SocketProvider>
    );

    expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');
  });

  it('updates connection state on socket events', async () => {
    let connectCallback: any;
    const mockSocket = {
      on: vi.fn((event, cb) => {
        if (event === 'connect') connectCallback = cb;
      }),
      off: vi.fn(),
      connected: false,
    };
    (socketService.connect as any).mockReturnValue(mockSocket);

    render(
      <SocketProvider>
        <TestComponent />
      </SocketProvider>
    );

    await act(async () => {
      connectCallback();
    });

    expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
  });

  it('disconnects on unmount', () => {
    const mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
      connected: false,
    };
    (socketService.connect as any).mockReturnValue(mockSocket);

    const { unmount } = render(
      <SocketProvider>
        <TestComponent />
      </SocketProvider>
    );

    unmount();
    expect(socketService.disconnect).toHaveBeenCalled();
  });
});
