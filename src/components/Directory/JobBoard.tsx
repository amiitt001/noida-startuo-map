import React, { useState, useMemo } from 'react';
import { jobService } from '../../services/jobService';
import { JobCard } from '../JobCard';
import { JobFilterState } from '../../types';

interface JobBoardProps {
  onSelectStartup: (slug: string) => void;
}

export const JobBoard: React.FC<JobBoardProps> = ({ onSelectStartup }) => {
  const [filters, setFilters] = useState<Partial<JobFilterState>>({
    workMode: 'all',
    experience: 'all',
    fresherFriendly: false,
  });
  const [search, setSearch] = useState('');

  const jobs = useMemo(() => {
    return jobService.filterJobs({
      ...filters,
      search,
    });
  }, [filters, search]);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-caps text-xs text-[#545f72] uppercase font-bold tracking-wider">
              Talent Hub
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-emerald-700 font-semibold">{jobs.length} Verified Openings</span>
          </div>
          <h1 className="font-h1 text-3xl md:text-4xl font-extrabold text-[#030612]">
            Work at Noida Startups
          </h1>
          <p className="text-sm text-[#545f72] mt-1">
            Apply directly to engineering, product, AI research, and sales roles with fast-growing venture-backed startups in Noida.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#76777c]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles (e.g. Frontend Engineer, AI Researcher, Product Manager)..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#f6f3f4] text-xs md:text-sm rounded-xl border border-transparent focus:border-[#FF6B35] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <select
            value={filters.workMode || 'all'}
            onChange={(e) => setFilters({ ...filters, workMode: e.target.value as any })}
            className="px-3 py-2 bg-[#f6f3f4] border border-[#c6c6cc]/40 rounded-xl font-medium text-[#1c1b1c] focus:outline-none"
          >
            <option value="all">All Work Modes</option>
            <option value="On-site">On-site (Noida / Gr. Noida)</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
          </select>

          <select
            value={filters.experience || 'all'}
            onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
            className="px-3 py-2 bg-[#f6f3f4] border border-[#c6c6cc]/40 rounded-xl font-medium text-[#1c1b1c] focus:outline-none"
          >
            <option value="all">Any Experience Level</option>
            <option value="0-2 years">0-2 years (Junior / Entry)</option>
            <option value="2-5 years">2-5 years (Mid Level)</option>
            <option value="4-8 years">4-8 years (Senior / Lead)</option>
          </select>

          <button
            onClick={() => setFilters({ ...filters, fresherFriendly: !filters.fresherFriendly })}
            className={`px-3 py-2 rounded-xl font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              filters.fresherFriendly
                ? 'bg-emerald-600 text-white'
                : 'bg-[#f6f3f4] text-[#45464c] hover:bg-[#eae7e8]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">school</span>
            <span>Fresher Friendly Only</span>
          </button>
        </div>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-12 text-center text-[#545f72]">
          <span className="material-symbols-outlined text-4xl mb-2 text-[#c6c6cc]">work_off</span>
          <p className="text-sm font-semibold">No jobs found matching the selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onSelectStartup={onSelectStartup} />
          ))}
        </div>
      )}
    </div>
  );
};
