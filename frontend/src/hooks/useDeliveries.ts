import { useState, useEffect } from 'react';
import { DeliveryRecord } from '@shared/types';
import { getAllDeliveries } from '../services/api';

export const useDeliveries = () => {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      setDeliveries(await getAllDeliveries());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeliveries(); }, []);

  return { deliveries, loading, error, refetch: fetchDeliveries };
};
