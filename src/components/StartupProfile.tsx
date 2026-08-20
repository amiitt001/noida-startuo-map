import React, { useMemo } from 'react';
import { Startup } from '../types';
import { startupService } from '../services/startupService';
import { jobService } from '../services/jobService';
import { useSaved } from '../hooks/useSaved';
import { JobCard } from './JobCard';
import { StartupCard } from './StartupCard';

interface StartupProfileProps {
  startup: Startup;
  onSelectStartup: (slug: string) => void;
  onSelectFounder: (slug: string) => void;
  onNavigateArea: (areaSlug: string) => void;
  onBack: () => void;
}

export const StartupProfile: React.FC<StartupProfileProps> = ({
  startup,
  onSelectStartup,
  onSelectFounder,
  onNavigateArea,
  onBack,
}) => {
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved('startup', startup.id);

  const jobs = useMemo(() => jobService.getJobsByStartup(startup.id), [startup.id]);
  const similarStartups = useMemo(() => startupService.getSimilarStartups(startup, 3), [startup]);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Back Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#545f72]">
        <button
          onClick={onBack}
          className="flex items-center gap-1 hover:text-[#030612] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Startups</span>
        </button>
        <span>/</span>
        <span className="text-[#030612] truncate">{startup.name}</span>
      </div>

      {/* Header Banner & Hero Card */}
      <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={startup.logo}
              alt={startup.name}
              className="w-20 h-20 rounded-2xl bg-[#eae7e8] object-cover border border-[#c6c6cc]/50 shadow-sm"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-label-caps text-xs text-[#545f72] uppercase font-bold tracking-wider">
                  {startup.sectors.join(' · ')}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#c6c6cc]" />
                <span className="font-label-caps text-xs text-[#545f72] font-semibold">
                  {startup.type}
                </span>
                {startup.hiring && (
                  <span className="bg-[#1a1f2c] text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Actively Hiring
                  </span>
                )}
              </div>

              <h1 className="font-h1 text-2xl md:text-3xl font-extrabold text-[#030612] flex items-center gap-2">
                {startup.name}
                {startup.verified && (
                  <span className="material-symbols-outlined text-2xl text-[#FF6B35]" title="Verified Entity">
                    verified
                  </span>
                )}
              </h1>

              <p className="font-body-lg text-sm md:text-base text-[#45464c] mt-1 max-w-2xl">
                {startup.tagline}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => toggleSave('startup', startup.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
                saved
                  ? 'bg-[#FF6B35]/10 border-[#FF6B35] text-[#FF6B35]'
                  : 'bg-white border-[#c6c6cc] text-[#1c1b1c] hover:bg-[#f6f3f4]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
              >
                bookmark
              </span>
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>

            {startup.website && (
              <a
                href={startup.website}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#FF6B35] text-white text-sm font-bold rounded-xl hover:bg-[#e05a26] transition-colors shadow-sm"
              >
                <span>Visit Website</span>
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </a>
            )}
          </div>
        </div>

        {/* Quick Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#c6c6cc]/40">
          <div>
            <span className="font-metadata text-xs text-[#545f72] block">Current Stage</span>
            <span className="font-h3 text-base font-bold text-[#030612]">{startup.stage}</span>
          </div>
          <div>
            <span className="font-metadata text-xs text-[#545f72] block">Total Capital Raised</span>
            <span className="font-h3 text-base font-bold text-[#030612]">{startup.totalFunding}</span>
          </div>
          <div>
            <span className="font-metadata text-xs text-[#545f72] block">Founded Year</span>
            <span className="font-h3 text-base font-bold text-[#030612]">{startup.foundedYear}</span>
          </div>
          <div>
            <span className="font-metadata text-xs text-[#545f72] block">Team Headcount</span>
            <span className="font-h3 text-base font-bold text-[#030612]">{startup.employeeRange}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Content (Left) & Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-h3 text-lg font-bold text-[#030612]">About {startup.name}</h3>
            <p className="font-body-md text-sm text-[#45464c] leading-relaxed whitespace-pre-line">
              {startup.longDescription || startup.description}
            </p>

            {/* Products */}
            {startup.products && startup.products.length > 0 && (
              <div className="pt-4 border-t border-[#c6c6cc]/40 space-y-3">
                <h4 className="font-h3 text-sm font-bold text-[#030612]">Key Flagship Products</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {startup.products.map((p, idx) => (
                    <div key={idx} className="bg-[#f6f3f4] p-3.5 rounded-xl">
                      <h5 className="font-bold text-xs text-[#030612] mb-1">{p.name}</h5>
                      <p className="text-xs text-[#545f72] leading-relaxed">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Funding Rounds */}
          {startup.fundingRounds && startup.fundingRounds.length > 0 && (
            <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-h3 text-lg font-bold text-[#030612]">Funding History</h3>
                <span className="text-xs font-semibold text-[#545f72]">
                  {startup.fundingRounds.length} Disclosed Rounds
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#c6c6cc]/40 text-[#545f72] font-semibold">
                      <th className="pb-2">Round</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Lead Investors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c6c6cc]/30">
                    {startup.fundingRounds.map((round) => (
                      <tr key={round.id} className="py-2.5">
                        <td className="py-2.5 font-bold text-[#030612]">{round.roundType}</td>
                        <td className="py-2.5 font-semibold text-emerald-700">{round.amount}</td>
                        <td className="py-2.5 text-[#545f72]">{round.date}</td>
                        <td className="py-2.5 text-[#1c1b1c]">{round.leadInvestors.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Open Jobs at this Startup */}
          <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-h3 text-lg font-bold text-[#030612]">
                Open Opportunities ({jobs.length})
              </h3>
              {startup.hiring && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Fast-track Hiring in Noida
                </span>
              )}
            </div>

            {jobs.length === 0 ? (
              <div className="py-6 text-center text-[#545f72] text-xs">
                No public job postings currently listed for {startup.name}.
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} onSelectStartup={onSelectStartup} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          {/* Location & Micro-market */}
          <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-h3 text-sm font-bold text-[#030612]">Noida Headquarters</h3>
            <div className="flex items-start gap-2 text-xs text-[#45464c]">
              <span className="material-symbols-outlined text-[18px] text-[#FF6B35] shrink-0 mt-0.5">
                location_on
              </span>
              <div>
                <p className="font-semibold text-[#030612]">{startup.address}</p>
                <p className="text-[#545f72] mt-0.5">Coordinates: {startup.latitude.toFixed(4)}, {startup.longitude.toFixed(4)}</p>
              </div>
            </div>

            <button
              onClick={() => onNavigateArea(startup.areaId)}
              className="w-full mt-2 py-2 px-3 bg-[#f0edee] hover:bg-[#eae7e8] text-[#1c1b1c] text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <span>Explore Startups in {startup.areaName.split(',')[0]}</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {/* Founders */}
          <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-h3 text-sm font-bold text-[#030612]">Founding Team</h3>
            <div className="space-y-3">
              {startup.founders.map((f) => (
                <div
                  key={f.id}
                  onClick={() => onSelectFounder(f.slug)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f6f3f4] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img src={f.photo} alt={f.name} className="w-10 h-10 rounded-full object-cover border border-[#c6c6cc]/50" />
                    <div>
                      <h4 className="font-bold text-xs text-[#030612] group-hover:text-[#FF6B35] transition-colors">
                        {f.name}
                      </h4>
                      <p className="text-[11px] text-[#545f72]">{f.role}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-[#c6c6cc] group-hover:text-[#030612]">
                    chevron_right
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          {startup.techStack && startup.techStack.length > 0 && (
            <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="font-h3 text-sm font-bold text-[#030612]">Technology Stack</h3>
              <div className="flex flex-wrap gap-1.5">
                {startup.techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="bg-[#1a1f2c]/5 text-[#1c1b1c] text-xs font-semibold px-2.5 py-1 rounded-md"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-h3 text-sm font-bold text-[#030612]">Official Profiles</h3>
            <div className="flex flex-col gap-2">
              {startup.website && (
                <a
                  href={startup.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-xs text-[#545f72] hover:text-[#030612] py-1"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">language</span>
                    <span>Website</span>
                  </span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              )}
              {startup.linkedin && (
                <a
                  href={startup.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-xs text-[#545f72] hover:text-[#0077b5] py-1"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">work</span>
                    <span>LinkedIn Company</span>
                  </span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Startups Section */}
      {similarStartups.length > 0 && (
        <div className="pt-8 space-y-4">
          <h3 className="font-h2 text-xl font-bold text-[#030612]">
            Similar Startups in Noida
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {similarStartups.map((s) => (
              <StartupCard key={s.id} startup={s} onSelect={onSelectStartup} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
