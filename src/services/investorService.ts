import { Investor } from '../types';
import { SEED_INVESTORS } from '../data/seedData';

export const investorService = {
  getAllInvestors(): Investor[] {
    return SEED_INVESTORS;
  },

  getInvestorBySlug(slug: string): Investor | undefined {
    const all = this.getAllInvestors();
    return all.find(i => i.slug.toLowerCase() === slug.toLowerCase());
  },

  filterInvestors(query?: string, type?: string, stage?: string): Investor[] {
    let result = this.getAllInvestors();

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(inv =>
        inv.name.toLowerCase().includes(q) ||
        inv.description.toLowerCase().includes(q) ||
        inv.location.toLowerCase().includes(q) ||
        inv.portfolioCompanies.some(pc => pc.name.toLowerCase().includes(q))
      );
    }

    if (type && type !== 'all') {
      result = result.filter(inv => inv.type === type);
    }

    if (stage && stage !== 'all') {
      result = result.filter(inv => inv.stages.includes(stage as any));
    }

    return result;
  }
};
