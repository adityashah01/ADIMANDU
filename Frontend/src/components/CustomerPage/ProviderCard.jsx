import { Link } from 'react-router-dom';
import { MapPin, BadgeCheck, Clock, ShieldCheck, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import StarRating from './StarRating';
import { calculateDistance, estimateTravelTime } from '../../utils/geoUtils';

const availabilityConfig = {
    available: { label: 'Available Now', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    busy: { label: 'Busy on Job', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
    offline: { label: 'Offline', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export default function ProviderCard({ provider }) {
    const { coordinates } = useLocation();
    const avail = availabilityConfig[provider.availability] || availabilityConfig.offline;

    const liveDist = coordinates && provider.latitude && provider.longitude
        ? calculateDistance(coordinates.lat, coordinates.lng, provider.latitude, provider.longitude)
        : (provider.distance || null);

    const travelTime = estimateTravelTime(liveDist);

    return (
        <div className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs transition-all duration-300 hover:border-stone-900 focus-within:border-stone-900 hover:shadow-md flex flex-col justify-between">
            <div>
                <Link to={`/providers/${provider.id}`}>
                    <div className="relative h-44 overflow-hidden bg-stone-100">
                        <img
                            src={provider.coverImage || provider.avatar}
                            alt={provider.category}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
                            onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&fit=crop";
                            }}
                        />
                        <div className="absolute inset-0 bg-stone-950/20" />
                        <span className={`absolute right-3 top-3 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${avail.cls} shadow-xs`}>
                            {avail.label}
                        </span>

                        {liveDist !== null && (
                            <div className="absolute bottom-3 left-3 bg-white px-2.5 py-1 rounded-md text-[10px] font-bold text-stone-900 flex items-center gap-1 shadow-sm border border-stone-100">
                                <Navigation className="w-3 h-3 text-red-600" />
                                <span>{liveDist} KM</span>
                                <span className="text-stone-400 font-medium">({travelTime})</span>
                            </div>
                        )}
                    </div>
                </Link>

                <div className="p-5">
                    <div className="flex items-start gap-3">
                        <img
                            src={provider.avatar}
                            alt={provider.name}
                            className="h-12 w-12 shrink-0 rounded-lg border border-stone-200 object-cover shadow-xs -mt-10 relative z-10 bg-white"
                            onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=332d2b&color=fff`;
                            }}
                        />
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1">
                                <Link
                                    to={`/providers/${provider.id}`}
                                    className="truncate text-sm font-bold text-stone-900 transition-colors hover:text-red-700"
                                >
                                    {provider.name}
                                </Link>
                                {provider.verified && (
                                    <span className="inline-flex items-center gap-0.5 text-stone-900 bg-stone-100 text-[9px] font-bold px-1.5 py-0.5 rounded border border-stone-200" title="Verified Nepali Karigar">
                                        <BadgeCheck className="h-2.5 w-2.5 text-stone-800" /> VETTED
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">{provider.category}</p>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                        <StarRating rating={provider.rating} showNumber reviewCount={provider.reviewCount} />
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-100">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 font-semibold text-stone-700 truncate max-w-[130px]">
                                <MapPin className="h-3.5 w-3.5 text-red-600 shrink-0" /> {provider.location}
                            </span>
                        </div>
                        <span className="flex items-center gap-1 font-medium text-stone-400">
                            <Clock className="h-3.5 w-3.5" /> {provider.responseTime || '15 mins'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-5 pt-0">
                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                    <div>
                        <span className="text-base font-black text-stone-900">Rs. {Number(provider.price || 0).toLocaleString()}</span>
                        <span className="ml-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">{provider.priceUnit}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Link
                            to={`/providers/${provider.id}`}
                            className="rounded-lg bg-stone-100 hover:bg-stone-200 px-3 py-2 text-xs font-bold text-stone-700 transition-colors"
                        >
                            Profile
                        </Link>
                        <Link
                            to={`/book/${provider.id}`}
                            className="rounded-lg bg-stone-900 hover:bg-stone-800 px-4 py-2 text-xs font-bold text-white transition-all shadow-xs"
                        >
                            Book
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
