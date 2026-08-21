/**
 * Startup Repository
 *
 * All database operations for the Startup model.
 * Returns plain objects matching the frontend Startup interface shape.
 */

import { Prisma } from '@prisma/client';
import { prisma } from '../db.js';

// Default include for full startup shape (matching frontend interface)
const fullInclude = {
  area: true,
  founders: true,
  fundingRounds: true,
  products: true,
} satisfies Prisma.StartupInclude;

// Lightweight include for list views
const listInclude = {
  area: { select: { id: true, name: true, slug: true, shortName: true } },
  founders: { select: { id: true, name: true, slug: true, role: true, photo: true, linkedin: true, twitter: true } },
  fundingRounds: true,
  products: true,
} satisfies Prisma.StartupInclude;

/**
 * Map Prisma enum values back to display strings used by the frontend.
 */
function mapStartupType(type: string): string {
  const map: Record<string, string> = {
    Startup: 'Startup',
    ScaleUp: 'Scale-up',
    Unicorn: 'Unicorn',
    Bootstrapped: 'Bootstrapped',
    Public: 'Public',
  };
  return map[type] || type;
}

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

/**
 * Transform a Prisma startup record into the frontend-compatible shape.
 */
function toFrontendShape(record: any): any {
  return {
    ...record,
    type: mapStartupType(record.type),
    stage: mapStartupStage(record.stage),
    areaName: record.area?.name ? `${record.area.name}, Noida` : record.areaName || '',
    founders: (record.founders || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      slug: f.slug,
      role: f.role,
      photo: f.photo,
      linkedin: f.linkedin,
      twitter: f.twitter,
    })),
    fundingRounds: (record.fundingRounds || []).map((fr: any) => ({
      id: fr.id,
      roundType: fr.roundType,
      amount: fr.amount,
      date: fr.date,
      leadInvestors: fr.leadInvestors,
      valuation: fr.valuation,
    })),
    products: (record.products || []).map((p: any) => ({
      name: p.name,
      description: p.description,
    })),
  };
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

export interface StartupFilters {
  search?: string;
  area?: string;
  sector?: string;
  stage?: string;
  type?: string;
  verifiedOnly?: boolean;
  hiringOnly?: boolean;
  sortBy?: 'recent' | 'funded' | 'hiring' | 'alphabetical' | 'relevance';
  bbox?: string;
}

// ─── Repository ───────────────────────────────────────────────────────────────

