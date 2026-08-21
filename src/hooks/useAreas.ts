/**
 * useAreas Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { Area } from '../types';
import { areaService } from '../services/areaService';

export function useAreas() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);

  const fetchAreas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await areaService.getAllAreas();
      setAreas(res);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load areas'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  return { areas, loading, error, refetch: fetchAreas };
}
