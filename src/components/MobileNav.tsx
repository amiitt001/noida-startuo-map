import React from 'react';
import { useSaved } from '../hooks/useSaved';

interface MobileNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenMore: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentRoute,
  onNavigate,
  onOpenMore,
}) => {
  const { count: savedCount } = useSaved();

  const isExplore = currentRoute === '/' || currentRoute === '/explore';
  const isStartups = currentRoute === '/startups' || currentRoute.startsWith('/startups/');
  const isJobs = currentRoute === '/jobs' || currentRoute.startsWith('/jobs/');
  const isSaved = currentRoute === '/saved';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-2 pb-6 px-2 bg-[#fcf8f9]/95 backdrop-blur-md border-t border-[#c6c6cc]/50 shadow-lg">
      <button
        onClick={() => onNavigate('/explore')}
        className={`flex flex-col items-center justify-center py-1 w-16 transition-transform cursor-pointer ${
          isExplore ? 'text-[#030612] font-bold scale-105' : 'text-[#45464c] hover:text-[#030612]'
        }`}
      >
        <div className={`w-10 h-7 rounded-full flex items-center justify-center mb-0.5 ${isExplore ? 'bg-[#1a1f2c]/15 text-[#030612]' : ''}`}>
          <span
            className="material-symbols-outlined text-2xl"
            style={{ fontVariationSettings: isExplore ? "'FILL' 1" : "'FILL' 0" }}
          >
            explore
          </span>
        </div>
        <span className="font-label-caps text-[10px] tracking-wide">Explore</span>
      </button>

      <button
        onClick={() => onNavigate('/startups')}
        className={`flex flex-col items-center justify-center py-1 w-16 transition-transform cursor-pointer ${
          isStartups ? 'text-[#030612] font-bold scale-105' : 'text-[#45464c] hover:text-[#030612]'
        }`}
      >
        <div className={`w-10 h-7 rounded-full flex items-center justify-center mb-0.5 ${isStartups ? 'bg-[#1a1f2c]/15 text-[#030612]' : ''}`}>
          <span
            className="material-symbols-outlined text-2xl"
            style={{ fontVariationSettings: isStartups ? "'FILL' 1" : "'FILL' 0" }}
          >
            rocket_launch
          </span>
        </div>
        <span className="font-label-caps text-[10px] tracking-wide">Startups</span>
      </button>

      <button
        onClick={() => onNavigate('/jobs')}
        className={`flex flex-col items-center justify-center py-1 w-16 transition-transform cursor-pointer ${
          isJobs ? 'text-[#030612] font-bold scale-105' : 'text-[#45464c] hover:text-[#030612]'
        }`}
      >
        <div className={`w-10 h-7 rounded-full flex items-center justify-center mb-0.5 ${isJobs ? 'bg-[#1a1f2c]/15 text-[#030612]' : ''}`}>
          <span
            className="material-symbols-outlined text-2xl"
            style={{ fontVariationSettings: isJobs ? "'FILL' 1" : "'FILL' 0" }}
          >
            work
          </span>
        </div>
        <span className="font-label-caps text-[10px] tracking-wide">Jobs</span>
      </button>

      <button
        onClick={() => onNavigate('/saved')}
        className={`flex flex-col items-center justify-center py-1 w-16 transition-transform relative cursor-pointer ${
          isSaved ? 'text-[#030612] font-bold scale-105' : 'text-[#45464c] hover:text-[#030612]'
        }`}
      >
        <div className={`w-10 h-7 rounded-full flex items-center justify-center mb-0.5 ${isSaved ? 'bg-[#1a1f2c]/15 text-[#030612]' : ''}`}>
          <span
            className="material-symbols-outlined text-2xl"
            style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
          >
            bookmark
          </span>
        </div>
        {savedCount > 0 && (
          <span className="absolute top-0 right-3 bg-[#FF6B35] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {savedCount}
          </span>
        )}
        <span className="font-label-caps text-[10px] tracking-wide">Saved</span>
      </button>

      <button
        onClick={onOpenMore}
        className="flex flex-col items-center justify-center py-1 w-16 text-[#45464c] hover:text-[#030612] transition-transform cursor-pointer"
      >
        <div className="w-10 h-7 rounded-full flex items-center justify-center mb-0.5">
          <span className="material-symbols-outlined text-2xl">more_horiz</span>
        </div>
        <span className="font-label-caps text-[10px] tracking-wide">More</span>
      </button>
    </nav>
  );
};
