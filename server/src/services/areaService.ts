/**
 * Area Business Service
 */

import { areaRepo } from '../repositories/areaRepo.js';
import { NotFoundError } from '../utils/errors.js';

export const areaService = {
  async getAllAreas() {
    return areaRepo.findAll();
  },

  async getAreaBySlug(slug: string) {
    const area = await areaRepo.findBySlug(slug);
    if (!area) {
      throw new NotFoundError(`Area with slug "${slug}" not found`);
    }
    return area;
  },

  async getAreaById(id: string) {
    const area = await areaRepo.findById(id);
    if (!area) {
      throw new NotFoundError(`Area with ID "${id}" not found`);
    }
    return area;
  },
};
