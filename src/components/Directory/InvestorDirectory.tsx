import React, { useState } from 'react';
import { useInvestors } from '../../hooks/useInvestors';
import { InvestorCard } from '../InvestorCard';

interface InvestorDirectoryProps {
  onSelectInvestor: (slug: string) => void;
  onSelectStartup: (slug: string) => void;
}

export const InvestorDirectory: React.FC<InvestorDirectoryProps> = ({
  onSelectInvestor,
  onSelectStartup,
}) => {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');

  const { investors, loading } = useInvestors(search, type !== 'all' ? type : undefined);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-label-caps text-xs text-[#545f72] uppercase font-bold tracking-wider">
            Capital & Angels
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
          <span className="text-xs text-[#545f72] font-semibold">{investors.length} Investment Funds</span>
        </div>
        <h1 className="font-h1 text-3xl md:text-4xl font-extrabold text-[#030612]">
          Noida & NCR Investors Directory
        </h1>
        <p className="text-sm text-[#545f72] mt-1">
          Venture capital funds, micro-VCs, angel networks, and family offices actively deploying capital into Noida tech ventures.
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
            placeholder="Search investors by name, thesis, check size, or location..."
            className="w-full pl-9 pr-4 py-2 bg-[#f6f3f4] text-xs md:text-sm rounded-xl border border-transparent focus:border-[#FF6B35] focus:bg-white focus:outline-none"
          />
        </div>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2 bg-[#f6f3f4] border border-[#c6c6cc]/40 rounded-xl text-xs font-semibold text-[#1c1b1c] focus:outline-none"
        >
          <option value="all">All Investor Types</option>
          <option value="Venture Capital">Venture Capital</option>
          <option value="Angel Network">Angel Network</option>
          <option value="Incubator / Seed Fund">Incubator / Seed Fund</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {investors.map((inv) => (
          <InvestorCard
            key={inv.id}
            investor={inv}
            onSelect={onSelectInvestor}
            onSelectStartup={onSelectStartup}
          />
        ))}
      </div>
    </div>
  );
};
