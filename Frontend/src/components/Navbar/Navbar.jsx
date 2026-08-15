import { Sparkles, LayoutGrid, ShieldCheck, Map as MapIcon, Navigation } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Logo from "../Logo";
import SearchBar from "./SearchBar";
import LocationSelector from "./LocationSelector";
import NotificationButton from "./NotificationButton";
import ProfileMenu from "./ProfileMenu";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../CustomerPage/Button";

function Navbar() {
    const navigate = useNavigate();
    const routeLocation = useLocation();
    const { user } = useAuth();

    const isMapActive = routeLocation.pathname === '/map';

    return (
        <header className="sticky top-0 z-50 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-stone-200/80">
            {/* Top Nepali Trust Ribbon */}
            <div className="bg-stone-950 text-stone-300 text-[10px] font-bold py-2.5 px-4 sm:px-6 uppercase tracking-wider">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-red-500">
                            🇳🇵 सेवा नै धर्म हो
                        </span>
                        <span className="hidden sm:inline text-stone-700">•</span>
                        <span className="hidden sm:inline text-stone-400">Nepal's Verified On-Demand Home Care & Map Radar</span>
                    </div>
                    <div className="flex items-center gap-4 text-stone-400">
                        <span className="flex items-center gap-1 text-emerald-500">
                            <ShieldCheck className="w-3.5 h-3.5" /> 100% Khalti Escrow Guaranteed
                        </span>
                        <span className="hidden md:inline text-stone-500">Kathmandu • Lalitpur • Pokhara • Chitwan</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 sm:gap-6">
                {/* Logo & Subtitle */}
                <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => navigate('/')}>
                    <Logo className="h-9 w-auto" />
                </div>

                {/* Search + Location */}
                <div className="hidden lg:flex items-center gap-3 flex-1 justify-center max-w-2xl">
                    <SearchBar />
                    <LocationSelector />
                </div>

                {/* Right Side Navigation */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Nearby Map Button - Visible on both desktop & mobile */}
                    <button
                        onClick={() => navigate('/map')}
                        className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg transition font-bold text-[11px] uppercase tracking-wider border ${
                            isMapActive
                                ? 'bg-stone-900 text-white border-stone-900'
                                : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100/50'
                        }`}
                        title="View Nearby Experts & Distances on Map"
                    >
                        <Navigation className={`w-3.5 h-3.5 ${isMapActive ? 'text-white' : 'text-red-600'}`} />
                        <span>Nearby Map</span>
                    </button>

                    {/* AI Match button */}
                    <button
                        onClick={() => navigate('/ai-match')}
                        className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 transition font-bold text-[11px] uppercase tracking-wider"
                        title="AI-powered provider matching"
                    >
                        <Sparkles size={13} className="text-red-600" />
                        <span>AI Match</span>
                    </button>

                    {/* Categories button */}
                    <button
                        onClick={() => navigate('/categories')}
                        className="hidden md:flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg hover:bg-stone-100 text-stone-700 transition font-bold text-[11px] uppercase tracking-wider border border-stone-200"
                        title="Browse categories"
                    >
                        <LayoutGrid size={13} />
                        <span>Services</span>
                    </button>

                    {user ? (
                        <div className="flex items-center gap-1.5">
                            <NotificationButton />
                            <ProfileMenu />
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                text="Become Pro"
                                onClick={() => navigate('/become-provider')}
                            />
                            <Button
                                variant="secondary"
                                text="Login"
                                onClick={() => navigate('/login')}
                            />
                            <Button
                                variant="primary"
                                text="Signup"
                                onClick={() => navigate('/signup')}
                            />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;
