import React from 'react';

export default function Logo({ className = "h-10", showTagline = true, light = false }) {
    return (
        <div className={`flex items-center gap-3 select-none ${light ? 'text-white' : 'text-slate-900'}`}>
            <div className="relative flex items-center justify-center shrink-0">
                {/* Modern Geometric Hexagon/Diamond with MapPin and Home elements */}
                <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#DC2626" /> {/* red-600 */}
                            <stop offset="100%" stopColor="#EA580C" /> {/* orange-600 */}
                        </linearGradient>
                        <linearGradient id="logo-accent" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#F59E0B" /> {/* amber-500 */}
                            <stop offset="100%" stopColor="#FBBF24" /> {/* amber-400 */}
                        </linearGradient>
                    </defs>
                    
                    {/* Outer hexagon frame */}
                    <path 
                        d="M50 5 L89.5 27.8V72.2L50 95L10.5 72.2V27.8L50 5Z" 
                        fill="url(#logo-grad)" 
                        className="drop-shadow-md"
                    />
                    
                    {/* Inner cutout */}
                    <path 
                        d="M50 15 L80.5 32.6V67.4L50 85 L19.5 67.4V32.6L50 15Z" 
                        fill={light ? "#0F172A" : "#FFFFFF"} // slate-900 or white
                    />
                    
                    {/* Combined Home (chimney + roof) & Pin Icon */}
                    <path 
                        d="M50 25 L70 42 L62 42 V65 C62 67.2 60.2 69 58 69 H42 C39.8 69 38 67.2 38 65 V42 L30 42 L50 25Z" 
                        fill="url(#logo-grad)"
                    />
                    
                    {/* Core Sparkle/Star Indicator */}
                    <path 
                        d="M50 42 L52 47 L57 49 L52 51 L50 56 L48 51 L43 49 L48 47 L50 42Z" 
                        fill="url(#logo-accent)" 
                    />
                    
                    {/* Pin Bottom Ring */}
                    <circle cx="50" cy="78" r="4" fill="url(#logo-accent)" />
                </svg>
            </div>
            
            <div className="flex flex-col justify-center leading-tight">
                <span className="flex items-baseline">
                    <span className="text-xl font-black tracking-tight uppercase">
                        Adi
                    </span>
                    <span className="text-xl font-black tracking-tight text-red-600 uppercase">
                        mandu
                    </span>
                </span>
                {showTagline && (
                    <span className={`text-[10px] font-bold tracking-widest uppercase ${light ? 'text-slate-400' : 'text-slate-500'}`}>
                        Premium Home Services
                    </span>
                )}
            </div>
        </div>
    );
}
