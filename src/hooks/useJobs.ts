import { useState, useEffect } from 'react';
import { Job, JobFilterState } from '../types';
import { jobService } from '../services/jobService';

export function useJobs(filters?: Partial<JobFilterState>) {
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);

  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const res = jobService.filterJobs(filters || {});
      setJobs(res);
      setLoading(false);
    }, 40);
    return () => clearTimeout(timer);
  }, [filterKey]);

  return { jobs, loading };
}
