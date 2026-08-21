/**
 * Submission Repository
 */

import { Prisma } from '@prisma/client';
import { prisma } from '../db.js';

function mapStartupType(type: string): string {
  const map: Record<string, string> = {
    Startup: 'Startup', ScaleUp: 'Scale-up', Unicorn: 'Unicorn',
    Bootstrapped: 'Bootstrapped', Public: 'Public',
  };
  return map[type] || type;
}

function mapStartupStage(stage: string): string {
  const map: Record<string, string> = {
    Idea: 'Idea', PreSeed: 'Pre-seed', Seed: 'Seed',
    SeriesA: 'Series A', SeriesB: 'Series B', SeriesCPlus: 'Series C+', Growth: 'Growth',
  };
  return map[stage] || stage;
}

function toFrontendShape(record: any): any {
  return {
    ...record,
    type: mapStartupType(record.type),
    stage: mapStartupStage(record.stage),
  };
}

export const submissionRepo = {
  async findAll() {
    const records = await prisma.submission.findMany({
      orderBy: { submittedAt: 'desc' },
    });
    return records.map(toFrontendShape);
  },

  async findById(id: string) {
    const record = await prisma.submission.findUnique({ where: { id } });
    return record ? toFrontendShape(record) : null;
  },

  async create(data: Prisma.SubmissionCreateInput) {
    const record = await prisma.submission.create({ data });
    return toFrontendShape(record);
  },

  async updateStatus(
    id: string,
    status: 'pending' | 'in_review' | 'approved' | 'rejected',
    notes?: string
  ) {
    const record = await prisma.submission.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        ...(notes !== undefined ? { notes } : {}),
      },
    });
    return toFrontendShape(record);
  },

  async countByStatus() {
    const [pending, inReview, approved, rejected, total] = await Promise.all([
      prisma.submission.count({ where: { status: 'pending' } }),
      prisma.submission.count({ where: { status: 'in_review' } }),
      prisma.submission.count({ where: { status: 'approved' } }),
      prisma.submission.count({ where: { status: 'rejected' } }),
      prisma.submission.count(),
    ]);
    return { pending, inReview, approved, rejected, total };
  },
};
