import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    MapPin,
    Navigation,
    Clock,
    LocateFixed,
    ExternalLink,
    ShieldCheck,
    Car,
    Bike,
    Sparkles,
    CheckCircle2
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { calculateDistance, estimateTravelTime, estimateVisitCharge, getDirectionsUrl, getCategoryTheme } from '../../utils/geoUtils';

export default function SingleExpertMap({
    provider,
    height = '320px',
    showRoute = true,
}) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const polylineRef = useRef(null);
    const userMarkerRef = useRef(null);

    const { coordinates, setCoordinates, detectGpsLocation, isDetectingGps } = useLocation();
    const [travelMode, setTravelMode] = useState('bike'); // 'bike' | 'car'

    const providerLat = provider?.latitude ? Number(provider.latitude) : 27.7172;
    const providerLng = provider?.longitude ? Number(provider.longitude) : 85.3240;

    const distance = coordinates
        ? calculateDistance(coordinates.lat, coordinates.lng, providerLat, providerLng)
        : (provider?.distance || 0);

    const travelTime = estimateTravelTime(distance);
    const visitFee = estimateVisitCharge(distance);
    const theme = getCategoryTheme(provider?.categoryId || provider?.category);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
            center: [providerLat, providerLng],
            zoom: 14,
            zoomControl: false,
            attributionControl: false,
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd',
        }).addTo(map);

        // Add Provider Marker
        const providerHtml = `
            <div class="relative flex items-center justify-center">
                <div class="absolute w-10 h-10 bg-red-600/30 rounded-full animate-ping"></div>
                <div class="relative w-9 h-9 bg-red-600 border-2 border-white rounded-full flex items-center justify-center text-white shadow-xl">
                    <span class="text-sm">${theme.icon}</span>
                </div>
                <div class="absolute -bottom-6 whitespace-nowrap bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md">
                    ${provider?.name || 'Expert'}
                </div>
            </div>
        `;

        const providerIcon = L.divIcon({
            html: providerHtml,
            className: 'custom-single-provider-marker',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
        });

        L.marker([providerLat, providerLng], { icon: providerIcon }).addTo(map);

        // Click map to reposition user
        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            setCoordinates(lat, lng);
        });

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [providerLat, providerLng, provider?.name, theme.icon, setCoordinates]);

    // Update User Marker and Route Polyline
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        if (userMarkerRef.current) {
            map.removeLayer(userMarkerRef.current);
            userMarkerRef.current = null;
        }
        if (polylineRef.current) {
            map.removeLayer(polylineRef.current);
            polylineRef.current = null;
        }

        if (coordinates?.lat && coordinates?.lng) {
            const userHtml = `
                <div class="relative flex items-center justify-center">
                    <div class="w-7 h-7 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center text-white shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div class="absolute -bottom-6 whitespace-nowrap bg-blue-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                        You
                    </div>
                </div>
            `;

            const userIcon = L.divIcon({
                html: userHtml,
                className: 'custom-single-user-marker',
                iconSize: [28, 28],
                iconAnchor: [14, 14],
            });

            const marker = L.marker([coordinates.lat, coordinates.lng], {
                icon: userIcon,
                draggable: true,
            }).addTo(map);

            marker.on('dragend', (e) => {
                const pos = e.target.getLatLng();
                setCoordinates(pos.lat, pos.lng);
            });

            userMarkerRef.current = marker;

            if (showRoute) {
                const polyline = L.polyline(
                    [
                        [coordinates.lat, coordinates.lng],
                        [providerLat, providerLng],
                    ],
                    {
                        color: '#2563eb',
                        weight: 3.5,
                        opacity: 0.85,
                        dashArray: '8, 8',
                    }
                ).addTo(map);

                polylineRef.current = polyline;

                const bounds = L.latLngBounds([
                    [coordinates.lat, coordinates.lng],
                    [providerLat, providerLng],
                ]);
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        }
    }, [coordinates, providerLat, providerLng, showRoute, setCoordinates]);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {/* Header / Proximity Summary */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/40 flex items-center justify-center text-xl">
                        {theme.icon}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expert Location & Distance</span>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                                Verified Service Area
                            </span>
                        </div>
                        <p className="text-sm font-bold text-white mt-0.5">{provider?.location || 'Service Hub'}</p>
                    </div>
                </div>

                {/* Live Distance Pill */}
                <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className="bg-white/10 px-3.5 py-1.5 rounded-xl text-center border border-white/10">
                        <span className="text-[10px] text-slate-300 block font-medium">Distance</span>
                        <span className="text-sm font-black text-amber-400">
                            {distance !== null ? `${distance} km` : 'Near you'}
                        </span>
                    </div>

                    <div className="bg-white/10 px-3.5 py-1.5 rounded-xl text-center border border-white/10">
                        <span className="text-[10px] text-slate-300 block font-medium">Est. Arrival</span>
                        <span className="text-sm font-black text-emerald-400">{travelTime}</span>
                    </div>
                </div>
            </div>

            {/* Map Canvas */}
            <div className="relative w-full" style={{ height }}>
                <div ref={mapContainerRef} className="w-full h-full z-0" />

                {/* Floating GPS button */}
                <button
                    onClick={detectGpsLocation}
                    disabled={isDetectingGps}
                    className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs font-bold text-slate-700 flex items-center gap-1.5 hover:bg-slate-50 transition-all cursor-pointer"
                    title="Use my real GPS position"
                >
                    <LocateFixed className={`w-3.5 h-3.5 text-blue-600 ${isDetectingGps ? 'animate-spin' : ''}`} />
                    {isDetectingGps ? 'Detecting...' : 'Pin My Location'}
                </button>

                {/* Tip Pill at bottom left */}
                <div className="absolute bottom-3 left-3 z-10 bg-slate-900/85 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[11px] font-medium shadow-md pointer-events-none">
                    💡 Click or drag your pin on map to set your service address
                </div>
            </div>

            {/* Footer Breakdown */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Coverage:</strong> {visitFee.text}</span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2">
                    <a
                        href={getDirectionsUrl(providerLat, providerLng, coordinates?.lat, coordinates?.lng)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold"
                    >
                        <ExternalLink className="w-3.5 h-3.5" /> Turn-by-Turn in Google Maps →
                    </a>
                </div>
            </div>
        </div>
    );
}
