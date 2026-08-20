import React, { useState, useMemo } from 'react';
import { Startup, StartupFilterState } from '../../types';
import { startupService } from '../../services/startupService';
import { areaService } from '../../services/areaService';
import { StartupCard } from '../StartupCard';

interface StartupDirectoryProps {
  onSelectStartup: (slug: string) => void;
  onExploreMap: () => void;
}

export const StartupDirectory: React.FC<StartupDirectoryProps> = ({
  onSelectStartup,
  onExploreMap,
}) => {
  const [filters, setFilters] = useState<Partial<StartupFilterState>>({
    type: 'all',
    stage: 'all',
    sector: 'all',
    area: 'all',
    hiring: false,
    verified: false,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const areas = useMemo(() => areaService.getAllAreas(), []);

  const { startups, totalCount, totalPages } = useMemo(() => {
    return startupService.filterStartups(
      { ...filters, search: searchQuery },
      page,
      pageSize
    );
  }, [filters, searchQuery, page]);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Directory Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-caps text-xs text-[#545f72] uppercase font-bold tracking-wider">
              Ecosystem Index
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
            <span className="text-xs text-[#545f72] font-semibold">{totalCount} Startups Registered</span>
          </div>
          <h1 className="font-h1 text-3xl md:text-4xl font-extrabold text-[#030612]">
            Noida Startup Directory
          </h1>
          <p className="text-sm text-[#545f72] mt-1">
            Explore companies building artificial intelligence, fintech, clean mobility, deeptech, and enterprise software.
          </p>
        </div>

        <button
          onClick={onExploreMap}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1f2c] text-white text-xs font-bold rounded-xl hover:bg-[#030612] transition-colors shadow"
        >
          <span className="material-symbols-outlined text-base">map</span>
          <span>Switch to Interactive Map</span>
        </button>
      </div>

      {/* Filter Bar Controls */}
      <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-4 shadow-sm space-y-3">
        {/* Search row */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#76777c]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by company name, technology, or keywords..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#f6f3f4] text-sm text-[#1c1b1c] rounded-xl border border-transparent focus:border-[#FF6B35] focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        {/* Dropdown filters row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
          <select
            value={filters.sector || 'all'}
            onChange={(e) => {
              setFilters({ ...filters, sector: e.target.value });
              setPage(1);
            }}
            className="px-3 py-2 bg-[#f6f3f4] border border-[#c6c6cc]/40 rounded-xl font-medium text-[#1c1b1c] focus:outline-none"
          >
            <option value="all">All Sectors</option>
            <option value="AI / ML">AI / ML</option>
            <option value="SaaS">SaaS</option>
            <option value="FinTech">FinTech</option>
            <option value="DeepTech">DeepTech</option>
            <option value="EV">EV & CleanTech</option>
            <option value="EdTech">EdTech</option>
            <option value="HealthTech">HealthTech</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Robotics">Robotics</option>
          </select>

          <select
            value={filters.stage || 'all'}
            onChange={(e) => {
              setFilters({ ...filters, stage: e.target.value as any });
              setPage(1);
            }}
            className="px-3 py-2 bg-[#f6f3f4] border border-[#c6c6cc]/40 rounded-xl font-medium text-[#1c1b1c] focus:outline-none"
          >
            <option value="all">All Stages</option>
            <option value="Pre-seed">Pre-seed</option>
            <option value="Seed">Seed</option>
            <option value="Series A">Series A</option>
            <option value="Series B">Series B</option>
            <option value="Growth">Growth</option>
          </select>

          <select
            value={filters.area || 'all'}
            onChange={(e) => {
              setFilters({ ...filters, area: e.target.value });
              setPage(1);
            }}
            className="px-3 py-2 bg-[#f6f3f4] border border-[#c6c6cc]/40 rounded-xl font-medium text-[#1c1b1c] focus:outline-none"
          >
            <option value="all">All Areas</option>
            {areas.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          <select
            value={filters.sortBy || 'name'}
            onChange={(e) => {
              setFilters({ ...filters, sortBy: e.target.value as any });
              setPage(1);
            }}
            className="px-3 py-2 bg-[#f6f3f4] border border-[#c6c6cc]/40 rounded-xl font-medium text-[#1c1b1c] focus:outline-none"
          >
            <option value="name">Sort by: Name</option>
            <option value="foundedYear">Sort by: Newest</option>
            <option value="funding">Sort by: Funding Raised</option>
          </select>

          {/* Hiring toggle button */}
          <button
            onClick={() => {
              setFilters({ ...filters, hiring: !filters.hiring });
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              filters.hiring
                ? 'bg-[#1a1f2c] text-white'
                : 'bg-[#f6f3f4] text-[#45464c] hover:bg-[#eae7e8]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">group_add</span>
            <span>Hiring Only</span>
          </button>

          {/* Verified toggle button */}
          <button
            onClick={() => {
              setFilters({ ...filters, verified: !filters.verified });
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              filters.verified
                ? 'bg-[#FF6B35] text-white'
                : 'bg-[#f6f3f4] text-[#45464c] hover:bg-[#eae7e8]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">verified</span>
            <span>Verified</span>
          </button>
        </div>
      </div>

      {/* Startups Grid */}
      {startups.length === 0 ? (
        <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-12 text-center text-[#545f72]">
          <span className="material-symbols-outlined text-4xl mb-2 text-[#c6c6cc]">search_off</span>
          <p className="text-base font-bold text-[#030612]">No startups matched your filters</p>
          <p className="text-xs mt-1">Try resetting the stage or sector filters to see more results.</p>
          <button
            onClick={() => {
              setFilters({
                type: 'all',
                stage: 'all',
                sector: 'all',
                area: 'all',
                hiring: false,
                verified: false,
                sortBy: 'name',
                sortOrder: 'asc',
              });
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-[#1a1f2c] text-white text-xs font-semibold rounded-xl"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {startups.map((s) => (
            <StartupCard key={s.id} startup={s} onSelect={onSelectStartup} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#c6c6cc] disabled:opacity-40 hover:bg-[#f6f3f4]"
          >
            Previous
          </button>
          <span className="text-xs font-medium text-[#545f72]">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#c6c6cc] disabled:opacity-40 hover:bg-[#f6f3f4]"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
