import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import { Startup, SectorType, StartupStage, Area } from '../../types';
import { startupService } from '../../services/startupService';
import { areaService } from '../../services/areaService';
import { useSaved } from '../../hooks/useSaved';

interface StartupMapProps {
  onSelectStartup: (slug: string) => void;
  onNavigateArea?: (areaSlug: string) => void;
  initialSelectedSlug?: string;
  onToggleView?: (view: 'map' | 'grid') => void;
}

export const StartupMap: React.FC<StartupMapProps> = ({
  onSelectStartup,
  onNavigateArea,
  initialSelectedSlug,
  onToggleView,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});

  const [allStartups, setAllStartups] = useState<Startup[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [hiringOnly, setHiringOnly] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapStyle, setMapStyle] = useState<'osm' | 'dark' | 'voyager'>('voyager');

  const { isSaved, toggleSave } = useSaved();

  // Load initial data
  useEffect(() => {
    const list = startupService.getAllStartups();
    setAllStartups(list);
    setAreas(areaService.getAllAreas());

    if (initialSelectedSlug) {
      const found = list.find(s => s.slug === initialSelectedSlug);
      if (found) setSelectedStartup(found);
    }
  }, [initialSelectedSlug]);

  // Filtered startups list
  const filteredStartups = useMemo(() => {
    return allStartups.filter(s => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          s.name.toLowerCase().includes(q) ||
          s.tagline.toLowerCase().includes(q) ||
          s.sectors.some(sec => sec.toLowerCase().includes(q)) ||
          s.areaName.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filterType !== 'all' && s.type.toLowerCase() !== filterType.toLowerCase()) return false;
      if (filterArea !== 'all' && s.areaId !== filterArea && !s.areaName.toLowerCase().includes(filterArea.toLowerCase())) return false;
      if (filterSector !== 'all' && !s.sectors.some(sec => sec.toLowerCase() === filterSector.toLowerCase())) return false;
      if (filterStage !== 'all' && s.stage.toLowerCase() !== filterStage.toLowerCase()) return false;
      if (hiringOnly && !s.hiring) return false;
      if (verifiedOnly && !s.verified) return false;
      return true;
    });
  }, [allStartups, searchQuery, filterType, filterArea, filterSector, filterStage, hiringOnly, verifiedOnly]);

  // Sector icon helper
  const getSectorIcon = (sector: SectorType | string) => {
    const s = sector.toLowerCase();
    if (s.includes('ai') || s.includes('ml')) return 'psychology';
    if (s.includes('fintech')) return 'payments';
    if (s.includes('deeptech') || s.includes('robotics')) return 'science';
    if (s.includes('ev') || s.includes('climate')) return 'electric_bolt';
    if (s.includes('edtech')) return 'school';
    if (s.includes('health')) return 'medical_services';
    if (s.includes('logistics') || s.includes('commerce')) return 'shopping_cart';
    if (s.includes('cyber')) return 'shield';
    if (s.includes('proptech')) return 'apartment';
    return 'rocket_launch';
  };

  // Map Tile Style source URLs
  const getStyleObject = useCallback((style: 'osm' | 'dark' | 'voyager') => {
    // High-quality OpenStreetMap and Carto tile endpoints (free, CORS-friendly, reliable)
    let tilesUrl = 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png';
    if (style === 'dark') {
      tilesUrl = 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png';
    } else if (style === 'osm') {
      tilesUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    }

    return {
      version: 8 as const,
      sources: {
        'osm-tiles': {
          type: 'raster' as const,
          tiles: [tilesUrl],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        },
      },
      layers: [
        {
          id: 'osm-tiles-layer',
          type: 'raster' as const,
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };
  }, []);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Noida / Greater Noida bounding center
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getStyleObject(mapStyle),
      center: [77.3850, 28.5350], // Longitude, Latitude (Noida Center)
      zoom: 11.8,
      minZoom: 9,
      maxZoom: 18,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);
    });

    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
      }),
      'bottom-right'
    );

    return () => {
      map.remove();
    };
  }, [getStyleObject, mapStyle]);

  // Update Markers on filtered startups change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m: maplibregl.Marker) => m.remove());
    markersRef.current = {};

    // Group close coordinates or display markers
    filteredStartups.forEach(startup => {
      const isSelected = selectedStartup?.id === startup.id;
      const primarySector = startup.sectors[0] || 'SaaS';
      const iconName = getSectorIcon(primarySector);

      // Create custom HTML element for marker
      const el = document.createElement('div');
      el.className = 'group cursor-pointer transform transition-all duration-200';
      el.style.zIndex = isSelected ? '50' : '10';

      const inner = document.createElement('div');
      inner.className = `relative flex items-center justify-center transition-all ${
        isSelected
          ? 'w-12 h-12 rounded-full bg-[#1a1f2c] border-2 border-white shadow-xl scale-110 text-white'
          : 'w-9 h-9 rounded-full bg-white border border-[#c6c6cc] shadow-md hover:scale-115 text-[#1a1f2c] hover:border-[#FF6B35]'
      }`;

      // Icon or pulse ring
      if (isSelected) {
        const pulse = document.createElement('div');
        pulse.className = 'absolute -inset-1.5 rounded-full bg-[#FF6B35]/30 animate-ping pointer-events-none';
        inner.appendChild(pulse);
      }

      const iconSpan = document.createElement('span');
      iconSpan.className = 'material-symbols-outlined text-[18px] select-none';
      if (isSelected) {
        iconSpan.style.color = '#FF6B35';
      }
      iconSpan.innerText = iconName;
      inner.appendChild(iconSpan);

      // Hover Tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-[#1a1f2c] text-white text-[11px] font-semibold rounded shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30';
      tooltip.innerHTML = `${startup.name} <span class="text-[#FF6B35] font-normal">• ${primarySector}</span>`;
      inner.appendChild(tooltip);

      el.appendChild(inner);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedStartup(startup);
        map.flyTo({
          center: [startup.longitude, startup.latitude],
          zoom: 14,
          speed: 1.2,
          curve: 1.4,
          essential: true,
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([startup.longitude, startup.latitude])
        .addTo(map);

      markersRef.current[startup.id] = marker;
    });
  }, [filteredStartups, selectedStartup]);

  // Handle fly to selected startup if prop changed
  useEffect(() => {
    if (selectedStartup && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedStartup.longitude, selectedStartup.latitude],
        zoom: 14.2,
        speed: 1.2,
      });
    }
  }, [selectedStartup]);

  // Map Controls Helpers
  const handleZoomIn = () => {
    mapRef.current?.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut({ duration: 300 });
  };

  const handleResetLocation = () => {
    mapRef.current?.flyTo({
      center: [77.3850, 28.5350],
      zoom: 11.8,
      speed: 1.2,
    });
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] overflow-hidden bg-[#fcf8f9]">
      {/* Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Floating Top Control Bar (Matching Stitch Spec) */}
      <div className="fixed top-20 left-0 w-full z-30 px-4 md:px-10 flex justify-center pointer-events-none">
        <div className="w-full max-w-[1280px] flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pointer-events-auto">
          {/* Quick Filter Pill Row */}
          <div className="flex flex-wrap items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl md:rounded-full border border-[#c6c6cc]/70 shadow-md">
            {/* Type selector */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-full bg-transparent text-[#1c1b1c] text-xs md:text-sm font-semibold focus:outline-none cursor-pointer border-none"
            >
              <option value="all">All Types</option>
              <option value="Startup">Startup</option>
              <option value="Scale-up">Scale-up</option>
              <option value="Unicorn">Unicorn</option>
              <option value="Bootstrapped">Bootstrapped</option>
            </select>

            <div className="w-px h-4 bg-[#c6c6cc]" />

            {/* Area selector */}
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="px-3 py-1.5 rounded-full bg-transparent text-[#45464c] text-xs md:text-sm font-medium focus:outline-none cursor-pointer border-none"
            >
              <option value="all">All Areas</option>
              {areas.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>

            <div className="w-px h-4 bg-[#c6c6cc]" />

            {/* Sector selector */}
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="px-3 py-1.5 rounded-full bg-transparent text-[#45464c] text-xs md:text-sm font-medium focus:outline-none cursor-pointer border-none hidden sm:block"
            >
              <option value="all">All Sectors</option>
              <option value="AI / ML">AI / ML</option>
              <option value="SaaS">SaaS</option>
              <option value="FinTech">FinTech</option>
              <option value="DeepTech">DeepTech</option>
              <option value="EV">EV & Climate</option>
              <option value="EdTech">EdTech</option>
              <option value="HealthTech">HealthTech</option>
              <option value="Logistics">Logistics</option>
              <option value="Robotics">Robotics</option>
            </select>

            {/* Hiring toggle button */}
            <button
              onClick={() => setHiringOnly(!hiringOnly)}
              className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                hiringOnly ? 'bg-[#1a1f2c] text-white' : 'text-[#45464c] hover:bg-[#eae7e8]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">group_add</span>
              <span className="hidden sm:inline">Hiring</span>
            </button>

            {/* Tune filters modal toggle */}
            <button
              onClick={() => setShowFilterDrawer(true)}
              className="p-1.5 rounded-full text-[#45464c] hover:bg-[#eae7e8] hover:text-[#030612] transition-colors cursor-pointer"
              title="More Filters"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </button>
          </div>

          {/* Map / Grid View Toggle Button (from Stitch Design) */}
          <div className="flex items-center bg-white/90 backdrop-blur-md p-1 rounded-full border border-[#c6c6cc]/70 shadow-md">
            <button
              className="px-4 py-1.5 rounded-full bg-[#1a1f2c] text-white text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">map</span>
              Map
            </button>
            <button
              onClick={() => onToggleView && onToggleView('grid')}
              className="px-4 py-1.5 rounded-full bg-transparent text-[#45464c] hover:text-[#030612] hover:bg-[#eae7e8] text-xs md:text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              Grid ({filteredStartups.length})
            </button>
          </div>
        </div>
      </div>

      {/* Map Control Buttons (Floating Right, matching Stitch) */}
      <div className="absolute right-4 bottom-24 md:bottom-8 flex flex-col gap-2 z-30 pointer-events-auto">
        <div className="flex flex-col bg-white rounded-xl border border-[#c6c6cc] shadow-md overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center text-[#45464c] hover:bg-[#f6f3f4] hover:text-[#030612] transition-colors border-b border-[#c6c6cc]/40 cursor-pointer"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center text-[#45464c] hover:bg-[#f6f3f4] hover:text-[#030612] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-[20px]">remove</span>
          </button>
        </div>

        <button
          onClick={handleResetLocation}
          className="w-10 h-10 bg-white rounded-xl border border-[#c6c6cc] shadow-md flex items-center justify-center text-[#45464c] hover:bg-[#f6f3f4] hover:text-[#030612] transition-colors cursor-pointer"
          title="Center on Noida & Greater Noida"
        >
          <span className="material-symbols-outlined text-[20px]">my_location</span>
        </button>

        {/* Map Style Selector */}
        <div className="relative group">
          <button
            onClick={() => setMapStyle(mapStyle === 'voyager' ? 'dark' : mapStyle === 'dark' ? 'osm' : 'voyager')}
            className="w-10 h-10 bg-white rounded-xl border border-[#c6c6cc] shadow-md flex items-center justify-center text-[#45464c] hover:bg-[#f6f3f4] hover:text-[#030612] transition-colors cursor-pointer"
            title={`Style: ${mapStyle.toUpperCase()}`}
          >
            <span className="material-symbols-outlined text-[20px]">layers</span>
          </button>
        </div>
      </div>

      {/* Floating Selected Startup Popup Card (Desktop & Center) */}
      {selectedStartup && (
        <div className="hidden md:flex absolute top-36 left-10 z-30 w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-[#c6c6cc] p-4 shadow-xl flex-col gap-3 animate-in fade-in slide-in-from-left-4 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={selectedStartup.logo}
                alt={selectedStartup.name}
                className="w-11 h-11 rounded-lg bg-[#f0edee] object-cover border border-[#c6c6cc]/50"
              />
              <div>
                <span className="font-label-caps text-[10px] text-[#545f72] uppercase tracking-wider block">
                  {selectedStartup.sectors[0]} · {selectedStartup.type}
                </span>
                <h3 className="font-h3 text-lg font-bold text-[#030612] flex items-center gap-1">
                  {selectedStartup.name}
                  {selectedStartup.verified && (
                    <span className="material-symbols-outlined text-[15px] text-[#FF6B35]" title="Verified">
                      verified
                    </span>
                  )}
                </h3>
              </div>
            </div>
            <button
              onClick={() => setSelectedStartup(null)}
              className="text-[#76777c] hover:text-[#030612] p-1 rounded-full hover:bg-[#f0edee]"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <p className="text-xs text-[#45464c] line-clamp-2 leading-relaxed">
            {selectedStartup.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#45464c] pt-2 border-t border-[#c6c6cc]/40">
            <span className="flex items-center gap-1 font-semibold text-[#030612]">
              <span className="w-2 h-2 rounded-full bg-[#FF6B35]" />
              {selectedStartup.stage}
            </span>
            <span>•</span>
            <span className="flex items-center gap-0.5 text-[#545f72]">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {selectedStartup.areaName}
            </span>
            {selectedStartup.hiring && (
              <span className="ml-auto bg-[#1a1f2c] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                Hiring
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onSelectStartup(selectedStartup.slug)}
              className="flex-1 bg-[#1a1f2c] hover:bg-[#030612] text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>View Full Profile</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
            <button
              onClick={() => toggleSave('startup', selectedStartup.id)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isSaved('startup', selectedStartup.id)
                  ? 'bg-[#FF6B35]/10 border-[#FF6B35] text-[#FF6B35]'
                  : 'bg-white border-[#c6c6cc] text-[#45464c] hover:bg-[#f0edee]'
              }`}
              title="Save Startup"
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: isSaved('startup', selectedStartup.id) ? "'FILL' 1" : "'FILL' 0" }}
              >
                bookmark
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Sheet Drawer (Visible Area Summary - Stitch Spec) */}
      <div className="fixed bottom-16 md:bottom-6 left-0 w-full z-20 pointer-events-auto flex justify-center md:justify-start md:left-8">
        <div className="w-full md:w-[380px] bg-white rounded-t-2xl md:rounded-2xl border-t md:border border-[#c6c6cc] shadow-2xl flex flex-col max-h-[320px] md:max-h-[460px] transition-transform">
          {/* Mobile Drag Handle */}
          <div className="w-full h-4 flex justify-center items-center md:hidden">
            <div className="w-10 h-1 bg-[#c6c6cc] rounded-full" />
          </div>

          {/* Area Summary Header */}
          <div className="px-4 py-3 flex justify-between items-center border-b border-[#c6c6cc]/40">
            <div>
              <h2 className="font-h3 text-base font-bold text-[#030612]">Area Summary</h2>
              <p className="font-metadata text-xs text-[#545f72]">
                {filteredStartups.length} Startups in view
              </p>
            </div>
            <button
              onClick={() => onToggleView && onToggleView('grid')}
              className="text-[#030612] text-xs font-bold hover:text-[#FF6B35] transition-colors cursor-pointer"
            >
              View Grid
            </button>
          </div>

          {/* Scrollable Startups List */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 custom-scrollbar">
            {filteredStartups.length === 0 ? (
              <div className="py-8 text-center text-[#545f72]">
                <span className="material-symbols-outlined text-3xl mb-1 text-[#c6c6cc]">search_off</span>
                <p className="text-xs">No startups match active filters</p>
                <button
                  onClick={() => {
                    setFilterType('all');
                    setFilterArea('all');
                    setFilterSector('all');
                    setFilterStage('all');
                    setHiringOnly(false);
                    setSearchQuery('');
                  }}
                  className="mt-2 text-xs font-semibold text-[#FF6B35] hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredStartups.map(startup => (
                <div
                  key={startup.id}
                  onClick={() => {
                    setSelectedStartup(startup);
                    mapRef.current?.flyTo({
                      center: [startup.longitude, startup.latitude],
                      zoom: 14.5,
                      speed: 1.2,
                    });
                  }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer group ${
                    selectedStartup?.id === startup.id
                      ? 'bg-[#f6f3f4] border-[#1a1f2c] shadow-sm'
                      : 'bg-white border-[#c6c6cc]/40 hover:border-[#1a1f2c]'
                  }`}
                >
                  <img
                    src={startup.logo}
                    alt={startup.name}
                    className="w-10 h-10 rounded-lg bg-[#f0edee] object-cover border border-[#c6c6cc]/40 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-label-caps text-[9px] text-[#545f72] uppercase truncate">
                        {startup.sectors[0]}
                      </span>
                      {startup.hiring && (
                        <span className="bg-[#1a1f2c] text-white text-[8px] px-1.5 py-0.2 rounded font-bold">
                          HIRING
                        </span>
                      )}
                    </div>
                    <h4 className="font-body-md text-sm font-bold text-[#030612] truncate group-hover:text-[#FF6B35] transition-colors">
                      {startup.name}
                    </h4>
                    <p className="font-metadata text-[11px] text-[#545f72] truncate">
                      {startup.stage} • {startup.areaName.split(',')[0]}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectStartup(startup.slug);
                    }}
                    className="shrink-0 p-1.5 text-[#c6c6cc] group-hover:text-[#030612] transition-colors"
                    title="Open details"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* More Filters Drawer Modal */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-[#c6c6cc] p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#c6c6cc]/40 pb-3">
              <h3 className="font-h3 text-xl font-bold text-[#030612]">Filter Noida Atlas</h3>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="p-1 text-[#76777c] hover:text-[#030612] rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Keyword search in filter */}
            <div>
              <label className="block text-xs font-semibold text-[#545f72] uppercase tracking-wider mb-1.5">
                Keyword Search
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#76777c]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, technology, or founder..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-[#c6c6cc] rounded-lg focus:border-[#FF6B35] focus:outline-none"
                />
              </div>
            </div>

            {/* Sector */}
            <div>
              <label className="block text-xs font-semibold text-[#545f72] uppercase tracking-wider mb-1.5">
                Sector
              </label>
              <select
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="w-full p-2 text-sm border border-[#c6c6cc] rounded-lg focus:border-[#FF6B35] focus:outline-none"
              >
                <option value="all">All Sectors</option>
                <option value="AI / ML">AI / ML</option>
                <option value="SaaS">SaaS</option>
                <option value="FinTech">FinTech</option>
                <option value="DeepTech">DeepTech</option>
                <option value="EV">EV & Mobility</option>
                <option value="EdTech">EdTech</option>
                <option value="HealthTech">HealthTech</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Logistics">Logistics</option>
                <option value="AgriTech">AgriTech</option>
                <option value="Robotics">Robotics</option>
                <option value="Web3">Web3</option>
                <option value="PropTech">PropTech</option>
              </select>
            </div>

            {/* Stage */}
            <div>
              <label className="block text-xs font-semibold text-[#545f72] uppercase tracking-wider mb-1.5">
                Funding Stage
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['all', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Growth'].map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterStage(st)}
                    className={`py-1.5 px-2 text-xs rounded-lg border font-medium transition-colors ${
                      filterStage.toLowerCase() === st.toLowerCase()
                        ? 'bg-[#1a1f2c] text-white border-[#1a1f2c]'
                        : 'bg-white text-[#45464c] border-[#c6c6cc] hover:bg-[#f6f3f4]'
                    }`}
                  >
                    {st === 'all' ? 'Any Stage' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkbox filters */}
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#1c1b1c] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hiringOnly}
                  onChange={(e) => setHiringOnly(e.target.checked)}
                  className="rounded text-[#FF6B35] focus:ring-[#FF6B35] w-4 h-4"
                />
                Actively Hiring Only
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-[#1c1b1c] cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-[#FF6B35] focus:ring-[#FF6B35] w-4 h-4"
                />
                Verified Profiles Only
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-[#c6c6cc]/40 pt-4 mt-2">
              <button
                onClick={() => {
                  setFilterType('all');
                  setFilterArea('all');
                  setFilterSector('all');
                  setFilterStage('all');
                  setHiringOnly(false);
                  setVerifiedOnly(false);
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-[#76777c] hover:text-[#030612] underline"
              >
                Reset Filters
              </button>

              <button
                onClick={() => setShowFilterDrawer(false)}
                className="px-5 py-2 rounded-xl bg-[#1a1f2c] text-white text-sm font-semibold hover:bg-[#030612] transition-colors"
              >
                Apply Filters ({filteredStartups.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
