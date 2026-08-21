import React, { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { startupService } from '../services/startupService';
import { founderService } from '../services/founderService';
import { investorService } from '../services/investorService';
import { jobService } from '../services/jobService';
import { areaService } from '../services/areaService';
import { Startup, Founder, Investor, Job, Area } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string, param?: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 200);

  const [results, setResults] = useState<{
    startups: Startup[];
    founders: Founder[];
    investors: Investor[];
    jobs: Job[];
    areas: Area[];
  }>({
    startups: [],
    founders: [],
    investors: [],
    jobs: [],
    areas: [],
  });

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setResults({ startups: [], founders: [], investors: [], jobs: [], areas: [] });
      return;
    }

    let active = true;

    Promise.all([
      startupService.filterStartups({ search: debouncedSearch }, 1, 4).then((r) => r.startups).catch(() => []),
      founderService.filterFounders({ search: debouncedSearch }).then((f) => f.slice(0, 3)).catch(() => []),
      investorService.filterInvestors({ search: debouncedSearch }).then((i) => i.slice(0, 3)).catch(() => []),
      jobService.filterJobs({ search: debouncedSearch }).then((j) => j.slice(0, 3)).catch(() => []),
      areaService.getAllAreas().then((a) => a.filter((ar) =>
        ar.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        ar.topSectors.some((s) => s.toLowerCase().includes(debouncedSearch.toLowerCase()))
      ).slice(0, 3)).catch(() => []),
    ]).then(([startups, founders, investors, jobs, areas]) => {
      if (active) {
        setResults({ startups, founders, investors, jobs, areas });
      }
    });

    return () => {
      active = false;
    };
  }, [debouncedSearch]);

  if (!isOpen) return null;

  const totalHits =
    results.startups.length +
    results.founders.length +
    results.investors.length +
    results.jobs.length +
    results.areas.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#c6c6cc] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-[#c6c6cc]/50 flex items-center gap-3 bg-[#fcf8f9]">
          <span className="material-symbols-outlined text-2xl text-[#FF6B35]">search</span>
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search startups, founders, sectors or locations in Noida..."
            className="flex-1 bg-transparent text-base font-medium text-[#1c1b1c] placeholder:text-[#76777c] focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-[#76777c] hover:text-[#1c1b1c] p-1"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold bg-[#eae7e8] hover:bg-[#c6c6cc] text-[#45464c] px-2.5 py-1 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {!searchTerm.trim() ? (
            <div className="py-8 text-center text-[#545f72]">
              <p className="text-sm font-medium mb-3">Try searching for:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Acme AI', 'Neural Labs', 'Sector 62', 'FinTech', 'Arjun Sharma', 'Series A', 'EV'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchTerm(term)}
                    className="text-xs bg-[#f0edee] hover:bg-[#FF6B35]/10 hover:text-[#FF6B35] px-3 py-1.5 rounded-full text-[#1c1b1c] font-medium transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : totalHits === 0 ? (
            <div className="py-12 text-center text-[#76777c]">
              <span className="material-symbols-outlined text-4xl mb-2 text-[#c6c6cc]">search_off</span>
              <p className="text-sm font-semibold">No results found for "{searchTerm}"</p>
              <p className="text-xs mt-1">Check spelling or search for broader keywords like "SaaS" or "Noida".</p>
            </div>
          ) : (
            <>
              {/* Startups Results */}
              {results.startups.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label-caps text-xs text-[#545f72] tracking-wider uppercase font-bold">
                      Startups ({results.startups.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {results.startups.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onNavigate(`/startups/${s.slug}`);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#f6f3f4] border border-transparent hover:border-[#c6c6cc]/40 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img src={s.logo} alt={s.name} className="w-9 h-9 rounded-lg object-cover bg-[#eae7e8]" />
                          <div>
                            <h4 className="font-bold text-sm text-[#030612] flex items-center gap-1">
                              {s.name}
                              {s.verified && (
                                <span className="material-symbols-outlined text-[14px] text-[#FF6B35]">
                                  verified
                                </span>
                              )}
                            </h4>
                            <p className="text-xs text-[#545f72]">
                              {s.sectors.join(', ')} • {s.areaName}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold bg-[#1a1f2c] text-white px-2 py-0.5 rounded">
                          {s.stage}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Founders Results */}
              {results.founders.length > 0 && (
                <div>
                  <span className="font-label-caps text-xs text-[#545f72] tracking-wider uppercase font-bold block mb-2">
                    Founders ({results.founders.length})
                  </span>
                  <div className="space-y-2">
                    {results.founders.map(f => (
                      <div
                        key={f.id}
                        onClick={() => {
                          onNavigate(`/founders/${f.slug}`);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#f6f3f4] border border-transparent hover:border-[#c6c6cc]/40 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img src={f.photo} alt={f.name} className="w-9 h-9 rounded-full object-cover" />
                          <div>
                            <h4 className="font-bold text-sm text-[#030612]">{f.name}</h4>
                            <p className="text-xs text-[#545f72]">{f.role} @ {f.startupName}</p>
                          </div>
                        </div>
                        <span className="text-xs text-[#545f72]">{f.location}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Jobs Results */}
              {results.jobs.length > 0 && (
                <div>
                  <span className="font-label-caps text-xs text-[#545f72] tracking-wider uppercase font-bold block mb-2">
                    Jobs ({results.jobs.length})
                  </span>
                  <div className="space-y-2">
                    {results.jobs.map(j => (
                      <div
                        key={j.id}
                        onClick={() => {
                          onNavigate(`/jobs`);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#f6f3f4] border border-transparent hover:border-[#c6c6cc]/40 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-xl text-[#FF6B35]">work</span>
                          <div>
                            <h4 className="font-bold text-sm text-[#030612]">{j.title}</h4>
                            <p className="text-xs text-[#545f72]">{j.startupName} • {j.salaryRange}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-[#f0edee] text-[#1c1b1c] px-2 py-0.5 rounded font-medium">
                          {j.workMode}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Areas Results */}
              {results.areas.length > 0 && (
                <div>
                  <span className="font-label-caps text-xs text-[#545f72] tracking-wider uppercase font-bold block mb-2">
                    Ecosystem Locations ({results.areas.length})
                  </span>
                  <div className="space-y-2">
                    {results.areas.map(a => (
                      <div
                        key={a.id}
                        onClick={() => {
                          onNavigate(`/areas/${a.slug}`);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#f6f3f4] border border-transparent hover:border-[#c6c6cc]/40 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-xl text-[#545f72]">location_city</span>
                          <div>
                            <h4 className="font-bold text-sm text-[#030612]">{a.name}</h4>
                            <p className="text-xs text-[#545f72]">{a.startupCount} Startups • Top: {a.topSectors.join(', ')}</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-[#76777c] text-sm">arrow_forward</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
