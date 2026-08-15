import { useState, useMemo, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal, X, ChevronDown, Home as HomeIcon, Wrench, Zap, Info, Camera, MapPin, Send, ArrowLeft } from 'lucide-react';
import { categories } from "../../data/categories";
import { providersApi } from "../../services/api";
import ProviderCard from "../../components/CustomerPage/ProviderCard";

const sortOptions = [
    { label: 'Top Rated', value: 'rating' },
    { label: 'Most Reviews', value: 'reviews' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Nearest First', value: 'distance' },
];

export default function CategoryPage() {
    const { categoryId } = useParams();
    const category = categories.find((c) => c.id === categoryId);
    
    // View state: 'categories', 'fixed-providers', 'inspection-form'
    const [viewState, setViewState] = useState('categories');
    const [selectedFixedService, setSelectedFixedService] = useState(null);
    const [selectedInspectionService, setSelectedInspectionService] = useState(null);
    const [inspectionForm, setInspectionForm] = useState({ description: '', location: '' });

    const [sortBy, setSortBy] = useState('rating');
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [selectedAvailability, setSelectedAvailability] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Reset view state when category changes
        setViewState('categories');
        setSelectedFixedService(null);
        setSelectedInspectionService(null);
        setProviders([]);

        if (category) {
            const fetchProviders = async () => {
                setLoading(true);
                try {
                    const data = await providersApi.getAll({ category: category.id });
                    setProviders(data || []);
                } catch (error) {
                    console.error("Failed to load providers:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchProviders();
        }
    }, [categoryId]);

    const providersInCategory = useMemo(() => {
        let list = [...providers];
        if (verifiedOnly) list = list.filter((p) => p.verified);
        if (selectedAvailability) list = list.filter((p) => p.availability === selectedAvailability);

        switch (sortBy) {
            case 'rating': list.sort((a, b) => b.rating - a.rating); break;
            case 'reviews': list.sort((a, b) => b.reviewCount - a.reviewCount); break;
            case 'price_asc': list.sort((a, b) => a.price - b.price); break;
            case 'price_desc': list.sort((a, b) => b.price - a.price); break;
            case 'distance': list.sort((a, b) => a.distance - b.distance); break;
            default: break;
        }
        return list;
    }, [providers, sortBy, verifiedOnly, selectedAvailability]);

    if (!category) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-3">Category Not Found</h2>
                <Link to="/categories" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors">
                    Browse All Categories
                </Link>
            </div>
        );
    }

    const handleFixedServiceClick = (service) => {
        setSelectedFixedService(service);
        setViewState('fixed-providers');
    };

    const handleInspectionServiceClick = (serviceName) => {
        setSelectedInspectionService(serviceName);
        setInspectionForm({ description: serviceName === 'Other / Describe your problem' ? '' : serviceName, location: '' });
        setViewState('inspection-form');
    };

    const handleInspectionSubmit = (e) => {
        e.preventDefault();
        alert("Your request has been sent! We will find suitable providers for you shortly.");
        setViewState('categories');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6 flex-wrap">
                <Link to="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                    <HomeIcon className="w-3.5 h-3.5" /> Home
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link to="/categories" className="hover:text-blue-600 transition-colors">Categories</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <button onClick={() => setViewState('categories')} className="hover:text-blue-600 transition-colors">
                    {category.name}
                </button>
                {viewState === 'fixed-providers' && selectedFixedService && (
                    <>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-slate-700 font-medium">{selectedFixedService.name}</span>
                    </>
                )}
                {viewState === 'inspection-form' && (
                    <>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-slate-700 font-medium">Request Service</span>
                    </>
                )}
            </nav>

            <div className="relative h-48 sm:h-60 rounded-2xl overflow-hidden mb-8 shadow-sm">
                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40" />
                <div className="absolute inset-0 flex items-center px-6 sm:px-10">
                    <div className="text-white">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{category.name}</h1>
                        <p className="text-slate-200 text-sm sm:text-base max-w-lg">{category.description}</p>
                    </div>
                </div>
            </div>

            {viewState === 'categories' && (
                <div className="space-y-10">
                    {/* Fixed Price Services */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="w-6 h-6 text-yellow-500" />
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Fixed Price Services</h2>
                                <p className="text-sm text-slate-500">Standardized jobs with predefined pricing.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {category.fixedServices?.map(service => (
                                <div 
                                    key={service.id} 
                                    onClick={() => handleFixedServiceClick(service)}
                                    className="bg-white border border-slate-200 rounded-xl p-5 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
                                >
                                    <div>
                                        <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors mb-1">{service.name}</h3>
                                        <p className="text-sm text-slate-500 font-medium bg-slate-50 inline-block px-2 py-1 rounded">Range: {service.priceRange}</p>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm font-medium text-blue-600">
                                        View Providers <ChevronRight className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Inspection-Based Services */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Wrench className="w-6 h-6 text-blue-500" />
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Inspection-Based Services</h2>
                                <p className="text-sm text-slate-500">Request a custom repair or diagnosis.</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {category.inspectionServices?.map((service, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleInspectionServiceClick(service)}
                                    className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all text-left flex-grow sm:flex-grow-0"
                                >
                                    {service}
                                </button>
                            ))}
                            <button
                                onClick={() => handleInspectionServiceClick('Other / Describe your problem')}
                                className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all text-left flex-grow sm:flex-grow-0"
                            >
                                Other / Describe your problem
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {viewState === 'fixed-providers' && selectedFixedService && (
                <div>
                    <button 
                        onClick={() => setViewState('categories')}
                        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to {category.name} services
                    </button>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{selectedFixedService.name} Providers</h2>
                            <p className="text-sm text-slate-500 mt-1">Estimated {selectedFixedService.priceRange}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${showFilters || verifiedOnly || selectedAvailability
                                    ? 'border-blue-400 bg-blue-50 text-blue-600'
                                    : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                                    }`}
                            >
                                <SlidersHorizontal className="w-4 h-4" /> Filters
                            </button>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-2 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-400 cursor-pointer"
                                >
                                    {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-slate-800 text-sm">Filter Providers</h3>
                                {(verifiedOnly || selectedAvailability) && (
                                    <button
                                        onClick={() => { setVerifiedOnly(false); setSelectedAvailability(''); }}
                                        className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                                    >
                                        <X className="w-3.5 h-3.5" /> Clear
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Availability</label>
                                    <select
                                        value={selectedAvailability}
                                        onChange={(e) => setSelectedAvailability(e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-400"
                                    >
                                        <option value="">Any</option>
                                        <option value="available">Available Now</option>
                                        <option value="busy">Busy</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Verification</label>
                                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                                        <input
                                            type="checkbox"
                                            checked={verifiedOnly}
                                            onChange={(e) => setVerifiedOnly(e.target.checked)}
                                            className="w-4 h-4 accent-blue-600"
                                        />
                                        <span className="text-sm text-slate-700">Verified providers only</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : providersInCategory.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {providersInCategory.map((p) => <ProviderCard key={p.id} provider={p} />)}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                            <h3 className="text-xl font-semibold text-slate-700 mb-2">No providers found</h3>
                            <p className="text-slate-400 mb-6">No providers match your current filters.</p>
                            <button
                                onClick={() => { setVerifiedOnly(false); setSelectedAvailability(''); }}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            {viewState === 'inspection-form' && (
                <div className="max-w-2xl mx-auto">
                    <button 
                        onClick={() => setViewState('categories')}
                        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to {category.name} services
                    </button>
                    
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <Info className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Request Custom Inspection</h2>
                                <p className="text-sm text-slate-500">We'll find the best professional for your specific need.</p>
                            </div>
                        </div>
                        
                        <form onSubmit={handleInspectionSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Describe your issue</label>
                                <textarea
                                    required
                                    value={inspectionForm.description}
                                    onChange={(e) => setInspectionForm({...inspectionForm, description: e.target.value})}
                                    placeholder="E.g., The kitchen light trips whenever I turn on the microwave..."
                                    className="w-full border border-slate-300 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-32 resize-none"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Add photos (Optional)</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer group">
                                    <Camera className="w-8 h-8 mb-2 group-hover:text-blue-500" />
                                    <span className="text-sm font-medium">Click to upload or drag & drop</span>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        required
                                        type="text"
                                        value={inspectionForm.location}
                                        onChange={(e) => setInspectionForm({...inspectionForm, location: e.target.value})}
                                        placeholder="Enter your address"
                                        className="w-full border border-slate-300 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                            >
                                Send Request <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
