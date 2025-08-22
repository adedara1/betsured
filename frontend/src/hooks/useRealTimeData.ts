import { useEffect, useState } from 'react';
import { wsService } from '../services/websocket';

export function useRealTimeData<T>(event: string, initialValue: T) {
  const [data, setData] = useState<T>(initialValue);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const handleUpdate = (newData: T) => {
      setData(newData);
      setLastUpdate(new Date());
    };

    wsService.on(event, handleUpdate);

    return () => {
      wsService.off(event, handleUpdate);
    };
  }, [event]);

  return { data, lastUpdate };
}

export function useArberUpdates(arberId: string) {
  const [status, setStatus] = useState<string>('Unknown');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const handleStatusUpdate = (data: any) => {
      if (data.id === arberId) {
        setStatus(data.status);
        setLastUpdate(new Date());
      }
    };

    const handleOpportunities = (data: any) => {
      if (data.arberId === arberId) {
        setOpportunities((prev) => [...prev, ...data.opportunities]);
        setLastUpdate(new Date());
      }
    };

    wsService.on('arber_status_updated', handleStatusUpdate);
    wsService.on('opportunities_found', handleOpportunities);

    return () => {
      wsService.off('arber_status_updated', handleStatusUpdate);
      wsService.off('opportunities_found', handleOpportunities);
    };
  }, [arberId]);

  return { status, opportunities, lastUpdate };
}
