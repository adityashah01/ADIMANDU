import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, MapPin, Map as MapIcon, Grid, Navigation, Star, Award, LocateFixed } from 'lucide-react';
import { categories } from '../../data/categories';
import { providersApi } from '../../services/api';
import ProviderCard from '../../components/CustomerPage/ProviderCard';
import ExpertMap from '../../components/Map/ExpertMap';
import { useLocation } from '../../context/LocationContext';
import { calculateDistance, estimateTravelTime } from '../../utils/geoUtils';

const sortOptions = [
    { label: '📍 Nearest First', value: 'distance' },
    { label: '★ Highest Rated', value: 'rating' },
    { label: '💬 Most Reviews', value: 'reviews' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Best Match', value: 'match' },
];

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const locationParam = searchParams.get('location') || '';
    const categoryParam = searchParams.get('category') || '';

    const { location: ctxLocation, setLocation: setCtxLocation, coordinates, detectGpsLocation, isDetectingGps, searchRadius } = useLocation();

    const [inputValue, setInputValue] = useState(query);
    const [selectedCategory, setSelectedCategory] = useState(categoryParam);
    const [selectedAvailability, setSelectedAvailability] = useState('');
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [minRating, setMinRating] = useState(0);
    const [sortBy, setSortBy] = useState('distance'); // Default to nearest
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
    const [selectedProviderId, setSelectedProviderId] = useState(null);
    const [allProviders, setAllProviders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sync category param → state when URL changes
    useEffect(() => {
        setSelectedCategory(categoryParam);
        if (categoryParam) setShowFilters(false);
    }, [categoryParam]);

    // Sync location param to context
    useEffect(() => {
        if (locationParam && locationParam !== ctxLocation) {
            setCtxLocation(locationParam);
        }
    }, [locationParam, ctxLocation, setCtxLocation]);

    useEffect(() => {
        const loadProviders = async () => {
            setLoading(true);
            try {
                const params = coordinates ? { lat: coordinates.lat, lng: coordinates.lng } : {};
                const data = await providersApi.getAll(params);
                setAllProviders(data || []);
            } catch (error) {
                console.error("Failed to load providers:", error);
            } finally {
                setLoading(false);
            }
        };
        loadProviders();
    }, [coordinates]);

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmedQuery = inputValue.trim();
        const params = {};
        if (trimmedQuery) params.q = trimmedQuery;
        const loc = ctxLocation && ctxLocation !== 'All Locations' ? ctxLocation : '';
        if (loc) params.location = loc;
        if (selectedCategory) params.category = selectedCategory;
        setSearchParams(params);
    };

    const results = useMemo(() => {
        let list = [...allProviders];

        if (query) {
            const q = query.toLowerCase();
            list = list.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q) ||
                    p.skills.some((s) => s.toLowerCase().includes(q)) ||
                    p.location?.toLowerCase().includes(q)
            );
        }

        if (locationParam && locationParam !== 'All Locations') {
            const loc = locationParam.toLowerCase();
            list = list.filter((p) => p.location?.toLowerCase().includes(loc));
        }

        if (selectedCategory) list = list.filter((p) => p.categoryId === selectedCategory);
        if (selectedAvailability) list = list.filter((p) => p.availability === selectedAvailability);
        if (verifiedOnly) list = list.filter((p) => p.verified);
        if (minRating > 0) list = list.filter((p) => p.rating >= minRating);

        switch (sortBy) {
            case 'distance':
                list.sort((a, b) => {
                    const distA = coordinates && a.latitude && a.longitude ? calculateDistance(coordinates.lat, coordinates.lng, a.latitude, a.longitude) : (a.distance || 999);
                    const distB = coordinates && b.latitude && b.longitude ? calculateDistance(coordinates.lat, coordinates.lng, b.latitude, b.longitude) : (b.distance || 999);
                    return distA - distB;
                });
                break;
            case 'rating': list.sort((a, b) => b.rating - a.rating); break;
            case 'reviews': list.sort((a, b) => b.reviewCount - a.reviewCount); break;
            case 'price_asc': list.sort((a, b) => a.price - b.price); break;
            case 'price_desc': list.sort((a, b) => b.price - a.price); break;
            default: break;
        }

        return list;
    }, [allProviders, query, locationParam, selectedCategory, selectedAvailability, verifiedOnly, minRating, sortBy, coordinates]);

    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedAvailability('');
        setVerifiedOnly(false);
        setMinRating(0);
        setSortBy('distance');
        const params = {};
        if (query) params.q = query;
        if (locationParam) params.location = locationParam;
        setSearchParams(params);
    };

    const hasActiveFilters = !!(selectedCategory || selectedAvailability || verifiedOnly || minRating > 0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Search for services, providers, locations across Nepal..."
                        className="w-full pl-12 pr-10 py-3 rounded-2xl border border-slate-300 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 bg-white text-slate-800 text-sm sm:text-base shadow-xs"
                    />
                    {inputValue && (
                        <button
                            type="button"
                            onClick={() => { setInputValue(''); setSearchParams({}); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <button type="submit" className="px-6 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition shadow-md text-sm">
                    Search
                </button>
                <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-2xl border font-bold text-xs sm:text-sm transition ${
                        showFilters || hasActiveFilters
                            ? 'border-red-400 bg-red-50 text-red-600'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:block">Filters</span>
                    {hasActiveFilters && (
                        <span className="w-4 h-4 bg-red-600 text-white rounded-full text-[10px] flex items-center justify-center">!</span>
                    )}
                </button>
            </form>

            {showFilters && (
                <div className="bg-white border border-slate-200 rounded-3xl p-5 mb-6 shadow-sm animate-in fade-in duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 text-sm">Filter Search Results</h3>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1">
                                <X className="w-3.5 h-3.5" /> Clear all
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-red-500 bg-slate-50"
                            >
                                <option value="">All Categories</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Availability</label>
                            <select
                                value={selectedAvailability}
                                onChange={(e) => setSelectedAvailability(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-red-500 bg-slate-50"
                            >
                                <option value="">Any Status</option>
                                <option value="available">Available Now (तुरुन्त)</option>
                                <option value="busy">Busy on Job</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                                Min Rating: {minRating > 0 ? `${minRating}+` : 'Any'}
                            </label>
                            <div className="flex gap-1.5">
                                {[0, 4, 4.5, 4.8].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setMinRating(r)}
                                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                                            minRating === r
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        {r === 0 ? 'Any' : `${r}+`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Trust & Verification</label>
                            <label className="flex items-center gap-2 cursor-pointer mt-2">
                                <input
                                    type="checkbox"
                                    checked={verifiedOnly}
                                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                                    className="w-4 h-4 rounded accent-red-600"
                                />
                                <span className="text-xs font-semibold text-slate-700">Verified Providers Only</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Header & Grid/Map Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                        {selectedCategory
                            ? <>{categories.find(c => c.id === selectedCategory)?.name || selectedCategory} <span className="font-medium text-slate-400">Specialists</span></>
                            : query ? <>Results for "<span className="text-red-600">{query}</span>"</> : 'All Nearby Experts'
                        }
                        {locationParam && locationParam !== 'All Locations' && (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                <MapPin className="w-3 h-3 text-red-600" />{locationParam}
                            </span>
                        )}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">{results.length} verified experts found near you</p>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* View Switcher */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Grid className="w-3.5 h-3.5" /> Grid
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                viewMode === 'map' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <MapIcon className="w-3.5 h-3.5" /> Map View
                        </button>
                    </div>

                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:border-red-500 cursor-pointer shadow-xs"
                        >
                            {sortOptions.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Category Quick Pills */}
            <div className="flex gap-2 flex-wrap mb-6">
                <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
                        !selectedCategory ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                >
                    All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
                            selectedCategory === cat.id
                                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : results.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800 mb-1">No providers found</h3>
                    <p className="text-slate-400 text-xs mb-4">Try adjusting your search query, location, or clearing active filters.</p>
                    <button onClick={clearFilters} className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition">
                        Clear Filters
                    </button>
                </div>
            ) : viewMode === 'map' ? (
                <div className="h-[620px] rounded-3xl overflow-hidden shadow-lg border border-slate-200">
                    <ExpertMap
                        providers={results}
                        selectedProviderId={selectedProviderId}
                        onSelectProvider={(p) => setSelectedProviderId(p?.id || null)}
                        height="100%"
                        showRadiusCircle={true}
                        showRouteLine={true}
                        interactive={true}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {results.map((p) => (
                        <ProviderCard key={p.id} provider={p} />
                    ))}
                </div>
            )}
        </div>
    );
}
