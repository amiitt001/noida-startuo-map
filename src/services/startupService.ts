import { Startup, StartupFilterState } from '../types';
import { SEED_STARTUPS } from '../data/seedData';
import { storageService } from './storageService';

const CUSTOM_STARTUPS_KEY = 'noida_atlas_custom_startups_v1';

export const startupService = {
  getAllStartups(): Startup[] {
    const custom = storageService.getItem<Startup[]>(CUSTOM_STARTUPS_KEY, []);
    return [...SEED_STARTUPS, ...custom];
  },

  getStartupBySlug(slug: string): Startup | undefined {
    const all = this.getAllStartups();
    return all.find(s => s.slug.toLowerCase() === slug.toLowerCase());
  },

  getStartupById(id: string): Startup | undefined {
    const all = this.getAllStartups();
    return all.find(s => s.id === id);
  },

  getStartupsByArea(areaSlugOrId: string): Startup[] {
    const all = this.getAllStartups();
    return all.filter(s => 
      s.areaId === areaSlugOrId || 
      s.areaName.toLowerCase().includes(areaSlugOrId.replace('-', ' ').toLowerCase())
    );
  },

  getSimilarStartups(currentStartup: Startup, limit = 3): Startup[] {
    const all = this.getAllStartups();
    return all
      .filter(s => s.id !== currentStartup.id)
      .map(s => {
        let score = 0;
        // matching sector
        const sharedSectors = s.sectors.filter(sec => currentStartup.sectors.includes(sec));
        score += sharedSectors.length * 3;
        // matching area
        if (s.areaId === currentStartup.areaId) score += 2;
        // matching stage
        if (s.stage === currentStartup.stage) score += 1;
        return { startup: s, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.startup);
  },

  filterStartups(filters: Partial<StartupFilterState>, page = 1, pageSize = 12): {
    startups: Startup[];
    totalCount: number;
    totalPages: number;
  } {
    let result = this.getAllStartups();

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.areaName.toLowerCase().includes(q) ||
        s.sectors.some(sec => sec.toLowerCase().includes(q)) ||
        s.founders.some(f => f.name.toLowerCase().includes(q))
      );
    }

    if (filters.area && filters.area !== 'all' && filters.area !== '') {
      result = result.filter(s => 
        s.areaId === filters.area || 
        s.areaName.toLowerCase().includes(filters.area.toLowerCase()) ||
        s.areaName.toLowerCase().replace(/[^a-z0-9]/g, '').includes(filters.area.toLowerCase().replace(/[^a-z0-9]/g, ''))
      );
    }

    if (filters.sector && filters.sector !== 'all' && filters.sector !== '') {
      result = result.filter(s =>
        s.sectors.some(sec => sec.toLowerCase() === filters.sector?.toLowerCase() || sec.toLowerCase().includes(filters.sector?.toLowerCase() || ''))
      );
    }

    if (filters.stage && filters.stage !== 'all' && filters.stage !== '') {
      result = result.filter(s => s.stage.toLowerCase() === filters.stage?.toLowerCase());
    }

    if (filters.type && filters.type !== 'all' && filters.type !== '') {
      result = result.filter(s => s.type.toLowerCase() === filters.type?.toLowerCase());
    }

    if (filters.verifiedOnly) {
      result = result.filter(s => s.verified);
    }

    if (filters.hiringOnly) {
      result = result.filter(s => s.hiring);
    }

    // Sorting
    const sort = filters.sortBy || 'recent';
    if (sort === 'recent') {
      result.sort((a, b) => b.foundedYear - a.foundedYear || b.createdAt.localeCompare(a.createdAt));
    } else if (sort === 'funded') {
      const parseAmt = (amt: string) => {
        const clean = amt.replace(/[^0-9.]/g, '');
        const num = parseFloat(clean) || 0;
        if (amt.includes('M')) return num * 1000000;
        if (amt.includes('K')) return num * 1000;
        if (amt.includes('Cr')) return num * 10000000;
        return num;
      };
      result.sort((a, b) => parseAmt(b.totalFunding) - parseAmt(a.totalFunding));
    } else if (sort === 'hiring') {
      result.sort((a, b) => (b.hiring ? 1 : 0) - (a.hiring ? 1 : 0));
    } else if (sort === 'alphabetical') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    const totalCount = result.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginated = result.slice((page - 1) * pageSize, page * pageSize);

    return {
      startups: paginated,
      totalCount,
      totalPages: Math.max(1, totalPages),
    };
  },

  addStartup(startup: Startup): void {
    const custom = storageService.getItem<Startup[]>(CUSTOM_STARTUPS_KEY, []);
    custom.unshift(startup);
    storageService.setItem(CUSTOM_STARTUPS_KEY, custom);
  },

  updateStartup(updatedStartup: Startup): void {
    const custom = storageService.getItem<Startup[]>(CUSTOM_STARTUPS_KEY, []);
    const idx = custom.findIndex(s => s.id === updatedStartup.id);
    if (idx >= 0) {
      custom[idx] = updatedStartup;
      storageService.setItem(CUSTOM_STARTUPS_KEY, custom);
    }
  },

  deleteStartup(id: string): void {
    const custom = storageService.getItem<Startup[]>(CUSTOM_STARTUPS_KEY, []);
    const filtered = custom.filter(s => s.id !== id);
    storageService.setItem(CUSTOM_STARTUPS_KEY, filtered);
  }
};
