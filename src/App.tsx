import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { Footer } from './components/Footer';
import { StartupMap } from './components/Map/StartupMap';
import { StartupDirectory } from './components/Directory/StartupDirectory';
import { FounderDirectory } from './components/Directory/FounderDirectory';
import { InvestorDirectory } from './components/Directory/InvestorDirectory';
import { JobBoard } from './components/Directory/JobBoard';
import { EcosystemAnalytics } from './components/Analytics/EcosystemAnalytics';
import { StartupProfile } from './components/StartupProfile';
import { FounderProfile } from './components/FounderProfile';
import { InvestorProfile } from './components/InvestorProfile';
import { AreaPage } from './components/AreaPage';
import { SavedPage } from './components/SavedPage';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { SearchModal } from './components/SearchModal';
import { SubmitModal } from './components/SubmitModal';
import { MoreDrawer } from './components/MoreDrawer';

import { startupService } from './services/startupService';
import { founderService } from './services/founderService';
import { investorService } from './services/investorService';
import { areaService } from './services/areaService';
import { Startup, Founder, Investor, Area } from './types';

// Async profile wrapper components
const StartupProfileView: React.FC<{
  slug: string;
  onSelectStartup: (slug: string) => void;
  onSelectFounder: (slug: string) => void;
  onNavigateArea: (areaSlug: string) => void;
  onBack: () => void;
}> = ({ slug, onSelectStartup, onSelectFounder, onNavigateArea, onBack }) => {
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    startupService
      .getStartupBySlug(slug)
      .then(setStartup)
      .catch(() => setStartup(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]"></div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#030612]">Startup Not Found</h2>
        <p className="text-sm text-[#545f72]">We couldn't find a startup matching "{slug}".</p>
        <button onClick={onBack} className="px-4 py-2 bg-[#FF6B35] text-white text-xs font-semibold rounded-lg">
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <StartupProfile
      startup={startup}
      onSelectStartup={onSelectStartup}
      onSelectFounder={onSelectFounder}
      onNavigateArea={onNavigateArea}
      onBack={onBack}
    />
  );
};

const FounderProfileView: React.FC<{
  slug: string;
  onSelectStartup: (slug: string) => void;
  onBack: () => void;
}> = ({ slug, onSelectStartup, onBack }) => {
  const [founder, setFounder] = useState<Founder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    founderService
      .getFounderBySlug(slug)
      .then(setFounder)
      .catch(() => setFounder(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full max-w-[1000px] mx-auto px-4 md:px-10 py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]"></div>
      </div>
    );
  }

  if (!founder) {
    return (
      <div className="w-full max-w-[1000px] mx-auto px-4 md:px-10 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#030612]">Founder Not Found</h2>
        <button onClick={onBack} className="px-4 py-2 bg-[#FF6B35] text-white text-xs font-semibold rounded-lg">
          Back to Founders
        </button>
      </div>
    );
  }

  return <FounderProfile founder={founder} onSelectStartup={onSelectStartup} onBack={onBack} />;
};

const InvestorProfileView: React.FC<{
  slug: string;
  onSelectStartup: (slug: string) => void;
  onBack: () => void;
}> = ({ slug, onSelectStartup, onBack }) => {
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    investorService
      .getInvestorBySlug(slug)
      .then(setInvestor)
      .catch(() => setInvestor(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full max-w-[1000px] mx-auto px-4 md:px-10 py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]"></div>
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="w-full max-w-[1000px] mx-auto px-4 md:px-10 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#030612]">Investor Not Found</h2>
        <button onClick={onBack} className="px-4 py-2 bg-[#FF6B35] text-white text-xs font-semibold rounded-lg">
          Back to Investors
        </button>
      </div>
    );
  }

  return <InvestorProfile investor={investor} onSelectStartup={onSelectStartup} onBack={onBack} />;
};

