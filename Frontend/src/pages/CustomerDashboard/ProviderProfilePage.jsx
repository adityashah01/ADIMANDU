import { useParams, Link, useNavigate, useLocation as useRouteLocation } from 'react-router-dom';
import {
    MapPin, BadgeCheck, Clock, Briefcase, Star, ChevronRight,
    Home as HomeIcon, Phone, MessageSquare, Calendar, Share2, Heart,
    Navigation, ShieldCheck, CheckCircle2, Award
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { providersApi } from '../../services/api';
import StarRating from "../../components/CustomerPage/StarRating";
import SingleExpertMap from '../../components/Map/SingleExpertMap';
import { useLocation } from '../../context/LocationContext';
import { calculateDistance, estimateTravelTime, estimateVisitCharge } from '../../utils/geoUtils';

const availabilityConfig = {
    available: { label: 'Available Now (तुरुन्त उपलब्ध)', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    busy: { label: 'Currently Busy on Job', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
    offline: { label: 'Offline', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
};

export default function ProviderProfilePage() {
    const { providerId } = useParams();
    const navigate = useNavigate();
    const routeLocation = useRouteLocation();
    const searchParams = new URLSearchParams(routeLocation.search);
    const catalogServiceId = searchParams.get('catalogServiceId');

    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [wishlisted, setWishlisted] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const { coordinates: userLocation } = useLocation();

    // FEATURE 2: Chat Simulation States
    const [chatMessages, setChatMessages] = useState(() => [
        { id: 1, sender: 'provider', text: 'Namaste! Thanks for visiting my profile. How can I assist you with your home service needs today?', date: new Date() }
    ]);
    const [typedMessage, setTypedMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // FEATURE 5: Weekly Scheduler States
    const [selectedDay, setSelectedDay] = useState("Tomorrow");
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookedSlots, setBookedSlots] = useState(["11:00 AM", "03:00 PM"]); // Mocked busy slots

    // FEATURE 10: Review Rating & Keyword Filters
    const [selectedStarFilter, setSelectedStarFilter] = useState(null);
    const [selectedReviewKeyword, setSelectedReviewKeyword] = useState(null);

    // FEATURE 1: Custom Interactive Fare & Distance Calculator Location overrides
    const [overrideLocationName, setOverrideLocationName] = useState("");
    const [calcDistance, setCalcDistance] = useState(null);
    const [calcError, setCalcError] = useState("");

    // FEATURE 2: Real-time chat simulation trigger
    const handleSendChat = (textToSend) => {
        if (!textToSend.trim()) return;
        const newMsg = {
            id: Date.now(),
            sender: 'user',
            text: textToSend,
            date: new Date()
        };
        setChatMessages(prev => [...prev, newMsg]);
        setTypedMessage("");
        setIsTyping(true);

        setTimeout(() => {
            let responseText = `Dhanyabaad for your message! Yes, I specialize in ${provider?.category || 'home service'} jobs. I always guarantee professional craftsmanship and tidy up afterwards.`;
            const lower = textToSend.toLowerCase();
            
            if (lower.includes('available') || lower.includes('time') || lower.includes('when') || lower.includes('free')) {
                responseText = `I am completely available ${selectedDay.toLowerCase()} during your preferred slot (${selectedSlot || '9:00 AM - 5:00 PM'}). Go ahead and book using the "Book Appointment" button above so the system reserves the slot for you!`;
            } else if (lower.includes('price') || lower.includes('cost') || lower.includes('charge') || lower.includes('fee')) {
                responseText = `My baseline visit and diagnostic fee is Rs. ${provider?.price || 500}. If there are any custom requirements or extra parts, I will present a transparent estimate before initiating any repair.`;
            } else if (lower.includes('tool') || lower.includes('part') || lower.includes('material') || lower.includes('bring')) {
                responseText = "Yes, as an Adimandu certified professional, I carry a complete specialized toolkit. For any replacement components, I will source genuine parts with physical VAT receipts for your peace of mind.";
            } else if (provider?.categorySlug === 'plumbing' || String(provider?.category).toLowerCase().includes('plumb')) {
                responseText = "I can resolve pipeline leaks, blocked washbasins, low tap pressure, or flush tanks. I carry specialized industrial sealing thread and pipeline wrenches for a secure job.";
            } else if (provider?.categorySlug === 'electrical' || String(provider?.category).toLowerCase().includes('electr')) {
                responseText = "For electrical jobs, safety is my absolute priority. I carry digital multimeters and insulated safety gear to diagnose short circuits, wire burns, switch replacements, or fan setups safely.";
            } else if (provider?.categorySlug === 'beautician' || String(provider?.category).toLowerCase().includes('salon') || String(provider?.category).toLowerCase().includes('beauty')) {
                responseText = "Namaste! I only use certified organic, premium cosmetic brands for facial, waxing, or threading care. I follow a strict personal sanitation protocol with sterilized disposable equipment.";
            } else if (provider?.categorySlug === 'it-support' || String(provider?.category).toLowerCase().includes('computer') || String(provider?.category).toLowerCase().includes('tech')) {
                responseText = "I can troubleshoot slow laptops, configure high-performance Wi-Fi routers, install antivirus firewalls, or mount smart CCTV security cameras. I carry specialized diagnostic cables.";
            }

            setChatMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'provider',
                text: responseText,
                date: new Date()
            }]);
            setIsTyping(false);
        }, 1100);
    };

    useEffect(() => {
        const fetchProvider = async () => {
            try {
                const data = await providersApi.getById(providerId, userLocation);
                setProvider(data);
            } catch (error) {
                console.error("Failed to load provider:", error);
                setProvider(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProvider();
    }, [providerId, userLocation]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-3">Provider Not Found</h2>
                <Link to="/map" className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium text-sm hover:bg-red-700 transition-colors">
                    Find Experts on Map
                </Link>
            </div>
        );
    }

    const avail = availabilityConfig[provider.availability] || availabilityConfig.offline;

    const liveDistance = userLocation && provider.latitude && provider.longitude
        ? calculateDistance(userLocation.lat, userLocation.lng, provider.latitude, provider.longitude)
        : (provider.distance || null);

    const liveTravelTime = estimateTravelTime(liveDistance);
    const liveVisitFee = estimateVisitCharge(liveDistance);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6 flex-wrap">
                <Link to="/" className="flex items-center gap-1 hover:text-red-600"><HomeIcon className="w-3.5 h-3.5" /> Home</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link to="/categories" className="hover:text-red-600">Categories</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link to={`/categories/${provider.categoryId}`} className="hover:text-red-600">{provider.category}</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-700 font-medium truncate">{provider.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Cover Hero */}
                    <div className="relative h-52 sm:h-64 rounded-3xl overflow-hidden shadow-sm">
                        <img
                            src={provider.coverImage || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&fit=crop'}
                            alt={provider.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-4 right-4 flex gap-2">
                            <button
                                onClick={() => setWishlisted(!wishlisted)}
                                className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors cursor-pointer"
                            >
                                <Heart className={`w-5 h-5 ${wishlisted ? 'text-red-500 fill-red-500' : 'text-slate-600'}`} />
                            </button>
                            <button
                                onClick={() => {
                                    if (navigator.clipboard) {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert("Link copied to clipboard!");
                                    }
                                }}
                                className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors cursor-pointer"
                            >
                                <Share2 className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>
                    </div>

                    {/* Basic Info Card */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
                        <div className="flex items-start gap-4">
                            <img
                                src={provider.avatar}
                                alt={provider.name}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md shrink-0 -mt-10 relative z-10 bg-slate-100"
                                onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=dc2626&color=fff`;
                                }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{provider.name}</h1>
                                    {provider.verified && (
                                        <span className="flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-bold border border-red-200">
                                            <BadgeCheck className="w-3.5 h-3.5" /> Verified Nepali Pro
                                        </span>
                                    )}
                                </div>
                                <p className="text-red-600 font-bold text-sm mt-0.5">{provider.category}</p>
                                
                                <div className="mt-2 flex items-center gap-3 text-xs sm:text-sm text-slate-500 flex-wrap">
                                    <span className="flex items-center gap-1 font-medium"><MapPin className="w-3.5 h-3.5 text-red-600" /> {provider.location || 'Nepal'}</span>
                                    <span className="flex items-center gap-1 font-medium"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> {provider.experience || 3} yrs exp</span>
                                    <span className="flex items-center gap-1 font-medium"><Clock className="w-3.5 h-3.5 text-slate-400" /> Responds {provider.responseTime}</span>
                                </div>

                                <div className="mt-3 flex items-center gap-3 flex-wrap">
                                    <StarRating rating={provider.rating} showNumber reviewCount={provider.reviewCount} />
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${avail.cls}`}>{avail.label}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex border-b border-slate-200 flex-wrap">
                        {['overview', 'scheduling_chat', 'location_map', 'reviews'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold capitalize transition-colors border-b-2 -mb-px flex items-center gap-2 ${
                                    activeTab === tab
                                        ? 'border-red-600 text-red-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {tab === 'overview' && 'Overview & Skills'}
                                {tab === 'scheduling_chat' && '📅 Timetable & Instant Chat'}
                                {tab === 'location_map' && (
                                    <>
                                        <Navigation className="w-4 h-4" />
                                        <span>Live Map & Proximity</span>
                                        {liveDistance !== null && (
                                            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-extrabold">
                                                {liveDistance} km
                                            </span>
                                        )}
                                    </>
                                )}
                                {tab === 'reviews' && `Reviews (${provider.reviewCount || 0})`}
                            </button>
                        ))}
                    </div>

                    {/* Tab 1: Overview */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Live Distance Highlight Widget */}
                            <div className="bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 rounded-2xl border border-red-200/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0">
                                        <Navigation className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-extrabold uppercase tracking-wider text-red-700">Proximity to You</div>
                                        <div className="text-lg font-black text-slate-900 mt-0.5">
                                            {liveDistance !== null ? `${liveDistance} km away` : 'Within Local Area'}
                                            <span className="text-xs font-bold text-slate-500 ml-2 font-normal">
                                                (~{liveTravelTime} transit)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveTab('location_map')}
                                    className="px-4 py-2 bg-white hover:bg-slate-50 text-red-700 font-bold text-xs rounded-xl border border-red-200 shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                                >
                                    <MapPin className="w-3.5 h-3.5 text-red-600" /> View on Map & Route →
                                </button>
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                                <h3 className="font-bold text-slate-900 text-base mb-3">About the Expert</h3>
                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{provider.bio}</p>
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                                <h3 className="font-bold text-slate-900 text-base mb-3">Skills & Specializations</h3>
                                <div className="flex flex-wrap gap-2">
                                    {provider.skills?.map((skill) => (
                                        <span key={skill} className="px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-xl font-semibold">
                                            ✓ {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-xs">
                                    <div className="text-2xl font-black text-red-600">{provider.completedJobs || 15}+</div>
                                    <div className="text-xs font-bold text-slate-500 mt-1">Jobs Done</div>
                                </div>
                                <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-xs">
                                    <div className="text-2xl font-black text-amber-500">{provider.rating || '5.0'}★</div>
                                    <div className="text-xs font-bold text-slate-500 mt-1">Rating</div>
                                </div>
                                <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-xs">
                                    <div className="text-2xl font-black text-emerald-600">{liveDistance ? `${liveDistance} km` : "Local"}</div>
                                    <div className="text-xs font-bold text-slate-500 mt-1">Proximity</div>
                                </div>
                            </div>

                            {/* Embedded Map in Overview */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-red-600" />
                                        Service Location & Distance
                                    </h3>
                                    <Link to="/map" className="text-xs font-bold text-red-600 hover:text-red-700">
                                        Explore All Nearby on Map →
                                    </Link>
                                </div>
                                <SingleExpertMap provider={provider} height="300px" showRoute={true} />
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Full Map View */}
                    {activeTab === 'location_map' && (
                        <div className="space-y-4">
                            <SingleExpertMap provider={provider} height="480px" showRoute={true} />
                        </div>
                    )}

                    {/* Tab 3: Reviews */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-4">
                            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-6 shadow-xs">
                                <div className="text-center shrink-0">
                                    <div className="text-5xl font-black text-slate-900">{provider.rating}</div>
                                    <StarRating rating={provider.rating} className="justify-center mt-1" />
                                    <div className="text-xs text-slate-400 mt-1 font-bold">{provider.reviewCount || 0} reviews</div>
                                </div>
                                <div className="flex-1">
                                    {[5, 4, 3, 2, 1].map((n) => {
                                        const count = provider.reviews?.filter((r) => r.rating === n).length || 0;
                                        const pct = (provider.reviews?.length || 0) > 0 ? (count / provider.reviews.length) * 100 : 0;
                                        return (
                                            <div key={n} className="flex items-center gap-2 mb-1.5">
                                                <span className="text-xs text-slate-500 w-4 text-right font-bold">{n}</span>
                                                <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                                                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                                    <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-xs text-slate-400 w-5 font-medium">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            {provider.reviews?.map((review) => (
                                <div key={review.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                                    <div className="flex items-start gap-3">
                                        <img src={review.avatar} alt={review.author} className="w-10 h-10 rounded-full object-cover shrink-0 bg-slate-100" />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between flex-wrap gap-1">
                                                <span className="font-bold text-slate-900 text-sm">{review.author}</span>
                                                <span className="text-xs text-slate-400 font-medium">
                                                    {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <StarRating rating={review.rating} className="mt-1 mb-2" />
                                            <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Sticky Booking Box */}
                <div className="space-y-5">
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg sticky top-24">
                        <div className="mb-4">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-black text-slate-900">Rs. {Number(provider.price).toLocaleString()}</span>
                                <span className="text-xs font-bold text-slate-400">{provider.priceUnit}</span>
                            </div>
                            {provider.priceType === 'inspection' && (
                                <p className="text-xs text-amber-700 font-semibold mt-1">Inspection / Basic Service charge</p>
                            )}
                        </div>

                        {/* FEATURE 1: Custom Location Simulator & Fare Estimator */}
                        <div className="mb-4">
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                📍 Choose Kathmandu Area for Fare estimation:
                            </label>
                            <select
                                value={overrideLocationName}
                                onChange={(e) => {
                                    const loc = e.target.value;
                                    setOverrideLocationName(loc);
                                    if (loc === "Thamel") {
                                        setCalcDistance(1.2);
                                    } else if (loc === "Pulchowk") {
                                        setCalcDistance(4.8);
                                    } else if (loc === "Bhaktapur") {
                                        setCalcDistance(13.4);
                                    } else if (loc === "Koteshwor") {
                                        setCalcDistance(6.1);
                                    } else if (loc === "Boudha") {
                                        setCalcDistance(5.5);
                                    } else {
                                        setCalcDistance(null);
                                    }
                                }}
                                className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500 outline-none transition"
                            >
                                <option value="">Default (Your GPS Location)</option>
                                <option value="Thamel">Thamel, KTM (1.2 km away)</option>
                                <option value="Pulchowk">Pulchowk, Lalitpur (4.8 km away)</option>
                                <option value="Boudha">Boudha Stupa, KTM (5.5 km away)</option>
                                <option value="Koteshwor">Koteshwor, Ring Road (6.1 km away)</option>
                                <option value="Bhaktapur">Bhaktapur Durbar Sq. (13.4 km away)</option>
                            </select>
                        </div>

                        <div className="space-y-3 mb-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center justify-between text-xs text-slate-700">
                                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                                    <Navigation className="w-4 h-4 text-red-600" /> Distance
                                </span>
                                <span className="font-bold text-slate-900">
                                    {overrideLocationName ? `${calcDistance} km (${overrideLocationName})` : (liveDistance !== null ? `${liveDistance} km` : 'Local Area')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-700">
                                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                                    <Clock className="w-4 h-4 text-emerald-600" /> Estimated Transit
                                </span>
                                <span className="font-bold text-emerald-700">
                                    {overrideLocationName ? `${Math.ceil(calcDistance * 3.5)} mins` : liveTravelTime}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-700 border-t border-slate-200/60 pt-2">
                                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                                    <ShieldCheck className="w-4 h-4 text-blue-600" /> Travel Coverage
                                </span>
                                <span className="font-semibold text-slate-800 text-[11px]">
                                    {overrideLocationName ? `Rs. ${Math.max(100, Math.ceil(calcDistance * 25))} Coverage Charge` : liveVisitFee.text}
                                </span>
                            </div>

                            {/* Total estimation */}
                            <div className="flex items-center justify-between text-xs text-slate-900 border-t border-slate-200 pt-2 font-bold">
                                <span>Estimated Total:</span>
                                <span className="text-sm font-black text-slate-950">
                                    Rs. {(
                                        Number(provider.price) + 
                                        (overrideLocationName ? Math.max(100, Math.ceil(calcDistance * 25)) : (liveVisitFee.amount || 0))
                                    ).toLocaleString()}
                                </span>
                            </div>

                            {/* Feature 5: slot booking validation message */}
                            {selectedSlot && (
                                <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 p-2 rounded-xl mt-1.5 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    Booking for {selectedDay} @ {selectedSlot}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => navigate(`/book/${provider.id}${catalogServiceId ? `?catalogServiceId=${catalogServiceId}` : ''}`)}
                            disabled={provider.availability === 'offline'}
                            className="w-full py-3.5 bg-red-600 text-white font-extrabold rounded-2xl hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 cursor-pointer text-sm"
                        >
                            <Calendar className="w-4 h-4" />
                            {provider.availability === 'offline' ? 'Currently Unavailable' : 'Book Appointment (बुक गर्नुहोस्)'}
                        </button>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {provider.phone ? (
                                <>
                                    <a
                                        href={`tel:${provider.phone}`}
                                        className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <Phone className="w-3.5 h-3.5 text-slate-600" /> Call Pro
                                    </a>
                                    <a
                                        href={`https://wa.me/${provider.phone}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 py-2.5 border border-emerald-500/30 text-emerald-700 bg-emerald-50 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                                    </a>
                                </>
                            ) : (
                                <>
                                    <button disabled className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-400 bg-slate-50 cursor-not-allowed">
                                        <Phone className="w-3.5 h-3.5" /> Call
                                    </button>
                                    <button disabled className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-400 bg-slate-50 cursor-not-allowed">
                                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
