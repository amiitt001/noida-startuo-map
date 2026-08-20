import { Area } from '../types';
import { SEED_AREAS } from '../data/seedData';
import { startupService } from './startupService';

export const areaService = {
  getAllAreas(): Area[] {
    const startups = startupService.getAllStartups();
    return SEED_AREAS.map(area => {
      const areaStartups = startups.filter(s => s.areaId === area.id || s.areaName.includes(area.name));
      const hiringCount = areaStartups.filter(s => s.hiring).length;
      return {
        ...area,
        startupCount: Math.max(area.startupCount, areaStartups.length),
        hiringCount: Math.max(area.hiringCount, hiringCount),
      };
    });
  },

  getAreaBySlug(slug: string): Area | undefined {
    const areas = this.getAllAreas();
    return areas.find(a => a.slug === slug || a.id === slug);
  },

  getAreaById(id: string): Area | undefined {
    const areas = this.getAllAreas();
    return areas.find(a => a.id === id || a.slug === id);
  }
};
