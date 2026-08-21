/**
 * Founder Repository
 */

import { Prisma } from '@prisma/client';
import { prisma } from '../db.js';

const fullInclude = {
  startup: {
    select: { id: true, name: true, slug: true, logo: true },
  },
} satisfies Prisma.FounderInclude;

function mapStage(stage: string): string {
  const map: Record<string, string> = {
    Idea: 'Idea', PreSeed: 'Pre-seed', Seed: 'Seed',
    SeriesA: 'Series A', SeriesB: 'Series B', SeriesCPlus: 'Series C+', Growth: 'Growth',
  };
  return map[stage] || stage;
}

function toFrontendShape(record: any): any {
  return {
    ...record,
    stage: mapStage(record.stage),
    startupId: record.startupId,
    startupName: record.startup?.name || '',
    startupSlug: record.startup?.slug || '',
    startupLogo: record.startup?.logo || '',
  };
}

export interface FounderFilters {
  search?: string;
  sector?: string;
  stage?: string;
  location?: string;
}

export const founderRepo = {
  async findAll() {
    const records = await prisma.founder.findMany({
      include: fullInclude,
      orderBy: { name: 'asc' },
    });
    return records.map(toFrontendShape);
  },

  async findBySlug(slug: string) {
    const record = await prisma.founder.findUnique({
      where: { slug },
      include: fullInclude,
    });
    return record ? toFrontendShape(record) : null;
  },

  async findByStartup(startupId: string) {
    const records = await prisma.founder.findMany({
      where: { startupId },
      include: fullInclude,
    });
    return records.map(toFrontendShape);
  },

  async filter(filters: FounderFilters) {
    const where: Prisma.FounderWhereInput = {};

    if (filters.search?.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { bio: { contains: q, mode: 'insensitive' } },
        { skills: { hasSome: [q] } },
        { sectors: { hasSome: [q] } },
        { startup: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (filters.sector && filters.sector !== 'all') {
      where.sectors = { hasSome: [filters.sector] };
    }

    if (filters.stage && filters.stage !== 'all') {
      const stageEnumMap: Record<string, string> = {
        'Idea': 'Idea', 'Pre-seed': 'PreSeed', 'Seed': 'Seed',
        'Series A': 'SeriesA', 'Series B': 'SeriesB',
        'Series C+': 'SeriesCPlus', 'Growth': 'Growth',
      };
      where.stage = (stageEnumMap[filters.stage] || filters.stage) as any;
    }

    if (filters.location && filters.location !== 'all') {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    const records = await prisma.founder.findMany({
      where,
      include: fullInclude,
      orderBy: { name: 'asc' },
    });
    return records.map(toFrontendShape);
  },
};
