import React from 'react';
import { Founder } from '../types';
import { useSaved } from '../hooks/useSaved';

interface FounderCardProps {
  founder: Founder;
  onSelect: (slug: string) => void;
  onSelectStartup?: (startupSlug: string) => void;
}

export const FounderCard: React.FC<FounderCardProps> = ({
  founder,
  onSelect,
  onSelectStartup,
}) => {
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved('founder', founder.id);

  return (
    <div
      onClick={() => onSelect(founder.slug)}
      className="group bg-white border border-[#c6c6cc]/70 rounded-xl overflow-hidden hover:border-[#030612] hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Cover Header Banner */}
      <div className="h-28 bg-gradient-to-r from-[#1a1f2c] to-[#3c475a] relative overflow-hidden">
        {founder.coverImage && (
          <img
            src={founder.coverImage}
            alt=""
            className="w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSave('founder', founder.id);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
              saved
                ? 'bg-[#FF6B35] text-white'
                : 'bg-black/30 text-white hover:bg-black/50'
            }`}
            title="Bookmark Founder"
          >
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
            >
              bookmark
            </span>
          </button>
        </div>
      </div>

      {/* Body / Avatar Overlap */}
      <div className="px-5 pb-5 flex-1 flex flex-col relative -mt-10">
        <img
          src={founder.photo}
          alt={founder.name}
          className="w-18 h-18 rounded-full border-3 border-white object-cover bg-white shadow-md mb-2.5"
        />

        <div className="flex justify-between items-start mb-1">
          <h3 className="font-h3 text-lg font-bold text-[#030612] group-hover:text-[#FF6B35] transition-colors truncate">
            {founder.name}
          </h3>
          {founder.linkedin && (
            <a
              href={founder.linkedin}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[#545f72] hover:text-[#0077b5] p-1 rounded transition-colors"
              title="LinkedIn Profile"
            >
              <span className="material-symbols-outlined text-[18px]">work</span>
            </a>
          )}
        </div>

        <p className="font-body-md text-xs text-[#545f72] mb-3">
          {founder.role} @{' '}
          <span
            onClick={(e) => {
              if (onSelectStartup && founder.startupSlug) {
                e.stopPropagation();
                onSelectStartup(founder.startupSlug);
              }
            }}
            className="font-bold text-[#030612] hover:text-[#FF6B35] hover:underline cursor-pointer"
          >
            {founder.startupName}
          </span>
        </p>

        <p className="text-xs text-[#45464c] line-clamp-2 mb-4 leading-relaxed flex-1">
          {founder.bio}
        </p>

        {/* Tags & Location Footer */}
        <div className="mt-auto pt-3 flex flex-wrap gap-2 items-center border-t border-[#c6c6cc]/40">
          <span className="font-label-caps text-[10px] bg-[#1a1f2c]/5 text-[#1a1f2c] px-2 py-0.5 rounded-full font-semibold">
            {founder.sectors[0] || 'Tech'}
          </span>
          <span className="flex items-center gap-0.5 font-metadata text-[11px] text-[#545f72] ml-auto">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {founder.location.split(',')[0]}
          </span>
        </div>
      </div>
    </div>
  );
};
