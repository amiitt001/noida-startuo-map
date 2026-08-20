import { useState, useEffect } from 'react';
import { Founder, FounderFilterState } from '../types';
import { founderService } from '../services/founderService';

export function useFounders(filters?: Partial<FounderFilterState>) {
  const [loading, setLoading] = useState(false);
  const [founders, setFounders] = useState<Founder[]>([]);

  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const res = founderService.filterFounders(filters || {});
      setFounders(res);
      setLoading(false);
    }, 40);

    return () => clearTimeout(timer);
  }, [filterKey]);

  return { founders, loading };
}
