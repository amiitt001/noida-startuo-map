/**
 * useJobs Hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Job, JobFilterState } from '../types';
import { jobService } from '../services/jobService';

export function useJobs(filters?: Partial<JobFilterState>) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  const filterKey = JSON.stringify(filters);
  const requestIdRef = useRef(0);

  const fetchJobs = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const res = await jobService.filterJobs(filters || {});
      if (currentRequestId === requestIdRef.current) {
        setJobs(res);
      }
    } catch (err) {
      if (currentRequestId === requestIdRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to load jobs'));
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [filterKey]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, refetch: fetchJobs };
}
