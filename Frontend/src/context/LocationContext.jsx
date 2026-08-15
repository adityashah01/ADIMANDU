import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { calculateDistance } from "../utils/geoUtils";

const LocationContext = createContext(null);

export const NEPAL_LOCATIONS = [
    { name: "Kathmandu", lat: 27.7172, lng: 85.3240, region: "Bagmati" },
    { name: "Lalitpur (Patan)", lat: 27.6644, lng: 85.3188, region: "Bagmati" },
    { name: "Bhaktapur", lat: 27.6710, lng: 85.4298, region: "Bagmati" },
    { name: "Pokhara", lat: 28.2096, lng: 83.9856, region: "Gandaki" },
    { name: "Bharatpur (Chitwan)", lat: 27.6833, lng: 84.4333, region: "Bagmati" },
    { name: "Biratnagar", lat: 26.4525, lng: 87.2718, region: "Koshi" },
    { name: "Birgunj", lat: 27.0126, lng: 84.8776, region: "Madhesh" },
    { name: "Dharan", lat: 26.8126, lng: 87.2831, region: "Koshi" },
    { name: "Butwal", lat: 27.7006, lng: 83.4484, region: "Lumbini" },
    { name: "Hetauda", lat: 27.4262, lng: 85.0333, region: "Bagmati" },
    { name: "Nepalgunj", lat: 28.0500, lng: 81.6167, region: "Lumbini" },
    { name: "Itahari", lat: 26.6667, lng: 87.2833, region: "Koshi" },
    { name: "Janakpur", lat: 26.7112, lng: 85.9238, region: "Madhesh" },
    { name: "Dhangadhi", lat: 28.6845, lng: 80.6083, region: "Sudurpashchim" },
    { name: "All Locations", lat: null, lng: null, region: "All Nepal" },
];

export function LocationProvider({ children }) {
    const [location, setLocationName] = useState(() => {
        return localStorage.getItem("sewa_user_city") || "Kathmandu";
    });

    const [coordinates, setCoordinates] = useState(() => {
        const saved = localStorage.getItem("sewa_user_coords");
        if (saved) {
            try { return JSON.parse(saved); } catch { /* ignore */ }
        }
        return { lat: 27.7172, lng: 85.3240 }; // Default: Kathmandu Central
    });

    const [customAddress, setCustomAddress] = useState(() => {
        return localStorage.getItem("sewa_user_address") || "Kathmandu, Nepal";
    });

    const [searchRadius, setSearchRadius] = useState(() => {
        return Number(localStorage.getItem("sewa_search_radius")) || 25; // 25 km default
    });

    const [isDetectingGps, setIsDetectingGps] = useState(false);
    const [gpsStatus, setGpsStatus] = useState(null); // { type: 'success' | 'error', message: '' }

    // Save changes to localStorage
    useEffect(() => {
        if (location) localStorage.setItem("sewa_user_city", location);
        if (coordinates) localStorage.setItem("sewa_user_coords", JSON.stringify(coordinates));
        if (customAddress) localStorage.setItem("sewa_user_address", customAddress);
        if (searchRadius) localStorage.setItem("sewa_search_radius", searchRadius.toString());
    }, [location, coordinates, customAddress, searchRadius]);

    const updateLocation = useCallback((locName) => {
        setLocationName(locName);
        const found = NEPAL_LOCATIONS.find((l) => l.name === locName || l.name.startsWith(locName));
        if (found && found.lat && found.lng) {
            const coords = { lat: found.lat, lng: found.lng };
            setCoordinates(coords);
            setCustomAddress(`${found.name}, Nepal`);
            setGpsStatus(null);
        } else if (locName === "All Locations") {
            setCoordinates(null);
            setCustomAddress("All Across Nepal");
            setGpsStatus(null);
        }
    }, []);

    const setCustomCoordinates = useCallback((lat, lng, addressLabel) => {
        const coords = { lat: Number(lat), lng: Number(lng) };
        setCoordinates(coords);
        if (addressLabel) {
            setCustomAddress(addressLabel);
            setLocationName(addressLabel.split(",")[0] || "Custom Pin");
        } else {
            // Find closest known city
            let closest = NEPAL_LOCATIONS[0];
            let minD = Infinity;
            NEPAL_LOCATIONS.forEach((l) => {
                if (l.lat && l.lng) {
                    const d = calculateDistance(lat, lng, l.lat, l.lng);
                    if (d !== null && d < minD) {
                        minD = d;
                        closest = l;
                    }
                }
            });
            if (minD < 30) {
                setLocationName(closest.name);
                setCustomAddress(`${closest.name} (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
            } else {
                setLocationName("Custom Location");
                setCustomAddress(`Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
            }
        }
    }, []);

    const detectGpsLocation = useCallback(() => {
        if (!("geolocation" in navigator)) {
            setGpsStatus({ type: "error", message: "GPS not supported on this device/browser." });
            return;
        }

        setIsDetectingGps(true);
        setGpsStatus(null);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setCustomCoordinates(lat, lng);
                setIsDetectingGps(false);
                setGpsStatus({
                    type: "success",
                    message: `Live GPS detected (±${Math.round(pos.coords.accuracy || 10)}m accuracy)`,
                });
            },
            (err) => {
                setIsDetectingGps(false);
                setGpsStatus({
                    type: "error",
                    message: err.message || "Could not retrieve GPS location. Using default city location.",
                });
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
        );
    }, [setCustomCoordinates]);

    const getDistanceTo = useCallback((targetLat, targetLng) => {
        if (!coordinates || !targetLat || !targetLng) return null;
        return calculateDistance(coordinates.lat, coordinates.lng, targetLat, targetLng);
    }, [coordinates]);

    return (
        <LocationContext.Provider
            value={{
                location,
                setLocation: updateLocation,
                coordinates,
                setCoordinates: setCustomCoordinates,
                customAddress,
                setCustomAddress,
                searchRadius,
                setSearchRadius,
                isDetectingGps,
                gpsStatus,
                detectGpsLocation,
                getDistanceTo,
            }}
        >
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const ctx = useContext(LocationContext);
    if (!ctx) throw new Error("useLocation must be used within LocationProvider");
    return ctx;
}
