import React, { useMemo } from 'react';
import { Area } from '../types';
import { startupService } from '../services/startupService';
import { StartupCard } from './StartupCard';

interface AreaPageProps {
  area: Area;
  onSelectStartup: (slug: string) => void;
  onExploreMap: () => void;
  onBack: () => void;
}

export const AreaPage: React.FC<AreaPageProps> = ({
  area,
  onSelectStartup,
  onExploreMap,
  onBack,
}) => {
  const startups = useMemo(() => startupService.getStartupsByArea(area.id), [area.id]);
  const hiringCount = startups.filter(s => s.hiring).length;

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#545f72]">
        <button
          onClick={onBack}
          className="flex items-center gap-1 hover:text-[#030612] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back</span>
        </button>
        <span>/</span>
        <span className="text-[#030612] truncate">{area.name}</span>
      </div>

      {/* Area Hero Banner */}
      <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#1a1f2c] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {area.city}
              </span>
              <span className="text-xs text-[#545f72] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">train</span>
                {area.connectivity}
              </span>
            </div>

            <h1 className="font-h1 text-3xl md:text-4xl font-extrabold text-[#030612]">
              Startups in {area.name}
            </h1>

            <p className="font-body-lg text-sm md:text-base text-[#45464c] max-w-2xl mt-2">
              {area.description}
            </p>
          </div>

          <button
            onClick={onExploreMap}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B35] text-white text-sm font-bold rounded-xl hover:bg-[#e05a26] transition-colors shadow"
          >
            <span className="material-symbols-outlined text-base">map</span>
            <span>View on Map</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#c6c6cc]/40">
          <div>
            <span className="text-xs text-[#545f72] block font-semibold">Active Startups</span>
            <span className="font-h2 text-2xl font-extrabold text-[#030612]">{startups.length}</span>
          </div>
          <div>
            <span className="text-xs text-[#545f72] block font-semibold">Hiring Teams</span>
            <span className="font-h2 text-2xl font-extrabold text-emerald-600">{hiringCount}</span>
          </div>
          <div>
            <span className="text-xs text-[#545f72] block font-semibold">Top Sector</span>
            <span className="font-h3 text-base font-bold text-[#030612]">{area.topSectors[0]}</span>
          </div>
          <div>
            <span className="text-xs text-[#545f72] block font-semibold">Tech Density</span>
            <span className="font-h3 text-base font-bold text-[#030612]">High Cluster</span>
          </div>
        </div>

        {/* Popular Tech Hubs */}
        <div className="mt-6 pt-4 border-t border-[#c6c6cc]/40">
          <span className="text-xs font-bold text-[#545f72] uppercase tracking-wider block mb-2">
            Notable Incubation & Tech Parks
          </span>
          <div className="flex flex-wrap gap-2">
            {area.popularHubs.map((hub, idx) => (
              <span key={idx} className="bg-[#f0edee] text-[#1c1b1c] text-xs font-medium px-3 py-1 rounded-full">
                {hub}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Startups in this area list */}
      <div className="space-y-4">
        <h2 className="font-h2 text-2xl font-bold text-[#030612]">
          Companies Headquartered in {area.shortName || area.name}
        </h2>
        {startups.length === 0 ? (
          <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-12 text-center text-[#545f72]">
            <p className="text-sm">No startups registered yet in this specific sector zone.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {startups.map((s) => (
              <StartupCard key={s.id} startup={s} onSelect={onSelectStartup} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
