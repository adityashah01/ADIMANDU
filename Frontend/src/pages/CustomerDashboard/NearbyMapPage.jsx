import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    MapPin,
    Navigation,
    Search,
    SlidersHorizontal,
    LocateFixed,
    Sparkles,
    Star,
    Award,
    Calendar,
    Phone,
    Filter,
    Layers,
    Clock,
    Zap,
    CheckCircle,
    ChevronRight,
    Users
} from 'lucide-react';
import { providersApi } from '../../services/api';
import { useLocation, NEPAL_LOCATIONS } from '../../context/LocationContext';
import ExpertMap from '../../components/Map/ExpertMap';
import { calculateDistance, estimateTravelTime, getCategoryTheme } from '../../utils/geoUtils';
import { categories } from '../../data/categories';

export default function NearbyMapPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get('category') || '';
    const queryParam = searchParams.get('q') || '';

    const {
        location: selectedCity,
        setLocation: setSelectedCity,
        coordinates,
        searchRadius,
        setSearchRadius,
        detectGpsLocation,
        isDetectingGps
    } = useLocation();

    const [allProviders, setAllProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(queryParam);
    const [selectedCategory, setSelectedCategory] = useState(categoryParam);
    const [onlyAvailable, setOnlyAvailable] = useState(false);
    const [onlyVerified, setOnlyVerified] = useState(false);
    const [selectedProviderId, setSelectedProviderId] = useState(null);
    const [mobileView, setMobileView] = useState('split'); // 'split' | 'map' | 'list'

    // Fetch providers
    useEffect(() => {
        const loadProviders = async () => {
            setLoading(true);
            try {
                const params = coordinates ? { lat: coordinates.lat, lng: coordinates.lng } : {};
                const data = await providersApi.getAll(params);
                setAllProviders(data || []);
            } catch (err) {
                console.error("Failed to load providers for map:", err);
            } finally {
                setLoading(false);
            }
        };
        loadProviders();
    }, [coordinates]);

    // Filter & Sort by Distance
    const filteredProviders = useMemo(() => {
        let list = [...allProviders];

        // Search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q) ||
                    p.location.toLowerCase().includes(q) ||
                    p.skills?.some((s) => s.toLowerCase().includes(q))
            );
        }

        // Category
        if (selectedCategory) {
            list = list.filter((p) => p.categoryId === selectedCategory || p.category?.toLowerCase() === selectedCategory.toLowerCase());
        }

        // Availability
        if (onlyAvailable) {
            list = list.filter((p) => p.availability === 'available');
        }

        // Verified
        if (onlyVerified) {
            list = list.filter((p) => p.verified);
        }

        // Radius filter (if coordinates exist and radius is set)
        if (coordinates && searchRadius && searchRadius < 100) {
            list = list.filter((p) => {
                if (!p.latitude || !p.longitude) return true;
                const d = calculateDistance(coordinates.lat, coordinates.lng, p.latitude, p.longitude);
                return d !== null ? d <= searchRadius : true;
            });
        }

        // Sort by distance to user
        if (coordinates) {
            list.sort((a, b) => {
                const distA = a.latitude && a.longitude ? calculateDistance(coordinates.lat, coordinates.lng, a.latitude, a.longitude) : 9999;
                const distB = b.latitude && b.longitude ? calculateDistance(coordinates.lat, coordinates.lng, b.latitude, b.longitude) : 9999;
                return distA - distB;
            });
        }

        return list;
    }, [allProviders, searchQuery, selectedCategory, onlyAvailable, onlyVerified, coordinates, searchRadius]);

    const radiusOptions = [
        { label: '5 km (Immediate)', value: 5 },
        { label: '10 km (Local Area)', value: 10 },
        { label: '25 km (Valley Wide)', value: 25 },
        { label: '50 km (Regional)', value: 50 },
        { label: 'All Nepal', value: 100 },
    ];

    return (
        <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex flex-col">
            {/* Top Filter Bar */}
            <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 shadow-xs sticky top-0 z-30">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    {/* Left: Title & Quick City / GPS */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/30">
                                <Navigation className="w-4 h-4" />
                            </div>
                            <div>
                                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-none">Find Experts Near You</h1>
                                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Live Nepal Karigar Radar & Distance Tracker</p>
                            </div>
                        </div>

                        {/* City Selector */}
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <MapPin className="w-3.5 h-3.5 text-red-600 ml-1.5" />
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="bg-transparent text-xs font-bold text-slate-800 pr-3 py-1 focus:outline-none cursor-pointer"
                            >
                                {NEPAL_LOCATIONS.map((loc) => (
                                    <option key={loc.name} value={loc.name}>{loc.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={detectGpsLocation}
                                disabled={isDetectingGps}
                                className={`px-2 py-1 bg-white hover:bg-slate-50 text-blue-600 rounded-lg text-xs font-bold shadow-xs border border-slate-200 flex items-center gap-1 transition ${
                                    isDetectingGps ? 'animate-pulse' : ''
                                }`}
                                title="Use exact GPS coordinates"
                            >
                                <LocateFixed className="w-3 h-3" />
                                <span className="hidden sm:inline">GPS</span>
                            </button>
                        </div>
                    </div>

                    {/* Middle: Search input & Radius */}
                    <div className="flex items-center gap-2 flex-1 max-w-xl">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, skill, or area (e.g. Boudha, Thamel)..."
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-red-400 focus:outline-none"
                            />
                        </div>

                        {/* Radius Dropdown */}
                        <select
                            value={searchRadius}
                            onChange={(e) => setSearchRadius(Number(e.target.value))}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none cursor-pointer shrink-0"
                        >
                            {radiusOptions.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Mobile View Toggle (Map / List / Both) */}
                    <div className="flex lg:hidden items-center justify-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                        <button
                            onClick={() => setMobileView('list')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                                mobileView === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                            }`}
                        >
                            List ({filteredProviders.length})
                        </button>
                        <button
                            onClick={() => setMobileView('map')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                                mobileView === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                            }`}
                        >
                            Map View
                        </button>
                    </div>
                </div>

                {/* Category Pills & Fast Toggles */}
                <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            onClick={() => setSelectedCategory('')}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap ${
                                !selectedCategory
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            All Categories
                        </button>
                        {categories.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedCategory(selectedCategory === c.id ? '' : c.id)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
                                    selectedCategory === c.id
                                        ? 'bg-red-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                <span>{c.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {/* Emergency / Available fast toggle */}
                        <button
                            onClick={() => setOnlyAvailable(!onlyAvailable)}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition ${
                                onlyAvailable
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <Zap className="w-3 h-3 text-emerald-600" /> Available Now
                        </button>

                        <button
                            onClick={() => setOnlyVerified(!onlyVerified)}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition ${
                                onlyVerified
                                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <Award className="w-3 h-3 text-blue-600" /> Verified Only
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Interactive Split Canvas */}
            <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden" style={{ minHeight: 'calc(100vh - 150px)' }}>
                {/* Left Side: Scrollable Provider List */}
                <div className={`w-full lg:w-[420px] xl:w-[460px] bg-white border-r border-slate-200 overflow-y-auto shrink-0 flex flex-col ${
                    mobileView === 'map' ? 'hidden lg:flex' : 'flex'
                }`}>
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {filteredProviders.length} Nearby Experts Found
                        </span>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            Sorted by closest distance
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-12 flex flex-col items-center justify-center gap-3 text-center">
                            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-slate-500 font-medium">Locating nearby experts...</p>
                        </div>
                    ) : filteredProviders.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-sm font-bold text-slate-800">No experts in this radius</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                                Try expanding your search radius (e.g. 50 km) or choosing "All Locations".
                            </p>
                            <button
                                onClick={() => {
                                    setSearchRadius(100);
                                    setSelectedCategory('');
                                    setSearchQuery('');
                                }}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow hover:bg-red-700 transition"
                            >
                                Expand to All Nepal
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 p-2 space-y-1">
                            {filteredProviders.map((provider) => {
                                const isSelected = String(selectedProviderId) === String(provider.id);
                                const theme = getCategoryTheme(provider.categoryId || provider.category);
                                const dist = coordinates
                                    ? calculateDistance(coordinates.lat, coordinates.lng, provider.latitude, provider.longitude)
                                    : (provider.distance || 0);
                                const travelTime = estimateTravelTime(dist);

                                return (
                                    <div
                                        key={provider.id}
                                        onClick={() => setSelectedProviderId(provider.id)}
                                        className={`p-3.5 rounded-2xl cursor-pointer transition-all ${
                                            isSelected
                                                ? 'bg-blue-50/80 border-2 border-blue-500 shadow-md ring-2 ring-blue-500/10'
                                                : 'hover:bg-slate-50 border border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={provider.avatar}
                                                alt={provider.name}
                                                className="w-13 h-13 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0 bg-slate-100"
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=3b82f6&color=fff`;
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1">
                                                    <h4 className="text-sm font-bold text-slate-900 truncate">{provider.name}</h4>
                                                    <span className="text-xs font-black text-slate-900 shrink-0">
                                                        Rs. {Number(provider.price || 0).toLocaleString()}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-xs font-semibold text-red-600">{provider.category}</span>
                                                    {provider.verified && (
                                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-md">
                                                            ✓ Verified
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Distance & Travel Time Row */}
                                                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                                                    <div className="flex items-center gap-1 font-bold text-blue-600">
                                                        <Navigation className="w-3.5 h-3.5" />
                                                        <span>{dist !== null ? `${dist} km away` : 'Nearby'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{travelTime}</span>
                                                    </div>
                                                </div>

                                                {/* Action Bar */}
                                                <div className="mt-2.5 flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                                                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                                                        <span>{provider.rating || '5.0'}</span>
                                                        <span className="text-slate-400 font-normal">({provider.reviewCount || 10})</span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        <Link
                                                            to={`/providers/${provider.id}`}
                                                            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            Profile
                                                        </Link>
                                                        <Link
                                                            to={`/book/${provider.id}`}
                                                            className="text-xs font-bold text-white px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 transition shadow-xs"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            Book
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Side: Interactive Leaflet Map */}
                <div className={`flex-1 relative h-full min-h-[450px] lg:min-h-full ${
                    mobileView === 'list' ? 'hidden lg:block' : 'block'
                }`}>
                    <ExpertMap
                        providers={filteredProviders}
                        selectedProviderId={selectedProviderId}
                        onSelectProvider={(p) => setSelectedProviderId(p?.id || null)}
                        height="100%"
                        showRadiusCircle={true}
                        showRouteLine={true}
                        interactive={true}
                    />
                </div>
            </div>
        </div>
    );
}
