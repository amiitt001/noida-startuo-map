import { Founder, FounderFilterState } from '../types';
import { SEED_FOUNDERS } from '../data/seedData';
import { startupService } from './startupService';

export const founderService = {
  getAllFounders(): Founder[] {
    return SEED_FOUNDERS;
  },

  getFounderBySlug(slug: string): Founder | undefined {
    const all = this.getAllFounders();
    return all.find(f => f.slug.toLowerCase() === slug.toLowerCase());
  },

  getFoundersByStartup(startupId: string): Founder[] {
    const all = this.getAllFounders();
    return all.filter(f => f.startupId === startupId);
  },

  filterFounders(filters: Partial<FounderFilterState>): Founder[] {
    let result = this.getAllFounders();

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.startupName.toLowerCase().includes(q) ||
        f.bio.toLowerCase().includes(q) ||
        f.skills.some(sk => sk.toLowerCase().includes(q)) ||
        f.sectors.some(sec => sec.toLowerCase().includes(q))
      );
    }

    if (filters.sector && filters.sector !== 'all' && filters.sector !== '') {
      result = result.filter(f =>
        f.sectors.some(sec => sec.toLowerCase() === filters.sector?.toLowerCase() || sec.toLowerCase().includes(filters.sector?.toLowerCase() || ''))
      );
    }

    if (filters.stage && filters.stage !== 'all' && filters.stage !== '') {
      result = result.filter(f => f.stage.toLowerCase() === filters.stage?.toLowerCase());
    }

    if (filters.location && filters.location !== 'all' && filters.location !== '') {
      result = result.filter(f => f.location.toLowerCase().includes(filters.location?.toLowerCase() || ''));
    }

    return result;
  }
};
