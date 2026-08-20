import React from 'react';

interface FooterProps {
  onNavigate: (route: string) => void;
  onOpenSubmit: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenSubmit }) => {
  return (
    <footer className="w-full bg-[#f6f3f4] border-t border-[#c6c6cc]/60 pt-12 pb-24 md:pb-12 mt-16 text-xs text-[#545f72]">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#1a1f2c] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[16px] text-[#FF6B35]">hub</span>
              </div>
              <span className="font-h2 text-base font-bold text-[#030612]">
                Noida Startup Atlas
              </span>
            </div>
            <p className="text-xs text-[#545f72] leading-relaxed">
              The canonical ecosystem registry and geographic intelligence platform for startups, founders, and investors in Noida & Greater Noida.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-[#030612]">
                Updated Daily • Open Community
              </span>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="font-h3 text-xs font-bold text-[#030612] uppercase tracking-wider mb-3">
              Explore Atlas
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('/explore')} className="hover:text-[#030612] transition-colors">
                  Interactive Startup Map
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/startups')} className="hover:text-[#030612] transition-colors">
                  Startups Directory
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/founders')} className="hover:text-[#030612] transition-colors">
                  Founders Network
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/investors')} className="hover:text-[#030612] transition-colors">
                  Active Investors
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/jobs')} className="hover:text-[#030612] transition-colors">
                  Startup Jobs
                </button>
              </li>
            </ul>
          </div>

          {/* Key Noida Clusters */}
          <div>
            <h4 className="font-h3 text-xs font-bold text-[#030612] uppercase tracking-wider mb-3">
              Innovation Zones
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('/areas/area-sec-62')} className="hover:text-[#030612] transition-colors">
                  Sector 62 IT & AI Corridor
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/areas/area-sec-135')} className="hover:text-[#030612] transition-colors">
                  Sector 135 Expressway SEZ
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/areas/area-sec-142')} className="hover:text-[#030612] transition-colors">
                  Sector 142 Advant Hub
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/areas/area-gr-noida-kp3')} className="hover:text-[#030612] transition-colors">
                  Knowledge Park III Tech
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/ecosystem')} className="hover:text-[#030612] transition-colors">
                  Ecosystem Analytics & Stats
                </button>
              </li>
            </ul>
          </div>

          {/* Submit & Admin */}
          <div>
            <h4 className="font-h3 text-xs font-bold text-[#030612] uppercase tracking-wider mb-3">
              Contribute
            </h4>
            <p className="text-xs text-[#545f72] mb-3">
              Building a tech company in Gautam Buddha Nagar? Get verified and listed.
            </p>
            <button
              onClick={onOpenSubmit}
              className="w-full py-2 bg-[#1a1f2c] hover:bg-[#030612] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm mb-2"
            >
              Submit Your Startup
            </button>
            <button
              onClick={() => onNavigate('/admin')}
              className="w-full py-1.5 text-xs text-[#545f72] hover:text-[#030612] text-center block"
            >
              Admin & Verification Portal →
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-[#c6c6cc]/40 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-[#76777c]">
          <p>© 2026 Noida Startup Atlas. Built for the NCR innovation ecosystem.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('/saved')} className="hover:text-[#030612]">
              Saved Bookmarks
            </button>
            <span>•</span>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[#030612]">
              Open Data Schema
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
