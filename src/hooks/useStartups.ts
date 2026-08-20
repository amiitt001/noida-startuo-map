import { useState, useEffect, useMemo } from 'react';
import { Startup, StartupFilterState } from '../types';
import { startupService } from '../services/startupService';

export function useStartups(filters?: Partial<StartupFilterState>, page = 1, pageSize = 12) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    startups: Startup[];
    totalCount: number;
    totalPages: number;
  }>({ startups: [], totalCount: 0, totalPages: 1 });

  const filterKey = JSON.stringify({ filters, page, pageSize });

  useEffect(() => {
    setLoading(true);
    // Mimic fast realistic API latency
    const timer = setTimeout(() => {
      const res = startupService.filterStartups(filters || {}, page, pageSize);
      setData(res);
      setLoading(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [filterKey]);

  const allStartups = useMemo(() => startupService.getAllStartups(), [data.totalCount]);

  return {
    startups: data.startups,
    allStartups,
    totalCount: data.totalCount,
    totalPages: data.totalPages,
    loading,
  };
}
