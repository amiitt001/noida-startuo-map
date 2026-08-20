import React, { useState } from 'react';
import { useSaved } from '../hooks/useSaved';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string, param?: string) => void;
  onOpenSearch: () => void;
  onOpenSubmit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  onOpenSearch,
  onOpenSubmit,
}) => {
  const { count: savedCount } = useSaved();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-10 h-16 bg-[#fcf8f9]/95 backdrop-blur-md border-b border-[#c6c6cc]/40 shadow-none">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
          title="Noida Startup Atlas"
        >
          {/* Logo Pin & Graph Icon */}
          <div className="w-8 h-8 rounded-full bg-[#1a1f2c] flex items-center justify-center text-white relative shadow-sm group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[18px] text-[#FF6B35]">hub</span>
          </div>
          <div>
            <span className="font-h2 text-xl md:text-2xl font-extrabold text-[#030612] tracking-tight block leading-tight">
              Noida Startup Atlas
            </span>
          </div>
        </button>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-1 lg:gap-2 items-center">
        <button
          onClick={() => onNavigate('/explore')}
          className={`font-body-md font-semibold flex items-center gap-1.5 py-2 px-3 rounded-lg transition-colors cursor-pointer ${
            currentRoute === '/explore'
              ? 'bg-[#1a1f2c] text-white'
              : 'text-[#45464c] hover:bg-[#eae7e8] hover:text-[#030612]'
          }`}
        >
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: currentRoute === '/explore' ? "'FILL' 1" : "'FILL' 0" }}>
            explore
          </span>
          Explore Map
        </button>

        <button
          onClick={() => onNavigate('/startups')}
          className={`font-body-md font-semibold flex items-center gap-1.5 py-2 px-3 rounded-lg transition-colors cursor-pointer ${
            currentRoute === '/startups'
              ? 'bg-[#1a1f2c] text-white'
              : 'text-[#45464c] hover:bg-[#eae7e8] hover:text-[#030612]'
          }`}
        >
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: currentRoute === '/startups' ? "'FILL' 1" : "'FILL' 0" }}>
            rocket_launch
          </span>
          Startups
        </button>

        <button
          onClick={() => onNavigate('/founders')}
          className={`font-body-md font-semibold flex items-center gap-1.5 py-2 px-3 rounded-lg transition-colors cursor-pointer ${
            currentRoute === '/founders'
              ? 'bg-[#1a1f2c] text-white'
              : 'text-[#45464c] hover:bg-[#eae7e8] hover:text-[#030612]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">group</span>
          Founders
        </button>

        <button
          onClick={() => onNavigate('/investors')}
          className={`font-body-md font-semibold flex items-center gap-1.5 py-2 px-3 rounded-lg transition-colors cursor-pointer ${
            currentRoute === '/investors'
              ? 'bg-[#1a1f2c] text-white'
              : 'text-[#45464c] hover:bg-[#eae7e8] hover:text-[#030612]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">payments</span>
          Investors
        </button>

        <button
          onClick={() => onNavigate('/jobs')}
          className={`font-body-md font-semibold flex items-center gap-1.5 py-2 px-3 rounded-lg transition-colors cursor-pointer ${
            currentRoute === '/jobs'
              ? 'bg-[#1a1f2c] text-white'
              : 'text-[#45464c] hover:bg-[#eae7e8] hover:text-[#030612]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">work</span>
          Jobs
        </button>

        <button
          onClick={() => onNavigate('/ecosystem')}
          className={`font-body-md font-semibold flex items-center gap-1.5 py-2 px-3 rounded-lg transition-colors cursor-pointer ${
            currentRoute === '/ecosystem'
              ? 'bg-[#1a1f2c] text-white'
              : 'text-[#45464c] hover:bg-[#eae7e8] hover:text-[#030612]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">analytics</span>
          Analytics
        </button>

        {/* More Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="font-body-md font-semibold text-[#45464c] hover:bg-[#eae7e8] hover:text-[#030612] flex items-center gap-1 py-2 px-2 rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">more_horiz</span>
          </button>

          {moreOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#c6c6cc] rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                onClick={() => {
                  onNavigate('/saved');
                  setMoreOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-[#1c1b1c] hover:bg-[#f6f3f4] flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">bookmark</span>
                  Saved Items
                </span>
                {savedCount > 0 && (
                  <span className="bg-[#1a1f2c] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    {savedCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  onNavigate('/admin');
                  setMoreOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-[#1c1b1c] hover:bg-[#f6f3f4] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base text-[#FF6B35]">admin_panel_settings</span>
                Admin Console
              </button>
              <div className="border-t border-[#c6c6cc]/40 my-1"></div>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-full text-left px-4 py-2 text-sm text-[#45464c] hover:bg-[#f6f3f4] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">code</span>
                Open API Docs
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Right Action buttons */}
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={onOpenSearch}
          className="text-[#030612] hover:bg-[#eae7e8] p-2 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          title="Search anything (Cmd+K)"
        >
          <span className="material-symbols-outlined text-xl">search</span>
        </button>

        <button
          onClick={onOpenSubmit}
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#e05a26] transition-colors shadow-sm hover:shadow cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Submit Startup</span>
        </button>

        <button
          onClick={() => onNavigate('/admin')}
          className="md:hidden text-[#45464c] hover:bg-[#eae7e8] p-2 rounded-full flex items-center justify-center"
          title="Admin Panel"
        >
          <span className="material-symbols-outlined text-xl text-[#FF6B35]">admin_panel_settings</span>
        </button>
      </div>
    </header>
  );
};
