import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    MapPin,
    Navigation,
    LocateFixed,
    Layers,
    Maximize2,
    Star,
    Award,
    Clock,
    Phone,
    Calendar,
    ChevronRight,
    ExternalLink,
    X,
    CheckCircle2
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { calculateDistance, estimateTravelTime, getDirectionsUrl, getCategoryTheme, estimateVisitCharge } from '../../utils/geoUtils';
import { Link } from 'react-router-dom';

export default function ExpertMap({
    providers = [],
    selectedProviderId = null,
    onSelectProvider = () => {},
    height = '100%',
    showRadiusCircle = true,
    showRouteLine = true,
    interactive = true,
    initialZoom = 13,
}) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersLayerRef = useRef(null);
    const userMarkerRef = useRef(null);
    const radiusCircleRef = useRef(null);
    const routePolylineRef = useRef(null);

    const { coordinates, setCoordinates, searchRadius, isDetectingGps, detectGpsLocation, gpsStatus } = useLocation();
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [tileLayerType, setTileLayerType] = useState('voyager'); // 'voyager' | 'osm'
    const tileLayerRef = useRef(null);

    // Sync selected provider from prop or internal state
    useEffect(() => {
        if (selectedProviderId) {
            const found = providers.find((p) => String(p.id) === String(selectedProviderId));
            if (found) setSelectedProvider(found);
        }
    }, [selectedProviderId, providers]);

    // 1. Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Prevent double init
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        const centerLat = coordinates?.lat || 27.7172;
        const centerLng = coordinates?.lng || 85.3240;

        const map = L.map(mapContainerRef.current, {
            center: [centerLat, centerLng],
            zoom: initialZoom,
            zoomControl: false,
            attributionControl: false,
        });

        // Add Zoom Control to bottom-right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Add Custom Attribution
        L.control.attribution({
            position: 'bottomleft',
            prefix: '<a href="https://leafletjs.com" target="_blank">Leaflet</a> | &copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        }).addTo(map);

        // Add Tile Layer
        const tileUrl = tileLayerType === 'voyager'
            ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        const tileLayer = L.tileLayer(tileUrl, {
            maxZoom: 19,
            subdomains: 'abcd',
        }).addTo(map);
        tileLayerRef.current = tileLayer;

        // Layer group for markers
        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;

        mapInstanceRef.current = map;

        // Click on map to reposition user's pin
        if (interactive) {
            map.on('click', (e) => {
                const { lat, lng } = e.latlng;
                setCoordinates(lat, lng);
            });
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []); // Run once on mount

    // Switch Tile Layer if state changes
    useEffect(() => {
        if (!mapInstanceRef.current || !tileLayerRef.current) return;
        mapInstanceRef.current.removeLayer(tileLayerRef.current);

        const tileUrl = tileLayerType === 'voyager'
            ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        tileLayerRef.current = L.tileLayer(tileUrl, {
            maxZoom: 19,
            subdomains: 'abcd',
        }).addTo(mapInstanceRef.current);
    }, [tileLayerType]);

    // 2. Render User Marker & Radius Circle
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        if (userMarkerRef.current) {
            map.removeLayer(userMarkerRef.current);
            userMarkerRef.current = null;
        }
        if (radiusCircleRef.current) {
            map.removeLayer(radiusCircleRef.current);
            radiusCircleRef.current = null;
        }

        if (coordinates && coordinates.lat && coordinates.lng) {
            const userIconHtml = `
                <div class="relative flex items-center justify-center">
                    <div class="absolute w-12 h-12 bg-blue-500/25 rounded-full animate-ping"></div>
                    <div class="absolute w-8 h-8 bg-blue-500/40 rounded-full"></div>
                    <div class="relative w-7 h-7 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-500/50">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div class="absolute -bottom-6 whitespace-nowrap bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md pointer-events-none">
                        Your Location
                    </div>
                </div>
            `;

            const userDivIcon = L.divIcon({
                html: userIconHtml,
                className: 'custom-user-marker',
                iconSize: [28, 28],
                iconAnchor: [14, 14],
            });

            const marker = L.marker([coordinates.lat, coordinates.lng], {
                icon: userDivIcon,
                draggable: interactive,
                zIndexOffset: 1000,
            }).addTo(map);

            marker.on('dragend', (e) => {
                const newPos = e.target.getLatLng();
                setCoordinates(newPos.lat, newPos.lng);
            });

            userMarkerRef.current = marker;

            if (showRadiusCircle && searchRadius) {
                const circle = L.circle([coordinates.lat, coordinates.lng], {
                    radius: searchRadius * 1000,
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.07,
                    weight: 1.5,
                    dashArray: '4, 6',
                }).addTo(map);
                radiusCircleRef.current = circle;
            }
        }
    }, [coordinates, searchRadius, showRadiusCircle, interactive, setCoordinates]);

    // 3. Render Provider Markers
    useEffect(() => {
        const map = mapInstanceRef.current;
        const markersLayer = markersLayerRef.current;
        if (!map || !markersLayer) return;

        markersLayer.clearLayers();

        providers.forEach((p) => {
            if (!p.latitude || !p.longitude) return;

            const isSelected = selectedProvider && String(selectedProvider.id) === String(p.id);
            const theme = getCategoryTheme(p.categoryId || p.category);
            const distance = coordinates
                ? calculateDistance(coordinates.lat, coordinates.lng, p.latitude, p.longitude)
                : (p.distance || null);

            const isAvailable = p.availability === 'available';

            const markerHtml = `
                <div class="relative group cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
                    <div class="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full shadow-lg border-2 ${
                        isSelected ? 'border-blue-600 ring-4 ring-blue-500/20' : 'border-slate-200'
                    }">
                        <span class="w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}"></span>
                        <span class="text-xs font-black text-slate-800">${theme.icon}</span>
                        <span class="text-[11px] font-bold text-slate-900 whitespace-nowrap">Rs. ${Number(p.price || 0).toLocaleString()}</span>
                        ${
                            distance !== null
                                ? `<span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-full">${distance}km</span>`
                                : ''
                        }
                    </div>
                    <div class="w-2.5 h-2.5 bg-white border-r-2 border-b-2 ${
                        isSelected ? 'border-blue-600' : 'border-slate-200'
                    } transform rotate-45 mx-auto -mt-1 shadow-xs"></div>
                </div>
            `;

            const icon = L.divIcon({
                html: markerHtml,
                className: 'custom-expert-marker',
                iconSize: [100, 36],
                iconAnchor: [50, 36],
            });

            const marker = L.marker([p.latitude, p.longitude], { icon }).addTo(markersLayer);

            marker.on('click', () => {
                setSelectedProvider(p);
                onSelectProvider(p);
            });
        });
    }, [providers, selectedProvider, coordinates, onSelectProvider]);

    // 4. Draw Route Line between User and Selected Provider
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        if (routePolylineRef.current) {
            map.removeLayer(routePolylineRef.current);
            routePolylineRef.current = null;
        }

        if (showRouteLine && selectedProvider && selectedProvider.latitude && selectedProvider.longitude && coordinates?.lat && coordinates?.lng) {
            const start = [coordinates.lat, coordinates.lng];
            const end = [selectedProvider.latitude, selectedProvider.longitude];

            // Animated curved or dashed line
            const polyline = L.polyline([start, end], {
                color: '#2563eb',
                weight: 3.5,
                opacity: 0.85,
                dashArray: '8, 8',
                lineCap: 'round',
                lineJoin: 'round',
            }).addTo(map);

            routePolylineRef.current = polyline;

            // Smoothly pan & fit to show both user and expert
            const bounds = L.latLngBounds([start, end]);
            map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
        }
    }, [selectedProvider, coordinates, showRouteLine]);

    // Action Handlers
    const handleFitAll = useCallback(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        const points = [];
        if (coordinates?.lat && coordinates?.lng) {
            points.push([coordinates.lat, coordinates.lng]);
        }
        providers.forEach((p) => {
            if (p.latitude && p.longitude) points.push([p.latitude, p.longitude]);
        });

        if (points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [coordinates, providers]);

    const activeDistance = selectedProvider && coordinates
        ? calculateDistance(coordinates.lat, coordinates.lng, selectedProvider.latitude, selectedProvider.longitude)
        : (selectedProvider?.distance || 0);

    const activeTravelTime = estimateTravelTime(activeDistance);
    const visitCharge = estimateVisitCharge(activeDistance);

    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 bg-slate-100 flex flex-col" style={{ height }}>
            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Top Bar Floating Controls */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
                {/* Location Quick Info Pill */}
                <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-lg flex items-center gap-2 max-w-[280px] sm:max-w-xs">
                    <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                    <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Your Base Location</p>
                        <p className="text-xs font-bold text-slate-800 truncate">
                            {coordinates ? `${coordinates.lat.toFixed(3)}, ${coordinates.lng.toFixed(3)} (Click map to move)` : 'Select on map'}
                        </p>
                    </div>
                </div>

                {/* Map Control Buttons */}
                <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-lg">
                    {/* GPS Locate Me */}
                    <button
                        onClick={detectGpsLocation}
                        disabled={isDetectingGps}
                        className={`p-2 rounded-xl transition-all ${
                            isDetectingGps
                                ? 'bg-blue-100 text-blue-600 animate-spin'
                                : 'hover:bg-slate-100 text-slate-700'
                        }`}
                        title="Detect My Live GPS Location"
                    >
                        <LocateFixed className="w-4 h-4 text-blue-600" />
                    </button>

                    {/* Fit All Markers */}
                    <button
                        onClick={handleFitAll}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
                        title="Fit All Experts on Map"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>

                    {/* Switch Layer */}
                    <button
                        onClick={() => setTileLayerType((prev) => (prev === 'voyager' ? 'osm' : 'voyager'))}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
                        title={`Switch Tile Theme (Current: ${tileLayerType === 'voyager' ? 'Carto Voyager' : 'OpenStreetMap'})`}
                    >
                        <Layers className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* GPS Feedback Toast if active */}
            {gpsStatus && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-2 ${
                        gpsStatus.type === 'success'
                            ? 'bg-emerald-600/90 text-white'
                            : 'bg-red-600/90 text-white'
                    }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {gpsStatus.message}
                    </div>
                </div>
            )}

            {/* Bottom Floating Expert Card when an expert is selected */}
            {selectedProvider && (
                <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-96 z-20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-white/98 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl p-4 sm:p-5 relative">
                        {/* Close button */}
                        <button
                            onClick={() => {
                                setSelectedProvider(null);
                                onSelectProvider(null);
                            }}
                            className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-3.5">
                            <img
                                src={selectedProvider.avatar}
                                alt={selectedProvider.name}
                                className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md shrink-0 bg-slate-100"
                                onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedProvider.name)}&background=2563eb&color=fff`;
                                }}
                            />
                            <div className="min-w-0 flex-1 pr-4">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <h4 className="font-bold text-slate-900 text-sm truncate">{selectedProvider.name}</h4>
                                    {selectedProvider.verified && (
                                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                            <Award className="w-3 h-3" /> Verified
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs font-semibold text-blue-600 mt-0.5">{selectedProvider.category}</p>
                                
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                                        <span>{selectedProvider.rating || '5.0'}</span>
                                    </div>
                                    <span>•</span>
                                    <span>{selectedProvider.reviewCount || 10} reviews</span>
                                    <span>•</span>
                                    <span className="text-slate-400 truncate">{selectedProvider.location}</span>
                                </div>
                            </div>
                        </div>

                        {/* Distance & Travel Estimation Pill Box */}
                        <div className="mt-3.5 p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2">
                                <Navigation className="w-4 h-4 text-blue-600 shrink-0" />
                                <div>
                                    <span className="text-[10px] text-slate-500 block font-medium">Distance from you</span>
                                    <span className="font-bold text-blue-900 text-sm">
                                        {activeDistance !== null ? `${activeDistance} km` : 'Calculating...'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                                <div>
                                    <span className="text-[10px] text-slate-500 block font-medium">Est. Arrival Time</span>
                                    <span className="font-bold text-emerald-800 text-sm">{activeTravelTime}</span>
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Actions */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                            <div>
                                <span className="text-xs text-slate-400 block font-medium">Starting from</span>
                                <span className="text-base font-extrabold text-slate-900">
                                    Rs. {Number(selectedProvider.price || 0).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={getDirectionsUrl(selectedProvider.latitude, selectedProvider.longitude, coordinates?.lat, coordinates?.lng)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                                    title="Open Turn-by-Turn in Google Maps"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>

                                {selectedProvider.phone && (
                                    <a
                                        href={`tel:${selectedProvider.phone}`}
                                        className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                                        title="Call Expert"
                                    >
                                        <Phone className="w-4 h-4" />
                                    </a>
                                )}

                                <Link
                                    to={`/book/${selectedProvider.id}`}
                                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                                >
                                    <Calendar className="w-3.5 h-3.5" /> Book Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