const AreaPageView: React.FC<{
  slug: string;
  onSelectStartup: (slug: string) => void;
  onExploreMap: () => void;
  onBack: () => void;
}> = ({ slug, onSelectStartup, onExploreMap, onBack }) => {
  const [area, setArea] = useState<Area | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    areaService
      .getAreaBySlug(slug)
      .then(setArea)
      .catch(() => setArea(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]"></div>
      </div>
    );
  }

  if (!area) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#030612]">Area Not Found</h2>
        <button onClick={onBack} className="px-4 py-2 bg-[#FF6B35] text-white text-xs font-semibold rounded-lg">
          Back to Startups
        </button>
      </div>
    );
  }

  return <AreaPage area={area} onSelectStartup={onSelectStartup} onExploreMap={onExploreMap} onBack={onBack} />;
};

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderRoute = () => {
    if (currentPath.startsWith('/startups/') && currentPath.length > '/startups/'.length) {
      const slug = currentPath.replace('/startups/', '');
      return (
        <StartupProfileView
          slug={slug}
          onSelectStartup={(s) => navigate(`/startups/${s}`)}
          onSelectFounder={(f) => navigate(`/founders/${f}`)}
          onNavigateArea={(a) => navigate(`/areas/${a}`)}
          onBack={() => navigate('/startups')}
        />
      );
    }

    if (currentPath.startsWith('/founders/') && currentPath.length > '/founders/'.length) {
      const slug = currentPath.replace('/founders/', '');
      return (
        <FounderProfileView
          slug={slug}
          onSelectStartup={(s) => navigate(`/startups/${s}`)}
          onBack={() => navigate('/founders')}
        />
      );
    }

    if (currentPath.startsWith('/investors/') && currentPath.length > '/investors/'.length) {
      const slug = currentPath.replace('/investors/', '');
      return (
        <InvestorProfileView
          slug={slug}
          onSelectStartup={(s) => navigate(`/startups/${s}`)}
          onBack={() => navigate('/investors')}
        />
      );
    }

    if (currentPath.startsWith('/areas/') && currentPath.length > '/areas/'.length) {
      const slug = currentPath.replace('/areas/', '');
      return (
        <AreaPageView
          slug={slug}
          onSelectStartup={(s) => navigate(`/startups/${s}`)}
          onExploreMap={() => navigate('/explore')}
          onBack={() => navigate('/startups')}
        />
      );
    }

    switch (currentPath) {
      case '/startups':
        return (
          <StartupDirectory
            onSelectStartup={(slug) => navigate(`/startups/${slug}`)}
            onExploreMap={() => navigate('/explore')}
          />
        );

      case '/founders':
        return (
          <FounderDirectory
            onSelectFounder={(slug) => navigate(`/founders/${slug}`)}
            onSelectStartup={(slug) => navigate(`/startups/${slug}`)}
          />
        );

      case '/investors':
        return (
          <InvestorDirectory
            onSelectInvestor={(slug) => navigate(`/investors/${slug}`)}
            onSelectStartup={(slug) => navigate(`/startups/${slug}`)}
          />
        );

      case '/jobs':
        return <JobBoard onSelectStartup={(slug) => navigate(`/startups/${slug}`)} />;

      case '/ecosystem':
        return (
          <EcosystemAnalytics
            onSelectSector={(_sec) => navigate('/startups')}
            onSelectArea={(_areaName) => navigate('/startups')}
            onNavigateStartups={() => navigate('/startups')}
          />
        );

      case '/saved':
        return (
          <SavedPage
            onSelectStartup={(slug) => navigate(`/startups/${slug}`)}
            onSelectFounder={(slug) => navigate(`/founders/${slug}`)}
            onSelectInvestor={(slug) => navigate(`/investors/${slug}`)}
            onExplore={() => navigate('/explore')}
          />
        );

      case '/admin':
        return (
          <AdminDashboard
            onBack={() => navigate('/')}
            onViewStartup={(slug) => navigate(`/startups/${slug}`)}
          />
        );

      case '/':
      case '/explore':
      default:
        return (
          <StartupMap
            onSelectStartup={(slug) => navigate(`/startups/${slug}`)}
            onNavigateArea={(areaSlug) => navigate(`/areas/${areaSlug}`)}
            onToggleView={(view) => {
              if (view === 'grid') navigate('/startups');
            }}
          />
        );
    }
  };

  const isMapRoute = currentPath === '/' || currentPath === '/explore';

  return (
    <div className="min-h-screen bg-[#fcf8f9] text-[#1c1b1c] flex flex-col font-sans selection:bg-[#FF6B35] selection:text-[#ffffff]">
      <Navbar
        currentRoute={currentPath}
        onNavigate={navigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSubmit={() => setIsSubmitOpen(true)}
      />

      <main className="flex-1 pt-16">{renderRoute()}</main>

      {!isMapRoute && (
        <Footer onNavigate={navigate} onOpenSubmit={() => setIsSubmitOpen(true)} />
      )}

      <MobileNav currentRoute={currentPath} onNavigate={navigate} onOpenMore={() => setIsMoreOpen(true)} />

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={navigate} />

      <SubmitModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />

      <MoreDrawer
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        onNavigate={navigate}
        onOpenSubmit={() => setIsSubmitOpen(true)}
      />
    </div>
  );
}

export default App;
