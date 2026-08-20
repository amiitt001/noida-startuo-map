import React from 'react';
import { Investor } from '../types';
import { useSaved } from '../hooks/useSaved';

interface InvestorProfileProps {
  investor: Investor;
  onSelectStartup: (slug: string) => void;
  onBack: () => void;
}

export const InvestorProfile: React.FC<InvestorProfileProps> = ({
  investor,
  onSelectStartup,
  onBack,
}) => {
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved('investor', investor.id);

  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 md:px-10 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#545f72]">
        <button
          onClick={onBack}
          className="flex items-center gap-1 hover:text-[#030612] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Investors Directory</span>
        </button>
        <span>/</span>
        <span className="text-[#030612] truncate">{investor.name}</span>
      </div>

      <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#c6c6cc]/40">
          <div className="flex items-center gap-4">
            <img
              src={investor.logo}
              alt={investor.name}
              className="w-16 h-16 rounded-2xl bg-[#eae7e8] object-cover border border-[#c6c6cc]/50"
            />
            <div>
              <span className="font-label-caps text-xs text-[#545f72] font-semibold">
                {investor.type}
              </span>
              <h1 className="font-h1 text-2xl md:text-3xl font-extrabold text-[#030612]">
                {investor.name}
              </h1>
              <p className="text-xs text-[#545f72] flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {investor.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleSave('investor', investor.id)}
              className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                saved
                  ? 'bg-[#FF6B35]/10 border-[#FF6B35] text-[#FF6B35]'
                  : 'bg-white border-[#c6c6cc] text-[#1c1b1c] hover:bg-[#f6f3f4]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
              >
                bookmark
              </span>
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>

            {investor.website && (
              <a
                href={investor.website}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#1a1f2c] text-white text-xs font-semibold rounded-xl hover:bg-[#030612] transition-colors flex items-center gap-1"
              >
                <span>Visit Firm Website</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            )}
          </div>
        </div>

        {/* Thesis & Overview */}
        <div>
          <h3 className="font-h3 text-base font-bold text-[#030612] mb-2">Investment Thesis</h3>
          <p className="font-body-md text-sm text-[#45464c] leading-relaxed">
            {investor.description}
          </p>
        </div>

        {/* Investment Stages & Focus Sectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#c6c6cc]/40">
          <div>
            <h4 className="font-h3 text-xs font-bold text-[#545f72] uppercase tracking-wider mb-2">
              Stages Backed
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {investor.stages.map((st, i) => (
                <span key={i} className="bg-[#f6f3f4] text-[#030612] text-xs font-bold px-2.5 py-1 rounded-lg">
                  {st}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-h3 text-xs font-bold text-[#545f72] uppercase tracking-wider mb-2">
              Focus Sectors
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {investor.focusSectors.map((sec, i) => (
                <span key={i} className="bg-[#1a1f2c]/5 text-[#1a1f2c] text-xs font-semibold px-2.5 py-1 rounded-lg">
                  {sec}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Portfolio Companies */}
        <div className="pt-4 border-t border-[#c6c6cc]/40">
          <h3 className="font-h3 text-base font-bold text-[#030612] mb-3">
            Noida & NCR Portfolio Startups
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {investor.portfolioCompanies.map((comp, idx) => (
              <div
                key={idx}
                onClick={() => comp.slug && onSelectStartup(comp.slug)}
                className={`p-3.5 rounded-xl border border-[#c6c6cc]/50 transition-all ${
                  comp.slug ? 'bg-white hover:border-[#1a1f2c] cursor-pointer' : 'bg-[#f6f3f4]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#030612]">{comp.name}</span>
                  <span className="text-[10px] text-[#545f72] bg-[#eae7e8] px-2 py-0.5 rounded font-medium">
                    {comp.sector}
                  </span>
                </div>
                {comp.slug && (
                  <span className="text-[11px] text-[#FF6B35] font-semibold flex items-center gap-0.5 mt-2">
                    View profile on Atlas →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
