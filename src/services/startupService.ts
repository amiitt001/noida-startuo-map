/**
 * Startup Service
 *
 * Frontend service calling the Express API via apiClient.
 */

import { apiClient } from './apiClient';
import { Startup, StartupFilterState, StartupGeoJSONCollection } from '../types';

export const startupService = {
  async getAllStartups(): Promise<Startup[]> {
    const res = await apiClient.get<Startup[]>('/api/startups?limit=100');
    return res.data;
  },

  async getGeoJSON(
    filters?: Partial<StartupFilterState> & { bbox?: string },
    signal?: AbortSignal
  ): Promise<StartupGeoJSONCollection> {
    const params = new URLSearchParams();
    if (filters?.search?.trim()) params.set('search', filters.search.trim());
    if (filters?.sector && filters.sector !== 'all') params.set('sector', filters.sector);
    if (filters?.stage && filters.stage !== 'all') params.set('stage', filters.stage);
    if (filters?.type && filters.type !== 'all') params.set('type', filters.type);
    if (filters?.area && filters.area !== 'all') params.set('area', filters.area);
    if (filters?.hiringOnly) params.set('hiring', 'true');
    if (filters?.verifiedOnly) params.set('verified', 'true');
    if (filters?.bbox) params.set('bbox', filters.bbox);

    const queryString = params.toString();
    const url = `/api/startups/geojson${queryString ? `?${queryString}` : ''}`;
    const res = await apiClient.get<StartupGeoJSONCollection>(url, { signal });
    return res.data;
  },

  async filterStartups(
    filters: Partial<StartupFilterState>,
    page = 1,
    pageSize = 12
  ): Promise<{ startups: Startup[]; totalCount: number; totalPages: number }> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(pageSize));

    if (filters.search?.trim()) params.set('search', filters.search.trim());
    if (filters.sector && filters.sector !== 'all') params.set('sector', filters.sector);
    if (filters.stage && filters.stage !== 'all') params.set('stage', filters.stage);
    if (filters.type && filters.type !== 'all') params.set('type', filters.type);
    if (filters.area && filters.area !== 'all') params.set('area', filters.area);
    if (filters.hiringOnly) params.set('hiring', 'true');
    if (filters.verifiedOnly) params.set('verified', 'true');
    if (filters.sortBy) params.set('sortBy', filters.sortBy);

    const res = await apiClient.get<Startup[]>(`/api/startups?${params.toString()}`);
    return {
      startups: res.data,
      totalCount: res.pagination?.total || res.data.length,
      totalPages: res.pagination?.totalPages || 1,
    };
  },

  async getStartupBySlug(slug: string): Promise<Startup | null> {
    try {
      const res = await apiClient.get<Startup>(`/api/startups/${encodeURIComponent(slug)}`);
      return res.data;
    } catch (_err) {
      return null;
    }
  },

  async getSimilarStartups(slug: string, limit = 3): Promise<Startup[]> {
    try {
      const res = await apiClient.get<Startup[]>(`/api/startups/${encodeURIComponent(slug)}/similar?limit=${limit}`);
      return res.data;
    } catch (_err) {
      return [];
    }
  },

  async createStartup(startupData: Omit<Startup, 'id' | 'slug' | 'jobsCount' | 'viewsCount' | 'createdAt' | 'updatedAt'>): Promise<Startup> {
    const res = await apiClient.post<Startup>('/api/admin/startups', startupData);
    return res.data;
  },

  async updateStartup(id: string, updates: Partial<Startup>): Promise<Startup> {
    const res = await apiClient.patch<Startup>(`/api/admin/startups/${id}`, updates);
    return res.data;
  },

  async deleteStartup(id: string): Promise<void> {
    await apiClient.delete(`/api/admin/startups/${id}`);
  },

  async toggleVerified(id: string): Promise<Startup> {
    const res = await apiClient.patch<Startup>(`/api/admin/startups/${id}/verify`);
    return res.data;
  },
};
