/**
 * Area Repository
 */

import { prisma } from '../db.js';

function mapCity(city: string): string {
  const map: Record<string, string> = {
    Noida: 'Noida',
    GreaterNoida: 'Greater Noida',
    YamunaExpressway: 'Yamuna Expressway',
  };
  return map[city] || city;
}

function toFrontendShape(record: any): any {
  return {
    ...record,
    city: mapCity(record.city),
    startupCount: record._count?.startups ?? record.startupCount ?? 0,
    hiringCount: record._hiringCount ?? 0,
  };
}

export const areaRepo = {
  /**
   * Get all areas with live startup + hiring counts.
   */
  async findAll() {
    const areas = await prisma.area.findMany({
      include: {
        _count: { select: { startups: true } },
        startups: { select: { hiring: true } },
      },
      orderBy: { name: 'asc' },
    });

    return areas.map((area) => {
      const hiringCount = area.startups.filter((s) => s.hiring).length;
      const { startups, _count, ...rest } = area;
      return {
        ...rest,
        city: mapCity(rest.city),
        startupCount: _count.startups,
        hiringCount,
      };
    });
  },

  async findBySlug(slug: string) {
    const area = await prisma.area.findUnique({
      where: { slug },
      include: {
        _count: { select: { startups: true } },
        startups: { select: { hiring: true } },
      },
    });
    if (!area) return null;

    const hiringCount = area.startups.filter((s) => s.hiring).length;
    const { startups, _count, ...rest } = area;
    return {
      ...rest,
      city: mapCity(rest.city),
      startupCount: _count.startups,
      hiringCount,
    };
  },

  async findById(id: string) {
    const area = await prisma.area.findUnique({
      where: { id },
      include: {
        _count: { select: { startups: true } },
        startups: { select: { hiring: true } },
      },
    });
    if (!area) return null;

    const hiringCount = area.startups.filter((s) => s.hiring).length;
    const { startups, _count, ...rest } = area;
    return {
      ...rest,
      city: mapCity(rest.city),
      startupCount: _count.startups,
      hiringCount,
    };
  },
};