export const startupRepo = {
  async findAll() {
    const records = await prisma.startup.findMany({
      include: listInclude,
      orderBy: { createdAt: 'desc' },
    });
    return records.map(toFrontendShape);
  },

  async findBySlug(slug: string) {
    const record = await prisma.startup.findUnique({
      where: { slug },
      include: fullInclude,
    });
    return record ? toFrontendShape(record) : null;
  },

  async findById(id: string) {
    const record = await prisma.startup.findUnique({
      where: { id },
      include: fullInclude,
    });
    return record ? toFrontendShape(record) : null;
  },

  async findByArea(areaId: string) {
    const records = await prisma.startup.findMany({
      where: { areaId },
      include: listInclude,
      orderBy: { createdAt: 'desc' },
    });
    return records.map(toFrontendShape);
  },

  async filter(
    filters: StartupFilters,
    page = 1,
    pageSize = 12
  ): Promise<{ startups: any[]; totalCount: number; totalPages: number }> {
    const where: Prisma.StartupWhereInput = {};

    // Text search
    if (filters.search?.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { tagline: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { sectors: { hasSome: [q] } },
      ];
    }

    // Area filter
    if (filters.area && filters.area !== 'all') {
      where.OR = [
        ...(where.OR || []),
        { areaId: filters.area },
        { area: { name: { contains: filters.area, mode: 'insensitive' } } },
        { area: { slug: filters.area } },
      ];
      // If we already had text search OR, we need AND
      if (filters.search?.trim()) {
        const searchOr = where.OR;
        delete where.OR;
        where.AND = [
          { OR: searchOr },
          {
            OR: [
              { areaId: filters.area },
              { area: { name: { contains: filters.area, mode: 'insensitive' } } },
              { area: { slug: filters.area } },
            ],
          },
        ];
      }
    }

    // Sector filter
    if (filters.sector && filters.sector !== 'all') {
      where.sectors = { hasSome: [filters.sector] };
    }

    // Stage filter
    if (filters.stage && filters.stage !== 'all') {
      const stageEnumMap: Record<string, string> = {
        'Idea': 'Idea',
        'Pre-seed': 'PreSeed',
        'Seed': 'Seed',
        'Series A': 'SeriesA',
        'Series B': 'SeriesB',
        'Series C+': 'SeriesCPlus',
        'Growth': 'Growth',
      };
      const enumVal = stageEnumMap[filters.stage] || filters.stage;
      where.stage = enumVal as any;
    }

    // Type filter
    if (filters.type && filters.type !== 'all') {
      const typeEnumMap: Record<string, string> = {
        'Startup': 'Startup',
        'Scale-up': 'ScaleUp',
        'Unicorn': 'Unicorn',
        'Bootstrapped': 'Bootstrapped',
        'Public': 'Public',
      };
      const enumVal = typeEnumMap[filters.type] || filters.type;
      where.type = enumVal as any;
    }

    // Boolean filters
    if (filters.verifiedOnly) where.verified = true;
    if (filters.hiringOnly) where.hiring = true;

    // Sorting
    let orderBy: Prisma.StartupOrderByWithRelationInput = { createdAt: 'desc' };
    switch (filters.sortBy) {
      case 'alphabetical':
        orderBy = { name: 'asc' };
        break;
      case 'hiring':
        orderBy = { hiring: 'desc' };
        break;
      case 'recent':
      default:
        orderBy = { foundedYear: 'desc' };
        break;
    }

    const [records, totalCount] = await Promise.all([
      prisma.startup.findMany({
        where,
        include: listInclude,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.startup.count({ where }),
    ]);

    return {
      startups: records.map(toFrontendShape),
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    };
  },

  async findSimilar(startupId: string, limit = 3) {
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      select: { id: true, sectors: true, areaId: true, stage: true },
    });
    if (!startup) return [];

    // Find startups sharing sectors, area, or stage
    const records = await prisma.startup.findMany({
      where: {
        id: { not: startupId },
        OR: [
          { sectors: { hasSome: startup.sectors } },
          { areaId: startup.areaId },
          { stage: startup.stage },
        ],
      },
      include: listInclude,
      take: limit * 2, // Fetch extra for scoring
    });

    // Score and rank
    const scored = records.map((r) => {
      let score = 0;
      const shared = r.sectors.filter((s) => startup.sectors.includes(s));
      score += shared.length * 3;
      if (r.areaId === startup.areaId) score += 2;
      if (r.stage === startup.stage) score += 1;
      return { record: r, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => toFrontendShape(s.record));
  },

  async create(data: Prisma.StartupCreateInput) {
    const record = await prisma.startup.create({
      data,
      include: fullInclude,
    });
    return toFrontendShape(record);
  },

  async update(id: string, data: Prisma.StartupUpdateInput) {
    const record = await prisma.startup.update({
      where: { id },
      data,
      include: fullInclude,
    });
    return toFrontendShape(record);
  },

  async delete(id: string) {
    await prisma.startup.delete({ where: { id } });
  },

  async toggleVerified(id: string) {
    const startup = await prisma.startup.findUnique({
      where: { id },
      select: { verified: true },
    });
    if (!startup) return null;

    const record = await prisma.startup.update({
      where: { id },
      data: { verified: !startup.verified },
      include: fullInclude,
    });
    return toFrontendShape(record);
  },

  /**
   * Return a GeoJSON FeatureCollection of startups for map rendering.
   */
  async toGeoJSON(filters?: StartupFilters) {
    const where: Prisma.StartupWhereInput = {};

    // Text search
    if (filters?.search?.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { tagline: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { sectors: { hasSome: [q] } },
      ];
    }

    // Area filter
    if (filters?.area && filters.area !== 'all') {
      const areaConditions: Prisma.StartupWhereInput[] = [
        { areaId: filters.area },
        { area: { name: { contains: filters.area, mode: 'insensitive' } } },
        { area: { slug: filters.area } },
      ];
      if (where.OR) {
        const searchOr = where.OR;
        delete where.OR;
        where.AND = [
          { OR: searchOr },
          { OR: areaConditions },
        ];
      } else {
        where.OR = areaConditions;
      }
    }

    // Sector filter
    if (filters?.sector && filters.sector !== 'all') {
      where.sectors = { hasSome: [filters.sector] };
    }

    // Stage filter
    if (filters?.stage && filters.stage !== 'all') {
      const stageEnumMap: Record<string, string> = {
        'Idea': 'Idea',
        'Pre-seed': 'PreSeed',
        'Seed': 'Seed',
        'Series A': 'SeriesA',
        'Series B': 'SeriesB',
        'Series C+': 'SeriesCPlus',
        'Growth': 'Growth',
      };
      const enumVal = stageEnumMap[filters.stage] || filters.stage;
      where.stage = enumVal as any;
    }

    // Type filter
    if (filters?.type && filters.type !== 'all') {
      const typeEnumMap: Record<string, string> = {
        'Startup': 'Startup',
        'Scale-up': 'ScaleUp',
        'Unicorn': 'Unicorn',
        'Bootstrapped': 'Bootstrapped',
        'Public': 'Public',
      };
      const enumVal = typeEnumMap[filters.type] || filters.type;
      where.type = enumVal as any;
    }

    // Boolean filters
    if (filters?.verifiedOnly) where.verified = true;
    if (filters?.hiringOnly) where.hiring = true;

    // Viewport / Bounding box filter (bbox=minLng,minLat,maxLng,maxLat)
    if (filters?.bbox?.trim()) {
      const parts = filters.bbox.split(',').map((p) => Number(p.trim()));
      if (parts.length === 4 && !parts.some(Number.isNaN)) {
        const [minLng, minLat, maxLng, maxLat] = parts;
        where.longitude = { gte: minLng, lte: maxLng };
        where.latitude = { gte: minLat, lte: maxLat };
      }
    }

    const startups = await prisma.startup.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        sectors: true,
        stage: true,
        hiring: true,
        verified: true,
        logo: true,
        latitude: true,
        longitude: true,
        tagline: true,
        description: true,
        areaId: true,
        type: true,
        area: { select: { id: true, name: true, slug: true } },
      },
    });

    // Validate coordinates and exclude invalid ones
    const validStartups = startups.filter((s) => {
      if (
        s.latitude === null ||
        s.latitude === undefined ||
        s.longitude === null ||
        s.longitude === undefined ||
        Number.isNaN(s.latitude) ||
        Number.isNaN(s.longitude)
      ) {
        return false;
      }
      return (
        s.latitude >= -90 &&
        s.latitude <= 90 &&
        s.longitude >= -180 &&
        s.longitude <= 180
      );
    });

    return {
      type: 'FeatureCollection' as const,
      features: validStartups.map((s) => {
        const areaName = s.area?.name ? `${s.area.name}, Noida` : s.areaId || 'Noida';
        return {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [s.longitude, s.latitude] as [number, number],
          },
          properties: {
            id: s.id,
            slug: s.slug,
            name: s.name,
            sector: s.sectors[0] || 'SaaS',
            sectors: s.sectors,
            stage: mapStartupStage(s.stage),
            type: mapStartupType(s.type),
            area: s.areaId,
            areaName,
            hiring: s.hiring,
            verified: s.verified,
            logo: s.logo,
            tagline: s.tagline,
            description: s.description,
          },
        };
      }),
    };
  },
};
