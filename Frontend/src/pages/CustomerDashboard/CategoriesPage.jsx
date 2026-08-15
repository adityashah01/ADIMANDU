import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Droplets, Zap, Sparkles, BookOpen, Settings, Hammer,
    PaintBucket, Car, ChevronRight, ShieldCheck
} from 'lucide-react';
import { categories } from '../../data/categories';
import { providersApi } from '../../services/api';

const iconMap = {
    Droplets, Zap, Sparkles, BookOpen, Settings, Hammer, PaintBucket, Car,
};

const categoryStyles = {
    electrical: {
        border: 'hover:border-amber-500',
        bg: 'bg-amber-50/40',
        iconBg: 'bg-amber-100 border-amber-200',
        text: 'text-amber-800 hover:text-amber-900',
        glow: 'hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)]',
        colorBadge: 'bg-amber-50 border-amber-200 text-amber-800'
    },
    plumbing: {
        border: 'hover:border-blue-500',
        bg: 'bg-blue-50/40',
        iconBg: 'bg-blue-100 border-blue-200',
        text: 'text-blue-800 hover:text-blue-900',
        glow: 'hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)]',
        colorBadge: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    cleaning: {
        border: 'hover:border-emerald-500',
        bg: 'bg-emerald-50/40',
        iconBg: 'bg-emerald-100 border-emerald-200',
        text: 'text-emerald-800 hover:text-emerald-900',
        glow: 'hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)]',
        colorBadge: 'bg-emerald-50 border-emerald-200 text-emerald-800'
    },
    'appliance-repair': {
        border: 'hover:border-indigo-500',
        bg: 'bg-indigo-50/40',
        iconBg: 'bg-indigo-100 border-indigo-200',
        text: 'text-indigo-800 hover:text-indigo-900',
        glow: 'hover:shadow-[0_10px_30px_rgba(99,102,241,0.15)]',
        colorBadge: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    },
    carpentry: {
        border: 'hover:border-orange-500',
        bg: 'bg-orange-50/40',
        iconBg: 'bg-orange-100 border-orange-200',
        text: 'text-orange-800 hover:text-orange-900',
        glow: 'hover:shadow-[0_10px_30px_rgba(249,115,22,0.15)]',
        colorBadge: 'bg-orange-50 border-orange-200 text-orange-800'
    },
    tutoring: {
        border: 'hover:border-rose-500',
        bg: 'bg-rose-50/40',
        iconBg: 'bg-rose-100 border-rose-200',
        text: 'text-rose-800 hover:text-rose-900',
        glow: 'hover:shadow-[0_10px_30px_rgba(244,63,94,0.15)]',
        colorBadge: 'bg-rose-50 border-rose-200 text-rose-800'
    },
    painting: {
        border: 'hover:border-teal-500',
        bg: 'bg-teal-50/40',
        iconBg: 'bg-teal-100 border-teal-200',
        text: 'text-teal-800 hover:text-teal-900',
        glow: 'hover:shadow-[0_10px_30px_rgba(20,184,166,0.15)]',
        colorBadge: 'bg-teal-50 border-teal-200 text-teal-800'
    },
    'vehicle-mechanic': {
        border: 'hover:border-violet-500',
        bg: 'bg-violet-50/40',
        iconBg: 'bg-violet-100 border-violet-200',
        text: 'text-violet-800 hover:text-violet-900',
        glow: 'hover:shadow-[0_10px_30px_rgba(139,92,246,0.15)]',
        colorBadge: 'bg-violet-50 border-violet-200 text-violet-800'
    }
};

const getCategoryStyle = (id) => {
    return categoryStyles[id] || {
        border: 'hover:border-red-500',
        bg: 'bg-stone-50/40',
        iconBg: 'bg-stone-100 border-stone-200',
        text: 'text-stone-800 hover:text-stone-900',
        glow: 'hover:shadow-[0_10px_30px_rgba(239,68,68,0.15)]',
        colorBadge: 'bg-stone-50 border-stone-200 text-stone-800'
    };
};

export default function CategoriesPage() {
    const [providerCountMap, setProviderCountMap] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        providersApi.getAll()
            .then((data) => {
                // data is array of providers; each has categoryId = slug (e.g. 'electrical')
                const countMap = data.reduce((acc, p) => {
                    if (p.categoryId) acc[p.categoryId] = (acc[p.categoryId] || 0) + 1;
                    return acc;
                }, {});
                setProviderCountMap(countMap);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-[#FAF9F6] min-h-screen py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-stone-200 bg-stone-100 text-stone-800 text-[10px] font-bold uppercase tracking-wider mb-3">
                        <span>नेपालका दक्ष प्राविधिक सेवाहरू • SERVICE REGISTRY</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 mb-4 tracking-tight leading-none">
                        Service Categories
                    </h1>
                    <p className="text-stone-500 text-sm sm:text-base max-w-xl mx-auto font-medium">
                        Directly browse our {categories.length} core sectors to find verified, police-vetted technicians in your neighborhood.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categories.map((cat) => {
                        const Icon = iconMap[cat.icon] || Settings;
                        const count = providerCountMap[cat.id] ?? 0;
                        const style = getCategoryStyle(cat.id);
                        return (
                            <Link
                                key={cat.id}
                                to={`/categories/${cat.id}`}
                                className={`group bg-white border border-stone-200 rounded-xl overflow-hidden ${style.border} ${style.glow} hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex flex-col justify-between`}
                            >
                                <div className="relative">
                                    {/* Accent Background Tint Top Arc */}
                                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${style.bg.split(' ')[0] || 'bg-stone-50'}`} />

                                    <div className="relative h-44 overflow-hidden bg-stone-50">
                                        <img
                                            src={cat.image}
                                            alt={cat.name}
                                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-stone-950/20" />
                                        <div className="absolute top-3.5 left-3.5">
                                            <div className="w-10 h-10 bg-white rounded-lg border border-stone-200 flex items-center justify-center shadow-xs group-hover:rotate-3 transition-transform">
                                                <Icon className="w-5 h-5 text-red-700" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-3.5 left-4 right-4">
                                            <h3 className="text-white font-black text-base leading-tight uppercase tracking-widest">{cat.name}</h3>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 font-medium">{cat.description}</p>
                                    </div>
                                </div>

                                <div className="p-5 pt-0">
                                    <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border rounded ${style.colorBadge}`}>
                                            {loading ? '...' : `${count} Karigar${count !== 1 ? 's' : ''}`}
                                        </span>
                                        <span className="flex items-center gap-1 text-stone-900 text-xs font-bold group-hover:translate-x-1 transition-all uppercase tracking-wider">
                                            Explore <ChevronRight className="w-3.5 h-3.5 text-red-600" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom Banner - High end Dark Frame */}
                <div className="mt-20 text-center bg-stone-900 border border-stone-850 rounded-xl p-10 sm:p-14 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                    
                    <span className="inline-block bg-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-md mb-4 uppercase tracking-widest border border-white/10 relative z-10">
                        नेपालभर तुरुन्तै सहयोग
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black mb-3 relative z-10 tracking-tight">Can't Find Your Specific Problem?</h2>
                    <p className="text-stone-400 mb-8 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed font-medium relative z-10">
                        Our intelligent AI match can parse complex, custom service requests and find the correct specialized technician in seconds.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
                        <Link
                            to="/ai-match"
                            className="inline-flex items-center gap-2 bg-red-750 hover:bg-red-700 text-white font-bold px-6 py-4 rounded-lg transition-all text-xs uppercase tracking-wider"
                        >
                            <Sparkles className="w-4 h-4 text-white" /> Try AI Karigar Match
                        </Link>
                        <Link
                            to="/search"
                            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-4 rounded-lg border border-white/20 transition-colors text-xs uppercase tracking-wider"
                        >
                            Search All Services <ChevronRight className="w-4 h-4 text-stone-400" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

