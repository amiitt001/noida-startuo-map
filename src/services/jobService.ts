/**
 * Job Service
 *
 * Frontend service calling the Express API via apiClient.
 */

import { apiClient } from './apiClient';
import { Job, JobFilterState } from '../types';

export const jobService = {
  async getAllJobs(): Promise<Job[]> {
    const res = await apiClient.get<Job[]>('/api/jobs');
    return res.data;
  },

  async getJobById(id: string): Promise<Job | null> {
    try {
      const res = await apiClient.get<Job>(`/api/jobs/${encodeURIComponent(id)}`);
      return res.data;
    } catch (_err) {
      return null;
    }
  },

  async getJobsByStartup(startupId: string): Promise<Job[]> {
    const res = await apiClient.get<Job[]>(`/api/jobs?startup=${encodeURIComponent(startupId)}`);
    return res.data;
  },

  async filterJobs(filters: Partial<JobFilterState>): Promise<Job[]> {
    const params = new URLSearchParams();
    if (filters.search?.trim()) params.set('search', filters.search.trim());
    if (filters.workMode && filters.workMode !== 'all') params.set('workMode', filters.workMode);
    if (filters.isFresher) params.set('isFresher', 'true');
    if (filters.isInternship) params.set('isInternship', 'true');
    if (filters.area && filters.area !== 'all') params.set('area', filters.area);

    const res = await apiClient.get<Job[]>(`/api/jobs?${params.toString()}`);
    return res.data;
  },

  async addJob(jobData: Omit<Job, 'id'>): Promise<Job> {
    const res = await apiClient.post<Job>('/api/admin/jobs', jobData);
    return res.data;
  },

  async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    const res = await apiClient.patch<Job>(`/api/admin/jobs/${id}`, updates);
    return res.data;
  },

  async deleteJob(id: string): Promise<void> {
    await apiClient.delete(`/api/admin/jobs/${id}`);
  },
};
