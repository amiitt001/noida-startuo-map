/**
 * Investor Service
 *
 * Frontend service calling the Express API via apiClient.
 */

import { apiClient } from './apiClient';
import { Investor, InvestorFilterState } from '../types';

export const investorService = {
  async getAllInvestors(): Promise<Investor[]> {
    const res = await apiClient.get<Investor[]>('/api/investors');
    return res.data;
  },

  async filterInvestors(filters: Partial<InvestorFilterState>): Promise<Investor[]> {
    const params = new URLSearchParams();
    if (filters.search?.trim()) params.set('search', filters.search.trim());
    if (filters.type && filters.type !== 'all') params.set('type', filters.type);
    if (filters.stage && filters.stage !== 'all') params.set('stage', filters.stage);

    const res = await apiClient.get<Investor[]>(`/api/investors?${params.toString()}`);
    return res.data;
  },

  async getInvestorBySlug(slug: string): Promise<Investor | null> {
    try {
      const res = await apiClient.get<Investor>(`/api/investors/${encodeURIComponent(slug)}`);
      return res.data;
    } catch (_err) {
      return null;
    }
  },

  async createInvestor(investorData: Omit<Investor, 'id' | 'slug'>): Promise<Investor> {
    const res = await apiClient.post<Investor>('/api/admin/investors', investorData);
    return res.data;
  },

  async updateInvestor(id: string, updates: Partial<Investor>): Promise<Investor> {
    const res = await apiClient.patch<Investor>(`/api/admin/investors/${id}`, updates);
    return res.data;
  },

  async deleteInvestor(id: string): Promise<void> {
    await apiClient.delete(`/api/admin/investors/${id}`);
  },
};
