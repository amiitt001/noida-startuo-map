/**
 * Founder Service
 *
 * Frontend service calling the Express API via apiClient.
 */

import { apiClient } from './apiClient';
import { Founder, FounderFilterState } from '../types';

export const founderService = {
  async getAllFounders(): Promise<Founder[]> {
    const res = await apiClient.get<Founder[]>('/api/founders');
    return res.data;
  },

  async filterFounders(filters: Partial<FounderFilterState>): Promise<Founder[]> {
    const params = new URLSearchParams();
    if (filters.search?.trim()) params.set('search', filters.search.trim());
    if (filters.sector && filters.sector !== 'all') params.set('sector', filters.sector);
    if (filters.stage && filters.stage !== 'all') params.set('stage', filters.stage);
    if (filters.location && filters.location !== 'all') params.set('location', filters.location);

    const res = await apiClient.get<Founder[]>(`/api/founders?${params.toString()}`);
    return res.data;
  },

  async getFounderBySlug(slug: string): Promise<Founder | null> {
    try {
      const res = await apiClient.get<Founder>(`/api/founders/${encodeURIComponent(slug)}`);
      return res.data;
    } catch (_err) {
      return null;
    }
  },

  async createFounder(founderData: Omit<Founder, 'id' | 'slug'>): Promise<Founder> {
    const res = await apiClient.post<Founder>('/api/admin/founders', founderData);
    return res.data;
  },

  async updateFounder(id: string, updates: Partial<Founder>): Promise<Founder> {
    const res = await apiClient.patch<Founder>(`/api/admin/founders/${id}`, updates);
    return res.data;
  },

  async deleteFounder(id: string): Promise<void> {
    await apiClient.delete(`/api/admin/founders/${id}`);
  },
};
