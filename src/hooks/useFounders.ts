/**
 * useFounders Hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Founder, FounderFilterState } from '../types';
import { founderService } from '../services/founderService';

export function useFounders(filters?: Partial<FounderFilterState>) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [founders, setFounders] = useState<Founder[]>([]);

  const filterKey = JSON.stringify(filters);
  const requestIdRef = useRef(0);

  const fetchFounders = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const res = await founderService.filterFounders(filters || {});
      if (currentRequestId === requestIdRef.current) {
        setFounders(res);
      }
    } catch (err) {
      if (currentRequestId === requestIdRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to load founders'));
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [filterKey]);

  useEffect(() => {
    fetchFounders();
  }, [fetchFounders]);

  return { founders, loading, error, refetch: fetchFounders };
}
