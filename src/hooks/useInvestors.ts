/**
 * useInvestors Hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Investor } from '../types';
import { investorService } from '../services/investorService';

export function useInvestors(query?: string, type?: string, stage?: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [investors, setInvestors] = useState<Investor[]>([]);

  const requestIdRef = useRef(0);

  const fetchInvestors = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const res = await investorService.filterInvestors({ search: query, type, stage });
      if (currentRequestId === requestIdRef.current) {
        setInvestors(res);
      }
    } catch (err) {
      if (currentRequestId === requestIdRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to load investors'));
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [query, type, stage]);

  useEffect(() => {
    fetchInvestors();
  }, [fetchInvestors]);

  return { investors, loading, error, refetch: fetchInvestors };
}
