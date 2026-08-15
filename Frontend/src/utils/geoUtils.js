/**
 * Geographic & Routing utilities for Sewa Center Nepal
 */

export function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;

    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal
}

export function estimateTravelTime(distanceKm) {
    if (!distanceKm || distanceKm <= 0) return 'Immediate';
    // Urban Nepal average two-wheeler transit speed: ~18-22 km/h + 3 min prep buffer
    const baseMinutes = Math.round((distanceKm / 20) * 60) + 3;
    if (baseMinutes < 10) return `${baseMinutes}-${baseMinutes + 5} mins`;
    if (baseMinutes < 60) return `~${baseMinutes} mins`;
    const hours = Math.floor(baseMinutes / 60);
    const mins = baseMinutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
}

export function estimateVisitCharge(distanceKm, freeRadiusKm = 5, ratePerKm = 30) {
    if (!distanceKm || distanceKm <= freeRadiusKm) {
        return { isFree: true, fee: 0, text: 'Free Travel (Within 5 km zone)' };
    }
    const extraKm = Math.ceil(distanceKm - freeRadiusKm);
    const fee = extraKm * ratePerKm;
    return { isFree: false, fee, text: `+Rs. ${fee} Travel Allowance (${extraKm} km extra)` };
}

export function getDirectionsUrl(destLat, destLng, originLat, originLng) {
    if (originLat && originLng) {
        return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`;
}

export const CATEGORY_MAP_THEMES = {
    plumbing: { color: '#0284c7', bg: 'bg-sky-500', text: 'text-sky-600', icon: '🔧', label: 'Plumbing' },
    electrical: { color: '#d97706', bg: 'bg-amber-500', text: 'text-amber-600', icon: '⚡', label: 'Electrical' },
    cleaning: { color: '#059669', bg: 'bg-emerald-500', text: 'text-emerald-600', icon: '✨', label: 'Cleaning' },
    painting: { color: '#9333ea', bg: 'bg-purple-500', text: 'text-purple-600', icon: '🎨', label: 'Painting' },
    carpentry: { color: '#b45309', bg: 'bg-amber-700', text: 'text-amber-800', icon: '🪚', label: 'Carpentry' },
    appliances: { color: '#dc2626', bg: 'bg-red-600', text: 'text-red-600', icon: '❄️', label: 'Appliance Repair' },
    pestcontrol: { color: '#4b5563', bg: 'bg-slate-600', text: 'text-slate-600', icon: '🛡️', label: 'Pest Control' },
    default: { color: '#dc2626', bg: 'bg-red-600', text: 'text-red-600', icon: '📍', label: 'Service' },
};

export function getCategoryTheme(categorySlugOrName = '') {
    const key = String(categorySlugOrName).toLowerCase().replace(/[^a-z]/g, '');
    for (const [k, theme] of Object.entries(CATEGORY_MAP_THEMES)) {
        if (key.includes(k)) return theme;
    }
    return CATEGORY_MAP_THEMES.default;
}
