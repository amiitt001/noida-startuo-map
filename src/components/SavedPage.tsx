import React, { useState, useMemo } from 'react';
import { useSaved } from '../hooks/useSaved';
import { startupService } from '../services/startupService';
import { founderService } from '../services/founderService';
import { investorService } from '../services/investorService';
import { jobService } from '../services/jobService';
import { StartupCard } from './StartupCard';
import { FounderCard } from './FounderCard';
import { InvestorCard } from './InvestorCard';
import { JobCard } from './JobCard';

interface SavedPageProps {
  onSelectStartup: (slug: string) => void;
  onSelectFounder: (slug: string) => void;
  onSelectInvestor: (slug: string) => void;
  onExplore: () => void;
}

export const SavedPage: React.FC<SavedPageProps> = ({
  onSelectStartup,
  onSelectFounder,
  onSelectInvestor,
  onExplore,
}) => {
  const { bookmarks } = useSaved();
  const [activeTab, setActiveTab] = useState<'all' | 'startup' | 'job' | 'founder' | 'investor'>('all');

  const allStartups = useMemo(() => startupService.getAllStartups(), []);
  const allFounders = useMemo(() => founderService.getAllFounders(), []);
  const allInvestors = useMemo(() => investorService.getAllInvestors(), []);
  const allJobs = useMemo(() => jobService.getAllJobs(), []);

  const savedStartups = useMemo(() => {
    const ids = bookmarks.filter(b => b.type === 'startup').map(b => b.itemId);
    return allStartups.filter(s => ids.includes(s.id));
  }, [bookmarks, allStartups]);

  const savedFounders = useMemo(() => {
    const ids = bookmarks.filter(b => b.type === 'founder').map(b => b.itemId);
    return allFounders.filter(f => ids.includes(f.id));
  }, [bookmarks, allFounders]);

  const savedInvestors = useMemo(() => {
    const ids = bookmarks.filter(b => b.type === 'investor').map(b => b.itemId);
    return allInvestors.filter(i => ids.includes(i.id));
  }, [bookmarks, allInvestors]);

  const savedJobs = useMemo(() => {
    const ids = bookmarks.filter(b => b.type === 'job').map(b => b.itemId);
    return allJobs.filter(j => ids.includes(j.id));
  }, [bookmarks, allJobs]);

  const totalSaved = bookmarks.length;

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[#FF6B35] text-2xl">bookmarks</span>
          <span className="font-label-caps text-xs text-[#545f72] uppercase font-bold tracking-wider">
            Personal Collection
          </span>
        </div>
        <h1 className="font-h1 text-3xl md:text-4xl font-extrabold text-[#030612]">
          Saved Ecosystem Directory
        </h1>
        <p className="text-sm text-[#545f72] mt-1">
          {totalSaved} bookmarked startups, founders, investors, and job openings saved to your device.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-[#c6c6cc]/40">
        {[
          { id: 'all', label: 'All Saved', count: totalSaved },
          { id: 'startup', label: 'Startups', count: savedStartups.length },
          { id: 'job', label: 'Jobs', count: savedJobs.length },
          { id: 'founder', label: 'Founders', count: savedFounders.length },
          { id: 'investor', label: 'Investors', count: savedInvestors.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#1a1f2c] text-white'
                : 'bg-[#f6f3f4] text-[#45464c] hover:bg-[#eae7e8]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#c6c6cc]/40 text-[#1c1b1c]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {totalSaved === 0 ? (
        <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[#f6f3f4] flex items-center justify-center text-[#76777c]">
            <span className="material-symbols-outlined text-3xl">bookmark_border</span>
          </div>
          <h3 className="font-h3 text-lg font-bold text-[#030612]">No Saved Items Yet</h3>
          <p className="text-xs text-[#545f72] max-w-sm">
            Click the bookmark icon on any startup, job, or founder card across the atlas to save them here for quick access.
          </p>
          <button
            onClick={onExplore}
            className="mt-2 px-5 py-2.5 bg-[#FF6B35] text-white text-xs font-bold rounded-xl hover:bg-[#e05a26] transition-colors"
          >
            Explore Startups & Map
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Startups Section */}
          {(activeTab === 'all' || activeTab === 'startup') && savedStartups.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-h3 text-lg font-bold text-[#030612] flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-[#FF6B35]">rocket_launch</span>
                <span>Saved Startups ({savedStartups.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {savedStartups.map(s => (
                  <StartupCard key={s.id} startup={s} onSelect={onSelectStartup} />
                ))}
              </div>
            </div>
          )}

          {/* Jobs Section */}
          {(activeTab === 'all' || activeTab === 'job') && savedJobs.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-h3 text-lg font-bold text-[#030612] flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-[#FF6B35]">work</span>
                <span>Saved Job Openings ({savedJobs.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {savedJobs.map(j => (
                  <JobCard key={j.id} job={j} onSelectStartup={onSelectStartup} />
                ))}
              </div>
            </div>
          )}

          {/* Founders Section */}
          {(activeTab === 'all' || activeTab === 'founder') && savedFounders.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-h3 text-lg font-bold text-[#030612] flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-[#FF6B35]">group</span>
                <span>Saved Founders ({savedFounders.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {savedFounders.map(f => (
                  <FounderCard
                    key={f.id}
                    founder={f}
                    onSelect={onSelectFounder}
                    onSelectStartup={onSelectStartup}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Investors Section */}
          {(activeTab === 'all' || activeTab === 'investor') && savedInvestors.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-h3 text-lg font-bold text-[#030612] flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-[#FF6B35]">payments</span>
                <span>Saved Investors ({savedInvestors.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {savedInvestors.map(i => (
                  <InvestorCard
                    key={i.id}
                    investor={i}
                    onSelect={onSelectInvestor}
                    onSelectStartup={onSelectStartup}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
