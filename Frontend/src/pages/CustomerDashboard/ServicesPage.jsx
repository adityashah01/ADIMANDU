import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ChevronRight, Loader, AlertCircle, Tag, ClipboardList,
    CheckCircle, Search, ArrowRight, Sparkles, ShieldCheck
} from 'lucide-react';
import { catalogServicesApi } from '../../services/api';
import { categories } from '../../data/categories';

export default function ServicesPage() {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const categoryInfo = categories.find(c => c.id === categoryId);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const data = await catalogServicesApi.getAll({ categoryId });
                setServices(data);
            } catch (err) {
                setError(err.message || 'Failed to load services');
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [categoryId]);

    const fixedPrice = services.filter(s => s.serviceType === 'FIXED_PRICE');
    const inspectionBased = services.filter(s => s.serviceType === 'INSPECTION_BASED');

    const handleSelect = (service) => {
        navigate(`/providers?catalogServiceId=${service.id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] bg-[#FAF9F6]">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="w-8 h-8 animate-spin text-red-700" />
                    <p className="text-stone-500 font-bold uppercase tracking-wider text-[11px]">Retrieving Sector Registry...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center bg-[#FAF9F6]">
                <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
                <h3 className="text-xl font-black text-stone-900 mb-2 uppercase tracking-wider">Failed to Load Sector</h3>
                <p className="text-stone-500 text-sm max-w-md mb-6 font-medium">{error}</p>
                <button onClick={() => navigate('/categories')} className="px-6 py-3.5 bg-stone-900 text-white rounded-lg font-bold hover:bg-stone-800 transition-colors uppercase tracking-wider text-xs">
                    Back to Categories
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[#FAF9F6] min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-8 gap-2">
                    <Link to="/" className="hover:text-stone-900 transition-colors">Home</Link>
                    <span className="text-stone-300">/</span>
                    <Link to="/categories" className="hover:text-stone-900 transition-colors">Categories</Link>
                    <span className="text-stone-300">/</span>
                    <span className="text-stone-900">{categoryInfo?.name || categoryId}</span>
                </nav>

                {/* Header Banner */}
                <div className="mb-14">
                    {categoryInfo?.image && (
                        <div className="relative h-48 sm:h-56 rounded-xl overflow-hidden mb-6 border border-stone-200 bg-stone-100">
                            <img src={categoryInfo.image} alt={categoryInfo.name} className="w-full h-full object-cover filter grayscale" />
                            <div className="absolute inset-0 bg-stone-950/45 flex items-center px-6 sm:px-10">
                                <div>
                                    <span className="inline-block px-2.5 py-1 rounded bg-red-700 text-white text-[9px] font-bold uppercase tracking-widest mb-3.5">
                                        नेपाल राष्ट्रिय प्रमाणपत्र • SERVICE STANDARD
                                    </span>
                                    <h1 className="text-2xl sm:text-3.5xl font-black text-white uppercase tracking-wider">{categoryInfo.name}</h1>
                                    <p className="text-stone-200 mt-2 max-w-xl text-xs sm:text-sm font-medium leading-relaxed">{categoryInfo.description}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <p className="text-stone-500 text-xs sm:text-sm font-bold uppercase tracking-wider">
                        Select a category option below to inspect active local Karigars. <strong>{fixedPrice.length}</strong> fixed-rate and{' '}
                        <strong>{inspectionBased.length}</strong> site-quote listings active.
                    </p>
                </div>

                {services.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center border border-stone-200 shadow-xs">
                        <Search className="w-10 h-10 text-stone-300 mx-auto mb-4" />
                        <h3 className="text-base font-bold text-stone-900 mb-2 uppercase tracking-wider">No Listed Services</h3>
                        <p className="text-stone-500 mb-6 max-w-md mx-auto text-xs font-medium">No specialized services have been listed under this sector in your region yet.</p>
                        <button onClick={() => navigate('/categories')} className="px-6 py-3.5 bg-stone-900 text-white rounded-lg font-bold hover:bg-stone-800 transition-colors text-xs uppercase tracking-wider">
                            Explore Other Categories
                        </button>
                    </div>
                ) : (
                    <div className="space-y-16">

                        {/* ── CATEGORY A: Fixed Price ──────────────────── */}
                        {fixedPrice.length > 0 && (
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-stone-250 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-800 shrink-0">
                                            <Tag className="w-4 h-4 text-red-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-black text-stone-900 uppercase tracking-wider">Fixed Price Services (तोकिएको मूल्य)</h2>
                                            <p className="text-xs text-stone-500 font-medium">Upfront trade prices — pay standard listed fees with zero onsite adjustments</p>
                                        </div>
                                    </div>
                                    <span className="inline-block bg-stone-100 border border-stone-200 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-stone-700 rounded self-start sm:self-auto">
                                        Instant Booking
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {fixedPrice.map((service) => (
                                        <div
                                            key={service.id}
                                            onClick={() => handleSelect(service)}
                                            className="group bg-white rounded-xl border border-stone-200 hover:border-stone-900 transition-all duration-350 cursor-pointer flex flex-col justify-between overflow-hidden"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-3.5">
                                                    <h3 className="text-base font-bold text-stone-900 group-hover:text-red-700 transition-colors">{service.name}</h3>
                                                    <span className="shrink-0 ml-2 text-[9px] font-bold bg-stone-50 border border-stone-200/60 px-2 py-0.5 rounded uppercase tracking-wider text-stone-600">Fixed</span>
                                                </div>
                                                <p className="text-stone-500 text-xs leading-relaxed font-medium">
                                                    {service.description || `Professional ${service.name.toLowerCase()} by verified experts.`}
                                                </p>
                                            </div>
                                            <div className="bg-stone-50/50 px-6 py-4.5 border-t border-stone-100 flex items-center justify-between group-hover:bg-stone-100/30 transition-colors">
                                                <div>
                                                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Starting standard</p>
                                                    <p className="text-base font-black text-stone-900">Rs. {Number(service.basePrice).toLocaleString()}</p>
                                                </div>
                                                <div className="flex items-center gap-1 text-stone-900 text-xs font-bold uppercase tracking-wider">
                                                    Find Karigars <ArrowRight className="w-3.5 h-3.5 text-red-600" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── CATEGORY B: Inspection Based ────────────── */}
                        {inspectionBased.length > 0 && (
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-stone-250 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-800 shrink-0">
                                            <ClipboardList className="w-4 h-4 text-red-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-black text-stone-900 uppercase tracking-wider">Inspection-Based Services (अनुगमन तथा कोटेशन)</h2>
                                            <p className="text-xs text-stone-500 font-medium">Diagnostic visitation — expert assesses job complexity on site to issue custom quotation</p>
                                        </div>
                                    </div>
                                    <span className="inline-block bg-stone-100 border border-stone-200 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-stone-700 rounded self-start sm:self-auto">
                                        Visit & Quote
                                    </span>
                                </div>

                                {/* Explainer */}
                                <div className="bg-stone-100 border border-stone-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                                    <AlertCircle className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
                                    <div className="text-xs text-stone-600 leading-relaxed font-semibold">
                                        <span className="text-stone-900 uppercase tracking-wider text-[10px] font-bold block mb-1">Diagnose-First Protocol</span> You pay a standard diagnostic base-fee. The visiting professional delivers a custom on-site estimate. You remain under zero obligation to proceed.
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {inspectionBased.map((service) => (
                                        <div
                                            key={service.id}
                                            onClick={() => handleSelect(service)}
                                            className="group bg-white rounded-xl border border-stone-200 hover:border-stone-900 transition-all duration-350 cursor-pointer flex flex-col justify-between overflow-hidden"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-3.5">
                                                    <h3 className="text-base font-bold text-stone-900 group-hover:text-stone-850 transition-colors">{service.name}</h3>
                                                    <span className="shrink-0 ml-2 text-[9px] font-bold bg-stone-50 border border-stone-200/60 px-2 py-0.5 rounded uppercase tracking-wider text-stone-600">Inspect</span>
                                                </div>
                                                <p className="text-stone-500 text-xs leading-relaxed font-medium">
                                                    {service.description || `Provider inspects first, then provides a custom quote.`}
                                                </p>
                                                <div className="mt-4.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> No obligation quote guarantee
                                                </div>
                                            </div>
                                            <div className="bg-stone-50/50 px-6 py-4.5 border-t border-stone-100 flex items-center justify-between group-hover:bg-stone-100/30 transition-colors">
                                                <div>
                                                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Visiting fee</p>
                                                    <p className="text-base font-black text-stone-900">Rs. {Number(service.inspectionFee).toLocaleString()}</p>
                                                </div>
                                                <div className="flex items-center gap-1 text-stone-900 text-xs font-bold uppercase tracking-wider">
                                                    Find Karigars <ArrowRight className="w-3.5 h-3.5 text-red-600" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div
                                        onClick={() => navigate('/ai-match')}
                                        className="group bg-stone-900 hover:bg-stone-850 rounded-xl border border-stone-850 transition-all duration-350 cursor-pointer flex flex-col justify-between overflow-hidden relative"
                                    >
                                        <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />
                                        <div className="p-6 flex-1 flex flex-col items-center justify-center text-center relative z-10">
                                            <div className="w-10 h-10 bg-white/10 rounded border border-white/15 flex items-center justify-center mb-3 text-red-500">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors mb-2 uppercase tracking-wider">Unusual Request?</h3>
                                            <p className="text-stone-400 text-xs leading-relaxed font-medium max-w-[200px]">
                                                Describe your complex trade problem directly to our AI match system.
                                            </p>
                                        </div>
                                        <div className="bg-white/5 px-5 py-4 border-t border-white/10 flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider relative z-10">
                                            Try Sewa AI Match <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-red-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}

