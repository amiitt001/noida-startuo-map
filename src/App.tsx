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

export function App() {
  // Simple client-side router state from window.location.pathname or internal state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Synchronize browser history
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

  // Keyboard shortcut for Cmd+K Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Match routes
  const renderRoute = () => {
    // 1. Startup Deep Dive: /startups/:slug
    if (currentPath.startsWith('/startups/') && currentPath.length > '/startups/'.length) {
      const slug = currentPath.replace('/startups/', '');
      const startup = startupService.getStartupBySlug(slug);
      if (startup) {
        return (
          <StartupProfile
            startup={startup}
            onSelectStartup={(s) => navigate(`/startups/${s}`)}
            onSelectFounder={(f) => navigate(`/founders/${f}`)}
            onNavigateArea={(a) => navigate(`/areas/${a}`)}
            onBack={() => navigate('/startups')}
          />
        );
      }
    }

    // 2. Founder Deep Dive: /founders/:slug
    if (currentPath.startsWith('/founders/') && currentPath.length > '/founders/'.length) {
      const slug = currentPath.replace('/founders/', '');
      const founder = founderService.getFounderBySlug(slug);
      if (founder) {
        return (
          <FounderProfile
            founder={founder}
            onSelectStartup={(s) => navigate(`/startups/${s}`)}
            onBack={() => navigate('/founders')}
          />
        );
      }
    }

    // 3. Investor Deep Dive: /investors/:slug
    if (currentPath.startsWith('/investors/') && currentPath.length > '/investors/'.length) {
      const slug = currentPath.replace('/investors/', '');
      const investor = investorService.getInvestorBySlug(slug);
      if (investor) {
        return (
          <InvestorProfile
            investor={investor}
            onSelectStartup={(s) => navigate(`/startups/${s}`)}
            onBack={() => navigate('/investors')}
          />
        );
      }
    }

    // 4. Area Hub: /areas/:slug
    if (currentPath.startsWith('/areas/') && currentPath.length > '/areas/'.length) {
      const slug = currentPath.replace('/areas/', '');
      const area = areaService.getAreaById(slug) || areaService.getAllAreas().find(a => a.slug === slug);
      if (area) {
        return (
          <AreaPage
            area={area}
            onSelectStartup={(s) => navigate(`/startups/${s}`)}
            onExploreMap={() => navigate('/explore')}
            onBack={() => navigate('/startups')}
          />
        );
      }
    }

    // Standard static routes
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
        return (
          <JobBoard
            onSelectStartup={(slug) => navigate(`/startups/${slug}`)}
          />
        );

      case '/ecosystem':
        return (
          <EcosystemAnalytics
            onSelectSector={(sec) => navigate('/startups')}
            onSelectArea={(areaName) => navigate('/startups')}
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
        // Interactive Startup Map (The Primary Hero Feature)
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
    <div className="min-h-screen bg-[#fcf8f9] text-[#1c1b1c] flex flex-col font-sans selection:bg-[#FF6B35] selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentRoute={currentPath}
        onNavigate={navigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSubmit={() => setIsSubmitOpen(true)}
      />

      {/* Main View Body */}
      <main className="flex-1 pt-16">
        {renderRoute()}
      </main>

      {/* Footer (Rendered on non-map screens to prevent map occlusion) */}
      {!isMapRoute && (
        <Footer
          onNavigate={navigate}
          onOpenSubmit={() => setIsSubmitOpen(true)}
        />
      )}

      {/* Mobile Navigation Dock */}
      <MobileNav
        currentRoute={currentPath}
        onNavigate={navigate}
        onOpenMore={() => setIsMoreOpen(true)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={navigate}
      />

      {/* Submit Startup Modal */}
      <SubmitModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSubmitted={() => {
          // Stay on current or go to directory
        }}
      />

      {/* Mobile More Drawer */}
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
