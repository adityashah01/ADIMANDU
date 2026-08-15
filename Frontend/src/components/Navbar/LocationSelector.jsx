import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Check } from "lucide-react";
import { useLocation, NEPAL_LOCATIONS } from "../../context/LocationContext";

function LocationSelector() {
    const { location, setLocation } = useLocation();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className="relative shrink-0" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-slate-200 hover:border-red-400 transition bg-white shadow-xs"
            >
                <MapPin size={15} className="text-red-600 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700 max-w-[110px] truncate">
                    {location === "All Locations" ? "Nepal (All)" : location}
                </span>
                <ChevronDown size={13} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden">
                    <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Select City in Nepal
                    </div>
                    <div className="py-1 max-h-64 overflow-y-auto">
                        {NEPAL_LOCATIONS.map((loc) => (
                            <button
                                key={loc.name}
                                onClick={() => { setLocation(loc.name); setOpen(false); }}
                                className={`flex items-center justify-between w-full px-4 py-2.5 text-xs sm:text-sm text-left transition-colors ${
                                    location === loc.name
                                        ? "bg-red-50 text-red-700 font-bold"
                                        : "text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                                <span>{loc.name}</span>
                                {location === loc.name && <Check size={14} className="text-red-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LocationSelector;
