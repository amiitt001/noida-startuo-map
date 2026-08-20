import React from 'react';
import { Investor } from '../types';
import { useSaved } from '../hooks/useSaved';

interface InvestorCardProps {
  investor: Investor;
  onSelect: (slug: string) => void;
  onSelectStartup?: (slug: string) => void;
}

export const InvestorCard: React.FC<InvestorCardProps> = ({
  investor,
  onSelect,
  onSelectStartup,
}) => {
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved('investor', investor.id);

  return (
    <article
      onClick={() => onSelect(investor.slug)}
      className="bg-white border border-[#c6c6cc]/70 rounded-xl p-5 hover:border-[#030612] hover:shadow-md transition-all cursor-pointer flex flex-col h-full group"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <img
            src={investor.logo}
            alt={investor.name}
            className="w-12 h-12 rounded-xl bg-[#eae7e8] object-cover border border-[#c6c6cc]/40"
          />
          <div>
            <h3 className="font-h3 text-base font-bold text-[#030612] group-hover:text-[#FF6B35] transition-colors">
              {investor.name}
            </h3>
            <span className="font-label-caps text-[11px] text-[#545f72] font-semibold">
              {investor.type}
            </span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSave('investor', investor.id);
          }}
          className={`p-1.5 rounded-full transition-colors ${
            saved
              ? 'text-[#FF6B35] bg-[#FF6B35]/10'
              : 'text-[#c6c6cc] hover:text-[#030612] hover:bg-[#f6f3f4]'
          }`}
          title="Bookmark Investor"
        >
          <span
            className="material-symbols-outlined text-lg"
            style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
          >
            bookmark
          </span>
        </button>
      </div>

      <p className="font-body-md text-xs text-[#45464c] line-clamp-2 mb-4 leading-relaxed flex-1">
        {investor.description}
      </p>

      {/* Check Size & Location */}
      <div className="grid grid-cols-2 gap-2 bg-[#f6f3f4] p-2.5 rounded-lg mb-3 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#545f72] block">Check Size</span>
          <span className="font-semibold text-[#030612]">{investor.checkSize}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-[#545f72] block">Location</span>
          <span className="font-medium text-[#030612] truncate block">{investor.location}</span>
        </div>
      </div>

      {/* Portfolio Pills */}
      <div className="pt-2 border-t border-[#c6c6cc]/40">
        <span className="text-[10px] font-bold text-[#545f72] uppercase tracking-wider block mb-1.5">
          Key Portfolio
        </span>
        <div className="flex flex-wrap gap-1.5">
          {investor.portfolioCompanies.map((pc, idx) => (
            <span
              key={idx}
              onClick={(e) => {
                if (pc.slug && onSelectStartup) {
                  e.stopPropagation();
                  onSelectStartup(pc.slug);
                }
              }}
              className="text-[11px] font-medium bg-[#1a1f2c]/5 hover:bg-[#FF6B35]/10 hover:text-[#FF6B35] text-[#1c1b1c] px-2 py-0.5 rounded-md transition-colors"
            >
              {pc.name}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};
