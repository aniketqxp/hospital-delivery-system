import { useState, useEffect } from 'react';
import { DeliveryRecord } from '@shared/types';
import { getDeliveriesPage } from '../services/api';

const PAGE_SIZE = 100;

export const useDeliveries = () => {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const { records, hasMore: more } = await getDeliveriesPage(0, PAGE_SIZE);
      setDeliveries(records);
      setHasMore(more);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      setError(null);
      const offset = deliveries.length;
      const { records, hasMore: more } = await getDeliveriesPage(offset, PAGE_SIZE);
      setDeliveries(prev => [...prev, ...records]);
      setHasMore(more);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more records');
    } finally {
      setLoadingMore(false);
    }
  };

  // Optimistic local removal — used after a confirmed delete so we don't lose
  // the user's loaded pagination state by refetching from offset 0.
  const removeFromCache = (id: string) => {
    setDeliveries(prev => prev.filter(r => r.id !== id));
  };

  useEffect(() => { refetch(); }, []);

  return { deliveries, loading, loadingMore, hasMore, error, refetch, loadMore, removeFromCache };
};
