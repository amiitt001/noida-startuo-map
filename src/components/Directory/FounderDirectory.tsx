import React, { useState, useMemo } from 'react';
import { founderService } from '../../services/founderService';
import { FounderCard } from '../FounderCard';

interface FounderDirectoryProps {
  onSelectFounder: (slug: string) => void;
  onSelectStartup: (slug: string) => void;
}

export const FounderDirectory: React.FC<FounderDirectoryProps> = ({
  onSelectFounder,
  onSelectStartup,
}) => {
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('all');

  const founders = useMemo(() => {
    return founderService.filterFounders({
      search,
      sector: sector !== 'all' ? sector : undefined,
    });
  }, [search, sector]);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-label-caps text-xs text-[#545f72] uppercase font-bold tracking-wider">
            Builders & Innovators
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
          <span className="text-xs text-[#545f72] font-semibold">{founders.length} Founders</span>
        </div>
        <h1 className="font-h1 text-3xl md:text-4xl font-extrabold text-[#030612]">
          Noida Founders Directory
        </h1>
        <p className="text-sm text-[#545f72] mt-1">
          Discover the visionary engineers, operators, and entrepreneurs pioneering tech products in Noida and Greater Noida.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#76777c]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search founders by name, role, background, or startup..."
            className="w-full pl-9 pr-4 py-2 bg-[#f6f3f4] text-xs md:text-sm rounded-xl border border-transparent focus:border-[#FF6B35] focus:bg-white focus:outline-none"
          />
        </div>

        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="px-3 py-2 bg-[#f6f3f4] border border-[#c6c6cc]/40 rounded-xl text-xs font-semibold text-[#1c1b1c] focus:outline-none"
        >
          <option value="all">All Sectors</option>
          <option value="AI / ML">AI / ML</option>
          <option value="SaaS">SaaS</option>
          <option value="FinTech">FinTech</option>
          <option value="DeepTech">DeepTech</option>
          <option value="EV">EV & CleanTech</option>
          <option value="EdTech">EdTech</option>
          <option value="Cybersecurity">Cybersecurity</option>
        </select>
      </div>

      {/* Grid */}
      {founders.length === 0 ? (
        <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-12 text-center text-[#545f72]">
          <p className="text-sm font-semibold">No founders found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {founders.map((f) => (
            <FounderCard
              key={f.id}
              founder={f}
              onSelect={onSelectFounder}
              onSelectStartup={onSelectStartup}
            />
          ))}
        </div>
      )}
    </div>
  );
};
