import React, { useMemo } from 'react';
import { analyticsService } from '../../services/analyticsService';

interface EcosystemAnalyticsProps {
  onSelectSector?: (sector: string) => void;
  onSelectArea?: (areaName: string) => void;
  onNavigateStartups?: () => void;
}

export const EcosystemAnalytics: React.FC<EcosystemAnalyticsProps> = ({
  onSelectSector,
  onSelectArea,
  onNavigateStartups,
}) => {
  const stats = useMemo(() => analyticsService.getEcosystemStats(), []);

  const maxFundingYear = Math.max(...stats.fundingTimeline.map(t => t.amountMillions));

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a1f2c]/5 text-[#1a1f2c] text-xs font-bold uppercase tracking-wider mb-2">
          <span className="material-symbols-outlined text-[15px] text-[#FF6B35]">query_stats</span>
          Ecosystem Intelligence Report
        </div>
        <h1 className="font-h1 text-3xl md:text-4xl font-extrabold text-[#030612]">
          Noida Startup Ecosystem Analytics
        </h1>
        <p className="font-body-lg text-[#545f72] max-w-3xl mt-2">
          Real-time metrics, funding velocity, sectoral concentration, and geographical clustering across Noida, Greater Noida, and Yamuna Expressway.
        </p>
      </div>

      {/* Primary KPI Bento Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-metadata text-xs text-[#545f72] uppercase font-bold tracking-wider">
              Total Startups
            </span>
            <span className="material-symbols-outlined text-[#FF6B35] text-xl">rocket_launch</span>
          </div>
          <div className="font-h2 text-3xl font-extrabold text-[#030612] mb-1">
            {stats.totalStartups.toLocaleString()}+
          </div>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            +18% Year-over-Year
          </span>
        </div>

        <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-metadata text-xs text-[#545f72] uppercase font-bold tracking-wider">
              Disclosed Capital
            </span>
            <span className="material-symbols-outlined text-[#FF6B35] text-xl">paid</span>
          </div>
          <div className="font-h2 text-3xl font-extrabold text-[#030612] mb-1">
            {stats.totalFundingDisclosed}
          </div>
          <span className="text-xs text-[#545f72]">Across 220+ disclosed rounds</span>
        </div>

        <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-metadata text-xs text-[#545f72] uppercase font-bold tracking-wider">
              Hiring Startups
            </span>
            <span className="material-symbols-outlined text-[#FF6B35] text-xl">group_add</span>
          </div>
          <div className="font-h2 text-3xl font-extrabold text-[#030612] mb-1">
            {stats.hiringStartupsCount * 28}+
          </div>
          <span className="text-xs text-[#545f72]">{stats.totalJobs}+ Active Job Openings</span>
        </div>

        <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-metadata text-xs text-[#545f72] uppercase font-bold tracking-wider">
              Innovation Hubs
            </span>
            <span className="material-symbols-outlined text-[#FF6B35] text-xl">hub</span>
          </div>
          <div className="font-h2 text-3xl font-extrabold text-[#030612] mb-1">
            {stats.totalIncubators}+
          </div>
          <span className="text-xs text-[#545f72]">Incubators & Accelerators</span>
        </div>
      </div>

      {/* Sector Distribution + Stage Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sector Distribution Card */}
        <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-h3 text-xl font-bold text-[#030612]">Sectoral Distribution</h3>
                <p className="text-xs text-[#545f72]">Concentration of tech companies by industry sector</p>
              </div>
              <span className="material-symbols-outlined text-gray-400">pie_chart</span>
            </div>

            <div className="space-y-3 mt-4">
              {stats.sectorBreakdown.slice(0, 7).map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectSector && onSelectSector(item.sector)}
                  className="group cursor-pointer"
                >
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-[#1c1b1c] group-hover:text-[#FF6B35] transition-colors flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#1a1f2c]" />
                      {item.sector}
                    </span>
                    <span className="text-[#545f72]">{item.count} companies ({item.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-[#f0edee] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1a1f2c] group-hover:bg-[#FF6B35] transition-all duration-300"
                      style={{ width: `${Math.max(8, item.percentage * 3)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-[#c6c6cc]/40 flex justify-between items-center text-xs text-[#545f72]">
            <span>Top cluster: Artificial Intelligence & Enterprise SaaS</span>
            {onNavigateStartups && (
              <button
                onClick={onNavigateStartups}
                className="font-bold text-[#030612] hover:text-[#FF6B35] transition-colors"
              >
                Browse Sector Directory →
              </button>
            )}
          </div>
        </div>

        {/* Stage Pyramid */}
        <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-h3 text-xl font-bold text-[#030612]">Startup Maturity & Stages</h3>
                <p className="text-xs text-[#545f72]">Maturity breakdown from Pre-seed to Growth</p>
              </div>
              <span className="material-symbols-outlined text-gray-400">bar_chart</span>
            </div>

            <div className="space-y-3.5 mt-4">
              {stats.stageBreakdown.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-[#1c1b1c]">{item.stage}</span>
                    <span className="text-[#545f72]">{item.count} companies</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#f0edee] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#1a1f2c] to-[#FF6B35] rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(12, item.percentage * 2.8)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-[#c6c6cc]/40 text-xs text-[#545f72] flex items-center justify-between">
            <span>Strong early-stage funnel fueled by NCR engineering colleges</span>
          </div>
        </div>
      </div>

      {/* Funding Timeline Chart & Geographic Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Funding Velocity Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-[#c6c6cc]/70 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-h3 text-xl font-bold text-[#030612]">Venture Capital Velocity ($ Millions)</h3>
              <p className="text-xs text-[#545f72]">Cumulative disclosed funding by investment year</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">
              Record High 2025
            </span>
          </div>

          {/* SVG/CSS Responsive Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-4 pt-6 pb-2 border-b border-[#c6c6cc]/40">
            {stats.fundingTimeline.map((item, idx) => {
              const heightPct = (item.amountMillions / maxFundingYear) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-bold text-[#030612] opacity-80 group-hover:opacity-100 group-hover:text-[#FF6B35] transition-colors">
                    ${item.amountMillions}M
                  </span>
                  <div className="w-full max-w-[48px] bg-[#f0edee] rounded-t-lg overflow-hidden h-full flex items-end">
                    <div
                      className="w-full bg-[#1a1f2c] group-hover:bg-[#FF6B35] rounded-t-lg transition-all duration-300"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="font-metadata text-xs text-[#545f72] font-semibold">{item.year}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Geographic Hotspots */}
        <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-h3 text-xl font-bold text-[#030612]">Geographic Hubs</h3>
                <p className="text-xs text-[#545f72]">Startups by micro-market sector</p>
              </div>
              <span className="material-symbols-outlined text-gray-400">map</span>
            </div>

            <div className="space-y-3">
              {stats.areaBreakdown.slice(0, 6).map((area, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectArea && onSelectArea(area.areaName)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f6f3f4] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#FF6B35]">location_on</span>
                    <span className="text-xs font-bold text-[#030612]">{area.areaName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-[#1a1f2c]">{area.count} Startups</span>
                    {area.hiringCount > 0 && (
                      <span className="text-[10px] text-emerald-600 block">{area.hiringCount} Hiring</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#c6c6cc]/40 text-xs text-[#545f72]">
            Expressway corridor (Sec 135–142) is highest growing sub-market.
          </div>
        </div>
      </div>
    </div>
  );
};
