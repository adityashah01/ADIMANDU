import { useState, useEffect } from 'react';
import { Link, useLocation as useRouteLocation, useNavigate } from 'react-router-dom';
import { Users, Star, MapPin, Award, Search, ChevronRight, Wrench, Sparkles, Map as MapIcon, Grid, Navigation, Clock, LocateFixed } from 'lucide-react';
import { providersApi, catalogServicesApi } from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import ExpertMap from '../../components/Map/ExpertMap';
import { calculateDistance, estimateTravelTime } from '../../utils/geoUtils';

const availabilityConfig = {
    available: { label: 'AVAILABLE', cls: 'bg-red-700 text-white border border-red-800' },
    busy: { label: 'BUSY ON JOB', cls: 'bg-stone-200 text-stone-800 border border-stone-300' },
    offline: { label: 'OFFLINE', cls: 'bg-stone-100 text-stone-400 border border-stone-200' },
};

export default function ProvidersPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('proximity'); // Default to proximity
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
    const [allProviders, setAllProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [catalogService, setCatalogService] = useState(null);
    const [selectedProviderId, setSelectedProviderId] = useState(null);

    // FEATURE 6: Provider Comparison States
    const [compareList, setCompareList] = useState([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    // FEATURE 7: Emergency SOS Dispatcher States
    const [showSosModal, setShowSosModal] = useState(false);
    const [sosCategory, setSosCategory] = useState('plumbing'); // Default urgent type
    const [sosState, setSosState] = useState('idle'); // idle | broadcasting | assigned | dispatched | arrived
    const [sosProvider, setSosProvider] = useState(null);
    const [sosTimer, setSosTimer] = useState(5);

    const { coordinates, detectGpsLocation, isDetectingGps, searchRadius, setSearchRadius } = useLocation();

    // Toggle comparison list
    const handleToggleCompare = (provider) => {
        setCompareList(prev => {
            const exists = prev.find(p => p.id === provider.id);
            if (exists) {
                return prev.filter(p => p.id !== provider.id);
            }
            if (prev.length >= 4) {
                alert("You can compare up to 4 experts side-by-side!");
                return prev;
            }
            return [...prev, provider];
        });
    };

    // Simulate Emergency SOS Broadcaster
    const triggerEmergencySos = () => {
        setSosState('broadcasting');
        setSosTimer(5);
        setSosProvider(null);

        // Find standard emergency responder from state based on selected emergency category
        const responders = allProviders.filter(p => 
            p.categorySlug === sosCategory || 
            String(p.category).toLowerCase().includes(sosCategory)
        );
        const selectedResponder = responders[0] || allProviders[0] || {
            name: "Subash Bhatta",
            phone: "+977-9841234056",
            rating: "4.8",
            jobsCompleted: 62,
            location: "Chabahil",
            price: 1200,
            avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150"
        };

        let countdown = 4;
        const interval = setInterval(() => {
            if (countdown <= 1) {
                clearInterval(interval);
                setSosProvider(selectedResponder);
                setSosState('assigned');
                
                // Progress automatically to Dispatched after 2 seconds
                setTimeout(() => {
                    setSosState('dispatched');
                    // Progress automatically to Arrived after another 4 seconds
                    setTimeout(() => {
                        setSosState('arrived');
                    }, 4000);
                }, 2500);
            } else {
                countdown -= 1;
                setSosTimer(countdown);
            }
        }, 1000);
    };

    // Read catalogServiceId from URL
    const routeLocation = useRouteLocation();
    const searchParams = new URLSearchParams(routeLocation.search);
    const catalogServiceId = searchParams.get('catalogServiceId');

    // Fetch the catalog service details to show context
    useEffect(() => {
        if (catalogServiceId) {
            catalogServicesApi.getById(catalogServiceId)
                .then(setCatalogService)
                .catch(() => setCatalogService(null));
        } else {
            setCatalogService(null);
        }
    }, [catalogServiceId]);

    useEffect(() => {
        const loadProviders = async () => {
            setLoading(true);
            try {
                const data = await providersApi.getAll({
                    ...(catalogServiceId ? { catalogServiceId } : {}),
                    ...(coordinates ? { lat: coordinates.lat, lng: coordinates.lng } : {})
                });
                setAllProviders(data || []);
            } catch (error) {
                console.error("Failed to fetch providers", error);
            } finally {
                setLoading(false);
            }
        };
        loadProviders();
    }, [catalogServiceId, coordinates]);

    // Filter logic
    let filtered = [...allProviders];

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                p.location.toLowerCase().includes(q) ||
                p.skills?.some((s) => s.toLowerCase().includes(q))
        );
    }

    if (selectedCategory) {
        filtered = filtered.filter((p) => p.categoryId === selectedCategory || p.category === selectedCategory);
    }

    // Sort logic
    switch (sortBy) {
        case 'proximity':
            filtered.sort((a, b) => {
                const distA = coordinates && a.latitude && a.longitude ? calculateDistance(coordinates.lat, coordinates.lng, a.latitude, a.longitude) : (a.distance || 999);
                const distB = coordinates && b.latitude && b.longitude ? calculateDistance(coordinates.lat, coordinates.lng, b.latitude, b.longitude) : (b.distance || 999);
                return distA - distB;
            });
            break;
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        case 'reviews':
            filtered.sort((a, b) => b.reviewCount - a.reviewCount);
            break;
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            break;
    }

    const categories = [...new Set(allProviders.map((p) => p.category))];

    return (
        <div className="min-h-screen bg-[#FAF9F6] text-stone-900">
            {/* Header Hero Section */}
            {catalogService ? (
                <section className="bg-stone-900 text-white py-12 px-4 border-b border-stone-850">
                    <div className="max-w-7xl mx-auto">
                        <nav className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-4">
                            <Link to="/categories" className="hover:text-white transition-colors">Categories</Link>
                            <span className="text-stone-600">/</span>
                            <Link to={`/categories/${catalogService.category?.slug}`} className="hover:text-white transition-colors capitalize">
                                {catalogService.category?.name}
                            </Link>
                            <span className="text-stone-600">/</span>
                            <span className="text-white font-black">{catalogService.name}</span>
                        </nav>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[9px] font-bold px-2 py-0.5 bg-stone-800 text-stone-300 border border-stone-700 uppercase tracking-widest">
                                        {catalogService.serviceType === 'INSPECTION_BASED' ? 'Inspection Protocol' : 'Verified Trade Unit'}
                                    </span>
                                </div>
                                <h1 className="text-2xl sm:text-3.5xl font-black text-white uppercase tracking-wider">Expert Karigars for {catalogService.name}</h1>
                                {catalogService.description && (
                                    <p className="text-stone-300 text-xs sm:text-sm mt-2 max-w-2xl font-medium leading-relaxed">{catalogService.description}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <button
                                    onClick={() => navigate('/map')}
                                    className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold text-[10px] uppercase tracking-wider px-5 py-3.5 rounded-lg transition"
                                >
                                    <MapIcon className="w-3.5 h-3.5 text-white" /> Open Full Radar Map
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            ) : (
                <section className="bg-stone-900 text-white py-12 px-4 border-b border-stone-850">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-stone-800 text-stone-300 border border-stone-700 px-3 py-1 text-[9px] font-bold uppercase tracking-widest mb-3">
                                <Users className="w-3.5 h-3.5 text-red-500" /> {allProviders.length} VERIFIED NEPALESE PROFESSIONALS ACTIVE
                            </div>
                            <h1 className="text-2xl sm:text-3.5xl font-black text-white uppercase tracking-wider">On-Demand Service Guild</h1>
                            <p className="text-stone-300 text-xs sm:text-sm mt-2 max-w-xl font-medium leading-relaxed">
                                Discover background-checked independent tradesmen sorted by raw real-time physical proximity.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                onClick={detectGpsLocation}
                                disabled={isDetectingGps}
                                className="flex items-center gap-1.5 px-4.5 py-3.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-[10px] font-bold uppercase tracking-wider border border-stone-700 transition cursor-pointer"
                            >
                                <LocateFixed className={`w-3.5 h-3.5 text-red-500 ${isDetectingGps ? 'animate-spin' : ''}`} />
                                <span>{isDetectingGps ? 'Detecting...' : 'Pin GPS Coordinates'}</span>
                            </button>
                            <Link
                                to="/map"
                                className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold text-[10px] uppercase tracking-wider px-5 py-3.5 rounded-lg transition"
                            >
                                <MapIcon className="w-3.5 h-3.5" /> View Map & Distance
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* FEATURE 7: Emergency SOS Trigger Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="bg-white rounded-xl p-8 text-stone-950 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-stone-200">
                    <div className="space-y-2 relative z-10 text-center md:text-left">
                        <span className="bg-red-50 border border-red-200 text-red-700 font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded">
                            🚨 Emergency Rapid-Response Protocol
                        </span>
                        <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider">Active Tradesman Emergency? (आकस्मिक सेवा)</h2>
                        <p className="text-xs text-stone-500 font-semibold max-w-2xl leading-relaxed">
                            Have a massive pipeline burst, electrical short-circuit, or lockout? Trigger an instant regional SOS beacon to bypass standard booking. The closest verified responder will contact you within 2 minutes.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setSosState('idle');
                            setSosProvider(null);
                            setShowSosModal(true);
                        }}
                        className="px-5 py-3.5 bg-stone-900 hover:bg-stone-850 text-white font-bold text-[10px] rounded-lg transition-all shrink-0 cursor-pointer uppercase tracking-wider border border-stone-900 active:scale-95"
                    >
                        Trigger SOS Emergency ⚡
                    </button>
                </div>
            </section>

            {/* Filter & View Switcher Bar */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-xl border border-stone-200 p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, skill, or area (e.g. Patan, Baneshwor)..."
                                className="w-full pl-10 pr-4 py-3 text-[11px] font-semibold rounded-lg border border-stone-200 focus:border-stone-900 focus:outline-none bg-stone-50 focus:bg-white uppercase tracking-wider placeholder-stone-400 text-stone-800"
                            />
                        </div>

                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3.5 py-3 text-[10px] font-extrabold rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none min-w-[160px] cursor-pointer uppercase tracking-wider text-stone-700"
                        >
                            <option value="">All Guild Sectors</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3.5 py-3 text-[10px] font-extrabold rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none min-w-[160px] cursor-pointer uppercase tracking-wider text-stone-700"
                        >
                            <option value="proximity">📍 Nearest (Raw Proximity)</option>
                            <option value="rating">★ Highest Customer Rating</option>
                            <option value="reviews">💬 Most Certified Reviews</option>
                            <option value="name">Alphabetical</option>
                        </select>
                    </div>

                    {/* View Switcher Button (Grid vs Map) */}
                    <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200 self-end lg:self-auto shrink-0">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition ${
                                viewMode === 'grid' ? 'bg-white text-stone-900 border border-stone-200/50' : 'text-stone-500 hover:text-stone-800'
                            }`}
                        >
                            <Grid className="w-3.5 h-3.5" /> Grid
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition ${
                                viewMode === 'map' ? 'bg-white text-stone-900 border border-stone-200/50' : 'text-stone-500 hover:text-stone-800'
                            }`}
                        >
                            <MapIcon className="w-3.5 h-3.5 text-red-600" /> Map View
                        </button>
                    </div>
                </div>
            </section>

            {/* Providers Content: Grid or Interactive Map */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-stone-200">
                        <Users className="w-10 h-10 text-stone-300 mx-auto mb-4" />
                        <h3 className="text-base font-bold text-stone-950 mb-2 uppercase tracking-wider">No matching experts</h3>
                        <p className="text-stone-500 text-xs max-w-sm mx-auto font-medium mb-6">No providers match your search criteria. Try broadening your terms or reset the filters.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}
                            className="px-5 py-3 bg-stone-900 hover:bg-stone-850 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : viewMode === 'map' ? (
                    <div className="h-[600px] rounded-xl overflow-hidden border border-stone-200 shadow-xs">
                        <ExpertMap
                            providers={filtered}
                            selectedProviderId={selectedProviderId}
                            onSelectProvider={(p) => setSelectedProviderId(p?.id || null)}
                            height="100%"
                            showRadiusCircle={true}
                            showRouteLine={true}
                            interactive={true}
                        />
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                                    Showing {filtered.length} active expert{filtered.length !== 1 ? 's' : ''} in your area
                                </p>
                                {compareList.length > 0 && (
                                    <span className="text-[9px] bg-stone-100 border border-stone-200 text-stone-800 font-bold px-2.5 py-0.5 rounded uppercase tracking-widest">
                                        {compareList.length} Selected for Compare
                                    </span>
                                )}
                            </div>
                            <Link to="/map" className="text-[10px] font-bold text-red-700 hover:text-red-800 flex items-center gap-1 uppercase tracking-widest">
                                Open Interactive Map View →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filtered.map((provider) => {
                                const isCompared = compareList.some(p => p.id === provider.id);
                                return (
                                    <ProviderProfileCard 
                                        key={provider.id} 
                                        provider={provider} 
                                        isCompared={isCompared}
                                        onToggleCompare={handleToggleCompare}
                                    />
                                );
                            })}
                        </div>
                    </>
                )}
            </section>

            {/* FEATURE 6: Sticky Compare Bottom Bar */}
            {compareList.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-950 border border-stone-800 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-6 justify-between max-w-lg w-[90%]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-red-700 flex items-center justify-center font-black text-xs text-white">
                            {compareList.length}
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider">Compare Guild Experts</p>
                            <p className="text-[9px] text-stone-400 font-semibold mt-0.5">Evaluate ratings, proximity, and pricing instantly.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowCompareModal(true)}
                            className="px-4 py-2.5 bg-white hover:bg-stone-100 text-stone-950 text-[10px] font-bold uppercase tracking-wider rounded transition"
                        >
                            Compare Matrix 📊
                        </button>
                        <button
                            onClick={() => setCompareList([])}
                            className="px-3 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-bold uppercase tracking-wider rounded transition"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* FEATURE 6: Detailed Provider Comparison Matrix Modal */}
            {showCompareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-[#FAF9F6] rounded-xl w-full max-w-4xl shadow-2xl border border-stone-300 overflow-hidden my-8">
                        {/* Header */}
                        <div className="bg-stone-900 p-6 text-white flex items-center justify-between border-b border-stone-800">
                            <div>
                                <h3 className="text-sm font-black tracking-wider uppercase flex items-center gap-2">
                                    <span>📊 Specialist Comparative Matrix (तुलना तालिका)</span>
                                    <span className="text-[8px] bg-red-700 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">AdiMatch Engine</span>
                                </h3>
                                <p className="text-xs text-stone-400 mt-1 font-medium">Compare verified certifications, ratings, distance, and pricing metrics side-by-side.</p>
                            </div>
                            <button
                                onClick={() => setShowCompareModal(false)}
                                className="w-8 h-8 bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center font-bold text-sm transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content Grid */}
                        <div className="p-6 overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-stone-200 bg-stone-100">
                                        <th className="p-4 font-black text-stone-500 uppercase tracking-wider text-[10px] min-w-[150px]">Expert Profile</th>
                                        {compareList.map(p => (
                                            <th key={p.id} className="p-4 min-w-[180px] text-center">
                                                <img 
                                                    src={p.avatar} 
                                                    alt={p.name} 
                                                    className="w-12 h-12 rounded-none mx-auto object-cover border border-stone-200"
                                                    onError={(e) => {
                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=dc2626&color=fff`;
                                                    }}
                                                />
                                                <p className="font-black text-stone-900 uppercase tracking-wide text-xs mt-2">{p.name}</p>
                                                <p className="text-[10px] font-bold text-red-600 uppercase mt-0.5">{p.category}</p>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-200">
                                    <tr>
                                        <td className="p-4 font-black text-stone-500 uppercase tracking-wider text-[10px]">Verification & Trust</td>
                                        {compareList.map(p => (
                                            <td key={p.id} className="p-4 text-center">
                                                {p.verified ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-50 px-2 py-1 border border-red-200">
                                                        Certified Expert
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-1 border border-stone-200">
                                                        Standard Pro
                                                    </span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-black text-stone-500 uppercase tracking-wider text-[10px]">Customer Rating</td>
                                        {compareList.map(p => (
                                            <td key={p.id} className="p-4 text-center font-bold text-stone-800 text-sm">
                                                <div className="flex items-center justify-center gap-1 text-red-600">
                                                    <span className="font-black">★ {p.rating || '4.8'}</span>
                                                    <span className="text-[10px] text-stone-500 font-bold uppercase">({p.reviewCount || 0} reviews)</span>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-black text-stone-500 uppercase tracking-wider text-[10px]">Jobs Completed</td>
                                        {compareList.map(p => (
                                            <td key={p.id} className="p-4 text-center text-stone-800 font-bold text-xs uppercase tracking-wider">
                                                ⚡ {p.jobsCompleted || 45} completed
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-black text-stone-500 uppercase tracking-wider text-[10px]">Experience Level</td>
                                        {compareList.map(p => (
                                            <td key={p.id} className="p-4 text-center text-stone-800 font-black text-xs uppercase tracking-wider">
                                                🎓 {p.experience || "5 years"}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-black text-stone-500 uppercase tracking-wider text-[10px]">Distance & Coverage</td>
                                        {compareList.map(p => {
                                            const dist = coordinates && p.latitude && p.longitude
                                                ? calculateDistance(coordinates.lat, coordinates.lng, p.latitude, p.longitude)
                                                : (p.distance || 3.5);
                                            return (
                                                <td key={p.id} className="p-4 text-center text-stone-800 font-bold text-xs">
                                                    📍 {dist} km away
                                                    <span className="block text-[9px] text-stone-500 font-bold uppercase tracking-wider">({p.location})</span>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-black text-stone-500 uppercase tracking-wider text-[10px]">Baseline Service Fee</td>
                                        {compareList.map(p => (
                                            <td key={p.id} className="p-4 text-center">
                                                <span className="text-sm font-black text-stone-900 uppercase">Rs. {Number(p.price || 0).toLocaleString()}</span>
                                                <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider block">{p.priceUnit || '/ job'}</span>
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-black text-stone-500 uppercase tracking-wider text-[10px]">Select & Continue</td>
                                        {compareList.map(p => (
                                            <td key={p.id} className="p-4 text-center">
                                                <Link
                                                    to={`/providers/${p.id}`}
                                                    className="inline-block px-4 py-2 bg-stone-900 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest transition"
                                                >
                                                    Book {p.name.split(' ')[0]} ✓
                                                </Link>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="bg-[#FAF9F6] p-4 border-t border-stone-200 flex justify-between items-center">
                            <button
                                onClick={() => setCompareList([])}
                                className="px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                            >
                                Clear Comparative list
                            </button>
                            <button
                                onClick={() => setShowCompareModal(false)}
                                className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                            >
                                Close Comparison
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FEATURE 7: Emergency SOS Dispatcher Radar Modal */}
             {showSosModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-[#FAF9F6] rounded-none w-full max-w-md shadow-2xl border border-stone-300 overflow-hidden my-8 animate-fade-in">
                        {/* Header */}
                        <div className="bg-stone-900 p-6 text-white flex items-center justify-between border-b border-stone-800">
                            <div className="flex items-center gap-3">
                                <span className="animate-pulse w-3 h-3 bg-red-600 inline-block shrink-0" />
                                <div>
                                    <h3 className="text-xs font-black tracking-widest uppercase text-white">Emergency SOS Dispatcher</h3>
                                    <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Coverage Area: Kathmandu Valley</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSosModal(false)}
                                className="w-8 h-8 bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center font-bold text-sm transition cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* SOS content depends on state */}
                        <div className="p-6 space-y-6">
                            {sosState === 'idle' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-stone-100 border border-stone-200 text-stone-900 rounded-none flex items-start gap-3">
                                        <div className="text-red-600 text-sm font-black">⚠️</div>
                                        <div className="text-[11px]">
                                            <p className="font-black uppercase tracking-wider text-red-700">Priority Dispatch Terms</p>
                                            <p className="mt-1 font-semibold text-stone-600 leading-relaxed">
                                                This service triggers a priority dispatch. A surcharge of Rs. 300 will be added for immediate response. Verified specialists will reach out via phone within 2 minutes of signal dispersion.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black uppercase tracking-wider text-stone-500">Choose Emergency Service Type:</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { key: 'plumbing', label: "Pipeline Leak", icon: "🔧" },
                                                { key: 'electrical', label: "Short Circuit", icon: "🔌" },
                                                { key: 'vehicle-mechanic', label: "Bike Breakdown", icon: "⚙️" },
                                                { key: 'it-support', label: "Network Down", icon: "📶" }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.key}
                                                    onClick={() => setSosCategory(opt.key)}
                                                    className={`p-3 border text-left transition text-[11px] font-black uppercase tracking-wider rounded-none ${
                                                        sosCategory === opt.key 
                                                            ? 'border-red-600 bg-red-50 text-red-700' 
                                                            : 'border-stone-200 hover:border-stone-400 text-stone-700 bg-white'
                                                    }`}
                                                >
                                                    <span className="text-base block mb-1">{opt.icon}</span>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            onClick={triggerEmergencySos}
                                            className="w-full py-3.5 bg-red-700 hover:bg-red-800 text-white font-black uppercase tracking-widest transition text-xs cursor-pointer"
                                        >
                                            Disperse SOS Signal Now 📡
                                        </button>
                                    </div>
                                </div>
                            )}

                            {sosState === 'broadcasting' && (
                                <div className="text-center py-8 space-y-6">
                                    {/* Pulse Animation */}
                                    <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-75" />
                                        <div className="w-12 h-12 bg-red-600 text-white flex items-center justify-center text-xl font-bold shadow-md relative z-10">
                                            📡
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">Broadcasting SOS Signal</h4>
                                        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider max-w-xs mx-auto">
                                            Scanning for verified {sosCategory} experts within 5km...
                                        </p>
                                    </div>

                                    <div className="bg-stone-100 border border-stone-200 p-3 rounded-none text-[10px] font-mono text-stone-600 uppercase tracking-wider">
                                        Matching with nearest responder in: <span className="font-black text-red-600">{sosTimer}s</span>
                                    </div>
                                </div>
                            )}

                            {(sosState === 'assigned' || sosState === 'dispatched' || sosState === 'arrived') && (
                                <div className="space-y-5">
                                    {/* Success notification banner */}
                                    <div className="bg-stone-900 border border-stone-800 p-4 text-white flex items-start gap-3">
                                        <div className="text-red-500 text-sm font-black">🚨</div>
                                        <div className="text-[11px]">
                                            <p className="font-black uppercase tracking-widest text-red-500">Specialist Secured & Dispatched</p>
                                            <p className="mt-0.5 font-bold uppercase tracking-wider text-stone-400">Priority Dispatch Code: <span className="font-mono bg-stone-800 px-1 text-white">ADI-EM-843</span></p>
                                        </div>
                                    </div>

                                    {/* Assigned Expert Info Card */}
                                    {sosProvider && (
                                        <div className="flex items-center gap-4 p-4 border border-stone-200 bg-white">
                                            <img
                                                src={sosProvider.avatar}
                                                alt={sosProvider.name}
                                                className="w-12 h-12 object-cover border border-stone-200"
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sosProvider.name)}&background=dc2626&color=fff`;
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-stone-900 uppercase tracking-wide text-xs">{sosProvider.name}</h4>
                                                <p className="text-[10px] text-stone-500 font-bold uppercase mt-0.5">{sosProvider.category || "Emergency Responder"}</p>
                                                <p className="text-[10px] text-red-700 font-black uppercase mt-1">📞 {sosProvider.phone}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-black text-stone-900 block">Rs. {sosProvider.price || 1200}</span>
                                                <span className="text-[9px] text-stone-500 block font-bold uppercase tracking-wider">Base Rate</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Dispatch Progress Tracker */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Live Dispatch Milestones:</p>
                                        
                                        <div className="space-y-4 pl-4 relative before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                                            <div className="relative flex items-start gap-3">
                                                <div className={`absolute -left-[18px] w-2.5 h-2.5 border ${
                                                    sosState === 'assigned' || sosState === 'dispatched' || sosState === 'arrived'
                                                        ? 'bg-red-600 border-red-600' : 'bg-white border-stone-300'
                                                }`} />
                                                <div className="text-[11px]">
                                                    <p className="font-black uppercase tracking-wider text-stone-900">SOS Signal Accepted</p>
                                                    <p className="text-[10px] text-stone-500 font-medium">Expert received emergency route map.</p>
                                                </div>
                                            </div>

                                            <div className="relative flex items-start gap-3">
                                                <div className={`absolute -left-[18px] w-2.5 h-2.5 border ${
                                                    sosState === 'dispatched' || sosState === 'arrived'
                                                        ? 'bg-red-600 border-red-600' : 'bg-white border-stone-300'
                                                }`} />
                                                <div className="text-[11px]">
                                                    <p className="font-black uppercase tracking-wider text-stone-900">Technician Dispatched (सवारी साधन प्रस्थान)</p>
                                                    <p className="text-[10px] text-stone-500 font-medium">Expert on scooter carrying complete specialized toolkit.</p>
                                                </div>
                                            </div>

                                            <div className="relative flex items-start gap-3">
                                                <div className={`absolute -left-[18px] w-2.5 h-2.5 border ${
                                                    sosState === 'arrived'
                                                        ? 'bg-red-600 border-red-600' : 'bg-white border-stone-300'
                                                }`} />
                                                <div className="text-[11px]">
                                                    <p className="font-black uppercase tracking-wider text-stone-900">Arrived On-Site (काम सुरु भएको)</p>
                                                    <p className="text-[10px] text-stone-500 font-medium">Arrived at your location.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action items */}
                                    <div className="pt-2 flex gap-2">
                                        <button
                                            onClick={() => {
                                                alert("Contacting emergency dispatch team on " + (sosProvider?.phone || "phone"));
                                            }}
                                            className="flex-1 py-3 bg-stone-900 hover:bg-stone-850 text-white font-black uppercase tracking-widest text-[10px] transition cursor-pointer"
                                        >
                                            Call Specialist Now 📞
                                        </button>
                                        <button
                                            onClick={() => setShowSosModal(false)}
                                            className="px-5 py-3 border border-stone-300 hover:bg-stone-100 text-stone-800 font-black uppercase tracking-widest text-[10px] transition cursor-pointer"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ProviderProfileCard({ provider, isCompared, onToggleCompare }) {
    const avail = availabilityConfig[provider.availability] || availabilityConfig.available;
    const { coordinates } = useLocation();

    const dist = coordinates && provider.latitude && provider.longitude
        ? calculateDistance(coordinates.lat, coordinates.lng, provider.latitude, provider.longitude)
        : (provider.distance || null);

    const travelTime = estimateTravelTime(dist);

    return (
        <Link
            to={`/providers/${provider.id}`}
            className="group bg-white rounded-none border border-stone-200 overflow-hidden hover:border-red-600 transition-all duration-300 flex flex-col justify-between relative"
        >
            <div>
                <div className="relative aspect-video overflow-hidden bg-stone-100">
                    {/* FEATURE 6: Compare overlay trigger checkbox */}
                    <div className="absolute top-3 left-3 z-20" onClick={(e) => e.stopPropagation()}>
                        <label className="flex items-center gap-1.5 bg-stone-900/90 px-2.5 py-1.5 rounded-none text-[9px] font-black uppercase tracking-wider text-white hover:bg-stone-900 cursor-pointer select-none transition border border-stone-800">
                            <input
                                type="checkbox"
                                checked={isCompared}
                                onChange={() => onToggleCompare(provider)}
                                className="accent-red-600 rounded-none cursor-pointer w-3 h-3"
                            />
                            <span>Compare</span>
                        </label>
                    </div>

                    <img
                        src={provider.coverImage || provider.avatar}
                        alt={provider.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            e.target.src = `https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&fit=crop`;
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    <span className={`absolute right-3 top-3 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 shadow-none rounded-none ${avail.cls}`}>
                        {avail.label}
                    </span>
                    {dist !== null && (
                        <div className="absolute bottom-3 left-3 bg-[#FAF9F6] border border-stone-200 px-2.5 py-1 rounded-none text-[9px] font-black uppercase tracking-wider text-stone-900 flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-red-600" />
                            <span>{dist} km away</span>
                            <span className="text-stone-400 font-bold">• {travelTime}</span>
                        </div>
                    )}
                </div>

                <div className="p-4">
                    <div className="flex items-start gap-3">
                        <img
                            src={provider.avatar}
                            alt={provider.name}
                            className="w-12 h-12 rounded-none object-cover border border-stone-200 -mt-8 relative z-10 shrink-0 bg-stone-100"
                            onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=dc2626&color=fff`;
                            }}
                        />
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-black text-stone-900 text-xs uppercase tracking-wide truncate group-hover:text-red-600 transition-colors">{provider.name}</h3>
                                {provider.verified && (
                                    <span className="text-[8px] font-black tracking-wider uppercase bg-red-50 text-red-700 px-1.5 py-0.5 border border-red-200" title="Verified Nepali Karigar">
                                        Verified
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 mt-0.5">{provider.category}</p>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                        <div className="flex items-center gap-1 text-stone-600 font-bold uppercase tracking-wider">
                            <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            <span className="truncate max-w-[130px]">{provider.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-600 font-black">
                            <Star className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                            <span>{provider.rating || '5.0'}</span>
                            <span className="text-stone-400 font-bold uppercase tracking-wider">({provider.reviewCount || 0})</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 pt-0">
                <div className="flex items-center justify-between pt-2.5 border-t border-stone-100">
                    <div>
                        <span className="text-xs font-black text-stone-900 uppercase">Rs. {Number(provider.price || 0).toLocaleString()}</span>
                        <span className="text-[9px] text-stone-400 font-bold uppercase ml-1">{provider.priceUnit}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Book Pro →
                    </span>
                </div>
            </div>
        </Link>
    );
}
