/**
 * Startup Business Service
 */

import { startupRepo, StartupFilters } from '../repositories/startupRepo.js';
import { generateSlug, ensureUniqueSlug } from '../utils/slug.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { prisma } from '../db.js';

export const startupService = {
  async getAllStartups(filters: StartupFilters, page = 1, limit = 24) {
    return startupRepo.filter(filters, page, limit);
  },

  async getGeoJSON(filters: StartupFilters) {
    return startupRepo.toGeoJSON(filters);
  },

  async getStartupBySlug(slug: string) {
    const startup = await startupRepo.findBySlug(slug);
    if (!startup) {
      throw new NotFoundError(`Startup with slug "${slug}" not found`);
    }
    // Increment view count asynchronously
    prisma.startup.update({
      where: { slug },
      data: { viewsCount: { increment: 1 } },
    }).catch(() => {});

    return startup;
  },

  async getSimilarStartups(slug: string, limit = 3) {
    const startup = await startupRepo.findBySlug(slug);
    if (!startup) {
      throw new NotFoundError(`Startup with slug "${slug}" not found`);
    }
    return startupRepo.findSimilar(startup.id, limit);
  },

  async createStartup(data: any) {
    const rawSlug = generateSlug(data.name);
    const existing = await startupRepo.findBySlug(rawSlug);
    if (existing) {
      throw new ConflictError(`A startup with slug "${rawSlug}" already exists`);
    }

    const { areaId, founders, fundingRounds, products, ...rest } = data;

    const createData: any = {
      ...rest,
      slug: rawSlug,
      area: { connect: { id: areaId } },
    };

    return startupRepo.create(createData);
  },

  async updateStartup(id: string, data: any) {
    const existing = await startupRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Startup with ID "${id}" not found`);
    }

    const { areaId, founders, fundingRounds, products, ...rest } = data;
    const updateData: any = { ...rest };

    if (areaId) {
      updateData.area = { connect: { id: areaId } };
    }

    return startupRepo.update(id, updateData);
  },

  async deleteStartup(id: string) {
    const existing = await startupRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Startup with ID "${id}" not found`);
    }
    await startupRepo.delete(id);
    return { success: true };
  },

  async toggleVerified(id: string) {
    const startup = await startupRepo.toggleVerified(id);
    if (!startup) {
      throw new NotFoundError(`Startup with ID "${id}" not found`);
    }
    return startup;
  },
};
