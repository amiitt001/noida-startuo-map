/**
 * Analytics Business Service
 *
 * Real PostgreSQL-derived aggregations orchestrator. No hardcoded or inflated numbers.
 */

import { analyticsRepo } from '../repositories/analyticsRepo.js';

export const analyticsService = {
  async getEcosystemStats() {
    const [
      counts,
      sectorBreakdown,
      stageBreakdown,
      areaBreakdown,
      fundingData,
      yoyGrowthPercent,
    ] = await Promise.all([
      analyticsRepo.getCounts(),
      analyticsRepo.getSectorBreakdown(),
      analyticsRepo.getStageBreakdown(),
      analyticsRepo.getAreaBreakdown(),
      analyticsRepo.getFundingAnalytics(),
      analyticsRepo.getYoYGrowth(),
    ]);

    const topSectorCluster = sectorBreakdown.length >= 2
      ? `${sectorBreakdown[0].sector} & ${sectorBreakdown[1].sector}`
      : sectorBreakdown[0]?.sector || 'Tech';

    const topAreaHub = areaBreakdown[0]?.areaName || 'Sector 62';

    return {
      totalStartups: counts.totalStartups,
      totalFounders: counts.totalFounders,
      totalInvestors: counts.totalInvestors,
      totalIncubators: counts.totalAreas,
      totalAreas: counts.totalAreas,
      verifiedStartupsCount: counts.verifiedStartupsCount,
      totalJobs: counts.totalJobs,
      totalFundingDisclosed: fundingData.totalFundingDisclosed,
      totalFundingRounds: fundingData.totalFundingRounds,
      hiringStartupsCount: counts.hiringStartupsCount,
      yoyGrowthPercent,
      topSectorCluster,
      peakFundingYear: fundingData.peakFundingYear,
      topAreaHub,
      sectorBreakdown,
      stageBreakdown,
      areaBreakdown,
      fundingTimeline: fundingData.fundingTimeline,
    };
  },
};
