/**
 * useStartups Hook
 *
 * Async hook connecting component state to startupService API calls.
 * Includes loading, error, refetch, and race-condition cancellation.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Startup, StartupFilterState } from '../types';
import { startupService } from '../services/startupService';

export function useStartups(filters?: Partial<StartupFilterState>, page = 1, pageSize = 12) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [allStartups, setAllStartups] = useState<Startup[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const filterKey = JSON.stringify({ filters, page, pageSize });
  const requestIdRef = useRef(0);

  const fetchStartups = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const [filterRes, allRes] = await Promise.all([
        startupService.filterStartups(filters || {}, page, pageSize),
        startupService.getAllStartups().catch(() => []),
      ]);

      // Avoid race conditions if a newer request was dispatched
      if (currentRequestId !== requestIdRef.current) return;

      setStartups(filterRes.startups);
      setTotalCount(filterRes.totalCount);
      setTotalPages(filterRes.totalPages);
      setAllStartups(allRes.length > 0 ? allRes : filterRes.startups);
    } catch (err) {
      if (currentRequestId === requestIdRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to load startups'));
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [filterKey]);

  useEffect(() => {
    fetchStartups();
  }, [fetchStartups]);

  return {
    startups,
    allStartups,
    totalCount,
    totalPages,
    loading,
    error,
    refetch: fetchStartups,
  };
}
