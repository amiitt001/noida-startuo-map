/**
 * Investor Business Service
 */

import { investorRepo } from '../repositories/investorRepo.js';
import { generateSlug } from '../utils/slug.js';
import { NotFoundError } from '../utils/errors.js';
import { prisma } from '../db.js';

export const investorService = {
  async getAllInvestors(query?: string, type?: string, stage?: string) {
    return investorRepo.filter(query, type, stage);
  },

  async getInvestorBySlug(slug: string) {
    const investor = await investorRepo.findBySlug(slug);
    if (!investor) {
      throw new NotFoundError(`Investor with slug "${slug}" not found`);
    }
    return investor;
  },

  async createInvestor(data: any) {
    const slug = generateSlug(data.name);
    const createData = {
      ...data,
      slug,
    };
    return prisma.investor.create({ data: createData });
  },

  async updateInvestor(id: string, data: any) {
    const existing = await prisma.investor.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Investor with ID "${id}" not found`);
    }
    return prisma.investor.update({ where: { id }, data });
  },

  async deleteInvestor(id: string) {
    const existing = await prisma.investor.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Investor with ID "${id}" not found`);
    }
    await prisma.investor.delete({ where: { id } });
    return { success: true };
  },
};
