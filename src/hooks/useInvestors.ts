import { useState, useEffect } from 'react';
import { Investor } from '../types';
import { investorService } from '../services/investorService';

export function useInvestors(query?: string, type?: string, stage?: string) {
  const [loading, setLoading] = useState(false);
  const [investors, setInvestors] = useState<Investor[]>([]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const res = investorService.filterInvestors(query, type, stage);
      setInvestors(res);
      setLoading(false);
    }, 40);
    return () => clearTimeout(timer);
  }, [query, type, stage]);

  return { investors, loading };
}
