/**
 * Analytics Service
 *
 * Frontend service calling backend /api/analytics/ecosystem.
 * Returns real database aggregations without hardcoded or inflated numbers.
 */

import { apiClient } from './apiClient';
import { EcosystemStats } from '../types';

export const analyticsService = {
  async getEcosystemStats(): Promise<EcosystemStats> {
    const res = await apiClient.get<EcosystemStats>('/api/analytics/ecosystem');
    return res.data;
  },
};
