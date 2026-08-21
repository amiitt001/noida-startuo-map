/**
 * Area Service
 *
 * Frontend service calling the Express API via apiClient.
 */

import { apiClient } from './apiClient';
import { Area } from '../types';

export const areaService = {
  async getAllAreas(): Promise<Area[]> {
    const res = await apiClient.get<Area[]>('/api/areas');
    return res.data;
  },

  async getAreaBySlug(slug: string): Promise<Area | null> {
    try {
      const res = await apiClient.get<Area>(`/api/areas/${encodeURIComponent(slug)}`);
      return res.data;
    } catch (_err) {
      return null;
    }
  },
};
