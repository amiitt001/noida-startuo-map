/**
 * Investor Repository
 */

import { Prisma } from '@prisma/client';
import { prisma } from '../db.js';

const fullInclude = {
  portfolioCompanies: true,
} satisfies Prisma.InvestorInclude;

function mapInvestorType(type: string): string {
  const map: Record<string, string> = {
    VentureCapital: 'Venture Capital',
    AngelSyndicate: 'Angel Syndicate',
    MicroVC: 'Micro VC',
    FamilyOffice: 'Family Office',
    CorporateVC: 'Corporate VC',
  };
  return map[type] || type;
}

function toFrontendShape(record: any): any {
  return {
    ...record,
    type: mapInvestorType(record.type),
    portfolioCompanies: (record.portfolioCompanies || []).map((pc: any) => ({
      name: pc.name,
      slug: pc.slug,
      logo: pc.logo,
      sector: pc.sector,
    })),
  };
}

export const investorRepo = {
  async findAll() {
    const records = await prisma.investor.findMany({
      include: fullInclude,
      orderBy: { totalInvestments: 'desc' },
    });
    return records.map(toFrontendShape);
  },

  async findBySlug(slug: string) {
    const record = await prisma.investor.findUnique({
      where: { slug },
      include: fullInclude,
    });
    return record ? toFrontendShape(record) : null;
  },

  async filter(query?: string, type?: string, stage?: string) {
    const where: Prisma.InvestorWhereInput = {};

    if (query?.trim()) {
      const q = query.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { portfolioCompanies: { some: { name: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    if (type && type !== 'all') {
      const typeEnumMap: Record<string, string> = {
        'Venture Capital': 'VentureCapital',
        'Angel Syndicate': 'AngelSyndicate',
        'Micro VC': 'MicroVC',
        'Family Office': 'FamilyOffice',
        'Corporate VC': 'CorporateVC',
      };
      where.type = (typeEnumMap[type] || type) as any;
    }

    if (stage && stage !== 'all') {
      where.stages = { hasSome: [stage] };
    }

    const records = await prisma.investor.findMany({
      where,
      include: fullInclude,
      orderBy: { totalInvestments: 'desc' },
    });
    return records.map(toFrontendShape);
  },
};
