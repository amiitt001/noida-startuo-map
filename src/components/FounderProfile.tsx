import React, { useState, useEffect } from 'react';
import { Founder, Startup } from '../types';
import { startupService } from '../services/startupService';
import { useSaved } from '../hooks/useSaved';

interface FounderProfileProps {
  founder: Founder;
  onSelectStartup: (slug: string) => void;
  onBack: () => void;
}

export const FounderProfile: React.FC<FounderProfileProps> = ({
  founder,
  onSelectStartup,
  onBack,
}) => {
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved('founder', founder.id);
  const [startup, setStartup] = useState<Startup | null>(null);

  useEffect(() => {
    if (founder.startupSlug) {
      startupService.getStartupBySlug(founder.startupSlug).then(setStartup).catch(() => setStartup(null));
    }
  }, [founder.startupSlug]);

  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 md:px-10 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#545f72]">
        <button
          onClick={onBack}
          className="flex items-center gap-1 hover:text-[#030612] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Founders Directory</span>
        </button>
        <span>/</span>
        <span className="text-[#030612] truncate">{founder.name}</span>
      </div>

      {/* Main Founder Card */}
      <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl overflow-hidden shadow-sm">
        {/* Banner Cover */}
        <div className="h-40 bg-gradient-to-r from-[#1a1f2c] via-[#2d3748] to-[#1a1f2c] relative">
          {founder.coverImage && (
            <img
              src={founder.coverImage}
              alt=""
              className="w-full h-full object-cover opacity-50 mix-blend-overlay"
            />
          )}
        </div>

        {/* Profile Overlap Info */}
        <div className="px-6 md:px-8 pb-8 relative -mt-16">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-6">
            <div className="flex items-end gap-5">
              <img
                src={founder.photo}
                alt={founder.name}
                className="w-28 h-28 rounded-full border-4 border-white object-cover bg-white shadow-lg"
              />
              <div className="mb-2">
                <h1 className="font-h1 text-2xl md:text-3xl font-extrabold text-[#030612]">
                  {founder.name}
                </h1>
                <p className="font-body-md text-sm text-[#545f72]">
                  {founder.role} @{' '}
                  <span
                    onClick={() => onSelectStartup(founder.startupSlug)}
                    className="font-bold text-[#030612] hover:text-[#FF6B35] hover:underline cursor-pointer"
                  >
                    {founder.startupName}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => toggleSave('founder', founder.id)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
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
                <span>{saved ? 'Saved' : 'Save Founder'}</span>
              </button>

              {founder.linkedin && (
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0077b5] text-white text-xs font-semibold rounded-xl hover:bg-[#006097] transition-colors"
                >
                  <span>Connect on LinkedIn</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              )}
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-4 pt-4 border-t border-[#c6c6cc]/40">
            <h3 className="font-h3 text-base font-bold text-[#030612]">Biography & Background</h3>
            <p className="font-body-md text-sm text-[#45464c] leading-relaxed max-w-3xl">
              {founder.bio}
            </p>
          </div>

          {/* Skills & Domain Focus */}
          <div className="space-y-3 pt-6 border-t border-[#c6c6cc]/40 mt-6">
            <h3 className="font-h3 text-sm font-bold text-[#030612]">Areas of Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {founder.skills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-[#1a1f2c]/5 text-[#1c1b1c] text-xs font-semibold px-3 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Education & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-[#c6c6cc]/40 mt-6 text-xs">
            {founder.education && (
              <div>
                <span className="text-[#545f72] font-semibold block uppercase tracking-wider text-[10px]">
                  Education & Alma Mater
                </span>
                <span className="font-bold text-[#030612] text-sm mt-1 block">
                  {founder.education}
                </span>
              </div>
            )}

            {founder.previousCompanies && (
              <div>
                <span className="text-[#545f72] font-semibold block uppercase tracking-wider text-[10px]">
                  Prior Experience
                </span>
                <span className="font-bold text-[#030612] text-sm mt-1 block">
                  {founder.previousCompanies.join(' • ')}
                </span>
              </div>
            )}
          </div>

          {/* Current Startup Spotlight */}
          {startup && (
            <div className="mt-8 pt-6 border-t border-[#c6c6cc]/40">
              <span className="text-[#545f72] font-semibold block uppercase tracking-wider text-[10px] mb-3">
                Current Venture in Noida
              </span>
              <div
                onClick={() => onSelectStartup(startup.slug)}
                className="bg-[#f6f3f4] p-4 rounded-xl flex items-center justify-between hover:bg-[#eae7e8] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img src={startup.logo} alt={startup.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <h4 className="font-bold text-sm text-[#030612]">{startup.name}</h4>
                    <p className="text-xs text-[#545f72]">{startup.tagline}</p>
                  </div>
                </div>
                <button className="text-xs font-semibold bg-[#1a1f2c] text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <span>View Startup</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
