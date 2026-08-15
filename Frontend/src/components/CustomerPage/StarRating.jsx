import { Star } from 'lucide-react';

export default function StarRating({ rating, showNumber = false, reviewCount, className = '' }) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
        const filled = i < fullStars;
        const half = i === fullStars && hasHalf;
        stars.push(
            <span key={i} className="relative inline-block">
                <Star className="w-4 h-4 text-slate-300" fill="currentColor" />
                {(filled || half) && (
                    <span className="absolute inset-0 overflow-hidden" style={{ width: filled ? '100%' : '50%' }}>
                        <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
                    </span>
                )}
            </span>
        );
    }

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <div className="flex items-center gap-0.5">{stars}</div>
            {showNumber && (
                <span className="text-sm font-medium text-slate-700">
                    {rating.toFixed(1)}
                    {reviewCount !== undefined && (
                        <span className="text-slate-400 font-normal"> ({reviewCount})</span>
                    )}
                </span>
            )}
        </div>
    );
}
