import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ChevronRight, Star, MapPin, CheckCircle, Sparkles, Award, Navigation, Map as MapIcon, LocateFixed } from 'lucide-react';
import { useState, useEffect } from 'react';
import { categories } from '../../data/categories';
import { providersApi } from '../../services/api';
import ProviderCard from '../../components/CustomerPage/ProviderCard';
import Hero from '../../components/CustomerPage/Hero';
import Howitworks from '../../components/CustomerPage/Howitworks';
import { useLocation } from '../../context/LocationContext';
import ExpertMap from '../../components/Map/ExpertMap';

const categoryStyles = {
    electrical: {
        border: 'hover:border-amber-500',
        bg: 'bg-amber-50/40',
        iconBg: 'bg-amber-100 border-amber-200',
        text: 'text-amber-800 hover:text-amber-900',
        glow: 'group-hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)]',
        colorBadge: 'bg-amber-50 border-amber-200 text-amber-800'
    },
    plumbing: {
        border: 'hover:border-blue-500',
        bg: 'bg-blue-50/40',
        iconBg: 'bg-blue-100 border-blue-200',
        text: 'text-blue-800 hover:text-blue-900',
        glow: 'group-hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)]',
        colorBadge: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    cleaning: {
        border: 'hover:border-emerald-500',
        bg: 'bg-emerald-50/40',
        iconBg: 'bg-emerald-100 border-emerald-200',
        text: 'text-emerald-800 hover:text-emerald-900',
        glow: 'group-hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)]',
        colorBadge: 'bg-emerald-50 border-emerald-200 text-emerald-800'
    },
    'appliance-repair': {
        border: 'hover:border-indigo-500',
        bg: 'bg-indigo-50/40',
        iconBg: 'bg-indigo-100 border-indigo-200',
        text: 'text-indigo-800 hover:text-indigo-900',
        glow: 'group-hover:shadow-[0_10px_30px_rgba(99,102,241,0.15)]',
        colorBadge: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    },
    carpentry: {
        border: 'hover:border-orange-500',
        bg: 'bg-orange-50/40',
        iconBg: 'bg-orange-100 border-orange-200',
        text: 'text-orange-800 hover:text-orange-900',
        glow: 'group-hover:shadow-[0_10px_30px_rgba(249,115,22,0.15)]',
        colorBadge: 'bg-orange-50 border-orange-200 text-orange-800'
    },
    tutoring: {
        border: 'hover:border-rose-500',
        bg: 'bg-rose-50/40',
        iconBg: 'bg-rose-100 border-rose-200',
        text: 'text-rose-800 hover:text-rose-900',
        glow: 'group-hover:shadow-[0_10px_30px_rgba(244,63,94,0.15)]',
        colorBadge: 'bg-rose-50 border-rose-200 text-rose-800'
    },
    painting: {
        border: 'hover:border-teal-500',
        bg: 'bg-teal-50/40',
        iconBg: 'bg-teal-100 border-teal-200',
        text: 'text-teal-800 hover:text-teal-900',
        glow: 'group-hover:shadow-[0_10px_30px_rgba(20,184,166,0.15)]',
        colorBadge: 'bg-teal-50 border-teal-200 text-teal-800'
    },
    'vehicle-mechanic': {
        border: 'hover:border-violet-500',
        bg: 'bg-violet-50/40',
        iconBg: 'bg-violet-100 border-violet-200',
        text: 'text-violet-800 hover:text-violet-900',
        glow: 'group-hover:shadow-[0_10px_30px_rgba(139,92,246,0.15)]',
        colorBadge: 'bg-violet-50 border-violet-200 text-violet-800'
    }
};

const getCategoryStyle = (id) => {
    return categoryStyles[id] || {
        border: 'hover:border-red-500',
        bg: 'bg-stone-50/40',
        iconBg: 'bg-stone-100 border-stone-200',
        text: 'text-stone-800 hover:text-stone-900',
        glow: 'group-hover:shadow-[0_10px_30px_rgba(239,68,68,0.15)]',
        colorBadge: 'bg-stone-50 border-stone-200 text-stone-800'
    };
};

const stats = [
    { label: 'Verified Pros in Nepal', value: '1,200+', highlight: 'text-red-600' },
    { label: 'Services Completed', value: '50,000+', highlight: 'text-amber-600' },
    { label: 'Customer Satisfaction', value: '99.2%', highlight: 'text-emerald-600' },
    { label: 'Major Cities Covered', value: '12+', highlight: 'text-slate-900' },
];

export default function HomePage() {
    const navigate = useNavigate();
    const [allProviders, setAllProviders] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryCountMap, setCategoryCountMap] = useState({});
    const [selectedMapProviderId, setSelectedMapProviderId] = useState(null);
    const { coordinates, location, detectGpsLocation, isDetectingGps } = useLocation();

    useEffect(() => {
        const loadProviders = async () => {
            try {
                const params = coordinates ? { lat: coordinates.lat, lng: coordinates.lng } : {};
                const data = await providersApi.getAll(params);
                setAllProviders(data || []);

                // Build a live count map: { categoryId -> count }
                const countMap = (data || []).reduce((acc, p) => {
                    if (p.categoryId) acc[p.categoryId] = (acc[p.categoryId] || 0) + 1;
                    return acc;
                }, {});
                setCategoryCountMap(countMap);

                // Filter top providers
                const top = (data || []).filter(p => p.rating >= 4.0 || p.verified).slice(0, 4);
                setFeatured(top.length > 0 ? top : (data || []).slice(0, 4));
            } catch (error) {
                console.error('Failed to load top providers:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProviders();
    }, [coordinates]);

    return (
        <div className="bg-[#FAF9F6] min-h-screen">
            <Hero />

            {/* Trust Stat Section - Sophisticated Editorial Grid */}
            <section className="border-b border-stone-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-12 divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
                        {stats.map((s, idx) => (
                            <div key={s.label} className={`pt-6 sm:pt-0 ${idx > 0 ? 'sm:pl-8' : ''} text-center sm:text-left`}>
                                <div className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">{s.value}</div>
                                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mt-1.5">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Nearby Experts Radar Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-stone-200 bg-stone-100 text-stone-800 text-[10px] font-bold uppercase tracking-wider mb-3">
                            <Navigation className="w-3.5 h-3.5 text-red-600" />
                            <span>नेपालका दक्ष प्राविधिकहरू • PROXIMITY RADAR</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                            Experts Near You in {location === 'All Locations' ? 'Nepal' : location}
                        </h2>
                        <p className="mt-2 text-sm sm:text-base text-stone-500 font-medium max-w-2xl">
                            Real-time transit distances and hourly rates. Connect instantly with verified experts mapped around your precise locality.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={detectGpsLocation}
                            disabled={isDetectingGps}
                            className="flex items-center gap-1.5 px-4.5 py-3 rounded-lg bg-white border border-stone-300 hover:border-stone-900 text-stone-800 font-bold text-xs transition cursor-pointer"
                        >
                            <LocateFixed className={`w-3.5 h-3.5 text-red-600 ${isDetectingGps ? 'animate-spin' : ''}`} />
                            <span>{isDetectingGps ? 'DETECTING GPS...' : 'PIN MY LOCATION'}</span>
                        </button>
                        <Link
                            to="/map"
                            className="flex items-center gap-1.5 px-5 py-3 rounded-lg bg-stone-900 hover:bg-stone-850 text-white font-bold text-xs transition-colors"
                        >
                            <MapIcon className="w-3.5 h-3.5 text-red-400" />
                            <span>VIEW FULL INTERACTIVE MAP</span>
                        </Link>
                    </div>
                </div>

                {/* Featured Providers Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {featured.map((p) => (
                        <ProviderCard key={p.id} provider={p} />
                    ))}
                </div>

                {/* Interactive Map Preview Card - High end Frame */}
                <div className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-stone-100 pb-4">
                        <div>
                            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                                <MapPin className="w-4.5 h-4.5 text-red-600" />
                                Interactive Valley Service Radar
                            </h3>
                            <p className="text-xs text-stone-500 mt-1">
                                Drag the map to search nearby areas. Click on active markers to instantly view qualifications, pricing, and exact walking/driving times.
                            </p>
                        </div>
                        <Link to="/map" className="text-xs font-bold text-red-700 hover:text-stone-950 flex items-center gap-1 uppercase tracking-wider">
                            Explore full radar map with radius filter →
                        </Link>
                    </div>

                    <div className="h-[380px] sm:h-[450px] rounded-lg overflow-hidden border border-stone-200">
                        <ExpertMap
                            providers={allProviders}
                            selectedProviderId={selectedMapProviderId}
                            onSelectProvider={(p) => setSelectedMapProviderId(p?.id || null)}
                            height="100%"
                            showRadiusCircle={true}
                            showRouteLine={true}
                        />
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="bg-white border-t border-b border-stone-200 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-stone-200 bg-stone-50 text-stone-800 text-[10px] font-bold uppercase tracking-wider mb-3">
                                <span>नेपालका लोकप्रिय सेवाहरू • CORE SERVICES</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">Popular Home Services</h2>
                            <p className="mt-2 text-sm sm:text-base text-stone-500 font-medium">Select a category to view instant booking rates or request custom inspections.</p>
                        </div>
                        <Link to="/categories" className="inline-flex items-center gap-1.5 text-red-700 font-bold text-xs uppercase tracking-wider hover:text-stone-900 transition-colors">
                            View All Categories <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {categories.slice(0, 8).map((cat) => {
                            const style = getCategoryStyle(cat.id);
                            return (
                                <Link
                                    key={cat.id}
                                    to={`/categories/${cat.id}`}
                                    className={`group relative overflow-hidden rounded-xl border border-stone-200 bg-white ${style.border} ${style.glow} hover:-translate-y-1 active:translate-y-0 transition-all duration-300 p-5`}
                                >
                                    {/* Accent Background Tint Top Arc */}
                                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${style.bg.split(' ')[0] || 'bg-stone-50'}`} />
                                    
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-stone-50 border border-stone-100 group-hover:scale-105 transition-transform duration-300">
                                        <img 
                                            src={cat.image} 
                                            alt={cat.name} 
                                            className="h-11 w-11 rounded object-cover transition-all duration-500 group-hover:rotate-1" 
                                        />
                                    </div>
                                    <div className="font-black text-stone-900 transition-colors group-hover:text-red-700 text-base uppercase tracking-wide">
                                        {cat.name}
                                    </div>
                                    <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed font-medium">
                                        {cat.description || "Trusted technicians for home needs"}
                                    </p>
                                    <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border rounded ${style.colorBadge}`}>
                                            {loading
                                                ? <span className="inline-block w-6 h-2 bg-stone-200 rounded animate-pulse" />
                                                : `${categoryCountMap[cat.id] ?? 0} Karigars`
                                            }
                                        </span>
                                        <span className="text-xs text-stone-400 group-hover:text-red-700 transition-all font-bold uppercase tracking-wider">
                                            Book →
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Quick AI & Inspection-Based Prompt */}
            <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="bg-stone-900 rounded-xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 text-white relative overflow-hidden border border-stone-800">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                    
                    <div className="relative z-10 max-w-2xl">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest mb-4 border border-white/20">
                            <Sparkles className="w-3.5 h-3.5 text-red-400" /> INSTANT AI MATCHING
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">Unsure what technician you need?</h2>
                        <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                            Describe your issue in your own words (e.g. "kitchen tap is dripping non-stop" or "sparking fuse box"). Our expert matching engine connects you to the precise provider within seconds.
                        </p>
                    </div>
                    <div className="relative z-10 shrink-0 flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <Link to="/ai-match" className="flex items-center justify-center gap-2 bg-red-700 text-white font-bold px-6 py-4 rounded-lg hover:bg-red-800 transition-all text-xs uppercase tracking-wider">
                            <Sparkles className="w-4 h-4 text-white" /> Try Sewa AI Match
                        </Link>
                        <Link to="/categories" className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-4 rounded-lg border border-white/20 transition-colors text-xs uppercase tracking-wider">
                            Browse All Services
                        </Link>
                    </div>
                </div>
            </section>

            {/* Why Nepali Families Choose Sewa Center */}
            <section className="bg-stone-950 text-white py-24 border-t border-stone-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">नेपालभर विश्वासको प्रतीक</p>
                        <h2 className="text-3xl sm:text-4xl font-black mt-2">Why families trust Adimandu</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
                        {[
                            { icon: ShieldCheck, title: 'Identity & Police Vetted', desc: 'Each specialist is verified with National Citizenship cards, professional trade licenses, and clean background checks.' },
                            { icon: Star, title: 'Escrow Payout Guarantee', desc: 'Secure local booking terms. Funds remain locked until you confirm completion of work.' },
                            { icon: MapPin, title: 'Valley-Wide Coverage', desc: 'Rapid on-demand service throughout Kathmandu, Lalitpur, Bhaktapur, and major regional hubs.' },
                        ].map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex flex-col gap-4 p-8 rounded-xl bg-stone-900/40 border border-stone-800">
                                <div className="w-12 h-12 rounded-lg bg-stone-800 text-red-500 flex items-center justify-center border border-stone-700">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-stone-100">{title}</h3>
                                <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Become a Provider */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl overflow-hidden border border-stone-200">
                    <div className="grid lg:grid-cols-12 items-center">
                        {/* Content */}
                        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16">
                            <span className="inline-block bg-stone-100 border border-stone-200 text-stone-800 text-[10px] font-bold px-3 py-1.5 rounded-md mb-6 uppercase tracking-wider">
                                नेपाली कारीगर तथा दक्ष प्राविधिकहरूका लागि
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-4 leading-tight">
                                Grow Your Daily Income with Verified Bookings
                            </h2>
                            <p className="text-stone-500 text-sm sm:text-base mb-8 leading-relaxed max-w-lg font-medium">
                                Join Adimandu as a service provider. Get directly matched with clients in your immediate area, define your trade service rates, and collect instant digital payouts.
                            </p>

                            <div className="grid sm:grid-cols-2 gap-4 mb-8">
                                {[
                                    "Zero registration fees",
                                    "Direct Khalti instant settlements",
                                    "Work flexibly in your city",
                                    "Verified customer requests",
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-2.5">
                                        <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center shrink-0 border border-stone-200">
                                            <CheckCircle className="w-3 h-3 text-stone-900 font-bold" />
                                        </div>
                                        <span className="text-stone-700 text-xs sm:text-sm font-bold">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => navigate('/become-provider')}
                                className="bg-stone-900 text-white font-bold px-8 py-4 rounded-lg hover:bg-stone-800 transition-all text-xs uppercase tracking-wider cursor-pointer"
                            >
                                Register as a Sewa Provider (दर्ता गर्नुहोस्) →
                            </button>
                        </div>

                        {/* Image & Monthly Earning Card */}
                        <div className="hidden lg:block lg:col-span-5 relative min-h-[460px] h-full self-stretch">
                            <img
                                src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=600&auto=format&fit=crop"
                                alt="Skilled professional at work in Nepal"
                                className="absolute inset-0 w-full h-full object-cover filter grayscale"
                            />
                            <div className="absolute inset-0 bg-stone-950/20" />

                            {/* Floating stat */}
                            <div className="absolute bottom-8 right-8 bg-white rounded-lg p-5 shadow-lg border border-stone-200 text-stone-900 max-w-[240px]">
                                <div className="flex items-center gap-1.5 text-stone-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                                    <Award className="w-4 h-4 text-red-600" /> Top Karigar Earnings
                                </div>
                                <p className="text-3xl font-black text-stone-900 tracking-tight">Rs. 65,000+</p>
                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-1">Monthly average earnings</p>
                                <div className="mt-3.5 flex items-center gap-1.5 bg-stone-50 text-stone-900 border border-stone-200 px-2.5 py-1 rounded text-[10px] font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                                    100% PAYOUT SECURED
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
