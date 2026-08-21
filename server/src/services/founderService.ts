/**
 * Founder Business Service
 */

import { founderRepo, FounderFilters } from '../repositories/founderRepo.js';
import { generateSlug } from '../utils/slug.js';
import { NotFoundError } from '../utils/errors.js';
import { prisma } from '../db.js';

export const founderService = {
  async getAllFounders(filters: FounderFilters) {
    return founderRepo.filter(filters);
  },

  async getFounderBySlug(slug: string) {
    const founder = await founderRepo.findBySlug(slug);
    if (!founder) {
      throw new NotFoundError(`Founder with slug "${slug}" not found`);
    }
    return founder;
  },

  async createFounder(data: any) {
    const slug = generateSlug(data.name);
    const createData = {
      ...data,
      slug,
    };
    return prisma.founder.create({ data: createData });
  },

  async updateFounder(id: string, data: any) {
    const existing = await prisma.founder.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Founder with ID "${id}" not found`);
    }
    return prisma.founder.update({ where: { id }, data });
  },

  async deleteFounder(id: string) {
    const existing = await prisma.founder.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Founder with ID "${id}" not found`);
    }
    await prisma.founder.delete({ where: { id } });
    return { success: true };
  },
};
