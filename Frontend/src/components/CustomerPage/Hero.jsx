import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ChevronDown, Check, Search, Sparkles, ShieldCheck, Star, Users, CheckCircle, Navigation, LocateFixed } from "lucide-react";
import worker from "../../assets/images/cropped-worker.png";
import { useLocation, NEPAL_LOCATIONS } from "../../context/LocationContext";

const POPULAR_SEARCHES = [
    { label: "Plumber (प्लम्बर)", query: "plumbing" },
    { label: "Electrician (इलेक्ट्रीसियन)", query: "electrical" },
    { label: "House Cleaning", query: "cleaning" },
    { label: "AC Repair", query: "appliance" },
    { label: "Painter", query: "painting" },
];

function Hero() {
    const navigate = useNavigate();
    const { location, setLocation, coordinates, detectGpsLocation, isDetectingGps } = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [locationOpen, setLocationOpen] = useState(false);
    const locationRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (locationRef.current && !locationRef.current.contains(e.target)) {
                setLocationOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (event) => {
        event.preventDefault();
        const params = new URLSearchParams();
        const query = searchQuery.trim();
        if (query) params.set("q", query);
        if (location && location !== "All Locations") params.set("location", location);
        navigate(`/search?${params.toString()}`);
    };

    const handleAiClick = () => {
        navigate("/ai-match");
    };

    return (
        <section className="relative overflow-hidden bg-[#FAF9F6] pb-24 pt-16 sm:pt-20 border-b border-stone-200/80">
            {/* Fine design grid accent */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
                    {/* Left Hero Content */}
                    <div className="lg:col-span-7">
                        {/* Elegant Minimalist Pill */}
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-600 shadow-xs flex-wrap">
                            <span className="text-red-600 font-bold">🇳🇵 ADIMANDU</span>
                            <span className="text-stone-300">•</span>
                            <span className="text-stone-600 font-medium">Professional Home Maintenance & Real-time Radar Map</span>
                        </div>

                        <h1 className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-stone-900 leading-[1.08] font-sans">
                            On-Demand <br />
                            Professional Home Care & <br />
                            <span className="text-red-700 font-extrabold underline decoration-stone-200 decoration-4 underline-offset-8">
                                Verified Specialists
                            </span>
                        </h1>

                        <p className="mb-8 max-w-xl text-base sm:text-lg leading-relaxed text-stone-600 font-medium">
                            Direct, transparent access to vetted electrical, plumbing, carpentry, and home-cleaning experts across Nepal. Compare rates, track live distance on our valley radar, and settle securely via Khalti escrow.
                        </p>

                        {/* Search & Location Bar */}
                        <form
                            onSubmit={handleSearch}
                            className="mb-6 flex flex-col sm:flex-row max-w-2xl rounded-xl border border-stone-300/80 bg-white p-1.5 shadow-sm hover:border-stone-400 focus-within:border-stone-900 focus-within:ring-2 focus-within:ring-stone-900/5 transition-all gap-1.5 sm:gap-0"
                        >
                            {/* Search input */}
                            <div className="flex flex-1 items-center gap-3 px-4 py-2 sm:py-1">
                                <Search size={18} className="shrink-0 text-stone-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Need plumbing, electrical, or home beauty?"
                                    className="flex-1 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400 font-semibold"
                                />
                            </div>

                            {/* Location dropdown */}
                            <div
                                ref={locationRef}
                                className="relative border-t sm:border-t-0 sm:border-l border-stone-200 px-2 sm:px-0 flex items-center"
                            >
                                <button
                                    type="button"
                                    onClick={() => setLocationOpen((v) => !v)}
                                    className="flex w-full sm:w-auto h-full items-center justify-between sm:justify-start gap-2 px-4 py-2 sm:py-0 text-xs sm:text-sm text-stone-700 transition-colors hover:text-red-700 font-bold"
                                >
                                    <MapPin size={15} className="shrink-0 text-red-600" />
                                    <span className="max-w-[120px] truncate whitespace-nowrap">
                                        {location === "All Locations" ? "All Locations" : location}
                                    </span>
                                    <ChevronDown
                                        size={14}
                                        className={`text-stone-400 transition-transform ${locationOpen ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {locationOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                        <div className="px-3 py-2 bg-stone-50 border-b border-stone-100 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                                            Major Service Hubs
                                        </div>
                                        <div className="max-h-60 overflow-y-auto py-1">
                                            {NEPAL_LOCATIONS.map((loc) => (
                                                <button
                                                    key={loc.name}
                                                    type="button"
                                                    onClick={() => {
                                                        setLocation(loc.name);
                                                        setLocationOpen(false);
                                                    }}
                                                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-xs sm:text-sm transition-colors ${
                                                        location === loc.name
                                                            ? "bg-stone-50 font-bold text-stone-900"
                                                             : "text-stone-700 hover:bg-stone-50"
                                                    }`}
                                                >
                                                    <span>{loc.name}</span>
                                                    {location === loc.name && (
                                                        <Check size={14} className="text-red-600" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                className="flex-shrink-0 rounded-lg bg-stone-900 hover:bg-stone-800 px-7 py-3 text-xs sm:text-sm font-bold text-white transition-all cursor-pointer"
                            >
                                Search Experts
                            </button>
                        </form>

                        {/* Interactive Map & AI CTAs */}
                        <div className="flex flex-wrap items-center gap-2.5 mt-5">
                            <button
                                type="button"
                                onClick={() => navigate('/map')}
                                className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4.5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-stone-800 transition-all"
                            >
                                <Navigation className="h-3.5 w-3.5 text-red-400" />
                                <span>Find Experts on Live Map Radar</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleAiClick}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-red-700 px-4.5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-800 transition-all"
                            >
                                <Sparkles className="h-3.5 w-3.5 text-white" />
                                <span>Sewa AI Matching</span>
                            </button>

                            <button
                                type="button"
                                onClick={detectGpsLocation}
                                disabled={isDetectingGps}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-stone-200 px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
                            >
                                <LocateFixed className={`h-3.5 w-3.5 text-red-600 ${isDetectingGps ? 'animate-spin' : ''}`} />
                                <span>{isDetectingGps ? 'Detecting GPS...' : 'Use My GPS'}</span>
                            </button>
                        </div>

                        {/* Popular Search tags */}
                        <div className="flex flex-wrap items-center gap-2 mt-5 text-xs text-stone-500">
                            <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px]">Popular:</span>
                            {POPULAR_SEARCHES.map((item) => (
                                <button
                                    key={item.query}
                                    type="button"
                                    onClick={() => navigate(`/search?q=${encodeURIComponent(item.query)}`)}
                                    className="rounded-lg bg-stone-100 hover:bg-red-50 hover:text-red-800 border border-transparent hover:border-red-200/50 px-3 py-1 text-xs font-semibold text-stone-600 transition-all"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Trust Badges under hero */}
                        <div className="mt-12 grid grid-cols-3 gap-6 border-t border-stone-200/80 pt-8">
                            <div>
                                <p className="text-xl sm:text-2xl font-black text-stone-900">30+ Experts</p>
                                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mt-1">Verified Partners</p>
                            </div>
                            <div>
                                <p className="text-xl sm:text-2xl font-black text-stone-900">4.92 / 5</p>
                                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mt-1">Service Rating</p>
                            </div>
                            <div>
                                <p className="text-xl sm:text-2xl font-black text-red-700">Khalti Escrow</p>
                                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mt-1">Payout Protection</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Hero Image & Visual Proof */}
                    <div className="lg:col-span-5 relative flex items-center justify-center">
                        <div className="relative w-full max-w-md">
                            {/* Frame border accent */}
                            <div className="absolute inset-0 border border-stone-200 rounded-xl transform translate-x-3 translate-y-3 pointer-events-none" />
                            
                            <div className="relative rounded-xl border border-stone-300/90 bg-white p-5 shadow-sm">
                                <div className="relative flex items-center justify-center overflow-hidden rounded-lg bg-stone-50 p-4">
                                    <img
                                        src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop"
                                        alt="Verified Technician at work"
                                        className="h-80 sm:h-96 w-full object-cover rounded-lg filter grayscale hover:grayscale-0 transition-all duration-700"
                                    />
                                    
                                    {/* Floating Badge 1: Verification */}
                                    <div className="absolute top-4 left-4 flex items-center gap-2.5 rounded-lg bg-white p-3.5 shadow-sm border border-stone-200">
                                        <div className="flex h-8 w-8 items-center justify-center rounded bg-stone-900 text-white">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-stone-900 uppercase tracking-wide">Government ID Vetted</p>
                                            <p className="text-[10px] font-medium text-stone-500">Citizenship & Police Check</p>
                                        </div>
                                    </div>

                                    {/* Floating Badge 2: Live Radar Proximity */}
                                    <div
                                        onClick={() => navigate('/map')}
                                        className="absolute bottom-4 right-4 flex items-center gap-2.5 rounded-lg bg-stone-900 text-white p-3.5 shadow-md border border-stone-800 cursor-pointer hover:bg-stone-800 transition-colors"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded bg-red-600 text-white">
                                            <Navigation className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-wider">Live Valley Radar</p>
                                            <p className="text-[10px] font-semibold text-stone-300">See Real Transit Distance →</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-1.5">
                                            <span className="inline-block h-6 w-6 rounded-full bg-stone-900 border border-white text-[9px] font-bold text-white flex items-center justify-center">KT</span>
                                            <span className="inline-block h-6 w-6 rounded-full bg-stone-700 border border-white text-[9px] font-bold text-white flex items-center justify-center">PK</span>
                                            <span className="inline-block h-6 w-6 rounded-full bg-stone-500 border border-white text-[9px] font-bold text-white flex items-center justify-center">LP</span>
                                        </div>
                                        <span className="text-xs font-bold text-stone-700">Valued across Kathmandu</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-bold text-stone-900">
                                        <Star className="h-4 w-4 fill-stone-900 text-stone-900" />
                                        <span>4.9 (5,200+ Bookings)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
