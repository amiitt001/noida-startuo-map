import { Job, JobFilterState } from '../types';
import { SEED_JOBS } from '../data/seedData';
import { storageService } from './storageService';

const CUSTOM_JOBS_KEY = 'noida_atlas_custom_jobs_v1';

export const jobService = {
  getAllJobs(): Job[] {
    const custom = storageService.getItem<Job[]>(CUSTOM_JOBS_KEY, []);
    return [...SEED_JOBS, ...custom];
  },

  getJobById(id: string): Job | undefined {
    const all = this.getAllJobs();
    return all.find(j => j.id === id);
  },

  getJobsByStartup(startupSlugOrId: string): Job[] {
    const all = this.getAllJobs();
    return all.filter(j => j.startupId === startupSlugOrId || j.startupSlug === startupSlugOrId);
  },

  filterJobs(filters: Partial<JobFilterState>): Job[] {
    let result = this.getAllJobs();

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.startupName.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.skills.some(sk => sk.toLowerCase().includes(q))
      );
    }

    if (filters.workMode && filters.workMode !== 'all') {
      result = result.filter(j => j.workMode.toLowerCase() === filters.workMode?.toLowerCase());
    }

    if (filters.isFresher) {
      result = result.filter(j => j.isFresherFriendly);
    }

    if (filters.isInternship) {
      result = result.filter(j => j.isInternship || j.type === 'Internship');
    }

    if (filters.area && filters.area !== 'all') {
      result = result.filter(j => j.areaName.toLowerCase().includes(filters.area?.toLowerCase() || ''));
    }

    return result;
  },

  addJob(job: Job): void {
    const custom = storageService.getItem<Job[]>(CUSTOM_JOBS_KEY, []);
    custom.unshift(job);
    storageService.setItem(CUSTOM_JOBS_KEY, custom);
  }
};
