import React from 'react';
import { Startup } from '../types';
import { useSaved } from '../hooks/useSaved';

interface StartupCardProps {
  startup: Startup;
  onSelect: (slug: string) => void;
}

export const StartupCard: React.FC<StartupCardProps> = ({ startup, onSelect }) => {
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved('startup', startup.id);

  return (
    <article
      onClick={() => onSelect(startup.slug)}
      className="bg-white border border-[#c6c6cc]/70 rounded-xl p-4 hover:border-[#030612] hover:shadow-md transition-all cursor-pointer flex flex-col h-full group relative"
    >
      {/* Top Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2.5">
          <img
            src={startup.logo}
            alt={`${startup.name} logo`}
            className="w-10 h-10 rounded-lg bg-[#eae7e8] object-cover border border-[#c6c6cc]/40 shrink-0"
          />
          <div className="min-w-0">
            <h3 className="font-h3 text-base font-bold text-[#030612] flex items-center gap-1 group-hover:text-[#FF6B35] transition-colors truncate">
              {startup.name}
              {startup.verified && (
                <span
                  className="material-symbols-outlined text-[16px] text-[#FF6B35]"
                  title="Verified Profile"
                >
                  check_circle
                </span>
              )}
            </h3>
            <p className="font-label-caps text-xs text-[#545f72] truncate">
              {startup.sectors.join(' · ')}
            </p>
          </div>
        </div>

        {/* Bookmark Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSave('startup', startup.id);
          }}
          className={`p-1.5 rounded-full transition-colors ${
            saved
              ? 'text-[#FF6B35] bg-[#FF6B35]/10'
              : 'text-[#c6c6cc] hover:text-[#030612] hover:bg-[#f6f3f4]'
          }`}
          title={saved ? 'Remove from saved' : 'Save startup'}
        >
          <span
            className="material-symbols-outlined text-lg"
            style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
          >
            bookmark
          </span>
        </button>
      </div>

      {/* Description */}
      <p className="font-body-md text-sm text-[#45464c] line-clamp-2 mb-4 flex-1">
        {startup.description}
      </p>

      {/* Footer Metadata */}
      <div className="flex flex-col gap-2 font-metadata text-xs text-[#545f72] mt-auto border-t border-[#c6c6cc]/40 pt-3">
        <div className="flex items-center gap-1 truncate">
          <span className="material-symbols-outlined text-[15px] text-[#76777c]">location_on</span>
          <span>{startup.areaName}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-[#030612]">{startup.stage}</span>
            <span>·</span>
            <span>{startup.foundedYear}</span>
            {startup.totalFunding && startup.totalFunding !== 'Undisclosed' && (
              <>
                <span>·</span>
                <span className="text-[#545f72] font-medium">{startup.totalFunding}</span>
              </>
            )}
          </span>

          {startup.hiring && (
            <span className="bg-[#1a1f2c] text-white px-2 py-0.5 rounded-full font-label-caps text-[10px] tracking-wider font-semibold">
              Hiring
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
