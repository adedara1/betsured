import { useEffect, useState, useCallback } from 'react';
import { wsService } from '../services/websocket';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
      setReconnectAttempts(0);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleError = (error: any) => {
      setError(error.message || 'WebSocket error');
    };

    wsService.on('connect', handleConnect);
    wsService.on('disconnect', handleDisconnect);
    wsService.on('error', handleError);

    return () => {
      wsService.off('connect', handleConnect);
      wsService.off('disconnect', handleDisconnect);
      wsService.off('error', handleError);
    };
  }, []);

  const connect = useCallback(async () => {
    try {
      await wsService.connect();
    } catch (error: any) {
      setError(error.message);
      setReconnectAttempts((prev) => prev + 1);
    }
  }, []);

  const disconnect = useCallback(() => {
    wsService.disconnect();
  }, []);

  return {
    isConnected,
    reconnectAttempts,
    error,
    connect,
    disconnect,
  };
}
