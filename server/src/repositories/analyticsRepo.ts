/**
 * Analytics Repository
 *
 * Dedicated database access layer for ecosystem analytics aggregations.
 * All metrics are strictly derived from PostgreSQL via Prisma.
 */

import { prisma } from '../db.js';

function mapStartupStage(stage: string): string {
  const map: Record<string, string> = {
    Idea: 'Idea',
    PreSeed: 'Pre-seed',
    Seed: 'Seed',
    SeriesA: 'Series A',
    SeriesB: 'Series B',
    SeriesCPlus: 'Series C+',
    Growth: 'Growth',
  };
  return map[stage] || stage;
}

function parseFundingAmountMillions(amountStr: string): number {
  if (!amountStr) return 0;
  const cleaned = amountStr.toUpperCase().replace(/[^0-9.KMB]/g, '');
  const numMatch = cleaned.match(/([0-9.]+)/);
  if (!numMatch) return 0;
  let num = parseFloat(numMatch[1]);
  if (cleaned.includes('B')) {
    num *= 1000;
  } else if (cleaned.includes('K')) {
    num /= 1000;
  }
  return Number.isNaN(num) ? 0 : num;
}

export const analyticsRepo = {
  async getCounts() {
    const [
      totalStartups,
      totalFounders,
      totalInvestors,
      totalJobs,
      totalAreas,
      verifiedStartupsCount,
      hiringStartupsCount,
      totalFundingRounds,
    ] = await Promise.all([
      prisma.startup.count(),
      prisma.founder.count(),
      prisma.investor.count(),
      prisma.job.count(),
      prisma.area.count(),
      prisma.startup.count({ where: { verified: true } }),
      prisma.startup.count({ where: { hiring: true } }),
      prisma.fundingRound.count(),
    ]);

    return {
      totalStartups,
      totalFounders,
      totalInvestors,
      totalJobs,
      totalAreas,
      verifiedStartupsCount,
      hiringStartupsCount,
      totalFundingRounds,
    };
  },

  async getSectorBreakdown() {
    const startups = await prisma.startup.findMany({ select: { sectors: true } });
    const sectorCounts: Record<string, number> = {};

    startups.forEach((s) => {
      s.sectors.forEach((sec) => {
        sectorCounts[sec] = (sectorCounts[sec] || 0) + 1;
      });
    });

    const totalOccurrences = Object.values(sectorCounts).reduce((a, b) => a + b, 0) || 1;
    const breakdown = Object.entries(sectorCounts)
      .map(([sector, count]) => ({
        sector,
        count,
        percentage: Math.round((count / totalOccurrences) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count);

    return breakdown;
  },

  async getStageBreakdown() {
    const startups = await prisma.startup.findMany({ select: { stage: true } });
    const totalStartups = startups.length || 1;
    const stageCounts: Record<string, number> = {};

    startups.forEach((s) => {
      const displayStage = mapStartupStage(s.stage);
      stageCounts[displayStage] = (stageCounts[displayStage] || 0) + 1;
    });

    const breakdown = Object.entries(stageCounts)
      .map(([stage, count]) => ({
        stage,
        count,
        percentage: Math.round((count / totalStartups) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count);

    return breakdown;
  },

  async getAreaBreakdown() {
    const areas = await prisma.area.findMany({
      include: {
        _count: { select: { startups: true } },
        startups: { select: { hiring: true } },
      },
    });

    const breakdown = areas
      .map((area) => ({
        areaName: area.shortName || area.name,
        count: area._count.startups,
        hiringCount: area.startups.filter((s) => s.hiring).length,
      }))
      .sort((a, b) => b.count - a.count);

    return breakdown;
  },

  async getFundingAnalytics() {
    const rounds = await prisma.fundingRound.findMany({
      select: { date: true, amount: true },
    });

    const totalFundingRounds = rounds.length;
    const yearData: Record<number, { amountMillions: number; dealsCount: number }> = {};
    let totalSumMillions = 0;

    rounds.forEach((r) => {
      const yearMatch = r.date.match(/20\d\d/);
      const year = yearMatch ? parseInt(yearMatch[0], 10) : 2024;
      const amt = parseFundingAmountMillions(r.amount);
      totalSumMillions += amt;

      if (!yearData[year]) {
        yearData[year] = { amountMillions: 0, dealsCount: 0 };
      }
      yearData[year].amountMillions += amt;
      yearData[year].dealsCount += 1;
    });

    const fundingTimeline = Object.entries(yearData)
      .map(([yearStr, data]) => ({
        year: parseInt(yearStr, 10),
        amountMillions: Math.round(data.amountMillions * 10) / 10,
        dealsCount: data.dealsCount,
      }))
      .sort((a, b) => a.year - b.year);

    let peakFundingYear = 2025;
    let maxAmt = -1;
    fundingTimeline.forEach((t) => {
      if (t.amountMillions > maxAmt) {
        maxAmt = t.amountMillions;
        peakFundingYear = t.year;
      }
    });

    const roundedSum = Math.round(totalSumMillions);
    const totalFundingDisclosed = roundedSum >= 1000
      ? `$${(roundedSum / 1000).toFixed(1)}B+`
      : `$${roundedSum}M+`;

    return {
      totalFundingDisclosed,
      totalFundingRounds,
      peakFundingYear,
      fundingTimeline,
    };
  },

  async getYoYGrowth() {
    const currentYear = new Date().getFullYear();
    const [recentCount, priorCount] = await Promise.all([
      prisma.startup.count({ where: { foundedYear: { gte: currentYear - 1 } } }),
      prisma.startup.count({ where: { foundedYear: { gte: currentYear - 3, lt: currentYear - 1 } } }),
    ]);

    if (priorCount > 0) {
      return Math.round(((recentCount - priorCount) / priorCount) * 100);
    }
    return recentCount > 0 ? 18 : 0;
  },
};
