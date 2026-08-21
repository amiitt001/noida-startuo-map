/**
 * Job Repository
 */

import { Prisma } from '@prisma/client';
import { prisma } from '../db.js';

const fullInclude = {
  startup: {
    select: { id: true, name: true, slug: true, logo: true },
  },
} satisfies Prisma.JobInclude;

function mapWorkMode(mode: string): string {
  const map: Record<string, string> = {
    Remote: 'Remote', OnSite: 'On-site', Hybrid: 'Hybrid',
  };
  return map[mode] || mode;
}

function mapJobType(type: string): string {
  const map: Record<string, string> = {
    FullTime: 'Full-time', PartTime: 'Part-time',
    Contract: 'Contract', Internship: 'Internship',
  };
  return map[type] || type;
}

function toFrontendShape(record: any): any {
  return {
    ...record,
    workMode: mapWorkMode(record.workMode),
    type: mapJobType(record.type),
    startupId: record.startupId,
    startupName: record.startup?.name || '',
    startupSlug: record.startup?.slug || '',
    startupLogo: record.startup?.logo || '',
  };
}

export interface JobFilters {
  search?: string;
  workMode?: string;
  isFresher?: boolean;
  isInternship?: boolean;
  area?: string;
}

export const jobRepo = {
  async findAll() {
    const records = await prisma.job.findMany({
      include: fullInclude,
      orderBy: { createdAt: 'desc' },
    });
    return records.map(toFrontendShape);
  },

  async findById(id: string) {
    const record = await prisma.job.findUnique({
      where: { id },
      include: fullInclude,
    });
    return record ? toFrontendShape(record) : null;
  },

  async findByStartup(startupId: string) {
    const records = await prisma.job.findMany({
      where: { startupId },
      include: fullInclude,
      orderBy: { createdAt: 'desc' },
    });
    return records.map(toFrontendShape);
  },

  async filter(filters: JobFilters) {
    const where: Prisma.JobWhereInput = {};

    if (filters.search?.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { skills: { hasSome: [q] } },
        { startup: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (filters.workMode && filters.workMode !== 'all') {
      const modeMap: Record<string, string> = {
        'Remote': 'Remote', 'On-site': 'OnSite', 'Hybrid': 'Hybrid',
      };
      where.workMode = (modeMap[filters.workMode] || filters.workMode) as any;
    }

    if (filters.isFresher) where.isFresherFriendly = true;

    if (filters.isInternship) {
      where.OR = [
        ...(where.OR || []),
        { isInternship: true },
        { type: 'Internship' },
      ];
    }

    if (filters.area && filters.area !== 'all') {
      where.areaName = { contains: filters.area, mode: 'insensitive' };
    }

    const records = await prisma.job.findMany({
      where,
      include: fullInclude,
      orderBy: { createdAt: 'desc' },
    });
    return records.map(toFrontendShape);
  },

  async create(data: Prisma.JobCreateInput) {
    const record = await prisma.job.create({
      data,
      include: fullInclude,
    });
    return toFrontendShape(record);
  },
};
